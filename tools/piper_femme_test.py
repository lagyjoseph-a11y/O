import sys, os, io, wave, numpy as np, librosa
from piper import PiperVoice
from piper.config import SynthesisConfig
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from piper_epic import phonetique
vs = {"siwis": PiperVoice.load(os.path.join(D, "piper/fr_FR-siwis-medium.onnx"))}; wm = WhisperModel("medium", device="cpu", compute_type="int8")
T = "Fou b5, échec, il bloque avec son pion en c6. C'est l'erreur fatale, tu prends en c6, et tu laisses ta dame en prise ! Personne ne refuse une dame gratuite, et c'est échec et mat !"
for sid, nom in [(None, "femme (siwis)")]:
    v = vs["siwis"]
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        v.synthesize_wav(phonetique(T), w, syn_config=SynthesisConfig(speaker_id=sid, length_scale=1.0, noise_scale=0.6, noise_w_scale=0.42))
    buf.seek(0)
    with wave.open(buf) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    segs = list(wm.transcribe(librosa.resample(a, orig_sr=22050, target_sr=16000), language="fr", beam_size=5)[0])
    print(nom, "→", " ".join(s.text for s in segs), f"(confiance {np.mean([s.avg_logprob for s in segs]):.2f})")
