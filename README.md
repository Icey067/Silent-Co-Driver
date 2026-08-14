# The Silent Co-Driver 🏎️🎙️
> Reading Driver Stress from Radio Calls & Telemetry

The Silent Co-Driver is a real-time race telemetry & driver stress monitoring system designed for motorsport pit-wall engineers. The system analyzes a driver's radio audio clips to transcribe speech, detect acoustic stress markers, and feed this data into an advanced LLM to generate actionable F1 insights. By correlating high stress levels with slower lap times, engineers can make proactive strategy calls.

## Features
- **CPU-Optimized ASR Pipeline**: Utilizes `faster-distil-whisper-large-v3` running with `int8` precision for lightning-fast, local CPU transcription of driver radio communications.
- **Acoustic Audio Normalization**: Uses `librosa` to normalize audio, extract RMS energy (loudness), and measure Pitch Variability (F0) as markers for stress and urgency.
- **Groq LLM F1 Telemetry**: Feeds transcribed text and acoustic metrics into `llama-3.3-70b-versatile` via Groq for zero-shot driver state analysis. It determines stress scores, tactical intent, and actionable insights for the race engineer.
- **Live WebSocket Streaming**: Supports real-time audio chunk streaming from the frontend to the backend for immediate analysis.
- **Minimal React/Tailwind Dashboard**: A dark-mode, React-powered pit-wall UI featuring `Recharts` for telemetry visualization, a `UnifiedDriverPanel`, `TacticalDirectiveCard`, and `RadioIncidentLog`.

## Tech Stack
* **AI Models & Pipeline:**
  - Speech-to-Text: `Systran/faster-distil-whisper-large-v3` (Faster-Whisper)
  - Audio Processing: `librosa`, `numpy`
  - LLM Inference: `llama-3.3-70b-versatile` (via Groq API)
* **Backend:** Python + FastAPI + Uvicorn + WebSockets
* **Frontend:** React + Vite + Tailwind CSS + Recharts
* **Data Generation:** Local Text-to-Speech mock generators

---

## 🚀 Getting Started

### 1. Clone & Setup
Ensure you have Python 3.9+ and Node.js installed on your machine.
You will also need a Groq API key for the LLM analysis.

### 2. Backend Setup
Navigate to the `backend` directory and install the Python dependencies.
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

#### Generate Mock Data
We've included a script to generate dummy telemetry data and test radio `.wav` clips. Run this before starting the server:
```bash
python mock_telemetry_generator.py
```
*(This will generate `telemetry.json` and test audio clips).*

#### Start the API Server
```bash
uvicorn main:app --reload
```
The FastAPI server will start at `http://localhost:8000`. The Whisper model is loaded into memory on startup; the initial run may take a few seconds to download the model weights to the local cache.

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
2. Observe the **Telemetry Chart** plotting the historical Lap Times vs. Stress Index.
3. Review the **Unified Driver Panel** and **Radio Incident Log** for ongoing updates.
4. Upload or stream audio clips to the system. The Faster-Whisper pipeline will transcribe the audio, extract acoustic metrics, and the Groq LLM will generate tactical directives and stress scores.
5. Watch the dashboard update dynamically with actionable insights.
