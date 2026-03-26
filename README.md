# Quantum State Financial Engine (QFSE)

Quantum State Financial Engine (QFSE) is a full-stack financial risk intelligence platform that models customer instability, contagion risk propagation, behavioral interventions, and communication impact using a network-driven approach.

The system enables financial institutions to proactively detect, simulate, and mitigate default risk instead of relying solely on static credit scoring models.

---

## 1. Overview

Traditional risk systems evaluate customers independently. QFSE models financial risk as a dynamic ecosystem.

The platform:

1. Predicts individual default probability using machine learning
2. Models interconnected customers through a relationship network
3. Simulates intervention scenarios
4. Tracks communication effectiveness
5. Computes contagion risk propagation
6. Visualizes instability evolution over time

This approach enables proactive risk management.

---

## 2. Architecture

Frontend:

* React
* Vite
* TypeScript
* Axios for API communication

Backend:

* Node.js
* Express
* Prisma ORM
* PostgreSQL

Machine Learning Service:

* Python
* scikit-learn
* Synthetic dataset generation
* Logistic Regression classifier

Infrastructure:

* Docker
* Docker Compose

---

## 3. Core Features

### 3.1 Customer Risk Prediction

* Machine learning model predicts probability of default
* Risk score persisted in database
* Feature-based prediction using financial and behavioral signals
* Probability output normalized between 0 and 1

---

### 3.2 Entanglement Network (Contagion Modeling)

The system models relationships between customers, including:

* Shared address
* Co-borrower
* Guarantor
* Shared employer

Contagion score formula:

contagionScore = baseRisk + Σ(linkedCustomerRisk × weightFactor)

Weight factors:

* Shared address: 0.4
* Co-borrower: 0.6
* Guarantor: 0.7
* Shared employer: 0.3

The final score is normalized between 0 and 1.

The backend returns a structured graph containing:

* Nodes
* Edges
* Contagion score

---

### 3.3 Simulation Engine

The simulation engine enables analysts to model intervention scenarios such as:

* Salary stability improvement
* Debt restructuring
* Behavioral improvement
* Payment discipline enhancement

Simulation flow:

1. Fetch real customer features
2. Modify selected feature
3. Recalculate ML prediction
4. Compute delta between original and simulated risk
5. Persist simulation history

Response format:

{
originalRisk,
simulatedRisk,
delta,
modifiedFeature
}

---

### 3.4 Communication Intelligence Layer

The platform tracks:

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

### 3.5 Timeline Analytics

Each customer profile includes:

* Key Events Timeline
* Monthly Snapshots
* Quarterly Summary
* Communication history
* Risk evolution tracking

This provides longitudinal visibility into customer instability.

---

## 4. Database Schema Overview

Core models:

* Customer
* RiskScore
* Relationship
* CommunicationLog
* SimulationHistory

Database managed using Prisma ORM.

---

## 5. Machine Learning Model

The ML service includes:

* Synthetic dataset generation
* Feature scaling
* Logistic Regression classifier
* Probability output between 0 and 1
* Model auto-training if model file is missing
* Retraining endpoint support

ML Endpoints:

POST /predict
POST /retrain

Predictions are persisted in the RiskScore table.

---

## 6. Running the Project (Docker)

1. Clone repository:

git clone <repository-url>
cd QFSE

2. Run full stack:

docker-compose up --build

Services:

Frontend: [http://localhost:5173](http://localhost:5173)
Backend: [http://localhost:3001](http://localhost:3001)
PostgreSQL: localhost:5432
ML Service: internal container

System auto-migrates and seeds database on startup.

---

## 7. Development Mode (Without Docker)

Backend:

cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

Frontend:

cd frontend
npm install
npm run dev

ML Service:

cd ml
pip install -r requirements.txt
python train.py
python app.py

---

## 8. Security

* JWT-based authentication
* Protected API routes
* Centralized error handling
* Request validation
* Rate limiting
* Environment-based configuration

---

## 9. Demo Flow

1. Open dashboard
2. Select a customer
3. View risk probability
4. Explore entanglement network
5. Review timeline and communication logs
6. Run simulation
7. Observe risk delta
8. Log communication and observe behavioral impact

---

## 10. Design Philosophy

The system is inspired by:

* Network theory
* Probabilistic modeling
* Behavioral finance
* Risk contagion modeling

Risk is modeled as a dynamic state rather than a static score.

---

## 11. Future Improvements

* Graph neural networks for contagion modeling
* Real-time event streaming
* Explainable AI integration (e.g., SHAP)
* Credit bureau data integration
* Role-based dashboards
* CI/CD pipeline
* Production deployment hardening

---

## 12. Known Limitations

* Uses synthetic dataset
* Simplified contagion weights
* Logistic regression baseline model
* No real-world financial institution integration

---

## 13. License

For academic and demonstration purposes.

---

