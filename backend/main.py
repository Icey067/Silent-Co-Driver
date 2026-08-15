import os
import json
import asyncio
import uuid
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiofiles
from dotenv import load_dotenv
from groq import Groq

# import our local audio engine
from pipeline import AudioPipeline

# load up env vars
load_dotenv()

# fire up fastapi
app = FastAPI(title="The Silent Co-Driver API (Hybrid)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# globals for state
audio_pipeline = None
groq_client = None
executor = ThreadPoolExecutor(max_workers=2)

@app.on_event("startup")
def startup_event():
    global audio_pipeline, groq_client
    # init the local audio pipeline
    audio_pipeline = AudioPipeline()
    
    # set up the groq client for llm
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("WARNING: GROQ_API_KEY is not set in environment or .env file.")
    else:
        groq_client = Groq(api_key=api_key)

class DriverAnalysisResponse(BaseModel):
    transcript: str
    stress_score: int
    status: str
    driver_feedback_category: str
    actionable_insight: str
    tactical_intent: str
    lap: int = 0

@app.get("/telemetry")
def get_telemetry():
    try:
        with open("telemetry.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="telemetry.json not found")

@app.websocket("/ws/radio")
async def websocket_radio_endpoint(websocket: WebSocket):
    await websocket.accept()
    if groq_client is None:
        await websocket.close(code=1011, reason="Groq client is not initialized.")
        return

    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            temp_file_path = f"temp_{uuid.uuid4().hex}.wav"
            
            try:
                async with aiofiles.open(temp_file_path, 'wb') as out_file:
                    await out_file.write(audio_bytes)
                
                loop = asyncio.get_event_loop()
                try:
                    pipeline_result = await loop.run_in_executor(
                        executor, 
                        audio_pipeline.process_audio, 
                        temp_file_path
                    )
                except ValueError as ve:
                    print(f"WebSocket audio rejected: {ve}")
                    await websocket.send_json({"error": str(ve)})
                    continue
                
                transcript = pipeline_result["transcript"]
                if not transcript or transcript.strip() == "":
                    transcript = "[Unintelligible / Heavy Static]"
                metrics = pipeline_result["acoustic_metrics"]
                
                # skip the llm call if there's no speech
                if transcript:
                    system_prompt = """You are an elite F1 race engineer AI. 
Analyze the driver's radio transcript and acoustic metrics to determine their state and needs.
Heavily weight the acoustic rms_energy and pitch_variability when the transcript contains urgent F1 keywords (e.g., 'puncture', 'snap', 'box').
You must return a JSON object that exactly matches the following schema:
{
  "transcript": "string",
  "stress_score": "integer between 0 and 10",
  "status": "string (e.g., Calm, Stressed, Frustrated, Panicking, Tired)",
  "driver_feedback_category": "string (e.g., Setup, Tires, Traffic, Information)",
  "actionable_insight": "string (short instruction to the race engineer)",
  "tactical_intent": "string (what the driver is trying to achieve)"
}
"""
                    user_prompt = f"""
Transcript: "{transcript}"
Acoustic Metrics:
- RMS Energy (Loudness): {metrics['rms_energy']:.4f}
- Pitch Variability (Tone/Stress marker): {metrics['pitch_variability']:.4f}

Analyze the data and provide the JSON output.
"""
                    completion = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.2,
                    )
                    
                    llm_response = json.loads(completion.choices[0].message.content)
                    llm_response["transcript"] = transcript
                    
                    # try grabbing the current lap from telemetry
                    latest_lap = 0
                    try:
                        with open("telemetry.json", "r") as f:
                            t_data = json.load(f)
                            if t_data and isinstance(t_data, list):
                                latest_lap = t_data[-1].get("lap", 0)
                    except Exception:
                        pass
                        
                    llm_response["lap"] = latest_lap
                    
                    await websocket.send_json(llm_response)
                
            except Exception as e:
                print(f"Error processing audio chunk: {e}")
            finally:
                if os.path.exists(temp_file_path):
                    try:
                        os.remove(temp_file_path)
                    except Exception as e:
                        print(f"Failed to remove temp file: {e}")
                        
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.post("/analyze-radio", response_model=DriverAnalysisResponse)
async def analyze_radio(file: UploadFile = File(...)):
    if groq_client is None:
        raise HTTPException(status_code=500, detail="Groq client is not initialized. Check API key.")
        
    temp_file_path = f"temp_{file.filename}"
    
    try:
        # async save so we don't block
        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        # offload the heavy audio lifting to a background thread
        loop = asyncio.get_event_loop()
        try:
            pipeline_result = await loop.run_in_executor(
                executor, 
                audio_pipeline.process_audio, 
                temp_file_path
            )
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        
        transcript = pipeline_result["transcript"]
        if not transcript or transcript.strip() == "":
            transcript = "[Unintelligible / Heavy Static]"
        metrics = pipeline_result["acoustic_metrics"]
        
        # set up prompts
        system_prompt = """You are an elite F1 race engineer AI. 
Analyze the driver's radio transcript and acoustic metrics to determine their state and needs.
Heavily weight the acoustic rms_energy and pitch_variability when the transcript contains urgent F1 keywords (e.g., 'puncture', 'snap', 'box').
You must return a JSON object that exactly matches the following schema:
{
  "transcript": "string",
  "stress_score": "integer between 0 and 10",
  "status": "string (e.g., Calm, Stressed, Frustrated, Panicking, Tired)",
  "driver_feedback_category": "string (e.g., Setup, Tires, Traffic, Information)",
  "actionable_insight": "string (short instruction to the race engineer)",
  "tactical_intent": "string (what the driver is trying to achieve)"
}
"""
        user_prompt = f"""
Transcript: "{transcript}"
Acoustic Metrics:
- RMS Energy (Loudness): {metrics['rms_energy']:.4f}
- Pitch Variability (Tone/Stress marker): {metrics['pitch_variability']:.4f}

Analyze the data and provide the JSON output.
"""
        # hit the groq api
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        
        # parse out the json
        llm_response = json.loads(completion.choices[0].message.content)
        
        # force the transcript to match what we actually transcribed
        llm_response["transcript"] = transcript
        
        # grab latest lap
        latest_lap = 0
        try:
            with open("telemetry.json", "r") as f:
                t_data = json.load(f)
                if t_data and isinstance(t_data, list):
                    latest_lap = t_data[-1].get("lap", 0)
        except Exception:
            pass
            
        llm_response["lap"] = latest_lap
        
        return DriverAnalysisResponse(**llm_response)
        
    except Exception as e:
        print(f"Error in analyze_radio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # clean up the temp file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_error:
                print(f"Failed to remove temp file: {cleanup_error}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
