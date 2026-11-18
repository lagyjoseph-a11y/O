"""Énergie moyenne par bande (parties parlées) : python spectrum.py a.wav b.wav"""
import sys, numpy as np, librosa
bands = [(60,120),(120,250),(250,500),(500,1000),(1000,2000),(2000,4000),(4000,6000),(6000,8000)]
res = {}
for p in sys.argv[1:]:
    a, sr = librosa.load(p, sr=16000)
    S = np.abs(librosa.stft(a, n_fft=2048, hop_length=512))**2
    f = librosa.fft_frequencies(sr=sr, n_fft=2048)
    e = S.sum(0); S = S[:, e > np.percentile(e, 40)]  # garde les trames parlées
    tot = S.sum()
    res[p] = [10*np.log10(S[(f>=lo)&(f<hi)].sum()/tot) for lo,hi in bands]
names = list(res)
print("bande(Hz)    " + "  ".join(n.split('/')[-1][:12].ljust(12) for n in names) + "  écart")
for i,(lo,hi) in enumerate(bands):
    v = [res[n][i] for n in names]
    print(f"{lo:>4}-{hi:<5}   " + "  ".join(f"{x:12.1f}" for x in v) + f"  {v[0]-v[1]:+.1f}")
