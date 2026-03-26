#!/bin/sh
# QFSE ML Engine Entrypoint
# Auto-generates dataset and trains model if model.pkl not found in volume mount.

set -e

MODEL_PATH="${MODEL_PATH:-/app/model_cache/model.pkl}"

# Create model cache dir if needed
mkdir -p "$(dirname "$MODEL_PATH")"

if [ ! -f "$MODEL_PATH" ]; then
  echo "[ML] model.pkl not found at $MODEL_PATH. Starting auto-train..."

  echo "[ML] Generating synthetic dataset..."
  cd /app && python generate_dataset.py

  echo "[ML] Training model (Logistic Regression + Random Forest, ~60s)..."
  cd /app && MODEL_PATH="$MODEL_PATH" python train_model.py

  # Verify
  if [ ! -f "$MODEL_PATH" ]; then
    echo "[ML] ERROR: Training finished but $MODEL_PATH still not found."
    exit 1
  fi
  echo "[ML] model.pkl created at $MODEL_PATH"
else
  echo "[ML] model.pkl found at $MODEL_PATH — skipping training."
fi

echo "[ML] Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
