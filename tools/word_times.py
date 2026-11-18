"""Minutage mot à mot précis : python word_times.py audio.wav(16 kHz mono) sortie.json"""
import sys, json
import soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
audio, _ = sf.read(sys.argv[1], dtype="float32")
segs, _ = m.transcribe(audio, language="fr", word_timestamps=True)
words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
json.dump(words, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
print(" ".join(f"{x['w']}@{x['s']}" for x in words))
