import librosa
import numpy as np
from faster_whisper import WhisperModel
import warnings
import logging

logger = logging.getLogger(__name__)

# silence those annoying librosa warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

class AudioPipeline:
    def __init__(self):
        logger.info("Initializing AudioPipeline...")
        logger.info("Loading faster-distil-whisper-large-v3 model on CPU with int8...")
        self.whisper = WhisperModel("Systran/faster-distil-whisper-large-v3", device="cpu", compute_type="int8")
        logger.info("Model loaded successfully on CPU.")

    def extract_voice_metrics(self, y: np.ndarray, sr: int):
        # figure out how loud they're yelling (rms)
        rms = librosa.feature.rms(y=y)[0]
        mean_rms_energy = float(np.mean(rms)) if len(rms) > 0 else 0.0
        
        # extract the pitch
        pitches = librosa.yin(y, fmin=60, fmax=450, sr=sr)
        
        # drop the nans
        valid_pitches = pitches[~np.isnan(pitches)]
        if len(valid_pitches) > 5:
            mean_pitch = float(np.mean(valid_pitches))
            pitch_std = float(np.std(valid_pitches))
        else:
            mean_pitch = 0.0
            pitch_std = 0.0
            
        return {
            "rms_energy": mean_rms_energy,
            "mean_pitch": mean_pitch,
            "pitch_variability": pitch_std
        }

    def process_audio(self, file_path: str):
        logger.info(f"Processing audio: {file_path}")
        
        # guard against massive audio files
        duration = librosa.get_duration(path=file_path)
        if duration > 30.0:
            raise ValueError(f"Audio duration ({duration:.1f}s) exceeds the 30-second limit to prevent CPU thread starvation.")
        
        # load it up and normalize peaks
        y, sr = librosa.load(file_path, sr=16000, mono=True)
        y_normalized = librosa.util.normalize(y)

        # step 1: transcribe
        try:
            prompt = "F1 driver radio communications, racing terminology. Max, Lewis, Charles, Lando. understeer, oversteer, graining, blistering, delta, DRS, strat, mode, recharge, deploy, hards, mediums, softs, brake bias."
            segments, info = self.whisper.transcribe(
                y_normalized,
                language="en",
                temperature=0.0,
                beam_size=5,
                best_of=5,
                condition_on_previous_text=True,
                vad_filter=False,
                initial_prompt=prompt
            )
            
            transcript = []
            for segment in segments:
                transcript.append(segment.text.strip())
                
            full_transcript = " ".join(transcript)
        except Exception as e:
            logger.info(f"Transcription failed: {e}")
            full_transcript = ""
        
        # step 2: extract acoustic features
        features = self.extract_voice_metrics(y_normalized, sr)
        
        return {
            "transcript": full_transcript,
            "acoustic_metrics": features
        }
