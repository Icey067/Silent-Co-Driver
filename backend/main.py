from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
from transformers import pipeline
import json
import os
import shutil
import warnings
import asyncio
import gc
import torch
import soundfile as sf
import torchaudio.functional as F
import noisereduce as nr
import numpy as np

warnings.filterwarnings("ignore")

app = FastAPI(title="The Silent Co-Driver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global lock to ensure sequential processing
inference_lock = asyncio.Lock()

class AnalysisResult(BaseModel):
    transcript: str
    mood: str
    stress_score: int
    confidence: float

@app.get("/telemetry")
def get_telemetry():
    try:
        with open("telemetry.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="telemetry.json not found")

@app.post("/analyze-radio", response_model=AnalysisResult)
async def analyze_radio(file: UploadFile = File(...)):
    # 1. Acquire lock to prevent multiple requests crashing VRAM
    async with inference_lock:
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            # Read audio
            audio_data, sr = sf.read(temp_file_path)
            
            # Convert to mono if multi-channel
            if audio_data.ndim > 1:
                audio_data = audio_data.mean(axis=1)

            # Pre-Processing: Spectral Noise Reduction
            print("Applying noise reduction...")
            audio_data = nr.reduce_noise(y=audio_data, sr=sr)
            
            audio_tensor = torch.from_numpy(audio_data.astype("float32"))

            # Transcribe model needs 16kHz
            if sr != 16000:
                whisper_audio = F.resample(audio_tensor, sr, 16000).numpy()
            else:
                whisper_audio = audio_tensor.numpy()

            # --- MODEL 1: Transcription ---
            print("Loading Whisper model into VRAM...")
            whisper_model = whisper.load_model("base")
            print("Transcribing...")
            # Run inference
            result = whisper_model.transcribe(whisper_audio)
            transcript = result.get("text", "").strip()
            
            # Extract average confidence from segments
            segments = result.get("segments", [])
            if segments:
                # no_speech_prob is given per segment, confidence ~ 1 - no_speech_prob
                avg_confidence = np.mean([1.0 - s.get("no_speech_prob", 0.0) for s in segments])
            else:
                avg_confidence = 0.9 # Default if no segments found

            # Unload Whisper completely
            print("Unloading Whisper and clearing VRAM...")
            del whisper_model
            gc.collect()
            torch.cuda.empty_cache()

            # --- MODEL 2: Emotion Recognition ---
            print("Loading SER model into VRAM...")
            emotion_classifier = pipeline("audio-classification", model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")
            
            print("Extracting emotions...")
            # We pass the cleaned audio to emotion recognition as well
            emotions = emotion_classifier({"array": audio_data.astype("float32"), "sampling_rate": sr})
            
            top_emotion = emotions[0]
            label = top_emotion["label"].lower() # Ensure lowercase
            emotion_confidence = top_emotion["score"]

            print(f"Top detected emotion: {label} ({emotion_confidence})")

            # Map to Stressed/Calm
            if label in ["angry", "fearful"]:
                mood = "Stressed"
                stress_score = int(emotion_confidence * 10) # 0 to 10
                if stress_score < 6:
                    stress_score = 7 # Boost base stress if explicitly angry/fearful
            else:
                # happy, sad, neutral, etc
                mood = "Calm"
                stress_score = max(1, int((1 - emotion_confidence) * 4)) # Lower score for calm
                

            # Unload SER model
            print("Unloading SER model and clearing VRAM...")
            del emotion_classifier
            gc.collect()
            torch.cuda.empty_cache()

            return AnalysisResult(
                transcript=transcript,
                mood=mood,
                stress_score=stress_score,
                confidence=round(float(avg_confidence), 4)
            )
        except Exception as e:
            print(f"Error in analyze_radio: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
