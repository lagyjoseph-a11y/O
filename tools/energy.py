import sys, numpy as np, librosa
for p in sys.argv[1:]:
    a, sr = librosa.load(p, sr=16000)
    rms = librosa.feature.rms(y=a, frame_length=1024, hop_length=256)[0]
    db = 20*np.log10(rms + 1e-9); v = db[db > db.max() - 35]
    print(f"{p.split('/')[-1]:24s} dynamique(écart-type dB)={v.std():.1f}  crête-moyenne={np.percentile(v,95)-np.median(v):.1f}dB")
