#!/usr/bin/env bash
# Mixe voix + musique : la musique démarre à DEBUT_S dans le morceau, ducking sous la voix, fondu de sortie.
# Usage : tools/mix_music.sh voix.mp3 musique.mp3 DEBUT_S DUREE_S sortie.mp3
set -e
V="$1"; M="$2"; ST="$3"; D="$4"; OUT="$5"
FO=$(python3 -c "print(max(0, $D - 1.5))")
ffmpeg -v error -y -i "$V" -ss "$ST" -t "$D" -i "$M" -filter_complex "[1]afade=t=in:d=0.15,afade=t=out:st=$FO:d=1.5,loudnorm=I=-19:TP=-2,volume=2dB,aformat=channel_layouts=stereo[m];[0]aformat=channel_layouts=stereo,asplit=2[v][vsc];[m][vsc]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=350[md];[v][md]amix=inputs=2:normalize=0:duration=longest,atrim=0:$D,alimiter=limit=0.95" -ar 44100 -b:a 192k "$OUT"
