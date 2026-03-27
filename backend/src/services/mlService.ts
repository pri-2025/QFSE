import axios from "axios";
import { logger } from "../utils/logger";
import { execFile } from "child_process";
import path from "path";

const ML_BASE_URL = process.env.ML_ENGINE_URL || "https://unvanishing-enunciatively-elinor.ngrok-free.dev";

export interface MlRiskInput {
  income: number;
  emi_ratio: number;
  savings_ratio: number;
  credit_utilization: number;
  spending_volatility: number;
  transaction_irregularity: number;
}

export interface MlRiskOutput {
  probability:        number;
  risk_state:         string;
  feature_importance: Record<string, number>;
  confidence_score?:  number;
  model_version?:     string;
  model_name?:        string;
}

/** Returned by POST /simulate-intervention */
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

export type MlSimulateResponse = MlSimulationOutput | MlRiskOutput;

export function runPythonPredictorLocal(features: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../../../ml/predictor.py");
    const args = [scriptPath, JSON.stringify(features)];

    execFile("python", args, (error, stdout, stderr) => {
      if (error) { return reject(new Error("Failed to execute ML model")); }
      try {
        const outputString = stdout.trim();
        const jsonStart = outputString.indexOf("{");
        if (jsonStart === -1) throw new Error("No JSON object found in output");
        const cleanJson = outputString.substring(jsonStart);
        const result = JSON.parse(cleanJson);
        if (result.error) { reject(new Error(result.error)); } else { resolve(result); }
      } catch (e) {
        reject(new Error("Invalid output format from ML model"));
      }
    });
  });
}

// Keep the old API binding available if something else needs it
export async function predictRisk(features: any): Promise<MlRiskOutput> {
  try {
    const res = await runPythonPredictorLocal(features);
    return {
        probability: res.probability,
        risk_state: res.risk_level,
        feature_importance: {},
        model_version: "local-xgboost-v1",
        confidence_score: 0.90
    };
  } catch (err) {
    logger.error("ML engine predict-risk error:", err);
    throw new Error("ML Engine unavailable");
  }
}

// ── Simulate intervention effect ─────────────────────────────
const INTERVENTION_EFFECTS: Record<string, Record<string, [string, number]>> = {
  "EMI Holiday": {
    "emi_ratio": ["sub", 0.15],
    "savings_ratio": ["add", 0.10],
  },
  "Loan Restructuring": {
    "emi_ratio": ["sub", 0.20],
  },
  "Partial Payment Plan": {
    "emi_ratio": ["sub", 0.10],
  },
  "Flexible Repayment": {
    "emi_ratio": ["sub", 0.10],
    "spending_volatility": ["sub", 0.10],
  },
};

export async function simulateIntervention(
  features: MlRiskInput,
  actionType: string
): Promise<MlSimulateResponse> {
  try {
    const origResult = await runPythonPredictorLocal(features);
    const origProb = origResult.probability;
    const origState = origResult.risk_level;

    const modifiedFeatures = { ...features } as Record<string, any>;
    const effects = INTERVENTION_EFFECTS[actionType] || {};

    for (const [key, [op, delta]] of Object.entries(effects)) {
        if (op === "add") {
             modifiedFeatures[key] = Math.min(1.0, modifiedFeatures[key] + delta);
        } else {
             modifiedFeatures[key] = Math.max(0.0, modifiedFeatures[key] - delta);
        }
    }

    const simResult = await runPythonPredictorLocal(modifiedFeatures);
    const simProb = simResult.probability;

    const delta = origProb - simProb;
    const riskReductionPct = origProb > 0 ? (delta / origProb) * 100 : 0;

    const changed: Record<string, number> = {};
    for (const k in modifiedFeatures) {
       if (modifiedFeatures[k] !== (features as any)[k]) {
          changed[k] = parseFloat(modifiedFeatures[k].toFixed(4));
       }
    }

    return {
        original_probability: parseFloat(origProb.toFixed(4)),
        simulated_probability: parseFloat(simProb.toFixed(4)),
        delta: parseFloat(delta.toFixed(4)),
        risk_reduction_pct: parseFloat(Math.max(0, riskReductionPct).toFixed(1)),
        risk_state: origState,
        projected_risk_state: simResult.risk_level,
        confidence_score: 0.88,
        modified_features: changed,
        feature_importance: {},
        model_name: "local-xgboost-v1"
    };
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
