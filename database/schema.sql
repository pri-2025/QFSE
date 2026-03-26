-- ============================================================
-- QUANTUM STATE FINANCIAL ENGINE - PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (Analyst accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'analyst',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- PERSONAS (Reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS personas (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) UNIQUE NOT NULL,
  color    VARCHAR(20)  NOT NULL,
  emoji    VARCHAR(10)  NOT NULL,
  avg_risk SMALLINT     NOT NULL DEFAULT 50
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id                      VARCHAR(20) PRIMARY KEY,
  name                    VARCHAR(255) NOT NULL,
  email                   VARCHAR(255) UNIQUE NOT NULL,
  phone                   VARCHAR(30)  NOT NULL,
  persona_id              INTEGER REFERENCES personas(id) ON DELETE SET NULL,
  monthly_income          NUMERIC(12,2) NOT NULL DEFAULT 0,
  loan_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
  emi_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
  emi_due_days            SMALLINT     NOT NULL DEFAULT 0,
  credit_utilization      NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0-100 %
  salary_delay_freq       NUMERIC(5,4) NOT NULL DEFAULT 0,   -- 0-1
  emi_payment_consistency NUMERIC(5,4) NOT NULL DEFAULT 1,   -- 0-1
  withdrawal_spikes       SMALLINT     NOT NULL DEFAULT 0,
  loan_to_income_ratio    NUMERIC(5,3) NOT NULL DEFAULT 0,
  affordability_surplus   NUMERIC(12,2) NOT NULL DEFAULT 0,
  address                 TEXT,
  employer                VARCHAR(255),
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_persona ON customers(persona_id);
CREATE INDEX idx_customers_email   ON customers(email);

-- ============================================================
-- LOANS
-- ============================================================
CREATE TABLE IF NOT EXISTS loans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loan_type       VARCHAR(100) NOT NULL DEFAULT 'Personal Loan',
  sanctioned_amt  NUMERIC(12,2) NOT NULL,
  outstanding_amt NUMERIC(12,2) NOT NULL,
  emi_amount      NUMERIC(12,2) NOT NULL,
  tenure_months   SMALLINT NOT NULL,
  interest_rate   NUMERIC(5,2) NOT NULL DEFAULT 12.5,
  disbursed_at    DATE NOT NULL,
  maturity_date   DATE NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loans_customer ON loans(customer_id);

-- ============================================================
-- TRANSACTIONS (Last 90 days)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  txn_date        DATE NOT NULL,
  txn_type        VARCHAR(50) NOT NULL, -- 'credit','debit','emi_payment','atm_withdrawal','upi'
  amount          NUMERIC(12,2) NOT NULL,
  category        VARCHAR(100),
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_txn_customer  ON transactions(customer_id);
CREATE INDEX idx_txn_date      ON transactions(txn_date);
CREATE INDEX idx_txn_type      ON transactions(txn_type);

-- ============================================================
-- RISK SCORES (Time-series)
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_scores (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  scored_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  probability         NUMERIC(5,4) NOT NULL,   -- 0-1
  risk_state          VARCHAR(50) NOT NULL,    -- Healthy/Watchlist/At Risk/Imminent Default
  feature_importance  JSONB,
  model_version       VARCHAR(20) NOT NULL DEFAULT 'v1',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_customer ON risk_scores(customer_id);
CREATE INDEX idx_risk_date     ON risk_scores(scored_at DESC);

-- ============================================================
-- INTERVENTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS interventions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id             VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  analyst_id              UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type             VARCHAR(100) NOT NULL, -- 'EMI Holiday','Loan Restructuring','Partial Payment Plan','Flexible Repayment'
  pre_probability         NUMERIC(5,4) NOT NULL,
  projected_probability   NUMERIC(5,4) NOT NULL,
  actual_probability      NUMERIC(5,4),
  confidence_score        NUMERIC(5,4) NOT NULL,
  risk_reduction_pct      NUMERIC(5,2) NOT NULL,
  status                  VARCHAR(50) NOT NULL DEFAULT 'simulated', -- simulated/applied/succeeded/failed
  notes                   TEXT,
  simulated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at              TIMESTAMPTZ,
  outcome_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_int_customer ON interventions(customer_id);
CREATE INDEX idx_int_status   ON interventions(status);
CREATE INDEX idx_int_type     ON interventions(action_type);

-- ============================================================
-- ENTANGLEMENTS (Financial network links)
-- ============================================================
CREATE TABLE IF NOT EXISTS entanglements (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  linked_customer_id  VARCHAR(20) REFERENCES customers(id) ON DELETE SET NULL,
  linked_name         VARCHAR(255) NOT NULL,
  relationship        VARCHAR(100) NOT NULL, -- Spouse/Parent/Sibling/Co-borrower/Guarantor
  link_type           VARCHAR(100) NOT NULL DEFAULT 'family', -- family/co_borrower/guarantor/shared_address/shared_employer
  risk_impact_pct     NUMERIC(5,2) NOT NULL DEFAULT 0,
  linked_risk_score   NUMERIC(5,4),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entangle_customer ON entanglements(customer_id);
CREATE INDEX idx_entangle_linked   ON entanglements(linked_customer_id);

-- ============================================================
-- TIMELINE EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id  VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_date   DATE NOT NULL,
  event_type   VARCHAR(100) NOT NULL, -- 'salary_delay','missed_emi','atm_spike','intervention','recovery'
  severity     VARCHAR(20) NOT NULL DEFAULT 'info', -- critical/warning/info/success
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  risk_at_event NUMERIC(5,4),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_customer ON timeline_events(customer_id);
CREATE INDEX idx_timeline_date      ON timeline_events(event_date DESC);

-- ============================================================
-- MONTHLY SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS snapshots (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  snapshot_month    DATE NOT NULL,          -- First of month
  avg_balance       NUMERIC(12,2),
  total_credits     NUMERIC(12,2),
  total_debits      NUMERIC(12,2),
  emi_paid          BOOLEAN NOT NULL DEFAULT FALSE,
  risk_score        NUMERIC(5,4),
  risk_state        VARCHAR(50),
  savings_balance   NUMERIC(12,2),
  credit_util_pct   NUMERIC(5,2),
  behavioral_flags  JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, snapshot_month)
);

CREATE INDEX idx_snapshot_customer ON snapshots(customer_id);
CREATE INDEX idx_snapshot_month    ON snapshots(snapshot_month DESC);

-- ============================================================
-- QUARTERLY SUMMARIES
-- ============================================================
CREATE TABLE IF NOT EXISTS quarterly_summaries (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id           VARCHAR(20) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quarter_start         DATE NOT NULL,
  quarter_label         VARCHAR(20) NOT NULL, -- e.g. 'Q1 2025'
  avg_risk_score        NUMERIC(5,4),
  risk_trend            VARCHAR(20),          -- 'improving','stable','deteriorating'
  interventions_count   SMALLINT DEFAULT 0,
  successful_interventions SMALLINT DEFAULT 0,
  total_emi_paid        NUMERIC(12,2),
  missed_payments       SMALLINT DEFAULT 0,
  portfolio_shift_notes TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, quarter_start)
);

CREATE INDEX idx_quarterly_customer ON quarterly_summaries(customer_id);
CREATE INDEX idx_quarterly_start    ON quarterly_summaries(quarter_start DESC);
