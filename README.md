# Quantum State Financial Engine (QFSE)

> **Pre-Delinquency Intervention Platform**
> Detect financial instability before default using Machine Learning, Network Modeling, and Predictive Simulation.

---

# 1. Overview

Traditional risk systems evaluate customers independently.
QFSE models financial risk as a dynamic ecosystem.

The platform:

* Predicts individual default probability using machine learning
* Models interconnected customers through a relationship network
* Simulates intervention scenarios
* Tracks communication effectiveness
* Computes contagion risk propagation
* Visualizes instability evolution over time

This enables proactive, data-driven risk management.

---

# 2. Architecture

## Frontend

* React
* Vite
* TypeScript
* Axios

## Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL

## Machine Learning Service

* Python
* scikit-learn
* Synthetic dataset generation
* Logistic Regression classifier

## Infrastructure

* Docker
* Docker Compose

---

# 3. Core Features

## 3.1 Customer Risk Prediction

* Machine learning model predicts probability of default
* Risk score persisted in database
* Feature-based prediction using financial and behavioral signals
* Output normalized between 0 and 1

---

## 3.2 Entanglement Network (Contagion Modeling)

Models relationships between customers:

* Shared address
* Co-borrower
* Guarantor
* Shared employer

Contagion formula:

```
contagionScore = baseRisk + Σ(linkedCustomerRisk × weightFactor)
```

Weight factors:

* Shared address: 0.4
* Co-borrower: 0.6
* Guarantor: 0.7
* Shared employer: 0.3

Final score normalized between 0 and 1.

Backend returns:

* Nodes
* Edges
* Contagion score

---

## 3.3 Simulation Engine

Enables intervention modeling:

* Salary stability improvement
* Debt restructuring
* Behavioral improvement
* Payment discipline enhancement

Simulation flow:

1. Fetch customer features
2. Modify selected feature
3. Recalculate ML prediction
4. Compute risk delta
5. Persist simulation history

Response format:

```
{
  originalRisk,
  simulatedRisk,
  delta,
  modifiedFeature
}
```

---

## 3.4 Communication Intelligence Layer

Tracks:

* Email communications
* SMS interventions
* Phone calls
* Engagement responses

Communication logs:

* Stored in database
* Displayed in timeline
* Influence behavioral stability
* Adjust overall risk probability

---

## 3.5 Timeline Analytics

Each customer profile includes:

* Key events timeline
* Monthly risk snapshots
* Quarterly summary
* Communication history
* Risk evolution tracking

Provides longitudinal visibility into instability.

---

# 4. Database Schema Overview

Core models:

* Customer
* RiskScore
* Relationship
* CommunicationLog
* SimulationHistory

Managed using Prisma ORM.

---

# 5. Machine Learning Model

Includes:

* Synthetic dataset generation
* Feature scaling
* Logistic Regression classifier
* Probability output between 0 and 1
* Auto-training if model file missing
* Retraining endpoint support

ML Endpoints:

```
POST /predict
POST /retrain
```

Predictions are stored in the RiskScore table.

---

# 6. Running the Project

## 6.1 Using Docker (Recommended)

Clone repository:

```
git clone <repository-url>
cd QFSE
```

Run full stack:

```
docker-compose up --build
```

Services:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:3001](http://localhost:3001)
* PostgreSQL: localhost:5432
* ML Service: internal container

System auto-migrates and seeds database on startup.

---

## 6.2 Development Mode (Without Docker)

### Backend

```
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

### ML Service

```
cd ml
pip install -r requirements.txt
python train.py
python app.py
```

---

# 7. Security

* JWT-based authentication
* Protected API routes
* Centralized error handling
* Request validation
* Rate limiting
* Environment-based configuration

---

# 8. Demo Flow

1. Open dashboard
2. Select a customer
3. View risk probability
4. Explore entanglement network
5. Review timeline and communication logs
6. Run simulation
7. Observe risk delta
8. Log communication and observe behavioral impact

---

# 9. Design Philosophy

Inspired by:

* Network theory
* Probabilistic modeling
* Behavioral finance
* Risk contagion modeling

Core principle:

Risk is a dynamic state rather than a static score.

---

# 10. Future Improvements

* Graph neural networks for contagion modeling
* Real-time event streaming
* Explainable AI integration (SHAP)
* Credit bureau data integration
* Role-based dashboards
* CI/CD pipeline
* Production deployment hardening

---

# 11. Known Limitations

* Uses synthetic dataset
* Simplified contagion weights
* Logistic regression baseline model
* No real-world financial institution integration

---

# 12. License

For academic and demonstration purposes.

---

This version will render perfectly in:

* GitHub
* VS Code Preview
* GitLab
* Bitbucket


