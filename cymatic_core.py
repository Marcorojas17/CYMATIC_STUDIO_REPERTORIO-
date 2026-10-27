#!/usr/bin/env python3
import sys
import os
import hashlib
try:
    import numpy as np
    from scipy.io import wavfile
except ImportError:
    print("❌ Faltan dependencias. Ejecuta: pip install numpy scipy")
    sys.exit(1)

def analyze_audio(filepath):
    print(f"🔍 Analizando: {filepath}")
    try:
        sample_rate, data = wavfile.read(filepath)
        if len(data.shape) > 1: data = data[:, 0]
        
        fft_data = np.abs(np.fft.rfft(data))
        freqs = np.fft.rfftfreq(len(data), 1/sample_rate)
        peak_idx = np.argmax(fft_data)
        dominant_freq = freqs[peak_idx]
        
        print(f"✅ Frecuencia dominante: {dominant_freq:.2f} Hz")
        if 430 <= dominant_freq <= 450:
            print("⚠️ Ancla de 440 Hz (La4) detectada. Posible voz humana.")
        
        pattern_str = f"440Hz-{dominant_freq:.2f}-{len(data)}"
        visual_hash = hashlib.sha256(pattern_str.encode()).hexdigest()
        print(f"🔐 Firma SHA-256 (para KRONOS): {visual_hash}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 cymatic_core.py <audio.wav>")
    else:
        analyze_audio(sys.argv[1])
