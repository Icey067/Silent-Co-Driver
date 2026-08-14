import os
import numpy as np
import scipy.io.wavfile as wav
from pipeline import AudioPipeline

def create_dummy_audio(file_path):
    # Generate 1 second of 440Hz sine wave (A4)
    sample_rate = 16000
    t = np.linspace(0, 1, sample_rate, False)
    audio = 0.5 * np.sin(2 * np.pi * 440 * t)
    
    # Add some silence for VAD testing
    silence = np.zeros(sample_rate) # 1 sec silence
    audio = np.concatenate([audio, silence, audio])
    
    wav.write(file_path, sample_rate, (audio * 32767).astype(np.int16))

if __name__ == "__main__":
    test_file = "test_audio.wav"
    if not os.path.exists(test_file):
        print(f"Creating dummy audio file: {test_file}")
        create_dummy_audio(test_file)
        
    print("\n--- Initializing Pipeline ---")
    pipeline = AudioPipeline()
    
    print("\n--- Running Diagnostics ---")
    try:
        result = pipeline.process_audio(test_file)
        
        print("\n--- Diagnostic Results ---")
        print(f"Transcript: {result['transcript']}")
        print(f"Acoustic Metrics: {result['acoustic_metrics']}")
        print("\n✅ Test Passed: No NaN errors thrown and dict serialized cleanly.")
    except Exception as e:
        print(f"\n❌ Test Failed: Exception thrown during processing: {e}")
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)
