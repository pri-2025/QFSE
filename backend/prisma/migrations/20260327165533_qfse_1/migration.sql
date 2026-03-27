-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "avg_risk" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "persona_id" INTEGER,
    "monthly_income" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "loan_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "emi_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "emi_due_days" INTEGER NOT NULL DEFAULT 0,
    "credit_utilization" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "salary_delay_freq" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "emi_payment_consistency" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "withdrawal_spikes" INTEGER NOT NULL DEFAULT 0,
    "loan_to_income_ratio" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "affordability_surplus" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "address" TEXT,
    "employer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "loan_type" TEXT NOT NULL DEFAULT 'Personal Loan',
    "sanctioned_amt" DECIMAL(65,30) NOT NULL,
    "outstanding_amt" DECIMAL(65,30) NOT NULL,
    "emi_amount" DECIMAL(65,30) NOT NULL,
    "tenure_months" INTEGER NOT NULL,
    "interest_rate" DECIMAL(65,30) NOT NULL DEFAULT 12.5,
    "disbursed_at" TIMESTAMP(3) NOT NULL,
    "maturity_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "txn_date" TIMESTAMP(3) NOT NULL,
    "txn_type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_scores" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "scored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "probability" DECIMAL(65,30) NOT NULL,
    "risk_state" TEXT NOT NULL,
    "feature_importance" JSONB,
    "model_version" TEXT NOT NULL DEFAULT 'v1',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "analyst_id" TEXT,
    "action_type" TEXT NOT NULL,
    "pre_probability" DECIMAL(65,30) NOT NULL,
    "projected_probability" DECIMAL(65,30) NOT NULL,
    "actual_probability" DECIMAL(65,30),
    "confidence_score" DECIMAL(65,30) NOT NULL,
    "risk_reduction_pct" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'simulated',
    "notes" TEXT,
    "simulated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_at" TIMESTAMP(3),
    "outcome_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entanglements" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "linked_customer_id" TEXT,
    "linked_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "link_type" TEXT NOT NULL DEFAULT 'family',
    "risk_impact_pct" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "linked_risk_score" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entanglements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "risk_at_event" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "snapshot_month" TIMESTAMP(3) NOT NULL,
    "avg_balance" DECIMAL(65,30),
    "total_credits" DECIMAL(65,30),
    "total_debits" DECIMAL(65,30),
    "emi_paid" BOOLEAN NOT NULL DEFAULT false,
    "risk_score" DECIMAL(65,30),
    "risk_state" TEXT,
    "savings_balance" DECIMAL(65,30),
    "credit_util_pct" DECIMAL(65,30),
    "behavioral_flags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarterly_summaries" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "quarter_start" TIMESTAMP(3) NOT NULL,
    "quarter_label" TEXT NOT NULL,
    "avg_risk_score" DECIMAL(65,30),
    "risk_trend" TEXT,
    "interventions_count" INTEGER NOT NULL DEFAULT 0,
    "successful_interventions" INTEGER NOT NULL DEFAULT 0,
    "total_emi_paid" DECIMAL(65,30),
    "missed_payments" INTEGER NOT NULL DEFAULT 0,
    "portfolio_shift_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quarterly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT,
    "outcome" TEXT NOT NULL DEFAULT 'sent',
    "response_score" DECIMAL(65,30),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personas_name_key" ON "personas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_user_id_key" ON "customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "loans_customer_id_idx" ON "loans"("customer_id");

-- CreateIndex
CREATE INDEX "transactions_customer_id_idx" ON "transactions"("customer_id");

-- CreateIndex
CREATE INDEX "transactions_txn_date_idx" ON "transactions"("txn_date");

-- CreateIndex
CREATE INDEX "risk_scores_customer_id_idx" ON "risk_scores"("customer_id");

-- CreateIndex
CREATE INDEX "risk_scores_scored_at_idx" ON "risk_scores"("scored_at" DESC);

-- CreateIndex
CREATE INDEX "interventions_customer_id_idx" ON "interventions"("customer_id");

-- CreateIndex
CREATE INDEX "interventions_status_idx" ON "interventions"("status");

-- CreateIndex
CREATE INDEX "entanglements_customer_id_idx" ON "entanglements"("customer_id");

-- CreateIndex
CREATE INDEX "timeline_events_customer_id_idx" ON "timeline_events"("customer_id");

-- CreateIndex
CREATE INDEX "timeline_events_event_date_idx" ON "timeline_events"("event_date" DESC);

-- CreateIndex
CREATE INDEX "snapshots_customer_id_idx" ON "snapshots"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_customer_id_snapshot_month_key" ON "snapshots"("customer_id", "snapshot_month");

-- CreateIndex
CREATE INDEX "quarterly_summaries_customer_id_idx" ON "quarterly_summaries"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "quarterly_summaries_customer_id_quarter_start_key" ON "quarterly_summaries"("customer_id", "quarter_start");

-- CreateIndex
CREATE INDEX "communication_logs_customer_id_idx" ON "communication_logs"("customer_id");

-- CreateIndex
CREATE INDEX "communication_logs_sent_at_idx" ON "communication_logs"("sent_at" DESC);

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_scores" ADD CONSTRAINT "risk_scores_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_analyst_id_fkey" FOREIGN KEY ("analyst_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entanglements" ADD CONSTRAINT "entanglements_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entanglements" ADD CONSTRAINT "entanglements_linked_customer_id_fkey" FOREIGN KEY ("linked_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarterly_summaries" ADD CONSTRAINT "quarterly_summaries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
