"""
Quantum State Financial Engine - FastAPI ML Inference Server

Endpoints:
  GET  /health       - Liveness check
  POST /predict-risk - Predict default probability for a customer
"""

import json
import joblib
import numpy as np
from pathlib import Path
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
MODEL_PATH  = BASE_DIR / "model.pkl"
NAMES_PATH  = BASE_DIR / "feature_names.json"

# ── Load model on startup ─────────────────────────────────────
if not MODEL_PATH.exists():
    raise RuntimeError(
        f"Model not found at {MODEL_PATH}. "
        "Run python generate_dataset.py && python train_model.py first."
    )

bundle         = joblib.load(MODEL_PATH)
MODEL          = bundle["model"]
METADATA       = bundle["metadata"]
FEATURE_NAMES  = METADATA["feature_names"]

print(f"✅ Model loaded: {METADATA['model_name']}  AUC={METADATA['auc_roc']}")

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(
    title="QFSE ML Engine",
    description="Pre-Delinquency Risk Prediction Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response schemas ────────────────────────────────
class RiskInput(BaseModel):
    salary_delay_freq:         float = Field(..., ge=0, le=1, description="Frequency of salary delays (0-1)")
    credit_utilization_ratio:  float = Field(..., ge=0, le=1, description="Credit utilization ratio (0-1)")
    emi_payment_consistency:   float = Field(..., ge=0, le=1, description="EMI payment success rate (0-1)")
    withdrawal_spikes:         float = Field(..., ge=0, le=1, description="Normalised withdrawal spike count (0-1)")
    loan_to_income_ratio:      float = Field(..., ge=0, le=5, description="Loan balance / monthly income")
    past_intervention_success: float = Field(0.0, ge=0, le=1, description="Past intervention success rate (0-1)")
    linked_instability_score:  float = Field(0.0, ge=0, le=1, description="Linked person instability score (0-1)")

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
    probability:       float
    risk_state:        str
    feature_importance: Dict[str, float]
    confidence_score:  float
    model_version:     str
    model_name:        str

# ── Risk state mapping ────────────────────────────────────────
def get_risk_state(prob: float) -> str:
    if prob < 0.30:
        return "Healthy"
    elif prob < 0.50:
        return "Watchlist"
    elif prob < 0.75:
        return "At Risk"
    else:
        return "Imminent Default"

# ── Feature importance extraction ────────────────────────────
def get_feature_importance(model_pipeline, feature_vals: np.ndarray) -> Dict[str, float]:
    """
    Extract normalised feature importance from the underlying classifier.
    For RF: use feature_importances_.
    For LR: use absolute coefficient magnitudes.
    """
    clf = model_pipeline.named_steps["clf"]
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
    elif hasattr(clf, "coef_"):
        importances = np.abs(clf.coef_[0])
    else:
        # Fallback: equal weights
        importances = np.ones(len(FEATURE_NAMES))

    # Normalise to sum = 1
    total = importances.sum()
    if total > 0:
        importances = importances / total

    return {name: round(float(imp), 4) for name, imp in zip(FEATURE_NAMES, importances)}

# ── Endpoints ─────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":     "healthy",
        "model":      METADATA["model_name"],
        "accuracy":   METADATA["accuracy"],
        "auc_roc":    METADATA["auc_roc"],
    }

@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk(payload: RiskInput):
    """
    Predict default probability for a customer given their financial features.
    Returns probability (0-1), risk_state, feature importance map, and confidence.
    """
    try:
        features = np.array([[
            payload.salary_delay_freq,
            payload.credit_utilization_ratio,
            payload.emi_payment_consistency,
            payload.withdrawal_spikes,
            payload.loan_to_income_ratio,
            payload.past_intervention_success,
            payload.linked_instability_score,
        ]])

        prob_arr = MODEL.predict_proba(features)[0]
        probability = float(prob_arr[1])  # probability of default (class=1)

        # Confidence: distance from 0.5; capped at 0.99
        confidence = min(0.99, abs(probability - 0.5) * 2)

        risk_state        = get_risk_state(probability)
        feature_imp       = get_feature_importance(MODEL, features)

        return RiskOutput(
            probability       = round(probability, 4),
            risk_state        = risk_state,
            feature_importance = feature_imp,
            confidence_score  = round(confidence, 4),
            model_version     = "v1",
            model_name        = METADATA["model_name"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate-intervention")
def simulate_intervention(payload: RiskInput, action_type: str = "EMI Holiday"):
    """
    Simulate the effect of an intervention on default probability.
    Modifies relevant features based on intervention type and re-runs prediction.
    """
    # Clone features and apply intervention effect
    features = payload.dict()

    intervention_effects = {
        "EMI Holiday": {
            "emi_payment_consistency":  min(1.0, features["emi_payment_consistency"] + 0.25),
            "salary_delay_freq":        max(0.0, features["salary_delay_freq"] - 0.10),
        },
        "Loan Restructuring": {
            "loan_to_income_ratio":     max(0.0, features["loan_to_income_ratio"] - 0.20),
            "emi_payment_consistency":  min(1.0, features["emi_payment_consistency"] + 0.15),
        },
        "Partial Payment Plan": {
            "emi_payment_consistency":  min(1.0, features["emi_payment_consistency"] + 0.20),
            "withdrawal_spikes":        max(0.0, features["withdrawal_spikes"] - 0.15),
        },
        "Flexible Repayment": {
            "emi_payment_consistency":  min(1.0, features["emi_payment_consistency"] + 0.18),
            "loan_to_income_ratio":     max(0.0, features["loan_to_income_ratio"] - 0.10),
            "withdrawal_spikes":        max(0.0, features["withdrawal_spikes"] - 0.10),
        },
    }

    effect = intervention_effects.get(action_type, {})
    modified = {**features, **effect, "past_intervention_success": min(1.0, features["past_intervention_success"] + 0.30)}

    # Predict with modified features
    modified_input = RiskInput(**modified)
    return predict_risk(modified_input)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
