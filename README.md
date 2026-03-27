Quantum State Financial Engine (QFSE)

> Pre-Delinquency Intervention Platform
Detects financial instability before default using Machine Learning, Network Theory, and Predictive Simulation.




---

Executive Summary

Traditional financial risk systems evaluate customers in isolation.
QFSE models financial instability as a dynamic interconnected ecosystem.

Instead of asking:

> “Will this customer default?”



QFSE asks:

> “How does risk evolve, spread, and respond to intervention over time?”



The platform enables:

Individual default probability prediction

Relationship-based contagion modeling

Scenario simulation for proactive intervention

Behavioral communication tracking

Longitudinal risk analytics



---

Table of Contents

1. Problem Statement


2. System Architecture


3. Core Capabilities


4. Technical Stack


5. Machine Learning Design


6. Database Design


7. API Endpoints


8. Setup & Execution


9. Security


10. Demo Flow


11. Design Philosophy


12. Future Roadmap


13. Limitations


14. License




---

1. Problem Statement

Most credit risk systems:

Use static scoring

Evaluate customers independently

React after delinquency


This reactive approach:

Misses contagion risk

Fails to model behavior shifts

Lacks intervention simulation


QFSE introduces:

Predictive modeling

Network-aware risk propagation

Intervention outcome simulation

Behavioral risk adjustment



---

2. System Architecture

High-Level Architecture

Frontend (React + Vite)
        |
        v
Backend API (Node + Express)
        |
        v
PostgreSQL Database
        |
        v
Machine Learning Service (Python + scikit-learn)


---

Component Overview

Frontend

React

Vite

TypeScript

Axios

Dynamic graph visualization

Timeline analytics dashboard


Backend

Node.js

Express

Prisma ORM

PostgreSQL

JWT authentication

Validation middleware

Rate limiting


Machine Learning Service

Python

scikit-learn

Synthetic dataset generator

Logistic Regression classifier

Auto-training if model missing


Infrastructure

Docker

Docker Compose

Containerized multi-service deployment



---

3. Core Capabilities


---

3.1 Individual Risk Prediction

Each customer receives:

Probability of Default (0–1)

Stored risk score

Feature-driven prediction


Features include:

Income

Debt ratio

Payment history

Behavioral signals

Communication engagement



---

3.2 Entanglement Network (Contagion Modeling)

Customers are linked via relationships:

Shared address

Co-borrower

Guarantor

Shared employer


Contagion Formula

contagionScore = baseRisk + Σ(linkedCustomerRisk × weightFactor)

Weight Factors

Relationship Type	Weight

Shared Address	0.4
Co-borrower	0.6
Guarantor	0.7
Shared Employer	0.3


Final score normalized between 0 and 1.

Backend returns:

Nodes

Edges

Aggregated contagion score



---

3.3 Simulation Engine

Enables proactive intervention modeling.

Example Scenarios

Increase salary stability

Debt restructuring

Improved payment discipline

Behavioral stabilization


Simulation Flow

1. Fetch original customer features


2. Modify selected feature


3. Recalculate ML probability


4. Compute delta


5. Persist simulation history



Response Format

{
  "originalRisk": 0.72,
  "simulatedRisk": 0.51,
  "delta": -0.21,
  "modifiedFeature": "income"
}


---

3.4 Communication Intelligence Layer

Tracks:

Email outreach

SMS alerts

Phone calls

Engagement responses


Effects:

Behavioral feature adjustment

Risk recalibration

Timeline logging


All communications stored in CommunicationLog.


---

3.5 Timeline Analytics

Each customer profile contains:

Key Events Timeline

Monthly Risk Snapshots

Quarterly Summary

Simulation History

Communication History

Risk Evolution Graph


Provides longitudinal visibility into instability.


---

4. Technical Stack

Frontend

React

TypeScript

Vite

Axios


Backend

Node.js

Express

Prisma ORM

PostgreSQL


Machine Learning

Python

scikit-learn

Logistic Regression

Feature Scaling

Synthetic Data Generator


DevOps

Docker

Docker Compose


All technologies are free and open source.


---

5. Machine Learning Design

Model

Logistic Regression baseline

Probability output

Scaled features

Binary classification


Synthetic Dataset

Generated with:

Income ranges

Debt ratios

Payment discipline metrics

Behavioral variables


Auto Training

If model file is missing:

Auto-train on startup

Save trained model

Enable /predict endpoint


ML Endpoints

POST /predict
POST /retrain


---

6. Database Design

Managed using Prisma ORM.

Core Models

Customer

id

name

income

employer

behavioralScore


RiskScore

customerId

probability

timestamp


Relationship

sourceCustomerId

targetCustomerId

relationshipType


CommunicationLog

customerId

type

response

timestamp


SimulationHistory

customerId

originalRisk

simulatedRisk

delta

modifiedFeature

timestamp



---

7. API Endpoints (Backend)

Customer

GET /customers
GET /customers/:id
POST /customers

Risk

POST /risk/predict/:id
GET /risk/:id

Network

GET /network/:id

Simulation

POST /simulate/:id
GET /simulation/history/:id

Communication

POST /communication/:id
GET /communication/:id


---

8. Setup & Execution


---

Option 1: Docker (Recommended)

Clone Repository

git clone <repository-url>
cd QFSE

Run Full Stack

docker-compose up --build

Services

Service	URL

Frontend	http://localhost:5173
Backend	http://localhost:3001
PostgreSQL	localhost:5432
ML Service	Internal Container


System auto-migrates and seeds on startup.


---

Option 2: Local Development

Backend

cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

Frontend

cd frontend
npm install
npm run dev

ML Service

cd ml
pip install -r requirements.txt
python train.py
python app.py


---

9. Security

JWT Authentication

Protected Routes

Request Validation

Rate Limiting

Environment-based configuration

Centralized Error Handling



---

10. Demo Flow

1. Open Dashboard


2. Select Customer


3. View Risk Probability


4. Explore Entanglement Network


5. Review Timeline


6. Run Simulation


7. Observe Risk Delta


8. Log Communication


9. Observe Behavioral Impact




---

11. Design Philosophy

Inspired by:

Network Theory

Behavioral Finance

Probabilistic Modeling

Risk Contagion Dynamics


Core belief:

> Risk is a dynamic state, not a static number.




---

12. Future Roadmap

Graph Neural Networks for contagion modeling

Real-time event streaming

Explainable AI (SHAP integration)

Role-based dashboards

CI/CD pipeline

Production-grade monitoring

Credit bureau data integration

Kubernetes deployment



---

13. Known Limitations

Synthetic dataset only

Simplified contagion weights

Logistic Regression baseline model

No external financial system integration



---

14. License

This project is for academic and demonstration purposes.


---

Author

Built as a full-stack financial risk intelligence system
for advanced portfolio and academic demonstration.


---
