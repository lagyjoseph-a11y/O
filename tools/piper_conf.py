import sys, os, io, wave, numpy as np, librosa
from piper import PiperVoice
from piper.config import SynthesisConfig
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from piper_epic import phonetique
v = PiperVoice.load(os.path.join(D, "piper/fr_FR-upmc-medium.onnx")); wm = WhisperModel("medium", device="cpu", compute_type="int8")
for txt in sys.argv[1:]:
    cs = []
    for _ in range(6):
        buf = io.BytesIO()
        with wave.open(buf, "wb") as w:
            v.synthesize_wav(phonetique(txt), w, syn_config=SynthesisConfig(speaker_id=1, length_scale=1.0, noise_scale=0.62, noise_w_scale=0.42))
        buf.seek(0)
        with wave.open(buf) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        segs = list(wm.transcribe(librosa.resample(a, orig_sr=22050, target_sr=16000), language="fr", beam_size=5)[0])
        cs.append(np.mean([s.avg_logprob for s in segs]) if segs else -9)
    print(f"confiance moyenne {np.mean(cs):5.2f} (meilleure {max(cs):5.2f}) · {txt}")
