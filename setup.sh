#!/usr/bin/env bash
# Réinstalle les outils lourds (non versionnés) : deps npm, whisper.cpp + modèle, Kokoro.
set -e
cd "$(dirname "$0")"
(cd remotion && npm install)
(cd hyperframes && npm install)
mkdir -p tools
if [ ! -x tools/whisper.cpp/build/bin/whisper-cli ]; then
  git clone --depth 1 https://github.com/ggml-org/whisper.cpp tools/whisper.cpp
  (cd tools/whisper.cpp && cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j"$(nproc)" --config Release)
fi
[ -f tools/whisper.cpp/models/ggml-medium.bin ] || bash tools/whisper.cpp/models/download-ggml-model.sh medium
[ -d tools/venv ] || python3 -m venv tools/venv
tools/venv/bin/pip install -q kokoro-onnx soundfile faster-whisper
mkdir -p tools/kokoro
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -f tools/kokoro/$f ] || curl -sSLf -o tools/kokoro/$f https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f
done
echo "OK"
