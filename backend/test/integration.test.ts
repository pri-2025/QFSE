/**
 * QFSE Backend — Integration Tests
 * Tests the end-to-end flow: Login → Customers → Simulate → Save Intervention
 *
 * Run: npm test
 * Requires: DATABASE_URL env var (or test DB)
 */

import request from "supertest";
import app from "../src/index";

const TEST_EMAIL    = "sarah.chen@qfse.bank";
const TEST_PASSWORD = "Qfse@2025";

let authToken = "";
let testCustomerId = "";

// ── Auth ──────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("returns 200 and JWT token with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(TEST_EMAIL);

    authToken = res.body.token;
  });

  it("returns 401 with wrong credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email:    TEST_EMAIL,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });
});

// ── Customers ─────────────────────────────────────────────────
describe("GET /api/customers", () => {
  it("returns customer list with auth token", async () => {
    const res = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Save first customer for subsequent tests
    testCustomerId = res.body.data[0].id;
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).get("/api/customers");
    expect(res.status).toBe(401);
  });

  it("supports riskState filter", async () => {
    const res = await request(app)
      .get("/api/customers?riskState=Healthy")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((c: { riskState: string }) => c.riskState === "Healthy")).toBe(true);
  });
});

// ── Customer Detail ───────────────────────────────────────────
describe("GET /api/customers/:id", () => {
  it("returns full customer profile", async () => {
    const res = await request(app)
      .get(`/api/customers/${testCustomerId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", testCustomerId);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("risk");
  });

  it("returns 404 for unknown customer", async () => {
    const res = await request(app)
      .get("/api/customers/NONEXISTENT_CUST")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Simulation ────────────────────────────────────────────────
describe("POST /api/interventions/simulate", () => {
  it("returns structured delta result", async () => {
    const res = await request(app)
      .post("/api/interventions/simulate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ customerId: testCustomerId, actionType: "EMI Holiday" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("originalRisk");
    expect(res.body).toHaveProperty("simulatedRisk");
    expect(res.body).toHaveProperty("delta");
    expect(res.body).toHaveProperty("riskReductionPct");
    expect(typeof res.body.originalRisk).toBe("number");
    expect(typeof res.body.delta).toBe("number");
  });

  it("returns 400 for invalid actionType", async () => {
    const res = await request(app)
      .post("/api/interventions/simulate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ customerId: testCustomerId, actionType: "INVALID_ACTION" });
    expect(res.status).toBe(400);
  });
});

// ── Save Intervention ─────────────────────────────────────────
describe("POST /api/interventions", () => {
  it("saves intervention and returns 201", async () => {
    const res = await request(app)
      .post("/api/interventions")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        customerId:           testCustomerId,
        actionType:           "EMI Holiday",
        preProbability:       0.78,
        projectedProbability: 0.55,
        confidenceScore:      0.82,
        riskReductionPct:     29.5,
        notes:                "Integration test intervention",
        status:               "simulated",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.actionType).toBe("EMI Holiday");
  });
});

// ── Analytics ─────────────────────────────────────────────────
describe("GET /api/analytics/summary", () => {
  it("returns portfolio summary", async () => {
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalCustomers");
    expect(res.body).toHaveProperty("avgRiskScore");
    expect(res.body.totalCustomers).toBeGreaterThan(0);
  });
});

// ── Health ────────────────────────────────────────────────────
describe("GET /health", () => {
  it("returns healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });
});
