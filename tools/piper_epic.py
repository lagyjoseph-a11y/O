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
# Réglages par ton : vitesse (length_scale, >1 = plus lent), variation, régularité, gain dB, pause après (s), hauteur (demi-tons)
# Réglages par ton : vitesse (length_scale, >1 = plus lent), variation, régularité, gain dB, pause après (s)
# Plus aucun changement de hauteur artificiel (il donnait un son métallique) : l'expressivité vient
# du choix, parmi plusieurs prises bien articulées, de celle dont l'intonation varie le plus.
PRESETS = {
    "epique": {
        "exclamation": (0.97, 0.68, 0.45, 3.0, 0.25),
        "question": (1.00, 0.66, 0.45, 1.0, 0.35),
        "suspense": (1.08, 0.62, 0.40, -1.0, 0.60),
        "normal": (1.00, 0.62, 0.42, 0.0, 0.25),
        "mat": (1.12, 0.62, 0.40, 4.0, 0.50),
    },
    "clair": {
        "exclamation": (1.00, 0.55, 0.40, 1.5, 0.25),
        "question": (1.02, 0.55, 0.40, 0.5, 0.30),
        "suspense": (1.10, 0.50, 0.35, 0.0, 0.55),
        "normal": (1.02, 0.55, 0.40, 0.0, 0.25),
        "mat": (1.15, 0.50, 0.35, 2.0, 0.50),
    },
}


def expressivite(a, sr, ton):
    """Variation de l'intonation (écart-type de la hauteur en demi-tons) ; bonus si une exclamation finit plus haut."""
    import librosa
    f0, _, _ = librosa.pyin(a, fmin=70, fmax=300, sr=sr, frame_length=1024)
    f0 = f0[~np.isnan(f0)]
    if len(f0) < 8:
        return 0.0
    st = 12 * np.log2(f0 / np.median(f0))
    bonus = 0.0
    if ton in ("exclamation", "mat"):
        q = len(st) // 3
        bonus = max(0.0, np.mean(st[-q:]) - np.mean(st[:q])) * 0.5 + np.percentile(st, 90) * 0.3
    return float(np.std(st) + bonus)


def hauteur(a, sr, demi_tons):
    """Change la hauteur d'une phrase (formants préservés, haute qualité) via rubberband."""
    if abs(demi_tons) < 0.01:
        return a
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, "i.wav"), os.path.join(d, "o.wav")
        with wave.open(i, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", i, "-af",
                        f"rubberband=pitch={2 ** (demi_tons / 12)}:formant=preserved:pitchq=quality:transients=smooth", o], check=True)
        with wave.open(o) as w:
            return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def fusionner(morceaux, mini=5):
    """Piper sonne « robot » sur les phrases très courtes (pas assez de contexte pour l'intonation) :
    une phrase de moins de `mini` mots est fusionnée avec la suivante (ou la précédente si c'est la dernière)."""
    out = []
    for m in morceaux:
        if out and len(out[-1].split()) < mini:
            out[-1] = re.sub(r"\s*[.!?…]+$", ",", out[-1].rstrip()) + " " + m[0].lower() + m[1:]
        else:
            out.append(m)
    if len(out) > 1 and len(out[-1].split()) < mini:
        dernier = out.pop()
        out[-1] = re.sub(r"\s*[.!?…]+$", ",", out[-1].rstrip()) + " " + dernier[0].lower() + dernier[1:]
    return out


def decouper(texte: str):
    morceaux = fusionner([m.strip() for m in re.findall(r"[^.!?…]+(?:[.!?…]+|$)", texte) if m.strip()])
    out = []
    for m in morceaux:
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
        if re.search(r"\bmat\b", phrase, re.I):  # « échec et mat » : posé, appuyé, plus haut
            ton = "mat"
        vitesse, var, regul, gain, pause = preset[ton]
        cfg = SynthesisConfig(speaker_id=PIERRE, length_scale=vitesse, noise_scale=var, noise_w_scale=regul)
        prises = []
        for _ in range(best):
            buf = io.BytesIO()
            with wave.open(buf, "wb") as w:
                voix.synthesize_wav(phonetique(phrase), w, syn_config=cfg)
            buf.seek(0)
            with wave.open(buf) as w:
                prise = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
            if best == 1:
                prises.append((1.0, 0.0, prise))
                break
            import librosa
            segs, _ = juge.transcribe(librosa.resample(prise, orig_sr=sr, target_sr=16000), language="fr", beam_size=5)
            segs = list(segs)
            confiance = float(np.mean([x.avg_logprob for x in segs])) if segs else -9.0
            prises.append((score(phrase, " ".join(x.text for x in segs)), confiance, prise))
        # 1) articulation (prises les mieux comprises), 2) puis la plus naturelle : celle dont Whisper est le plus sûr.
        # (Choisir « la plus expressive » favorisait des prises qui déraillent, au son robotique.)
        top = max(p[0] for p in prises)
        clarte, conf, meilleur = max((p for p in prises if p[0] >= top - 0.02), key=lambda p: p[1])
        if best > 1:
            print(f"{100*clarte:5.0f} % compris · confiance {conf:5.2f} · {phrase}")
        a = meilleur
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
