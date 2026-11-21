"""Mesure la clarté (mots compris par Whisper) de Piper selon la variation, en moyenne sur plusieurs essais."""
import sys, os, io, wave, re, unicodedata, difflib, numpy as np
sys.argv += []
from piper import PiperVoice
from piper.config import SynthesisConfig
from faster_whisper import WhisperModel
import librosa
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from piper_epic import phonetique
v = PiperVoice.load(os.path.join(D, "piper/fr_FR-upmc-medium.onnx"))
wm = WhisperModel("medium", device="cpu", compute_type="int8")
T = "Fou b5, échec ! Il bloque avec son pion en c6. C'est l'erreur fatale. Tu prends en c6, et tu laisses ta dame en prise ! Personne ne refuse une dame gratuite."
n = lambda s: re.sub(r"[^a-z0-9' ]", " ", unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode()).split()
ref = n(T)
for var, w, speed in [(0.4, 0.4, 0.95), (0.5, 0.45, 0.95), (0.6, 0.5, 0.95), (0.7, 0.6, 0.95), (0.5, 0.45, 1.05)]:
    sc = []
    for k in range(3):
        buf = io.BytesIO()
        with wave.open(buf, "wb") as f:
            v.synthesize_wav(phonetique(T), f, syn_config=SynthesisConfig(speaker_id=1, length_scale=speed, noise_scale=var, noise_w_scale=w))
        buf.seek(0)
        with wave.open(buf) as f:
            a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        a = librosa.resample(a, orig_sr=22050, target_sr=16000)
        segs, _ = wm.transcribe(a, language="fr", beam_size=5)
        h = n(" ".join(s.text for s in segs))
        sc.append(sum(b.size for b in difflib.SequenceMatcher(None, ref, h).get_matching_blocks()) / len(ref))
    print(f"variation={var} régularité={w} vitesse={speed} -> clarté moyenne {100*np.mean(sc):.0f} % (min {100*min(sc):.0f} %)")
