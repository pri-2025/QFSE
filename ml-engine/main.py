"""
Quantum State Financial Engine - FastAPI ML Inference Server

Endpoints:
  GET  /health              - Liveness check with model metadata
  POST /predict-risk        - Predict default probability
  POST /simulate-intervention - Simulate intervention effect with delta
  POST /retrain             - Re-generate dataset and retrain model
"""

import json
import os
import threading
import subprocess
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
MODEL_PATH  = Path(os.environ.get("MODEL_PATH", str(BASE_DIR / "model.pkl")))
NAMES_PATH  = BASE_DIR / "feature_names.json"

# ── Model state (lazy load) ───────────────────────────────────
_model_bundle: Optional[dict] = None
_model_lock   = threading.Lock()
_training     = False

def load_model() -> Optional[dict]:
    """Load model from disk. Returns None if not found."""
    if MODEL_PATH.exists():
        bundle = joblib.load(MODEL_PATH)
        accuracy = bundle["metadata"].get("accuracy", 0)
        auc      = bundle["metadata"].get("auc_roc", 0)
        name     = bundle["metadata"].get("model_name", "Unknown")
        print(f"[ML] Model loaded: {name} | Accuracy={accuracy:.4f} | AUC={auc:.4f}")
        return bundle
    return None

def get_or_train_model() -> dict:
    """Get model, auto-training if missing."""
    global _model_bundle, _training
    with _model_lock:
        if _model_bundle is not None:
            return _model_bundle
        bundle = load_model()
        if bundle is not None:
            _model_bundle = bundle
            return _model_bundle
        # Auto-train
        print("[ML] Model not found — auto-training now (this may take ~60s)...")
        _training = True
        subprocess.run(["python", "generate_dataset.py"], check=True, cwd=str(BASE_DIR))
        subprocess.run(["python", "train_model.py"],    check=True, cwd=str(BASE_DIR))
        bundle = load_model()
        if bundle is None:
            raise RuntimeError("Training completed but model.pkl still not found.")
        _model_bundle = bundle
        _training     = False
        return _model_bundle

# ── Try loading on startup (non-blocking if missing) ─────────
try:
    _model_bundle = load_model()
except Exception as e:
    print(f"[ML] WARNING: Could not load model on startup: {e}")

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(
    title="QFSE ML Engine",
    description="Pre-Delinquency Risk Prediction Engine",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response schemas ────────────────────────────────
class RiskInput(BaseModel):
    salary_delay_freq:         float = Field(..., ge=0, le=1,  description="Frequency of salary delays (0-1)")
    credit_utilization_ratio:  float = Field(..., ge=0, le=1,  description="Credit utilization ratio (0-1)")
    emi_payment_consistency:   float = Field(..., ge=0, le=1,  description="EMI payment success rate (0-1)")
    withdrawal_spikes:         float = Field(..., ge=0, le=1,  description="Normalised withdrawal spike count (0-1)")
    loan_to_income_ratio:      float = Field(..., ge=0, le=5,  description="Loan balance / monthly income")
    past_intervention_success: float = Field(0.0, ge=0, le=1,  description="Past intervention success rate (0-1)")
    linked_instability_score:  float = Field(0.0, ge=0, le=1,  description="Linked person instability score (0-1)")

    class Config:
        json_schema_extra = {
            "example": {
                "salary_delay_freq": 0.65,
                "credit_utilization_ratio": 0.82,
                "emi_payment_consistency": 0.45,
                "withdrawal_spikes": 0.40,
                "loan_to_income_ratio": 0.70,
                "past_intervention_success": 0.0,
                "linked_instability_score": 0.35,
            }
        }

class RiskOutput(BaseModel):
    probability:        float
    risk_state:         str
    feature_importance: Dict[str, float]
    confidence_score:   float
    model_version:      str
    model_name:         str

class SimulationOutput(BaseModel):
    original_probability:   float
    simulated_probability:  float
    delta:                  float
    risk_reduction_pct:     float
    risk_state:             str
    projected_risk_state:   str
    confidence_score:       float
    modified_features:      Dict[str, float]
    feature_importance:     Dict[str, float]
    model_name:             str

# ── Helpers ───────────────────────────────────────────────────
def get_risk_state(prob: float) -> str:
    if prob < 0.30:  return "Healthy"
    if prob < 0.50:  return "Watchlist"
    if prob < 0.75:  return "At Risk"
    return "Imminent Default"

def get_feature_importance(model_pipeline, feature_names) -> Dict[str, float]:
    clf = model_pipeline.named_steps["clf"]
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
    elif hasattr(clf, "coef_"):
        importances = np.abs(clf.coef_[0])
    else:
        importances = np.ones(len(feature_names))
    total = importances.sum()
    if total > 0:
        importances = importances / total
    return {name: round(float(imp), 4) for name, imp in zip(feature_names, importances)}

def run_inference(features_dict: dict, bundle: dict) -> tuple:
    """Run model inference. Returns (probability, confidence, risk_state, feature_imp)."""
    FEATURE_NAMES = bundle["metadata"]["feature_names"]
    MODEL         = bundle["model"]
    features = np.array([[
        features_dict["salary_delay_freq"],
        features_dict["credit_utilization_ratio"],
        features_dict["emi_payment_consistency"],
        features_dict["withdrawal_spikes"],
        features_dict["loan_to_income_ratio"],
        features_dict["past_intervention_success"],
        features_dict["linked_instability_score"],
    ]])
    prob_arr    = MODEL.predict_proba(features)[0]
    probability = float(prob_arr[1])
    confidence  = min(0.99, abs(probability - 0.5) * 2)
    feature_imp = get_feature_importance(MODEL, FEATURE_NAMES)
    return probability, confidence, get_risk_state(probability), feature_imp

INTERVENTION_EFFECTS = {
    "EMI Holiday": {
        "emi_payment_consistency":  ("add", 0.25),
        "salary_delay_freq":        ("sub", 0.10),
    },
    "Loan Restructuring": {
        "loan_to_income_ratio":     ("sub", 0.20),
        "emi_payment_consistency":  ("add", 0.15),
    },
    "Partial Payment Plan": {
        "emi_payment_consistency":  ("add", 0.20),
        "withdrawal_spikes":        ("sub", 0.15),
    },
    "Flexible Repayment": {
        "emi_payment_consistency":  ("add", 0.18),
        "loan_to_income_ratio":     ("sub", 0.10),
        "withdrawal_spikes":        ("sub", 0.10),
    },
}

# ── Endpoints ─────────────────────────────────────────────────
@app.get("/health")
def health():
    global _training
    if _training:
        return {"status": "training", "message": "Model is being trained, please retry in 60s"}
    bundle = _model_bundle
    if bundle is None:
        return {"status": "no_model", "message": "Model not loaded yet — send a prediction request to auto-train"}
    meta = bundle["metadata"]
    return {
        "status":      "healthy",
        "model":       meta["model_name"],
        "accuracy":    meta["accuracy"],
        "auc_roc":     meta["auc_roc"],
        "model_path":  str(MODEL_PATH),
    }

@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk(payload: RiskInput):
    """Predict default probability for a customer given their financial features."""
    try:
        bundle = get_or_train_model()
        features = payload.model_dump()
        prob, conf, risk_state, feat_imp = run_inference(features, bundle)
        meta = bundle["metadata"]
        return RiskOutput(
            probability        = round(prob, 4),
            risk_state         = risk_state,
            feature_importance = feat_imp,
            confidence_score   = round(conf, 4),
            model_version      = "v1",
            model_name         = meta["model_name"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate-intervention", response_model=SimulationOutput)
def simulate_intervention(payload: RiskInput, action_type: str = "EMI Holiday"):
    """
    Simulate the effect of an intervention on default probability.
    Returns original vs projected probability, delta, and modified features.
    """
    try:
        bundle = get_or_train_model()
        original_features = payload.model_dump()

        # Baseline prediction
        orig_prob, _, orig_state, _ = run_inference(original_features, bundle)

        # Apply intervention effects
        effects = INTERVENTION_EFFECTS.get(action_type, {})
        modified_features = dict(original_features)
        for feature, (op, delta) in effects.items():
            if op == "add":
                modified_features[feature] = min(1.0, modified_features[feature] + delta)
            else:
                modified_features[feature] = max(0.0, modified_features[feature] - delta)
        # Boost past_intervention_success
        modified_features["past_intervention_success"] = min(
            1.0, modified_features["past_intervention_success"] + 0.30
        )

        sim_prob, sim_conf, sim_state, feat_imp = run_inference(modified_features, bundle)

        delta = orig_prob - sim_prob
        risk_reduction_pct = round((delta / orig_prob * 100) if orig_prob > 0 else 0, 1)

        # Only report actually-changed features
        changed = {
            k: round(modified_features[k], 4)
            for k in modified_features
            if round(modified_features[k], 4) != round(original_features[k], 4)
        }

        return SimulationOutput(
            original_probability   = round(orig_prob,  4),
            simulated_probability  = round(sim_prob,   4),
            delta                  = round(delta,      4),
            risk_reduction_pct     = max(0.0, risk_reduction_pct),
            risk_state             = orig_state,
            projected_risk_state   = sim_state,
            confidence_score       = round(sim_conf, 4),
            modified_features      = changed,
            feature_importance     = feat_imp,
            model_name             = bundle["metadata"]["model_name"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _retrain_background():
    """Background task: regenerate dataset and retrain model."""
    global _model_bundle, _training
    _training = True
    try:
        print("[ML] /retrain — regenerating dataset...")
        subprocess.run(["python", "generate_dataset.py"], check=True, cwd=str(BASE_DIR))
        print("[ML] /retrain — retraining model...")
        subprocess.run(["python", "train_model.py"],    check=True, cwd=str(BASE_DIR))
        with _model_lock:
            _model_bundle = load_model()
        print(f"[ML] /retrain — complete. New model: {_model_bundle['metadata']['model_name']}")
    except Exception as e:
        print(f"[ML] /retrain — ERROR: {e}")
    finally:
        _training = False

@app.post("/retrain")
def retrain(background_tasks: BackgroundTasks):
    """Trigger model retraining asynchronously."""
    global _training
    if _training:
        raise HTTPException(status_code=409, detail="Training already in progress")
    background_tasks.add_task(_retrain_background)
    return {"status": "training_started", "message": "Model retraining started. Poll /health for completion."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
