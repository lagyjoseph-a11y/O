"""Voix Piper (gratuite, licences libres) : tts_piper.py modele.onnx "texte" sortie.wav [speaker] [vitesse] [variation]"""
import sys, wave
from piper import PiperVoice
from piper.config import SynthesisConfig
m, txt, out = sys.argv[1], sys.argv[2], sys.argv[3]
spk = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] != "-" else None
speed = float(sys.argv[5]) if len(sys.argv) > 5 else 0.9
var = float(sys.argv[6]) if len(sys.argv) > 6 else 0.9
v = PiperVoice.load(m)
cfg = SynthesisConfig(speaker_id=spk, length_scale=speed, noise_scale=var, noise_w_scale=1.0)
with wave.open(out, "wb") as w:
    v.synthesize_wav(txt, w, syn_config=cfg)
