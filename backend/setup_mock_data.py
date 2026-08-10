import json
import os
import pyttsx3

def generate_mock_data():
    os.makedirs("audio_clips", exist_ok=True)
    
    engine = pyttsx3.init()
    
    telemetry_data = [
        { "lap": 1, "lap_time": 84.2, "stress_score": 2, "mood": "Calm", "radio_id": "lap1.wav" },
        { "lap": 2, "lap_time": 84.0, "stress_score": 2, "mood": "Calm", "radio_id": "lap2.wav" },
        { "lap": 3, "lap_time": 84.5, "stress_score": 3, "mood": "Calm", "radio_id": "lap3.wav" },
        { "lap": 4, "lap_time": 86.1, "stress_score": 8, "mood": "Stressed", "radio_id": "lap4.wav" },
        { "lap": 5, "lap_time": 87.3, "stress_score": 9, "mood": "Stressed", "radio_id": "lap5.wav" },
        { "lap": 6, "lap_time": 87.5, "stress_score": 9, "mood": "Stressed", "radio_id": "lap6.wav" },
        { "lap": 7, "lap_time": 86.8, "stress_score": 6, "mood": "Tired", "radio_id": "lap7.wav" },
        { "lap": 8, "lap_time": 86.5, "stress_score": 5, "mood": "Tired", "radio_id": "lap8.wav" },
        { "lap": 9, "lap_time": 85.2, "stress_score": 4, "mood": "Tired", "radio_id": "lap9.wav" },
        { "lap": 10, "lap_time": 84.8, "stress_score": 3, "mood": "Calm", "radio_id": "lap10.wav" }
    ]
    
    with open("telemetry.json", "w") as f:
        json.dump(telemetry_data, f, indent=2)
    print("telemetry.json generated with 10 laps.")

    audio_samples = [
        {"filename": "audio_clips/lap1.wav", "text": "The car feels good, tires are holding up well. I'm hitting my marks."},
        {"filename": "audio_clips/lap4.wav", "text": "I'm pushing, but the rear is getting a bit loose."},
        {"filename": "audio_clips/lap5.wav", "text": "No grip in the rear, I'm sliding everywhere!"}
    ]
    
    for sample in audio_samples:
        filepath = sample["filename"]
        print(f"Generating {filepath}...")
        engine.save_to_file(sample["text"], filepath)
        
    engine.runAndWait()
    print("Mock audio generation complete.")

if __name__ == "__main__":
    generate_mock_data()
