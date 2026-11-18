"""Voix locale (Kokoro) : python tools/tts_kokoro.py "texte" sortie.wav [voix] [vitesse]"""
import sys, os, soundfile as sf
from kokoro_onnx import Kokoro
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kokoro")
k = Kokoro(os.path.join(d, "kokoro-v1.0.onnx"), os.path.join(d, "voices-v1.0.bin"))
text, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "ff_siwis"
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.1
samples, sr = k.create(text, voice=voice, speed=speed, lang="fr-fr")
sf.write(out, samples, sr)
print(out)
