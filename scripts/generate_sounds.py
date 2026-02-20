"""
Generate simple audio feedback sounds for the math app.
Creates 3 MP3 files: correct.mp3, incorrect.mp3, click.mp3
"""
import numpy as np
import wave
import struct
import subprocess
import os

SAMPLE_RATE = 44100
OUTPUT_DIR = r"c:\Users\Nyx\Desktop\terapia\apk\math-app\assets\sounds"

def generate_tone(frequencies, duration, fade_in=0.01, fade_out=0.05):
    """Generate a tone with optional frequency list for chords/sequences."""
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)
    
    # Generate wave
    if isinstance(frequencies, list):
        # Multiple frequencies - create sequence
        segment_len = samples // len(frequencies)
        audio = np.zeros(samples)
        for i, freq in enumerate(frequencies):
            start = i * segment_len
            end = start + segment_len if i < len(frequencies) - 1 else samples
            segment_t = np.linspace(0, (end - start) / SAMPLE_RATE, end - start, False)
            audio[start:end] = np.sin(2 * np.pi * freq * segment_t)
    else:
        audio = np.sin(2 * np.pi * frequencies * t)
    
    # Apply fade in/out to avoid clicks
    fade_in_samples = int(SAMPLE_RATE * fade_in)
    fade_out_samples = int(SAMPLE_RATE * fade_out)
    
    audio[:fade_in_samples] *= np.linspace(0, 1, fade_in_samples)
    audio[-fade_out_samples:] *= np.linspace(1, 0, fade_out_samples)
    
    # Normalize
    audio = audio * 0.7
    return audio

def save_wav(audio, filename):
    """Save audio array as WAV file."""
    wav_path = os.path.join(OUTPUT_DIR, filename.replace('.mp3', '.wav'))
    
    # Convert to 16-bit PCM
    audio_int = np.int16(audio * 32767)
    
    with wave.open(wav_path, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(audio_int.tobytes())
    
    return wav_path

def convert_to_mp3(wav_path):
    """Convert WAV to MP3 using ffmpeg."""
    mp3_path = wav_path.replace('.wav', '.mp3')
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', wav_path, 
            '-codec:a', 'libmp3lame', '-qscale:a', '5',
            mp3_path
        ], capture_output=True, check=True)
        os.remove(wav_path)  # Clean up WAV
        print(f"Created: {mp3_path}")
        return True
    except FileNotFoundError:
        print("ffmpeg not found, keeping WAV files")
        # Rename WAV to MP3 extension for compatibility
        os.rename(wav_path, mp3_path)
        print(f"Created: {mp3_path} (actually WAV)")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Correct sound: ascending happy tones (C5 -> E5 -> G5)
    correct = generate_tone([523, 659, 784], duration=0.35, fade_out=0.1)
    wav = save_wav(correct, 'correct.mp3')
    convert_to_mp3(wav)
    
    # Incorrect sound: descending gentle tone (G4 -> E4)
    incorrect = generate_tone([392, 330], duration=0.3, fade_out=0.1)
    wav = save_wav(incorrect, 'incorrect.mp3')
    convert_to_mp3(wav)
    
    # Click sound: single short beep (A5)
    click = generate_tone(880, duration=0.08, fade_in=0.005, fade_out=0.03)
    wav = save_wav(click, 'click.mp3')
    convert_to_mp3(wav)
    
    print("\nAll sounds generated successfully!")

if __name__ == "__main__":
    main()
