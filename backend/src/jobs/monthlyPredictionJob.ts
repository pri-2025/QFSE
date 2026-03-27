import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { predictRisk, MlRiskInput } from "../services/mlService";

export function initMonthlyPredictionJob(runOnStartup = false) {
  // CRON definition: "0 0 1 * *" -> Midnight on the first of every month Let's use env var override or default.
  const schedule = process.env.CRON_MONTHLY_PREDICTION || "0 0 1 * *";

  logger.info(`Scheduling monthly prediction job with cron: ${schedule}`);

  const runPredictionSweep = async () => {
    logger.info("Starting monthly ML prediction sweep for all active customers.");
    try {
      // Get all active customers
      const customers = await prisma.customer.findMany({
        where: { user: { role: "CUSTOMER" } } // assuming a way to filter active
      });

      for (const customer of customers) {
        try {
          // Get the most recent snapshot
          const latestSnapshot = await prisma.snapshot.findFirst({
            where: { customerId: customer.id },
            orderBy: { snapshotMonth: "desc" }
          });

          if (!latestSnapshot) {
            logger.warn(`Skipping customer ${customer.id}: No recent snapshot found.`);
            continue;
          }

          // Build ML Input schema precisely
          const features: MlRiskInput = {
            income: Number(customer.monthlyIncome) || 50000,
            emi_ratio: Number(latestSnapshot.emiToIncome) || (Number(customer.emiAmount) / Number(customer.monthlyIncome || 1)) || 0.4,
            savings_ratio: Number(latestSnapshot.savingsToSalaryRatio) || 0.1,
            credit_utilization: Number(latestSnapshot.creditUtilPct || customer.creditUtilization) || 0.6,
            spending_volatility: 0.5,
            transaction_irregularity: 0.5
          };

          // Call endpoint
          const mlResponse = await predictRisk(features);

          // Persist
          await prisma.riskScore.create({
            data: {
              customerId: customer.id,
              probability: mlResponse.probability,
              riskState: mlResponse.risk_state,
              featureImportance: mlResponse.feature_importance,
              modelVersion: mlResponse.model_version || "v1",
            }
          });

          logger.info(`Successfully stored prediction for ${customer.id}: ${mlResponse.probability} (${mlResponse.risk_state})`);

        } catch (err: any) {
          logger.error(`Error predicting for customer ${customer.id}: ${err.message}`);
        }
      }
      logger.info("Monthly ML prediction sweep completed.");
    } catch (err: any) {
      logger.error(`Failed to execute monthly prediction sweep: ${err.message}`);
    }
  };

  cron.schedule(schedule, runPredictionSweep);

  if (runOnStartup) {
    logger.info("Executing initial sweep on startup as requested...");
    runPredictionSweep();
  }
}
