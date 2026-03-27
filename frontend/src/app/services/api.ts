/// <reference types="vite/client" />
import axios, { AxiosError } from "axios";

// Base URL — uses env var injected by Vite, falls back to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Auth interceptor ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qfse_token");
  const userStr = localStorage.getItem("qfse_user");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Cleanly route calls to the correct backend namespace based on role
  if (userStr && config.url && !config.url.startsWith("/auth")) {
    try {
      const user = JSON.parse(userStr);
      const prefix = user.role === "CUSTOMER" ? "/customer" : "/admin";
      if (!config.url.startsWith(prefix)) {
        config.url = `${prefix}${config.url}`;
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    }
  }
  
  return config;
});

// ── Response error interceptor ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("qfse_token");
      localStorage.removeItem("qfse_user");
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  persona: string;
  personaColor: string;
  personaEmoji: string;
  loanAmount: number;
  emiAmount: number;
  emiDueDays: number;
  affordabilitySurplus: number;
  employer?: string;
  risk: number;
  defaultProb: number;
  riskState: string;
  featureImportance: Record<string, number>;
  entanglementCount: number;
  lastIntervention?: string;
}

export interface ApiCustomerDetail extends ApiCustomer {
  monthlyIncome: number;
  creditUtilization: number;
  salaryDelayFreq: number;
  emiPaymentConsistency: number;
  withdrawalSpikes: number;
  loanToIncomeRatio: number;
  waveData: { date: string; risk: number; state: string }[];
  loans: Array<{
    id: string; type: string; sanctionedAmt: number; outstandingAmt: number;
    emiAmount: number; tenureMonths: number; interestRate: number;
    disbursedAt: string; maturityDate: string; status: string;
  }>;
  entanglements: Array<{
    id: string; name: string; relationship: string; linkType: string;
    riskImpact: string; risk: number; linkedCustomer?: { id: string; name: string; risk: number } | null;
  }>;
  interventions: Array<{
    id: string; actionType: string; preProbability: number;
    projectedProbability: number; actualProbability?: number;
    confidenceScore: number; riskReductionPct: number; status: string;
    notes?: string; simulatedAt: string; appliedAt?: string;
  }>;
  timeline: Array<{
    id: string; date: string; type: string; severity: string;
    title: string; description?: string; riskAtEvent?: number;
  }>;
  snapshots: Array<{
    month: string; avgBalance: number; totalCredits: number; totalDebits: number;
    emiPaid: boolean; riskScore: number; riskState: string;
    savingsBalance: number; creditUtilPct: number;
  }>;
}

export interface PersonaData {
  id: string;
  name: string;
  value: number;
  count: number;
  color: string;
  emoji: string;
  avgRisk: number;
  additionalInfo: string;
}

export interface PortfolioSummary {
  totalCustomers: number;
  avgRiskScore: number;
  interventionSuccessRate: number;
  avgRiskReduction: number;
  riskStateDistribution: {
    Healthy: number;
    Watchlist: number;
    "At Risk": number;
    "Imminent Default": number;
  };
}

export interface SimulationResult {
  customerId: string;
  actionType: string;
  preProbability: number;
  projectedProbability: number;
  riskReductionPct: string;
  confidenceScore: number;
  projectedRiskState: string;
  featureImportance: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const resp = await api.post<{ token: string; user: { id: string; email: string; name: string; role: string } }>("/auth/login", { email, password });
  return resp.data;
}

// ─────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────

export async function fetchCustomers(params?: { persona?: string; riskState?: string }) {
  const resp = await api.get<{ data: ApiCustomer[]; total: number }>("/customers", { params });
  return resp.data;
}

export async function fetchCustomer(id: string) {
  const resp = await api.get<ApiCustomerDetail>(`/customers/${id}`);
  return resp.data;
}

export async function fetchRiskHistory(customerId: string) {
  const resp = await api.get<{ date: string; risk: number; state: string }[]>(`/customers/${customerId}/risk-history`);
  return resp.data;
}

export async function fetchEntanglements(customerId: string) {
  const resp = await api.get(`/customers/${customerId}/entanglements`);
  return resp.data;
}

export async function fetchTimeline(customerId: string) {
  const resp = await api.get(`/customers/${customerId}/timeline`);
  return resp.data;
}

export async function refreshRisk(customerId: string) {
  const resp = await api.post(`/customers/${customerId}/refresh-risk`, {});
  return resp.data;
}

// ─────────────────────────────────────────────────────────────
// INTERVENTIONS
// ─────────────────────────────────────────────────────────────

export async function simulateIntervention(customerId: string, actionType: string): Promise<SimulationResult> {
  const resp = await api.post<SimulationResult>("/interventions/simulate", { customerId, actionType });
  return resp.data;
}

export async function saveIntervention(data: {
  customerId: string;
  actionType: string;
  preProbability: number;
  projectedProbability: number;
  confidenceScore: number;
  riskReductionPct: number;
  notes?: string;
}) {
  const resp = await api.post("/interventions", data);
  return resp.data;
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const resp = await api.get<PortfolioSummary>("/analytics/summary");
  return resp.data;
}

export async function fetchPersonaDistribution(): Promise<PersonaData[]> {
  const resp = await api.get<PersonaData[]>("/analytics/personas");
  return resp.data;
}

export async function fetchRiskMigration() {
  const resp = await api.get("/analytics/risk-migration");
  return resp.data;
}

export async function fetchInterventionSuccess() {
  const resp = await api.get("/analytics/intervention-success");
  return resp.data;
}

export async function fetchBehavioralTriggers() {
  const resp = await api.get("/analytics/behavioral-triggers");
  return resp.data;
}

// ─────────────────────────────────────────────────────────────
// SNAPSHOTS
// ─────────────────────────────────────────────────────────────

export async function fetchSnapshots(customerId: string) {
  const resp = await api.get(`/snapshots/${customerId}`);
  return resp.data;
}

export async function fetchQuarterly(customerId: string) {
  const resp = await api.get(`/snapshots/quarterly/${customerId}`);
  return resp.data;
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER PORTAL
// ─────────────────────────────────────────────────────────────

export async function fetchMyProfile() {
  const resp = await api.get('/me');
  return resp.data;
}

export async function fetchMyRisk() {
  const resp = await api.get('/risk');
  return resp.data;
}

export async function fetchMyTimeline() {
  const resp = await api.get('/timeline');
  return resp.data;
}

export async function fetchMyInterventions() {
  const resp = await api.get('/interventions');
  return resp.data;
}

export async function fetchMySnapshot() {
  const resp = await api.get('/snapshot');
  return resp.data;
}

export async function acceptMyIntervention(interventionId: string) {
  const resp = await api.post('/accept-intervention', { interventionId });
  return resp.data;
}

export default api;
