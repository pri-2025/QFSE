import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/adminRoutes";
import { customerRouter } from "./routes/customerRoutes";
import { errorHandler }         from "./middleware/errorHandler";
import { requestLogger }        from "./middleware/requestLogger";
import { logger }               from "./utils/logger";

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
  logger.info(`   ML Engine   : ${process.env.ML_ENGINE_URL || "http://localhost:8000"}`);
});

export default app;
