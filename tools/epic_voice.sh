#!/usr/bin/env bash
# Traitement « épique » pour la voix Piper : plus grave (formants préservés), présence, compression, -14 LUFS.
# Usage : tools/epic_voice.sh entree.wav sortie.mp3 [demi-tons, défaut -1]
set -e
ST="${3:--1}"
P=$(python3 -c "print(2**($ST/12))")
ffmpeg -v error -y -i "$1" -af "aresample=44100,rubberband=pitch=$P:formant=preserved,highpass=f=70,lowshelf=f=150:g=3,equalizer=f=3000:t=q:w=1:g=2.5,equalizer=f=400:t=q:w=1.5:g=-2,aexciter=amount=1.5:drive=6:freq=4000,agate=threshold=0.015:ratio=2.5:range=0.15:attack=3:release=70,acompressor=threshold=-24dB:ratio=4:attack=4:release=120:makeup=3,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 44100 -b:a 192k "$2"
