/**
 * Prisma Seed — Quantum State Financial Engine
 *
 * Inserts:
 *   - 5 Personas
 *   - 1 Analyst user
 *   - 15 real seed customers (from original types.ts)
 *   - 85 synthetic customers (total = 100)
 *   - Loans, RiskScores, Entanglements, Interventions, Snapshots per customer
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRiskState(prob: number): string {
  if (prob < 0.30) return "Healthy";
  if (prob < 0.50) return "Watchlist";
  if (prob < 0.75) return "At Risk";
  return "Imminent Default";
}

// ── Persona definitions ───────────────────────────────────────
const PERSONA_DEFS = [
  { name: "Salary-Dependent Struggler",    color: "#BD10E0", emoji: "🟣", avgRisk: 54 },
  { name: "Credit-Heavy Overuser",         color: "#F5A623", emoji: "🟡", avgRisk: 67 },
  { name: "Emergency Cash Withdrawer",     color: "#FF8C00", emoji: "🟠", avgRisk: 71 },
  { name: "Silent Saver Drain",            color: "#4169E1", emoji: "🔵", avgRisk: 32 },
  { name: "Paycheck-to-Paycheck Survivor", color: "#2E8B57", emoji: "🟢", avgRisk: 45 },
];

// ── 15 Real seed customers ────────────────────────────────────
const REAL_CUSTOMERS = [
  { id:"CUST_01", name:"Neha Verma",          email:"neha.v@email.com",          phone:"+91-98765-43001", persona:"Silent Saver Drain",            income:65000,  loan:120000,  emi:12000,  emiDue:12, creditUtil:25, salaryDelay:0.05, emiConsist:0.95, spikes:0, lti:0.15, surplus:15400, employer:"Infosys Ltd",       prob:0.08 },
  { id:"CUST_02", name:"Rohan Patil",         email:"rohan.p@email.com",          phone:"+91-98765-43002", persona:"Paycheck-to-Paycheck Survivor", income:42000,  loan:85000,   emi:8500,   emiDue:4,  creditUtil:40, salaryDelay:0.25, emiConsist:0.75, spikes:1, lti:0.17, surplus:5000,  employer:"State Bank of India",prob:0.28 },
  { id:"CUST_03", name:"Amit Sharma",         email:"amit.sharma@email.com",      phone:"+91-98765-43210", persona:"Salary-Dependent Struggler",    income:58000,  loan:250000,  emi:25000,  emiDue:6,  creditUtil:55, salaryDelay:0.60, emiConsist:0.55, spikes:2, lti:0.36, surplus:12400, employer:"HDFC Securities",   prob:0.55 },
  { id:"CUST_04", name:"Sneha Iyer",          email:"sneha.i@email.com",          phone:"+91-98765-43004", persona:"Salary-Dependent Struggler",    income:54000,  loan:320000,  emi:28000,  emiDue:3,  creditUtil:62, salaryDelay:0.65, emiConsist:0.50, spikes:2, lti:0.52, surplus:8500,  employer:"Wipro Technologies",prob:0.58 },
  { id:"CUST_05", name:"Priya Mehta",         email:"priya.m@email.com",          phone:"+91-98765-43005", persona:"Credit-Heavy Overuser",         income:72000,  loan:450000,  emi:45000,  emiDue:2,  creditUtil:87, salaryDelay:0.30, emiConsist:0.70, spikes:1, lti:0.52, surplus:3200,  employer:"Accenture",         prob:0.72 },
  { id:"CUST_06", name:"Vikas Nair",          email:"vikas.n@email.com",          phone:"+91-98765-43006", persona:"Emergency Cash Withdrawer",     income:48000,  loan:180000,  emi:18000,  emiDue:3,  creditUtil:70, salaryDelay:0.40, emiConsist:0.60, spikes:5, lti:0.31, surplus:2800,  employer:"TCS",               prob:0.76 },
  { id:"CUST_07", name:"Rajesh Kulkarni",     email:"rajesh.k@email.com",         phone:"+91-98765-43007", persona:"Emergency Cash Withdrawer",     income:60000,  loan:520000,  emi:52000,  emiDue:1,  creditUtil:82, salaryDelay:0.75, emiConsist:0.35, spikes:8, lti:0.72, surplus:500,   employer:"Reliance Industries",prob:0.88 },
  { id:"CUST_08", name:"Ankit Joshi",         email:"ankit.j@email.com",          phone:"+91-98765-43008", persona:"Credit-Heavy Overuser",         income:80000,  loan:670000,  emi:67000,  emiDue:0,  creditUtil:95, salaryDelay:0.55, emiConsist:0.25, spikes:6, lti:0.70, surplus:0,     employer:"Barclays Bank",      prob:0.92 },
  { id:"CUST_09", name:"Kavita Rao",          email:"kavita.r@email.com",         phone:"+91-98765-43009", persona:"Salary-Dependent Struggler",    income:52000,  loan:210000,  emi:21000,  emiDue:8,  creditUtil:30, salaryDelay:0.15, emiConsist:0.90, spikes:0, lti:0.33, surplus:15000, employer:"Cognizant",          prob:0.18 },
  { id:"CUST_10", name:"Manoj Deshpande",     email:"manoj.d@email.com",          phone:"+91-98765-43010", persona:"Paycheck-to-Paycheck Survivor", income:36000,  loan:95000,   emi:9500,   emiDue:2,  creditUtil:78, salaryDelay:0.70, emiConsist:0.40, spikes:4, lti:0.22, surplus:1200,  employer:"BPCL",               prob:0.80 },
  { id:"CUST_11", name:"Divya Krishnan",      email:"divya.k@email.com",          phone:"+91-98765-43011", persona:"Salary-Dependent Struggler",    income:65000,  loan:380000,  emi:38000,  emiDue:5,  creditUtil:68, salaryDelay:0.70, emiConsist:0.45, spikes:3, lti:0.49, surplus:4200,  employer:"HCL Technologies",   prob:0.68 },
  { id:"CUST_12", name:"Karthik Subramanian", email:"karthik.s@email.com",        phone:"+91-98765-43012", persona:"Credit-Heavy Overuser",         income:68000,  loan:290000,  emi:29000,  emiDue:10, creditUtil:72, salaryDelay:0.20, emiConsist:0.80, spikes:1, lti:0.35, surplus:0,     employer:"Deloitte",           prob:0.45 },
  { id:"CUST_13", name:"Meera Chandran",      email:"meera.c@email.com",          phone:"+91-98765-43013", persona:"Silent Saver Drain",            income:55000,  loan:150000,  emi:15000,  emiDue:15, creditUtil:38, salaryDelay:0.10, emiConsist:0.88, spikes:0, lti:0.23, surplus:0,     employer:"Amazon India",       prob:0.35 },
  { id:"CUST_14", name:"Sunil Gawande",       email:"sunil.g@email.com",          phone:"+91-98765-43014", persona:"Paycheck-to-Paycheck Survivor", income:38000,  loan:75000,   emi:7500,   emiDue:5,  creditUtil:42, salaryDelay:0.20, emiConsist:0.85, spikes:0, lti:0.16, surplus:0,     employer:"MSRTC",              prob:0.22 },
  { id:"CUST_15", name:"Pooja Desai",         email:"pooja.d@email.com",          phone:"+91-98765-43015", persona:"Emergency Cash Withdrawer",     income:50000,  loan:220000,  emi:22000,  emiDue:8,  creditUtil:55, salaryDelay:0.35, emiConsist:0.65, spikes:3, lti:0.36, surplus:0,     employer:"Flipkart",           prob:0.42 },
];

// ── Synthetic customer templates ──────────────────────────────
const SYNTHETIC_NAMES = [
  "Arjun Singh","Deepika Patel","Suresh Kumar","Ananya Reddy","Vikram Sharma","Preethi Nair",
  "Mohammed Ali","Sunita Joshi","Ramesh Gupta","Pallavi Iyer","Aditya Mehta","Varsha Kulkarni",
  "Santosh Rao","Nisha Verma","Prashanth Gowda","Lakshmi Devi","Harsha Patil","Rekha Sharma",
  "Dilip Nayak","Meenakshi Pillai","Subramaniam K","Geeta Chauhan","Ravi Shankar","Smita Jain",
  "Arvind Desai","Preeti Bose","Manish Kapoor","Sundarajan R","Vijaya Lakshmi","Kiran Rathod",
  "Bhoomi Shah","Karthikeyan M","Jayashree N","Srinath B","Lavanya P","Manikandan A",
  "Divyashree C","Pramod Tiwari","Usha Krishnan","Anil Bhatt","Savitha Rao","Gopinath V",
  "Hemalatha S","Naresh Panda","Shanthi M","Venkatesh K","Dharini R","Prabhu T",
  "Kavya Agarwal","Sridhar L","Nalini M","Manohar S","Ranjita B","Sudhir K","Lalitha P",
  "Balakrishnan N","Archana V","Rajkumar D","Mythili S","Senthil K","Sushama R",
  "Ashwini M","Surendra N","Hema K","Nagaraj P","Bindhu S","Basavaraj K","Padmini R",
  "Chandrashekar M","Saraswathi N","Murali K","Bhavani V","Suresh Babu","Indu Sharma",
  "Chandrika P","Venkataramaiah","Yamuna Rao","Shanmugavel","Sarojini Devi","Parimala K",
  "Krishnamurthy","Radha Krishnan","Geetha Kumari","Sathyanarayana","Varalakshmi P",
];

const EMPLOYERS = [
  "TCS","Infosys","Wipro","HCL Technologies","Tech Mahindra","L&T","HDFC Bank",
  "ICICI Bank","Axis Bank","State Bank of India","Reliance Industries","Tata Group",
  "Mahindra & Mahindra","ONGC","Coal India","Bharat Electronics","NTPC","Power Grid",
  "Hindustan Unilever","ITC Limited","Dr. Reddy's Labs","Sun Pharma","Cipla",
  "Bajaj Finance","Kotak Mahindra","Yes Bank","IndusInd Bank","BPCL","GAIL",
  "Cognizant","Accenture India","Deloitte India","PwC India","KPMG India",
];

async function main() {
  console.log("🌱 Starting QFSE database seed...");

  // ── Personas ──────────────────────────────────────────────
  console.log("  → Seeding personas...");
  const personaMap: Record<string, number> = {};
  for (const p of PERSONA_DEFS) {
    const rec = await prisma.persona.upsert({
      where:  { name: p.name },
      update: { color: p.color, emoji: p.emoji, avgRisk: p.avgRisk },
      create: p,
    });
    personaMap[p.name] = rec.id;
  }

  // ── Analyst user ──────────────────────────────────────────
  console.log("  → Seeding analyst user...");
  const pwHash = await bcrypt.hash("Qfse@2025", 12);
  await prisma.user.upsert({
    where:  { email: "sarah.chen@qfse.bank" },
    update: {},
    create: {
      id:           "00000000-0000-0000-0000-000000000001",
      email:        "sarah.chen@qfse.bank",
      passwordHash: pwHash,
      name:         "Sarah Chen",
      role:         "senior_analyst",
    },
  });

  // ── Real customers ────────────────────────────────────────
  console.log("  → Seeding 15 real customers...");
  for (const c of REAL_CUSTOMERS) {
    await prisma.customer.upsert({
      where:  { id: c.id },
      update: {},
      create: {
        id:                   c.id,
        name:                 c.name,
        email:                c.email,
        phone:                c.phone,
        personaId:            personaMap[c.persona],
        monthlyIncome:        c.income,
        loanAmount:           c.loan,
        emiAmount:            c.emi,
        emiDueDays:           c.emiDue,
        creditUtilization:    c.creditUtil,
        salaryDelayFreq:      c.salaryDelay,
        emiPaymentConsistency:c.emiConsist,
        withdrawalSpikes:     c.spikes,
        loanToIncomeRatio:    c.lti,
        affordabilitySurplus: c.surplus,
        employer:             c.employer,
      },
    });

    // Risk scores (4 weeks history)
    const daysBack = [21, 14, 7, 0];
    for (const d of daysBack) {
      const scoredAt = new Date();
      scoredAt.setDate(scoredAt.getDate() - d);
      const wobble = (Math.random() - 0.5) * 0.06;
      const prob   = Math.max(0.01, Math.min(0.99, c.prob + wobble));
      await prisma.riskScore.create({
        data: {
          customerId:        c.id,
          scoredAt,
          probability:       prob,
          riskState:         getRiskState(prob),
          featureImportance: {
            salary_delay_freq:        parseFloat((c.salaryDelay * 0.30).toFixed(4)),
            credit_utilization_ratio: parseFloat(((c.creditUtil / 100) * 0.25).toFixed(4)),
            emi_payment_consistency:  parseFloat(((1 - c.emiConsist) * 0.22).toFixed(4)),
            withdrawal_spikes:        parseFloat((c.spikes / 10 * 0.13).toFixed(4)),
            loan_to_income_ratio:     parseFloat((c.lti * 0.10).toFixed(4)),
          },
          modelVersion: "v1",
        },
      });
    }

    // Loan
    const disburse = new Date();
    disburse.setMonth(disburse.getMonth() - 3);
    const mature = new Date(disburse);
    mature.setFullYear(mature.getFullYear() + 1);
    await prisma.loan.create({
      data: {
        customerId:    c.id,
        loanType:      c.loan > 300000 ? "Home Loan" : "Personal Loan",
        sanctionedAmt: c.loan,
        outstandingAmt:c.loan * 0.9,
        emiAmount:     c.emi,
        tenureMonths:  12,
        interestRate:  12.5,
        disbursedAt:   disburse,
        maturityDate:  mature,
        status:        "active",
      },
    });
  }

  // ── Entanglements for real customers ─────────────────────
  const entanglementPairs = [
    { customerId: "CUST_04", linkedName: "Rahul Iyer",      relationship: "Spouse",  linkType: "family",        riskImpactPct: 12, linkedRiskScore: 0.32 },
    { customerId: "CUST_07", linkedName: "Meera Kulkarni",  relationship: "Spouse",  linkType: "family",        riskImpactPct: 20, linkedRiskScore: 0.45 },
    { customerId: "CUST_07", linkedName: "Suresh Kulkarni", relationship: "Parent",  linkType: "family",        riskImpactPct: 10, linkedRiskScore: 0.32 },
    { customerId: "CUST_08", linkedName: "Neha Joshi",      relationship: "Sibling", linkType: "family",        riskImpactPct: 15, linkedRiskScore: 0.38 },
    { customerId: "CUST_08", linkedName: "Ramesh Joshi",    relationship: "Parent",  linkType: "guarantor",     riskImpactPct: 8,  linkedRiskScore: 0.25 },
    { customerId: "CUST_15", linkedName: "Sibling",         relationship: "Sibling", linkType: "shared_address",riskImpactPct: 8,  linkedRiskScore: 0.28 },
  ];
  for (const e of entanglementPairs) {
    await prisma.entanglement.create({ data: e });
  }

  // ── 85 synthetic customers ────────────────────────────────
  console.log("  → Seeding 85 synthetic customers...");
  const personaNames = PERSONA_DEFS.map(p => p.name);
  const usedEmails   = new Set(REAL_CUSTOMERS.map(c => c.email));

  for (let i = 0; i < 85; i++) {
    const idx          = i + 16;
    const custId       = `CUST_${String(idx).padStart(3, "0")}`;
    const personaName  = pick(personaNames);
    const personaId    = personaMap[personaName];
    const nameIdx      = i % SYNTHETIC_NAMES.length;
    const baseName     = SYNTHETIC_NAMES[nameIdx] + (i >= SYNTHETIC_NAMES.length ? ` ${Math.floor(i / SYNTHETIC_NAMES.length) + 1}` : "");
    let   email        = `${baseName.toLowerCase().replace(/\s+/g, ".")}.${idx}@qfse.test`;
    while (usedEmails.has(email)) {
      email = `${baseName.toLowerCase().replace(/\s+/g, ".")}.${idx}.x@qfse.test`;
    }
    usedEmails.add(email);

    // Features by persona
    const featuresByPersona: Record<string, { salaryDelay: number; creditUtil: number; emiConsist: number; spikes: number; lti: number }> = {
      "Salary-Dependent Struggler":    { salaryDelay: rand(0.40, 0.80), creditUtil: randInt(40, 65), emiConsist: rand(0.40, 0.70), spikes: randInt(0, 3), lti: rand(0.25, 0.55) },
      "Credit-Heavy Overuser":         { salaryDelay: rand(0.10, 0.35), creditUtil: randInt(70, 95), emiConsist: rand(0.55, 0.85), spikes: randInt(0, 2), lti: rand(0.40, 0.75) },
      "Emergency Cash Withdrawer":     { salaryDelay: rand(0.25, 0.55), creditUtil: randInt(55, 80), emiConsist: rand(0.35, 0.65), spikes: randInt(3, 9), lti: rand(0.30, 0.60) },
      "Silent Saver Drain":            { salaryDelay: rand(0.02, 0.18), creditUtil: randInt(15, 40), emiConsist: rand(0.80, 0.98), spikes: randInt(0, 1), lti: rand(0.10, 0.28) },
      "Paycheck-to-Paycheck Survivor": { salaryDelay: rand(0.15, 0.40), creditUtil: randInt(35, 70), emiConsist: rand(0.60, 0.85), spikes: randInt(0, 2), lti: rand(0.12, 0.30) },
    };

    const f           = featuresByPersona[personaName];
    const income      = randInt(28000, 120000);
    const loanAmt     = randInt(50000, 800000);
    const emi         = Math.round(loanAmt / 12);
    const surplus     = Math.max(0, income - emi - randInt(8000, 30000));

    // Compute approximate default probability
    const logit = -3.5 + 3.2 * f.salaryDelay + 2.8 * (f.creditUtil / 100) - 3.0 * f.emiConsist
                       + 2.0 * (f.spikes / 10) + 1.8 * f.lti;
    const prob   = Math.max(0.02, Math.min(0.98, 1 / (1 + Math.exp(-logit))));

    await prisma.customer.create({
      data: {
        id:                   custId,
        name:                 baseName,
        email,
        phone:                `+91-9${randInt(100000000, 999999999)}`,
        personaId,
        monthlyIncome:        income,
        loanAmount:           loanAmt,
        emiAmount:            emi,
        emiDueDays:           randInt(0, 20),
        creditUtilization:    f.creditUtil,
        salaryDelayFreq:      parseFloat(f.salaryDelay.toFixed(4)),
        emiPaymentConsistency:parseFloat(f.emiConsist.toFixed(4)),
        withdrawalSpikes:     f.spikes,
        loanToIncomeRatio:    parseFloat(f.lti.toFixed(4)),
        affordabilitySurplus: surplus,
        employer:             pick(EMPLOYERS),
      },
    });

    // Risk score
    const scoredAt = new Date();
    scoredAt.setDate(scoredAt.getDate() - randInt(0, 3));
    await prisma.riskScore.create({
      data: {
        customerId:  custId,
        scoredAt,
        probability: parseFloat(prob.toFixed(4)),
        riskState:   getRiskState(prob),
        modelVersion:"v1",
      },
    });

    // Loan
    const disburse = new Date();
    disburse.setMonth(disburse.getMonth() - randInt(2, 10));
    const mature   = new Date(disburse);
    mature.setFullYear(mature.getFullYear() + 1);
    await prisma.loan.create({
      data: {
        customerId:    custId,
        loanType:      loanAmt > 300000 ? "Home Loan" : "Personal Loan",
        sanctionedAmt: loanAmt,
        outstandingAmt:loanAmt * rand(0.5, 0.95),
        emiAmount:     emi,
        tenureMonths:  12,
        interestRate:  rand(10, 18),
        disbursedAt:   disburse,
        maturityDate:  mature,
        status:        "active",
      },
    });
  }

  // ── Snapshot for high-risk real customers ─────────────────
  console.log("  → Seeding snapshots...");
  const snapshotCustomers = ["CUST_03","CUST_07","CUST_08","CUST_09"];
  for (const cid of snapshotCustomers) {
    for (let m = 2; m >= 0; m--) {
      const month = new Date();
      month.setDate(1);
      month.setMonth(month.getMonth() - m);
      try {
        await prisma.snapshot.create({
          data: {
            customerId:    cid,
            snapshotMonth: month,
            avgBalance:    randInt(500, 40000),
            totalCredits:  randInt(40000, 90000),
            totalDebits:   randInt(40000, 90000),
            emiPaid:       Math.random() > 0.3,
            riskScore:     rand(0.2, 0.9),
            riskState:     pick(["Watchlist","At Risk","Imminent Default"]),
            savingsBalance:randInt(0, 50000),
            creditUtilPct: rand(40, 95),
          },
        });
      } catch {
        // Skip duplicate
      }
    }
  }

  console.log("✅ Seed complete!");
  console.log(`   Personas   : ${PERSONA_DEFS.length}`);
  console.log(`   Customers  : ${REAL_CUSTOMERS.length + 85}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
