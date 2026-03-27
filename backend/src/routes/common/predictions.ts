import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import { predictRisk, MlRiskInput } from "../../services/mlService";

export const predictionsRouter = Router();

// Protect these routes
predictionsRouter.use(authenticate);

// 1. POST /api/predict-risk/:customerId (trigger on demand)
predictionsRouter.post("/predict-risk/:customerId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.params.customerId as string;
    
    // Authorization: Admin can access all, Customer can access only their own
    if (req.user!.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user!.userId } });
      if (!customer || customer.id !== customerId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ status: "error", message: "Customer not found" });
      return;
    }

    // Get the most recent snapshot for the financial signals
    const latestSnapshot = await prisma.snapshot.findFirst({
      where: { customerId },
      orderBy: { snapshotMonth: "desc" }
    });

    if (!latestSnapshot) {
      res.status(400).json({ status: "error", message: "Feature missing from database: No recent snapshot found." });
      return;
    }

    // Map db fields exactly to expected ML input structure
    const features: MlRiskInput = {
      salary_delay_days:       latestSnapshot.salaryDelayDays || 0,
      salary_vs_expected:      Number(latestSnapshot.salaryVsExpected) || 1.0,
      emi_bounce_count:        latestSnapshot.emiBounceCount || 0,
      savings_to_salary_ratio: Number(latestSnapshot.savingsToSalaryRatio) || 0.0,
      min_balance_breach:      latestSnapshot.minBalanceBreach || 0,
      upi_to_lenders_count:    latestSnapshot.upiToLendersCount || 0,
      atm_withdrawal_count:    latestSnapshot.atmWithdrawalCount || 0,
      atm_to_salary_ratio:     Number(latestSnapshot.atmToSalaryRatio) || 0.0,
      loan_enquiry_count:      latestSnapshot.loanEnquiryCount || 0,
      inward_return_count:     latestSnapshot.inwardReturnCount || 0,
      credit_score:            latestSnapshot.creditScore || 700,
      emi_to_income:           Number(latestSnapshot.emiToIncome) || 0.0,
      account_vintage_months:  latestSnapshot.accountVintageMonths || 12,
      n_emis:                  latestSnapshot.nEmis || 1
    };

    // Call ML API
    const mlResponse = await predictRisk(features);

    // Persist prediction in RiskScores
    const newPrediction = await prisma.riskScore.create({
      data: {
        customerId,
        probability: mlResponse.probability,
        riskState: mlResponse.risk_state,
        featureImportance: mlResponse.feature_importance,
        modelVersion: mlResponse.model_version || "v1",
      }
    });

    // Return to frontend
    res.json({
      customerId,
      probability: newPrediction.probability,
      risk_state: newPrediction.riskState,
      feature_importance: newPrediction.featureImportance,
      createdAt: newPrediction.createdAt
    });

  } catch (err: any) {
    logger.error(`POST /predict-risk error: ${err.message}`);
    res.status(500).json({ status: "error", message: err.message || "Failed to run prediction" });
  }
});

// 2. GET /api/customer/:customerId/predictions (return history)
predictionsRouter.get("/customer/:customerId/predictions", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.params.customerId as string;
    
    // Authorization
    if (req.user!.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user!.userId } });
      if (!customer || customer.id !== customerId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    const history = await prisma.riskScore.findMany({
      where: { customerId },
      orderBy: { createdAt: "asc" }
    });

    res.json(history.map(h => ({
      id: h.id,
      probability: h.probability,
      risk_state: h.riskState,
      feature_importance: h.featureImportance,
      createdAt: h.createdAt
    })));

  } catch (err: any) {
    logger.error(`GET /customer/predictions error: ${err.message}`);
    res.status(500).json({ status: "error", message: "Failed to fetch predictions" });
  }
});
