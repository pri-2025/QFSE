import axios from "axios";
import { logger } from "../utils/logger";

const ML_BASE_URL = process.env.ML_ENGINE_URL || "https://unvanishing-enunciatively-elinor.ngrok-free.dev";

export interface MlRiskInput {
  salary_delay_days:         number;
  salary_vs_expected:        number;
  emi_bounce_count:          number;
  savings_to_salary_ratio:   number;
  min_balance_breach:        number;
  upi_to_lenders_count:      number;
  atm_withdrawal_count:      number;
  atm_to_salary_ratio:       number;
  loan_enquiry_count:        number;
  inward_return_count:       number;
  credit_score:              number;
  emi_to_income:             number;
  account_vintage_months:    number;
  n_emis:                    number;
}

export interface MlRiskOutput {
  probability:        number;
  risk_state:         string;
  feature_importance: Record<string, number>;
  confidence_score?:  number;
  model_version?:     string;
  model_name?:        string;
}

/** Returned by POST /simulate-intervention when ML engine is v1.1+ */
export interface MlSimulationOutput {
  original_probability:  number;
  simulated_probability: number;
  delta:                 number;
  risk_reduction_pct:    number;
  risk_state:            string;
  projected_risk_state:  string;
  confidence_score:      number;
  modified_features:     Record<string, number>;
  feature_importance:    Record<string, number>;
  model_name:            string;
}

/** Union type for flexibility between model versions */
export type MlSimulateResponse = MlSimulationOutput | MlRiskOutput;

export async function predictRisk(features: MlRiskInput): Promise<MlRiskOutput> {
  try {
    const resp = await axios.post<MlRiskOutput>(`${ML_BASE_URL}/predict`, features, {
      timeout: 10_000,
      headers: { "Content-Type": "application/json" }
    });
    return resp.data;
  } catch (err) {
    logger.error("ML engine predict-risk error:", err);
    throw new Error("ML Engine unavailable");
  }
}

// ── Simulate intervention effect ─────────────────────────────
export async function simulateIntervention(
  features: MlRiskInput,
  actionType: string
): Promise<MlSimulateResponse> {
  try {
    const resp = await axios.post<MlSimulateResponse>(
      `${ML_BASE_URL}/simulate-intervention`,
      features,
      { params: { action_type: actionType }, timeout: 10_000 }
    );
    return resp.data;
  } catch (err) {
    logger.error("ML engine simulate-intervention error:", err);
    throw new Error("ML Engine unavailable");
  }
}

// ── Trigger model retraining ──────────────────────────────────
export async function triggerRetrain(): Promise<{ status: string; message: string }> {
  try {
    const resp = await axios.post<{ status: string; message: string }>(
      `${ML_BASE_URL}/retrain`,
      {},
      { timeout: 5_000 }
    );
    return resp.data;
  } catch (err) {
    logger.error("ML engine retrain error:", err);
    throw new Error("ML Engine retrain failed");
  }
}

// ── Check ML engine health ────────────────────────────────────
export async function checkMlHealth(): Promise<boolean> {
  try {
    await axios.get(`${ML_BASE_URL}/health`, { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

// ── Type guard helpers ────────────────────────────────────────
export function isSimulationOutput(res: MlSimulateResponse): res is MlSimulationOutput {
  return "simulated_probability" in res;
}
