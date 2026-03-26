# Quantum State Financial Engine (QFSE)

> **Pre-Delinquency Intervention Platform** — Detects financial instability before default using ML and enables predictive, data-driven intervention.

---

## Architecture

```mermaid
graph TB
    FE["Frontend\nReact + Vite + TypeScript\nlocalhost:5173"]
    BE["Backend\nNode.js + Express + Prisma\nlocalhost:3001"]
    ML["ML Engine\nPython + FastAPI\nlocalhost:8000"]
    DB["PostgreSQL 16\nlocalhost:5432"]

    FE -->|JWT REST| BE
    BE -->|Feature vector| ML
    BE -->|Prisma ORM| DB
    ML -->|Risk score + delta| BE
```

```
/QFSE
├── frontend/         React + Vite + TypeScript + TailwindCSS + Recharts
├── backend/          Node.js + Express + Prisma ORM + Zod validation
├── ml-engine/        Python + FastAPI + scikit-learn
├── database/         PostgreSQL schema SQL
└── docker-compose.yml
```

---

## Quick Start (Docker)

```bash
docker-compose up --build
```

**On first boot the system automatically:**
1. Waits for PostgreSQL to be ready
2. Runs `prisma migrate deploy`
3. Seeds 100 synthetic customers (idempotent)
4. Generates ML training dataset (if absent)
5. Trains the Random Forest model (≈60s)
6. Starts all services

| Service    | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost:5173 |
| Backend    | http://localhost:3001 |
| ML Engine  | http://localhost:8000 |
| PostgreSQL | localhost:5432        |

**Default login:** `sarah.chen@qfse.bank` / `Qfse@2025`

---

## Demo Walkthrough

1. **Login** → Enter credentials above
2. **Dashboard** → View live portfolio metrics (total customers, avg risk, intervention success rate)
3. **Persona View** → Distribution pie charts (persona + risk state breakdown)
4. **List View** → Filter customers by risk state; click any customer
5. **Customer Profile** → Quantum state probabilities, active signals, wave function graph, entanglement network
6. **Simulator** → Select customer + intervention strategy → Execute → See ML-computed `delta`, `originalRisk`, `simulatedRisk`, `riskReductionPct`
7. **Entanglement Deep-Dive** → Social-financial topology with contagion score
8. **Timeline** → Chronological event log with communications and interventions

---

## Database Schema Overview

| Model             | Purpose                                      |
|-------------------|----------------------------------------------|
| `User`            | Analyst accounts (JWT auth)                  |
| `Persona`         | Customer risk archetypes (Chronic Stresser…) |
| `Customer`        | Core financial profile + ML feature columns  |
| `RiskScore`       | ML-computed probability snapshots over time  |
| `Loan`            | Loan portfolio per customer                  |
| `Entanglement`    | Social-financial links (family, guarantor…)  |
| `Intervention`    | Simulated and applied intervention history   |
| `CommunicationLog`| Communication events with behavioral impact  |
| `TimelineEvent`   | Chronological event log per customer         |
| `Snapshot`        | Monthly financial snapshots                  |

---

## ML Explanation

The ML engine uses a **Random Forest classifier** trained on 10,000 synthetic customer records.

### Feature Vector (7 features)

| Feature | Description | Range |
|---------|-------------|-------|
| `salary_delay_freq` | How often salary is delayed | 0–1 |
| `credit_utilization_ratio` | Credit card usage vs limit | 0–1 |
| `emi_payment_consistency` | % of EMIs paid on time | 0–1 |
| `withdrawal_spikes` | Unusual ATM withdrawal activity | 0–1 |
| `loan_to_income_ratio` | Loan balance / monthly income | 0–5 |
| `past_intervention_success` | History of responding to interventions | 0–1 |
| `linked_instability_score` | Contagion-weighted network risk (see below) | 0–1 |

### Output
```json
{
  "probability": 0.82,
  "risk_state": "Imminent Default",
  "feature_importance": { "salary_delay_freq": 0.31, "credit_utilization_ratio": 0.22 },
  "confidence_score": 0.64,
  "model_name": "Random Forest"
}
```

### Risk States
| Probability | State |
|-------------|-------|
| < 30% | Healthy |
| 30–50% | Watchlist |
| 50–75% | At Risk |
| > 75% | Imminent Default |

### Simulation Engine
When a strategy is selected, the ML engine modifies relevant features per strategy:

| Strategy | Feature Delta |
|----------|---------------|
| EMI Holiday | `emi_payment_consistency +0.25`, `salary_delay_freq −0.10` |
| Loan Restructuring | `loan_to_income_ratio −0.20`, `emi_payment_consistency +0.15` |
| Partial Payment Plan | `emi_payment_consistency +0.20`, `withdrawal_spikes −0.15` |
| Flexible Repayment | All three features improved |

Returns `{ originalRisk, simulatedRisk, delta, riskReductionPct }` — no static arithmetic.

---

## Entanglement Contagion Model

Each customer can have social-financial links to other customers or external parties.

### Weight Factors

| Link Type | Weight |
|-----------|--------|
| `guarantor` | 0.7 |
| `co_borrower` | 0.6 |
| `family` | 0.5 |
| `shared_address` | 0.4 |
| `shared_employer` | 0.3 |

### Contagion Score Formula

```
contagionScore = (baseRisk + Σ(linkedRisk × weight)) / (1 + Σ(weight))
```

Normalized to **[0, 1]**. A customer with a high-risk guarantor will have their contagion score elevated even if their own base risk is low.

This score also feeds into the ML engine as `linked_instability_score` when running simulations.

### Communication Intelligence

Every communication logged (SMS, email, call) slightly reduces the customer's risk probability:

| Channel | Risk Adjustment |
|---------|----------------|
| `call` | −2.0% |
| `behavioral_alert` | −1.5% |
| `sms_reminder` | −1.0% |
| `email_nudge` | −1.0% |
| Positive response (score > 0.7) | Additional −3.0% |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List (filterable by persona, riskState) |
| GET | `/api/customers/:id` | Full profile + timeline + loans |
| POST | `/api/customers/:id/refresh-risk` | Re-score via ML |
| GET | `/api/customers/:id/timeline` | Chronological events |
| GET | `/api/customers/:id/risk-history` | Risk trend |

### Interventions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interventions/simulate` | Simulate → returns `{originalRisk, simulatedRisk, delta}` |
| POST | `/api/interventions` | Save applied intervention |
| GET | `/api/interventions?customerId=X` | Intervention history |

### Entanglements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entanglements/:customerId` | Social-financial graph + contagionScore |

### Communications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communications/:customerId` | Communication log (filterable) |
| POST | `/api/communications/log` | Log event → adjusts risk score |
| PATCH | `/api/communications/:id/outcome` | Update response outcome |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Portfolio overview |
| GET | `/api/analytics/personas` | Persona distribution |
| GET | `/api/analytics/risk-migration` | Risk state trends |

### ML Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Model metadata + accuracy |
| POST | `/predict-risk` | Predict default probability |
| POST | `/simulate-intervention?action_type=X` | Simulate with delta |
| POST | `/retrain` | Trigger background retraining |

---

## Local Development

### Prerequisites
Node.js 20+, Python 3.11+, PostgreSQL 16

```bash
# 1. Database
psql -U postgres -c "CREATE USER qfse_user WITH PASSWORD 'qfse_password';"
psql -U postgres -c "CREATE DATABASE qfse_db OWNER qfse_user;"

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev          # :3001

# 3. ML Engine  
cd ml-engine
pip install -r requirements.txt
python generate_dataset.py
python train_model.py
uvicorn main:app --reload --port 8000

# 4. Frontend
cd frontend
npm install
npm run dev          # :5173
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, TypeScript, TailwindCSS 4, Recharts, Lucide |
| Backend | Node.js 20, Express 4, Prisma 5, JWT, Zod, Helmet, Morgan |
| ML | Python 3.11, FastAPI, scikit-learn, Pandas, NumPy, Joblib |
| Database | PostgreSQL 16 |
| DevOps | Docker, Docker Compose |

**All technologies are 100% free and open-source.**

---

## Running Tests

```bash
cd backend
npm test
```

Covers: login, customer list/detail, simulation delta structure, intervention save, analytics summary, health check.

---

## Future Roadmap

- Real-time WebSocket notifications for Imminent Default state changes
- User role management (Admin vs Analyst) with RBAC
- Expanded CommunicationLog UI with full SMS/email render history
- Automated A/B testing of intervention strategies
- Model explainability (SHAP values) in customer profile view
- Portfolio-level contagion cascade simulation

## Known Limitations

- ML model trained on synthetic data — prediction accuracy improves with real banking data
- Entanglement risk links are seeded; in production these come from loan origination systems
- Communication SMS/email delivery is simulated (no actual send gateway integrated)
- JWT expiry is 7 days; rotation/refresh not yet implemented