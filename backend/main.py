from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
from transformers import pipeline
import json
import os
import shutil
import warnings

warnings.filterwarnings("ignore")

app = FastAPI(title="The Silent Co-Driver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Whisper model...")
whisper_model = whisper.load_model("tiny")
print("Loading SER model...")
emotion_classifier = pipeline("audio-classification", model="superb/wav2vec2-base-superb-er")

# Map superb/wav2vec2-base-superb-er labels: 'neu', 'hap', 'ang', 'sad'
# Wait, let's handle the labels correctly. superb/wav2vec2-base-superb-er uses 4 labels: neu, hap, ang, sad
emotion_mapping = {
    "ang": ("Stressed", 9),
    "fea": ("Stressed", 8), # Just in case
    "sad": ("Tired", 6),
    "neu": ("Calm", 2),
    "hap": ("Calm", 1),
}

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
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        import soundfile as sf
        import torch
        import torchaudio.functional as F

        audio_data, sr = sf.read(temp_file_path)
        
        # Convert to mono if multi-channel
        if audio_data.ndim > 1:
            audio_data = audio_data.mean(axis=1)

        audio_tensor = torch.from_numpy(audio_data.astype("float32"))

        # Resample to 16kHz for Whisper
        if sr != 16000:
            whisper_audio = F.resample(audio_tensor, sr, 16000).numpy()
        else:
            whisper_audio = audio_tensor.numpy()

        # 1. Speech-to-Text with Whisper
        result = whisper_model.transcribe(whisper_audio)
        transcript = result.get("text", "").strip()

        # 2. Speech Emotion Recognition with Wav2Vec2
        emotions = emotion_classifier({"array": audio_data.astype("float32"), "sampling_rate": sr})
        
        top_emotion = emotions[0]
        label = top_emotion["label"]
        confidence = top_emotion["score"]

        mood, stress_score = emotion_mapping.get(label, ("Calm", 3))

        return AnalysisResult(
            transcript=transcript,
            mood=mood,
            stress_score=stress_score,
            confidence=round(confidence, 4)
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
