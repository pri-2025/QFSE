#!/bin/sh
# Quantum State Financial Engine - ML Engine Entrypoint
# Auto-generates dataset and trains model if model.pkl does not exist

set -e

MODEL_PATH="/app/model.pkl"

if [ ! -f "$MODEL_PATH" ]; then
  echo "🔄 model.pkl not found. Generating synthetic dataset..."
  python generate_dataset.py

  echo "🧠 Training ML model (this takes ~60s)..."
  python train_model.py

  echo "✅ model.pkl created."
else
  echo "✅ model.pkl found — skipping training."
fi

echo "🚀 Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
