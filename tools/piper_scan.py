"""Génère une phrase avec chaque locuteur MLS, mesure hauteur/expressivité/ressemblance. Usage: piper_scan.py dossier_sortie ref.wav"""
import sys, os, wave, numpy as np, librosa, sherpa_onnx
from piper import PiperVoice
from piper.config import SynthesisConfig
out, ref = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
D = os.path.dirname(os.path.abspath(__file__))
v = PiperVoice.load(os.path.join(D, "piper/fr_FR-mls-medium.onnx"))
ext = sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=os.path.join(D, "wespeaker_resnet34.onnx"), num_threads=4))
def emb(a, sr):
    s = ext.create_stream(); s.accept_waveform(sr, a); s.input_finished(); e = np.array(ext.compute(s)); return e / np.linalg.norm(e)
r, _ = librosa.load(ref, sr=16000); R = emb(r, 16000)
txt = "Fou b5, échec ! Il bloque avec son pion. C'est l'erreur fatale !"
rows = []
for sid in range(125):
    p = os.path.join(out, f"mls{sid:03d}.wav")
    with wave.open(p, "wb") as w:
        v.synthesize_wav(txt, w, syn_config=SynthesisConfig(speaker_id=sid))
    a, _ = librosa.load(p, sr=16000)
    f0, _, _ = librosa.pyin(a, fmin=60, fmax=350, sr=16000); f0 = f0[~np.isnan(f0)]
    if len(f0) < 10: continue
    rows.append((sid, np.median(f0), np.std(f0), float(R @ emb(a, 16000))))
males = [x for x in rows if x[1] < 150]
print(f"{len(rows)} voix, {len(males)} masculines (F0<150 Hz)")
for sid, f0, var, sim in sorted(males, key=lambda x: -(x[3] + x[2] / 100))[:12]:
    print(f"mls{sid:03d}  F0={f0:.0f}Hz  expressivité={var:.0f}  ressemblance={sim:.3f}")
