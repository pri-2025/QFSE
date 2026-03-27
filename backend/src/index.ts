import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/common/auth";
import { adminRouter } from "./routes/admin/adminRoutes";
import { customerRouter } from "./routes/customer/customerRoutes";
import { predictionsRouter } from "./routes/common/predictions";
import { localPredictionRouter } from "./routes/common/localPrediction";
import { errorHandler }         from "./middleware/errorHandler";
import { requestLogger }        from "./middleware/requestLogger";
import { logger }               from "./utils/logger";
import { initMonthlyPredictionJob } from "./jobs/monthlyPredictionJob";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(requestLogger);

// ── Rate limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/customer", customerRouter);
app.use("/api", predictionsRouter);
app.use("/api", localPredictionRouter);

// ── Health check ───────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status:    "healthy",
    service:   "QFSE Backend",
    version:   "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ──────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 QFSE Backend running on port ${PORT}`);
  logger.info(`   Environment : ${process.env.NODE_ENV || "development"}`);
  logger.info(`   ML Engine   : ${process.env.ML_ENGINE_URL || "https://unvanishing-enunciatively-elinor.ngrok-free.dev"}`);
  
  // Initialize cron job to auto predict risk scores
  initMonthlyPredictionJob(true); // pass true to trigger sweep immediately for testing
});

export default app;
