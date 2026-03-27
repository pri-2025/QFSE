import { Router, Request, Response } from "express";
import { execFile } from "child_process";
import path from "path";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import { authenticate } from "../../middleware/auth"; // If auth is used

export const localPredictionRouter = Router();

/**
 * Executes the python predictor script securely.
 * Suppresses known Numpy warnings from stdout so JSON parses cleanly.
 */
function runPythonPredictor(features: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../../../ml/predictor.py");
    const args = [scriptPath, JSON.stringify(features)];

    execFile("python", args, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Python execution error: ${error.message}`);
        // If script crashed hard
        return reject(new Error("Failed to execute ML model"));
      }

      try {
        // Strip out any non-JSON prefix if there was a warning printed to stdout
        const outputString = stdout.trim();
        const jsonStart = outputString.indexOf("{");
        
        if (jsonStart === -1) {
          throw new Error("No JSON object found in output");
        }
        
        const cleanJson = outputString.substring(jsonStart);
        const result = JSON.parse(cleanJson);

        if (result.error) {
            reject(new Error(result.error));
        } else {
            resolve(result);
        }
      } catch (parseError) {
        logger.error(`Failed to parse ML output: ${stdout}`);
        reject(new Error("Invalid output format from ML model"));
      }
    });
  });
}

// Ensure month is saved as first day of month 00:00:00 UTc
function getStartOfMonthStr(): Date {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

// ── POST /api/predict ─────────────────────────────────────────
localPredictionRouter.post("/predict", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id,
      income,
      emi_ratio,
      savings_ratio,
      credit_utilization,
      spending_volatility,
      transaction_irregularity
    } = req.body;

    // Very basic existence validation (could use Zod here)
    if (!user_id || income === undefined || emi_ratio === undefined) {
      res.status(400).json({ error: "Missing required fields (user_id, income, emi_ratio, etc)" });
      return;
    }

    // Call ML model via Python process
    const mlParams = {
        income,
        emi_ratio,
        savings_ratio,
        credit_utilization,
        spending_volatility,
        transaction_irregularity
    };
    
    const predictionLog = await runPythonPredictor(mlParams);
    const { risk_score, risk_level, probability } = predictionLog;

    // Verify customer exists to avoid constraint violation
    const customer = await prisma.customer.findUnique({
        where: { id: user_id }
    });

    if (!customer) {
        res.status(404).json({ error: "Customer matching user_id not found" });
        return;
    }

    // Upsert the monthly snapshot logic as requested by user.
    // The user's system maps historical predictions by monthly bucket.
    const snapshotMonth = getStartOfMonthStr();
    
    await prisma.snapshot.upsert({
        where: {
            customerId_snapshotMonth: {
                customerId: user_id,
                snapshotMonth: snapshotMonth
            }
        },
        update: {
            riskScore: probability,
            riskState: risk_level,
        },
        create: {
            customerId: user_id,
            snapshotMonth: snapshotMonth,
            riskScore: probability,
            riskState: risk_level,
        }
    });

    // Also insert an audit log into RiskScores
    await prisma.riskScore.create({
        data: {
            customerId: user_id,
            probability: probability,
            riskState: risk_level,
            modelVersion: "local-xgboost-v1"
        }
    });

    // Return the response as specified 
    res.status(200).json({
        risk_score: risk_score,
        risk_level: risk_level,
        probability: probability
    });

  } catch (err: any) {
    logger.error(`POST /api/predict failed: ${err.message}`);
    res.status(500).json({ error: "Pipeline failure", message: err.message });
  }
});


// ── GET /api/predictions/:user_id ─────────────────────────────
localPredictionRouter.get("/predictions/:user_id", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.user_id as string;
        
        // Return last 6 months ascending
        const history = await prisma.snapshot.findMany({
            where: { customerId: userId },
            orderBy: { snapshotMonth: "asc" },
            take: 6
        });

        // Map to UI / Endpoint expectations format
        const responseData = history.map(snap => {
            const dateStr = snap.snapshotMonth.toISOString();
            return {
                month: dateStr.substring(0, 7), // "YYYY-MM"
                probability: snap.riskScore ? Number(snap.riskScore) : 0,
                risk_level: snap.riskState || "UNKNOWN",
            };
        });

        res.status(200).json(responseData);

    } catch (err: any) {
        logger.error(`GET /api/predictions/:user_id failed: ${err.message}`);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});
