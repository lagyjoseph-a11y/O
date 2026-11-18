"""Compare des voix à une référence : empreinte vocale (wespeaker) + hauteur + débit.
Usage : python compare_voices.py dossier_wav reference.wav"""
import sys, os, glob, numpy as np, soundfile as sf, librosa, sherpa_onnx
d, ref = sys.argv[1], sys.argv[2]
model = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wespeaker_resnet34.onnx")
ext = sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=model, num_threads=4))
def emb(path):
    a, sr = sf.read(path, dtype="float32")
    s = ext.create_stream(); s.accept_waveform(sr, a); s.input_finished()
    e = np.array(ext.compute(s)); return e / np.linalg.norm(e)
def feats(path):
    a, sr = librosa.load(path, sr=16000)
    f0, v, _ = librosa.pyin(a, fmin=60, fmax=350, sr=sr)
    f0 = f0[~np.isnan(f0)]
    on = librosa.onset.onset_detect(y=a, sr=sr, units="time")
    return np.median(f0), np.std(f0), len(on) / (len(a) / sr)
R = emb(ref); rf = feats(ref)
print(f"REFERENCE  F0={rf[0]:.0f}Hz  var={rf[1]:.0f}  rythme={rf[2]:.2f}/s")
rows = []
for p in sorted(glob.glob(os.path.join(d, "*.wav"))):
    if os.path.abspath(p) == os.path.abspath(ref): continue
    f = feats(p); sim = float(R @ emb(p))
    # score : empreinte (principal) + proximité de hauteur et d'expressivité
    score = sim - abs(f[0] - rf[0]) / 400 - abs(f[1] - rf[1]) / 400
    rows.append((score, sim, os.path.basename(p)[:-4], f))
for sc, sim, n, f in sorted(rows, reverse=True):
    print(f"{n:18s} score={sc:.3f}  similarité={sim:.3f}  F0={f[0]:.0f}Hz var={f[1]:.0f} rythme={f[2]:.2f}/s")
