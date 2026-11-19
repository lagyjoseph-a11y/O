#!/usr/bin/env bash
# Traitement voix off (même réglage que les vidéos précédentes) : corps, coupes des résonances, expandeur, compression, -14 LUFS.
# Usage : tools/process_voice.sh entree.mp3 sortie.mp3
set -e
NOTCH="equalizer=f=140:t=q:w=4:g=-6,equalizer=f=402:t=q:w=5:g=-2.5,equalizer=f=1656:t=q:w=5:g=-3,equalizer=f=2328:t=q:w=5:g=-4,equalizer=f=2660:t=q:w=5:g=-2"
TONE="highpass=f=70,lowshelf=f=180:g=3,equalizer=f=5500:t=q:w=1:g=-3,highshelf=f=6500:g=-10"
ffmpeg -v error -y -i "$1" -af "$NOTCH,$TONE,agate=threshold=0.015:ratio=2.5:range=0.12:attack=3:release=70,acompressor=threshold=-22dB:ratio=3:attack=5:release=150:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 44100 -b:a 192k "$2"
