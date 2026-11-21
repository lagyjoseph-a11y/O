#!/usr/bin/env bash
# Traitement propre pour la voix Piper : corps, clarté des consonnes, compression, -14 LUFS.
# (Pas de changement de hauteur global ni d'excitateur : ils donnaient un grain métallique « robot ».)
# Usage : tools/epic_voice.sh entree.wav sortie.mp3
set -e
ffmpeg -v error -y -i "$1" -af "aresample=44100,highpass=f=75,lowshelf=f=160:g=3,equalizer=f=350:t=q:w=1.4:g=-2.5,equalizer=f=2800:t=q:w=1.2:g=3.5,equalizer=f=5000:t=q:w=1.5:g=1.5,highshelf=f=8500:g=-3,acompressor=threshold=-22dB:ratio=3:attack=6:release=150:makeup=3,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=10" -ar 44100 -b:a 192k "$2"
