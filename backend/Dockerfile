FROM python:3.10-slim

# Install ffmpeg and audio libraries required for Whisper & Torchaudio
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download model to bake into Docker image cache for instant cold starts
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('Systran/faster-distil-whisper-large-v3', device='cpu', compute_type='int8')"

# Copy backend application files
COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
