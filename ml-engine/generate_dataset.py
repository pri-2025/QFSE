"""
Quantum State Financial Engine - Synthetic Dataset Generator
Generates 10,000 synthetic customer records for ML training.

Features engineered to reflect real-world pre-delinquency signals:
- salary_delay_freq: How often salary is delayed (0=never, 1=always)
- credit_utilization_ratio: Credit card usage ratio (0-1)
- emi_payment_consistency: EMI payment success rate (0=always miss, 1=always pay)
- withdrawal_spikes: Number of abnormal ATM/UPI withdrawal events per month
- loan_to_income_ratio: Total loan burden vs monthly income
- past_intervention_success: Whether past interventions helped (0-1)
- linked_instability_score: Risk score of financially linked persons (0-1)
- default_label: Ground truth - did customer default? (0/1)
"""

import pandas as pd
import numpy as np
from pathlib import Path

# Reproducibility
np.random.seed(42)
N = 10_000

print(f"Generating {N} synthetic customer records...")

# ── Persona weights (proportional distribution) ──────────────
# 0=Salary-Dependent, 1=Credit-Heavy, 2=Emergency-Cash, 3=Silent-Saver, 4=Paycheck-to-Paycheck
persona_weights = [0.32, 0.24, 0.18, 0.16, 0.10]
personas = np.random.choice(5, size=N, p=persona_weights)

# ── Feature generation per persona ───────────────────────────

def gen_feature(persona_vals: list, noise_std=0.05) -> np.ndarray:
    """Generate feature values based on persona with Gaussian noise."""
    base = np.array([persona_vals[p] for p in personas])
    noise = np.random.normal(0, noise_std, size=N)
    return np.clip(base + noise, 0.0, 1.0)

# salary_delay_freq: Salary-Dependent highest, Silent-Saver lowest
salary_delay_freq = gen_feature(
    [0.60, 0.20, 0.40, 0.05, 0.30], noise_std=0.12
)

# credit_utilization_ratio: Credit-Heavy highest
credit_utilization_ratio = gen_feature(
    [0.45, 0.85, 0.55, 0.25, 0.60], noise_std=0.10
)

# emi_payment_consistency: 1 = always pays; imminently defaulting lowest
emi_payment_consistency = gen_feature(
    [0.55, 0.65, 0.50, 0.90, 0.70], noise_std=0.10
)

# withdrawal_spikes: Emergency-Cash highest (normalised 0-1 from 0-10 range)
withdrawal_spikes_raw = np.array([
    np.random.poisson([4, 1, 7, 0, 2][p]) for p in personas
]).astype(float)
withdrawal_spikes = np.clip(withdrawal_spikes_raw / 10.0, 0.0, 1.0)

# loan_to_income_ratio: Credit-Heavy & Emergency-Cash highest
loan_to_income_ratio = gen_feature(
    [0.40, 0.65, 0.55, 0.18, 0.30], noise_std=0.10
)

# past_intervention_success: mostly 0 (no prior intervention), with 20% having history
_has_prior = np.random.random(N) < 0.20
past_intervention_success = np.where(
    _has_prior,
    np.random.uniform(0.2, 1.0, N),  # some got an intervention
    0.0
)

# linked_instability_score: proxy for network contagion risk
linked_instability_score = gen_feature(
    [0.35, 0.30, 0.50, 0.10, 0.25], noise_std=0.10
)

# ── Default label generation ──────────────────────────────────
# Logistic-sigmoid based on weighted risk factors
log_odds = (
    -3.5
    + 3.2  * salary_delay_freq
    + 2.8  * credit_utilization_ratio
    - 3.0  * emi_payment_consistency
    + 2.0  * withdrawal_spikes
    + 1.8  * loan_to_income_ratio
    - 1.5  * past_intervention_success
    + 1.2  * linked_instability_score
)
default_prob = 1 / (1 + np.exp(-log_odds))

# Add a small amount of label noise (~5%) for realism
label_noise = np.random.random(N) < 0.05
default_label = ((np.random.random(N) < default_prob) ^ label_noise).astype(int)

# ── Assemble DataFrame ────────────────────────────────────────
PERSONA_NAMES = [
    "Salary-Dependent Struggler",
    "Credit-Heavy Overuser",
    "Emergency Cash Withdrawer",
    "Silent Saver Drain",
    "Paycheck-to-Paycheck Survivor"
]

df = pd.DataFrame({
    "salary_delay_freq":        salary_delay_freq.round(4),
    "credit_utilization_ratio": credit_utilization_ratio.round(4),
    "emi_payment_consistency":  emi_payment_consistency.round(4),
    "withdrawal_spikes":        withdrawal_spikes.round(4),
    "loan_to_income_ratio":     loan_to_income_ratio.round(4),
    "past_intervention_success": past_intervention_success.round(4),
    "linked_instability_score": linked_instability_score.round(4),
    "persona":                  [PERSONA_NAMES[p] for p in personas],
    "default_label":            default_label,
})

# ── Save ──────────────────────────────────────────────────────
out_path = Path(__file__).parent / "dataset.csv"
df.to_csv(out_path, index=False)

print(f"✅ Dataset saved: {out_path}")
print(f"   Rows      : {len(df):,}")
print(f"   Defaults  : {df['default_label'].sum():,} ({df['default_label'].mean()*100:.1f}%)")
print(f"   Features  : {list(df.columns[:-2])}")
print("\nClass balance by persona:")
print(df.groupby("persona")["default_label"].agg(["count", "mean"]).rename(columns={"mean":"default_rate"}))
