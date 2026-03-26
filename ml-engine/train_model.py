"""
Quantum State Financial Engine - Model Training Script

Trains two classifiers on the synthetic dataset:
  1. Logistic Regression (baseline, interpretable)
  2. Random Forest (ensemble, typically higher accuracy)

Compares accuracy + AUC-ROC, picks the best model, and saves it as model.pkl.
Feature names are saved to feature_names.json for the inference endpoint.
"""

import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, roc_auc_score,
    classification_report, confusion_matrix
)

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
DATA_PATH   = BASE_DIR / "dataset.csv"
MODEL_PATH  = BASE_DIR / "model.pkl"
NAMES_PATH  = BASE_DIR / "feature_names.json"

FEATURE_COLS = [
    "salary_delay_freq",
    "credit_utilization_ratio",
    "emi_payment_consistency",
    "withdrawal_spikes",
    "loan_to_income_ratio",
    "past_intervention_success",
    "linked_instability_score",
]
TARGET_COL = "default_label"

# ── Load data ─────────────────────────────────────────────────
print("Loading dataset...")
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run generate_dataset.py first.")

df = pd.read_csv(DATA_PATH)
X = df[FEATURE_COLS].values
y = df[TARGET_COL].values

print(f"  Dataset shape : {df.shape}")
print(f"  Default rate  : {y.mean()*100:.1f}%")

# ── Train/test split ──────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"  Train/Test    : {len(X_train)} / {len(X_test)}")

# ── Model 1: Logistic Regression ─────────────────────────────
print("\n[1/2] Training Logistic Regression...")
lr_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf",    LogisticRegression(max_iter=1000, C=1.0, random_state=42)),
])
lr_pipeline.fit(X_train, y_train)

lr_pred      = lr_pipeline.predict(X_test)
lr_prob      = lr_pipeline.predict_proba(X_test)[:, 1]
lr_accuracy  = accuracy_score(y_test, lr_pred)
lr_auc       = roc_auc_score(y_test, lr_prob)

print(f"  Accuracy : {lr_accuracy:.4f}")
print(f"  AUC-ROC  : {lr_auc:.4f}")

# ── Model 2: Random Forest ────────────────────────────────────
print("\n[2/2] Training Random Forest...")
rf_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf",    RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )),
])
rf_pipeline.fit(X_train, y_train)

rf_pred      = rf_pipeline.predict(X_test)
rf_prob      = rf_pipeline.predict_proba(X_test)[:, 1]
rf_accuracy  = accuracy_score(y_test, rf_pred)
rf_auc       = roc_auc_score(y_test, rf_prob)

print(f"  Accuracy : {rf_accuracy:.4f}")
print(f"  AUC-ROC  : {rf_auc:.4f}")

# ── Compare and pick winner ───────────────────────────────────
print("\n── Model Comparison ──────────────────────")
print(f"  Logistic Regression  — Acc: {lr_accuracy:.4f}  AUC: {lr_auc:.4f}")
print(f"  Random Forest        — Acc: {rf_accuracy:.4f}  AUC: {rf_auc:.4f}")

# Primary metric: AUC-ROC (better for imbalanced classes)
if rf_auc >= lr_auc:
    best_model   = rf_pipeline
    best_name    = "Random Forest"
    best_acc     = rf_accuracy
    best_auc     = rf_auc
    best_pred    = rf_pred
    best_prob    = rf_prob
else:
    best_model   = lr_pipeline
    best_name    = "Logistic Regression"
    best_acc     = lr_accuracy
    best_auc     = lr_auc
    best_pred    = lr_pred
    best_prob    = lr_prob

print(f"\n✅ Selected: {best_name}")
print(f"   Accuracy : {best_acc:.4f}")
print(f"   AUC-ROC  : {best_auc:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, best_pred, target_names=["No Default", "Default"]))

# ── Save model ────────────────────────────────────────────────
metadata = {
    "model_name":    best_name,
    "accuracy":      round(float(best_acc), 4),
    "auc_roc":       round(float(best_auc), 4),
    "feature_names": FEATURE_COLS,
    "lr_accuracy":   round(float(lr_accuracy), 4),
    "lr_auc":        round(float(lr_auc), 4),
    "rf_accuracy":   round(float(rf_accuracy), 4),
    "rf_auc":        round(float(rf_auc), 4),
}

joblib.dump({"model": best_model, "metadata": metadata}, MODEL_PATH)
print(f"\n✅ Model saved: {MODEL_PATH}")

with open(NAMES_PATH, "w") as f:
    json.dump({"feature_names": FEATURE_COLS, "metadata": metadata}, f, indent=2)
print(f"✅ Feature names saved: {NAMES_PATH}")
