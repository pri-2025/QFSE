import axios from "axios";
import { logger } from "../utils/logger";

const ML_BASE_URL = process.env.ML_ENGINE_URL || "http://localhost:8000";

export interface MlRiskInput {
  salary_delay_freq:         number;
  credit_utilization_ratio:  number;
  emi_payment_consistency:   number;
  withdrawal_spikes:         number;
  loan_to_income_ratio:      number;
  past_intervention_success: number;
  linked_instability_score:  number;
}

export interface MlRiskOutput {
  probability:        number;
  risk_state:         string;
  feature_importance: Record<string, number>;
  confidence_score:   number;
  model_version:      string;
  model_name:         string;
}

// Predict risk from raw features
export async function predictRisk(features: MlRiskInput): Promise<MlRiskOutput> {
  try {
    const resp = await axios.post<MlRiskOutput>(`${ML_BASE_URL}/predict-risk`, features, {
      timeout: 10_000,
    });
    return resp.data;
  } catch (err) {
    logger.error("ML engine predict-risk error:", err);
    throw new Error("ML Engine unavailable");
  }
}

// Simulate intervention effect
export async function simulateIntervention(
  features: MlRiskInput,
  actionType: string
): Promise<MlRiskOutput> {
  try {
    const resp = await axios.post<MlRiskOutput>(
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

// Check ML engine health
export async function checkMlHealth(): Promise<boolean> {
  try {
    await axios.get(`${ML_BASE_URL}/health`, { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}
