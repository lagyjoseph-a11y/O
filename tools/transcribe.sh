#!/usr/bin/env bash
# « Écouter » une vidéo : transcription FR mot à mot. Usage : tools/transcribe.sh video.mp4 sortie_sans_ext
set -e
D="$(cd "$(dirname "$0")" && pwd)"
TMP=$(mktemp --suffix .wav)
ffmpeg -v error -y -i "$1" -ar 16000 -ac 1 "$TMP"
"$D/whisper.cpp/build/bin/whisper-cli" -m "$D/whisper.cpp/models/ggml-medium.bin" -l fr -f "$TMP" -ojf -osrt -of "$2" -t "$(nproc)"
rm -f "$TMP"
