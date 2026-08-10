# The Silent Co-Driver 🏎️🎙️
> Reading Driver Stress from Radio Calls

The Silent Co-Driver is a real-time race telemetry & driver stress monitoring system designed for motorsport pit-wall engineers. The system analyzes a driver's radio audio clips to transcribe speech, detect mood and stress levels, and display this telemetry alongside lap-time data on a sleek React dashboard. By correlating high stress levels with slower lap times, engineers can make proactive strategy calls.

## Features
- **Speech-to-Text Transcription**: Automatically transcribes driver radio messages using OpenAI's Whisper model.
- **Zero-shot Speech Emotion Recognition (SER)**: Analyzes the audio waveform using Hugging Face's `wav2vec2-base-superb-er` to determine if the driver is Calm, Tired, or Stressed.
- **Stress Index Mapping**: Maps emotional inferences to a 1-10 Stress Index.
- **Live Telemetry Dashboard**: A dark-mode, React-powered UI featuring Recharts for data visualization.
- **Interactive Audio Control Panel**: Upload radio clips directly from the dashboard to run live AI inference.

## Tech Stack
* **AI Models:**
  - Speech-to-Text: `openai/whisper` (tiny)
  - Emotion Recognition: `superb/wav2vec2-base-superb-er`
* **Backend:** Python + FastAPI + Uvicorn
* **Frontend:** React + Vite + Tailwind CSS + Recharts
* **Data Processing:** PyTorch, Torchaudio, gTTS/pyttsx3

---

## 🚀 Getting Started

### 1. Clone & Setup
Ensure you have Python 3.9+ and Node.js installed on your machine.

### 2. Backend Setup
Navigate to the `backend` directory and install the Python dependencies.
```bash
cd backend
pip install -r requirements.txt
```

#### Generate Mock Data
We've included a script to generate 10 laps of dummy telemetry data and 3 realistic test radio `.wav` clips using local Text-to-Speech (`pyttsx3`). Run this before starting the server:
```bash
python setup_mock_data.py
```
*(This will generate `telemetry.json` and populate the `audio_clips/` folder).*

#### Start the API Server
```bash
uvicorn main:app --reload
```
The FastAPI server will start at `http://localhost:8000`. Note that the AI models (`whisper` and `wav2vec2`) are loaded into memory on startup, so the initial run may take a few seconds to download the model weights.

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend` directory, and install the Node dependencies.
```bash
cd frontend
npm install
```

#### Start the Dashboard
```bash
npm run dev
```
The Vite development server will start at `http://localhost:5173`. 

---

## 🛠️ Usage
1. Open the dashboard in your web browser (`http://localhost:5173`).
2. Observe the **Telemetry Chart** plotting the historical Lap Times vs Stress Index across 10 laps.
3. Use the **Audio Control Panel** to upload one of the generated clips from the `backend/audio_clips/` folder.
4. Click **Analyze Clip**.
5. Watch the **Driver Status Card** update dynamically with the transcribed text, AI confidence score, and color-coded stress level (Green/Yellow/Red).
