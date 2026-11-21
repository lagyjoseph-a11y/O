"""Voix off « épique » gratuite avec Piper (voix pierre, upmc, CC-BY-SA 4.0).

Phrase par phrase : réglages selon le ton (exclamation, question, suspense, normal),
pauses calibrées, coups d'échecs écrits en phonétique pour une bonne articulation.

Règle d'écriture : ne pas commencer une phrase par un impératif (« Prends… ») → écrire « Tu prends… ».

Usage : python piper_epic.py "texte" sortie.wav [--preset epique|clair] [--best N]
  --best N : génère N prises par phrase et garde la mieux comprise par Whisper (articulation).
Sortie : WAV mono 22 050 Hz + sortie.json (début/fin de chaque phrase, pour les sous-titres).
"""
import json, os, re, sys, wave, io, difflib, unicodedata
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

D = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(D, "piper/fr_FR-upmc-medium.onnx")
PIERRE = 1

LETTRES = {"a": "a", "b": "bé", "c": "cé", "d": "dé", "e": "eu", "f": "èf", "g": "gé", "h": "ache"}
CHIFFRES = {"1": "un", "2": "deux", "3": "trois", "4": "quatre", "5": "cinq", "6": "six", "7": "sept", "8": "huit"}
NOMBRES = {"10": "dix", "9": "neuf", "7": "sept", "6": "six", "5": "cinq"}


def phonetique(t: str) -> str:
    """Rend les cases et nombres prononçables : « b5 » -> « bé cinq »."""
    t = re.sub(r"\b([a-h])([1-8])\b", lambda m: f"{LETTRES[m.group(1)]} {CHIFFRES[m.group(2)]}", t)
    t = re.sub(r"\b(\d+),(\d+)\s*€", lambda m: f"{m.group(1)} euros {m.group(2)}", t)
    t = re.sub(r"\b(10|9|7|6|5)\b", lambda m: NOMBRES[m.group(1)], t)
    t = t.replace("e-book", "i-bouk").replace("Échec et mat", "Échec, et mat")
    return t


# Réglages par ton : vitesse (length_scale, <1 = plus rapide), variation, régularité, gain dB, pause après (s)
PRESETS = {
    "epique": {  # calibré sur la clarté mesurée par Whisper (98 % de mots compris en moyenne)
        "exclamation": (0.95, 0.60, 0.50, 2.5, 0.22),
        "question": (0.95, 0.60, 0.50, 1.0, 0.30),
        "suspense": (1.02, 0.55, 0.45, 0.0, 0.50),
        "normal": (0.95, 0.60, 0.50, 0.0, 0.22),
    },
    "clair": {
        "exclamation": (0.95, 0.60, 0.45, 1.5, 0.25),
        "question": (1.0, 0.60, 0.45, 0.5, 0.30),
        "suspense": (1.08, 0.55, 0.40, 0.0, 0.55),
        "normal": (1.0, 0.55, 0.40, 0.0, 0.25),
    },
}


def decouper(texte: str):
    morceaux = re.findall(r"[^.!?…]+(?:[.!?…]+|$)", texte)
    out = []
    for m in morceaux:
        m = m.strip()
        if not m:
            continue
        ton = "exclamation" if m.endswith("!") else "question" if m.endswith("?") else "suspense" if m.endswith("…") else "normal"
        out.append((m, ton))
    return out


def _norm(t):
    t = unicodedata.normalize("NFD", t.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9 ]", " ", t.replace("maths", "mat").replace("mate", "mat")).split()


def score(attendu, entendu):
    r, h = _norm(attendu), _norm(entendu)
    return sum(b.size for b in difflib.SequenceMatcher(None, r, h).get_matching_blocks()) / max(1, len(r))


def main():
    texte, sortie = sys.argv[1], sys.argv[2]
    preset = PRESETS[sys.argv[sys.argv.index("--preset") + 1] if "--preset" in sys.argv else "epique"]
    voix = PiperVoice.load(MODEL)
    best = int(sys.argv[sys.argv.index("--best") + 1]) if "--best" in sys.argv else 1
    juge = None
    if best > 1:
        from faster_whisper import WhisperModel
        juge = WhisperModel("medium", device="cpu", compute_type="int8")
    sr = voix.config.sample_rate
    audio, segments, t = [], [], 0.0
    for phrase, ton in decouper(texte):
        vitesse, var, regul, gain, pause = preset[ton]
        if re.search(r"\bmat\b", phrase, re.I):  # « échec et mat » : toujours posé, sinon mal articulé
            vitesse, pause = max(vitesse, 1.05), max(pause, 0.4)
        cfg = SynthesisConfig(speaker_id=PIERRE, length_scale=vitesse, noise_scale=var, noise_w_scale=regul)
        meilleur, meilleur_score = None, -1
        for _ in range(best):
            buf = io.BytesIO()
            with wave.open(buf, "wb") as w:
                voix.synthesize_wav(phonetique(phrase), w, syn_config=cfg)
            buf.seek(0)
            with wave.open(buf) as w:
                prise = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
            if best == 1:
                meilleur = prise
                break
            import librosa
            segs, _ = juge.transcribe(librosa.resample(prise, orig_sr=sr, target_sr=16000), language="fr", beam_size=5)
            sc = score(phrase, " ".join(x.text for x in segs))
            if sc > meilleur_score:
                meilleur, meilleur_score = prise, sc
            if sc >= 0.999:
                break
        a = meilleur
        if best > 1:
            print(f"{100*meilleur_score:5.0f} %  {phrase}")
        a = a * (10 ** (gain / 20))
        segments.append({"texte": phrase, "ton": ton, "debut": round(t, 3), "fin": round(t + len(a) / sr, 3)})
        audio += [a, np.zeros(int(pause * sr), dtype=np.float32)]
        t += len(a) / sr + pause
    a = np.concatenate(audio)
    a = a / max(1e-6, np.abs(a).max()) * 0.9
    with wave.open(sortie, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((a * 32767).astype(np.int16).tobytes())
    json.dump(segments, open(os.path.splitext(sortie)[0] + ".json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
