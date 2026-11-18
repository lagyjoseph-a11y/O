"""Mesure la résonance d'une voix.
- queue : énergie 60-200 ms après la fin de chaque mot, relative au mot (dB, plus bas = plus sec)
- pics : fréquences qui ressortent de l'enveloppe spectrale lissée (résonances)
Usage : python resonance.py words.json audio1 [audio2 ...]"""
import sys, json, numpy as np, librosa
from scipy.ndimage import uniform_filter1d
words = json.load(open(sys.argv[1]))
for p in sys.argv[2:]:
    a, sr = librosa.load(p, sr=16000)
    def e(t0, t1):
        s = a[int(t0*sr):int(t1*sr)]; return np.mean(s**2) + 1e-12
    tails = []
    for i, w in enumerate(words[:-1]):
        gap = words[i+1]["s"] - w["e"]
        if gap > 0.25:  # pause nette après le mot
            tails.append(10*np.log10(e(w["e"]+0.06, w["e"]+0.2) / e(w["s"], w["e"])))
    S = np.abs(librosa.stft(a, n_fft=4096))**2
    spec = 10*np.log10(S.mean(1) + 1e-12); f = librosa.fft_frequencies(sr=sr, n_fft=4096)
    env = uniform_filter1d(spec, 60)
    d = spec - env; m = (f > 120) & (f < 3500)
    idx = [i for i in np.where(m)[0] if d[i] > 2.5 and d[i] == d[max(0,i-15):i+15].max()]
    peaks = ", ".join(f"{f[i]:.0f}Hz(+{d[i]:.1f})" for i in idx[:8])
    print(f"{p.split('/')[-1]:28s} queue={np.median(tails):6.1f} dB (n={len(tails)})  pics: {peaks}")
