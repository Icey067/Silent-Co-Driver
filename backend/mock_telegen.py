import time
import json
import random
import os

TELEMETRY_FILE = "telemetry.json"

def generate_telemetry():
    print("🏎️  F1 Telemetry Live Generator Started...")
    print("Press Ctrl+C to stop.")
    
    # Initialize or load existing telemetry
    if os.path.exists(TELEMETRY_FILE):
        try:
            with open(TELEMETRY_FILE, "r") as f:
                data = json.load(f)
        except Exception:
            data = []
    else:
        data = []

    lap = data[-1].get("lap", 0) if data else 0
    base_lap_time = 85.0 # Base time in seconds
    
    try:
        while True:
            lap += 1
            
            # Simulate a tire degradation pattern (lap time slowly increases)
            # Add some randomness for traffic, DRS, or mistakes
            lap_time_variance = random.uniform(-0.8, 1.8)
            
            # Evolving stint logic: times drop as fuel burns, but rise as tires degrade.
            # Simplified: just general fluctuation trending slightly upwards.
            lap_time = round(base_lap_time + (lap * 0.05) + lap_time_variance, 3)
            
            # Stress builds on bad laps
            stress_score = min(10, max(0, int((lap * 0.2) + random.randint(-1, 2))))
            
            # Spike stress if lap time is unusually slow
            if lap_time > base_lap_time + 1.2:
                stress_score = min(10, stress_score + random.randint(2, 4))
                
            status = "Calm"
            if stress_score >= 8:
                status = "Frustrated"
            elif stress_score >= 5:
                status = "Stressed"
                
            new_lap = {
                "lap": lap,
                "lap_time": lap_time,
                "stress_score": stress_score,
                "status": status,
                "radio_id": f"lap{lap}.wav"
            }
            
            data.append(new_lap)
            
            # Keep a rolling window of 25 laps for a clean chart UI
            if len(data) > 25:
                data = data[-25:]
                
            # Safely write to file using atomic replacement
            temp_file = TELEMETRY_FILE + ".tmp"
            with open(temp_file, "w") as f:
                json.dump(data, f, indent=2)
            os.replace(temp_file, TELEMETRY_FILE)
            
            print(f"🏁 Generated Lap {lap}: Time={lap_time}s | Stress={stress_score}/10 | Status={status}")
            
            # Sleep to simulate real-time lap progression (5 seconds for fast demo pace)
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\n🛑 Telemetry generation stopped.")

if __name__ == "__main__":
    generate_telemetry()
