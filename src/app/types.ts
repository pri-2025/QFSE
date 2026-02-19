export type PersonaType = 
  | "Salary-Dependent Struggler" 
  | "Credit-Heavy Overuser" 
  | "Emergency Cash Withdrawer" 
  | "Silent Saver Drain" 
  | "Paycheck-to-Paycheck Survivor";

export interface Signal {
  id: number;
  type: "critical" | "warning" | "info" | "success";
  text: string;
}

export interface EntanglementNode {
  id: string;
  name: string;
  risk: number;
  relationship: string;
  riskImpact: string;
}

export interface SignalHistory {
  day: number;
  intensity: number; // 0-100
  value?: string | number;
  event?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  risk: number;
  riskLevel: "Healthy" | "Early Stress" | "Warning" | "Critical" | "Imminent Default";
  persona: PersonaType;
  signals: Signal[];
  loanAmount: string;
  emi: string;
  emiDueDays: number;
  recoveryProb: number;
  struggleProb: number;
  defaultProb: number;
  entanglements: EntanglementNode[];
  waveData: { date: string; risk: number }[];
  signalHistory?: Record<string, SignalHistory[]>;
  affordabilitySurplus: number;
}

export const PERSONA_DATA = [
  { 
    name: "Salary-Dependent Struggler", 
    value: 468, 
    color: "#BD10E0", 
    id: "Salary-Dependent Struggler",
    avgRisk: 54,
    emoji: "🟣"
  },
  { 
    name: "Credit-Heavy Overuser", 
    value: 351, 
    color: "#F5A623", 
    id: "Credit-Heavy Overuser",
    avgRisk: 67,
    emoji: "🟡"
  },
  { 
    name: "Emergency Cash Withdrawer", 
    value: 263, 
    color: "#FF8C00", 
    id: "Emergency Cash Withdrawer",
    avgRisk: 71,
    emoji: "🟠"
  },
  { 
    name: "Silent Saver Drain", 
    value: 234, 
    color: "#4169E1", 
    id: "Silent Saver Drain",
    avgRisk: 32,
    emoji: "🔵"
  },
  { 
    name: "Paycheck-to-Paycheck Survivor", 
    value: 146, 
    color: "#2E8B57", 
    id: "Paycheck-to-Paycheck Survivor",
    avgRisk: 45,
    emoji: "🟢"
  },
];

export const CUSTOMERS: Customer[] = [
  // CUST_01 - Silent Saver Drain (Blue #4169E1)
  {
    id: "CUST_01",
    name: "Neha Verma",
    email: "neha.v@email.com",
    phone: "+91-98765-43001",
    risk: 8,
    riskLevel: "Healthy",
    persona: "Silent Saver Drain",
    signals: [
      { id: 1, type: "info", text: "Gradual savings depletion" },
      { id: 2, type: "success", text: "No missed payments" }
    ],
    loanAmount: "₹1.2L",
    emi: "₹12k",
    emiDueDays: 12,
    recoveryProb: 92,
    struggleProb: 5,
    defaultProb: 3,
    entanglements: [],
    affordabilitySurplus: 15400,
    waveData: [
      { date: "Week1", risk: 5 },
      { date: "Week2", risk: 6 },
      { date: "Week3", risk: 7 },
      { date: "Week4", risk: 8 },
    ]
  },
  // CUST_02 - Paycheck-to-Paycheck Survivor (Green #2E8B57)
  {
    id: "CUST_02",
    name: "Rohan Patil",
    email: "rohan.p@email.com",
    phone: "+91-98765-43002",
    risk: 28,
    riskLevel: "Early Stress",
    persona: "Paycheck-to-Paycheck Survivor",
    signals: [
      { id: 1, type: "warning", text: "Low end-of-month balance" },
      { id: 2, type: "info", text: "Bills paid just-in-time" }
    ],
    loanAmount: "₹85k",
    emi: "₹8.5k",
    emiDueDays: 4,
    recoveryProb: 65,
    struggleProb: 25,
    defaultProb: 10,
    entanglements: [],
    waveData: [
      { date: "Week1", risk: 20 },
      { date: "Week2", risk: 22 },
      { date: "Week3", risk: 25 },
      { date: "Week4", risk: 28 },
    ]
  },
  // CUST_03 - Salary-Dependent Struggler (Amit Sharma)
  {
    id: "CUST_03",
    name: "Amit Sharma",
    email: "amit.sharma@email.com",
    phone: "+91-98765-43210",
    risk: 55,
    riskLevel: "Warning",
    persona: "Salary-Dependent Struggler",
    signals: [
      { id: 1, type: "critical", text: "Salary delay" },
      { id: 2, type: "warning", text: "Savings withdrawal" }
    ],
    loanAmount: "₹2.5L",
    emi: "₹25k",
    emiDueDays: 6,
    recoveryProb: 35,
    struggleProb: 40,
    defaultProb: 25,
    entanglements: [],
    affordabilitySurplus: 12400,
    waveData: [], // Will be computed or ignored in favor of signalHistory
    signalHistory: {
      "Salary Delay": [
        { day: 1, intensity: 0, event: "Regular salary" },
        { day: 5, intensity: 0 },
        { day: 6, intensity: 20, event: "First delay" },
        { day: 7, intensity: 0, event: "Recovered" },
        { day: 10, intensity: 0 },
        { day: 11, intensity: 20, event: "Minor delay" },
        { day: 12, intensity: 0 },
        { day: 15, intensity: 0 },
        { day: 16, intensity: 40, event: "Worsening" },
        { day: 17, intensity: 0 },
        { day: 20, intensity: 0 },
        { day: 21, intensity: 60, event: "Severe" },
        { day: 22, intensity: 0 },
        { day: 25, intensity: 0 },
        { day: 26, intensity: 80, event: "Critical" },
        { day: 30, intensity: 80, event: "ACTIVE" }
      ],
      "Savings Withdrawal": [
        { day: 1, intensity: 0, event: "No withdrawals" },
        { day: 10, intensity: 0 },
        { day: 11, intensity: 10, value: "₹2,000", event: "Small withdrawal" },
        { day: 15, intensity: 0 },
        { day: 16, intensity: 25, value: "₹5,000", event: "Medium withdrawal" },
        { day: 20, intensity: 0 },
        { day: 21, intensity: 40, value: "₹8,000", event: "Large withdrawal" },
        { day: 25, intensity: 0 },
        { day: 26, intensity: 60, value: "₹12,000", event: "Major withdrawal" },
        { day: 27, intensity: 75, value: "₹15,000", event: "Severe withdrawal" },
        { day: 28, intensity: 50, value: "₹10,000" },
        { day: 29, intensity: 40, value: "₹8,000" },
        { day: 30, intensity: 25, value: "₹5,000", event: "Active pattern" }
      ]
    }
  },
  // CUST_04 - Salary-Dependent Struggler (Sneha Iyer)
  {
    id: "CUST_04",
    name: "Sneha Iyer",
    email: "sneha.i@email.com",
    phone: "+91-98765-43004",
    risk: 58,
    riskLevel: "Warning",
    persona: "Salary-Dependent Struggler",
    signals: [
      { id: 1, type: "critical", text: "Salary delay" },
      { id: 2, type: "critical", text: "Rent overdue" }
    ],
    loanAmount: "₹3.2L",
    emi: "₹28k",
    emiDueDays: 3,
    recoveryProb: 35,
    struggleProb: 40,
    defaultProb: 25,
    entanglements: [
      { id: "SPOUSE_S", name: "Rahul Iyer", risk: 32, relationship: "Spouse", riskImpact: "+12%" }
    ],
    affordabilitySurplus: 8500,
    waveData: [],
    signalHistory: {
      "Salary Delay": [
        { day: 1, intensity: 0 },
        { day: 10, intensity: 0 },
        { day: 11, intensity: 30, event: "First delay" },
        { day: 15, intensity: 20 },
        { day: 20, intensity: 40 },
        { day: 25, intensity: 60 },
        { day: 30, intensity: 70, event: "ACTIVE" }
      ],
      "Rent Overdue": [
        { day: 1, intensity: 0 },
        { day: 15, intensity: 0 },
        { day: 16, intensity: 50, event: "Overdue detected" },
        { day: 20, intensity: 50 },
        { day: 25, intensity: 80, event: "Second cycle" },
        { day: 30, intensity: 90, event: "CRITICAL" }
      ]
    }
  },
  // CUST_05 - Credit-Heavy Overuser (Gold #F5A623)
  {
    id: "CUST_05",
    name: "Priya Mehta",
    email: "priya.m@email.com",
    phone: "+91-98765-43005",
    risk: 72,
    riskLevel: "Critical",
    persona: "Credit-Heavy Overuser",
    signals: [
      { id: 1, type: "critical", text: "Credit utilization >85%" },
      { id: 2, type: "warning", text: "Balance transfers" }
    ],
    loanAmount: "₹4.5L",
    emi: "₹45k",
    emiDueDays: 2,
    recoveryProb: 25,
    struggleProb: 40,
    defaultProb: 35,
    entanglements: [],
    affordabilitySurplus: 3200,
    waveData: [],
    signalHistory: {
      "Credit utilization >85%": [
        { day: 1, intensity: 20 },
        { day: 10, intensity: 40, event: "Rising utilization" },
        { day: 15, intensity: 60 },
        { day: 20, intensity: 75, event: "Warning threshold" },
        { day: 25, intensity: 85, event: "Critical threshold" },
        { day: 30, intensity: 91, event: "CRITICAL" }
      ],
      "Balance transfers": [
        { day: 1, intensity: 10 },
        { day: 12, intensity: 30, event: "First transfer" },
        { day: 20, intensity: 50, event: "Second transfer" },
        { day: 28, intensity: 65, event: "Third transfer" }
      ]
    }
  },
  // CUST_06 - Emergency Cash Withdrawer (Orange #FF8C00)
  {
    id: "CUST_06",
    name: "Vikas Nair",
    email: "vikas.n@email.com",
    phone: "+91-98765-43006",
    risk: 76,
    riskLevel: "Critical",
    persona: "Emergency Cash Withdrawer",
    signals: [
      { id: 1, type: "critical", text: "Large ATM withdrawals" },
      { id: 2, type: "warning", text: "UPI transfers" }
    ],
    loanAmount: "₹1.8L",
    emi: "₹18k",
    emiDueDays: 3,
    recoveryProb: 20,
    struggleProb: 35,
    defaultProb: 45,
    entanglements: [],
    affordabilitySurplus: 2800,
    waveData: [],
    signalHistory: {
      "Large ATM withdrawals": [
        { day: 1, intensity: 15 },
        { day: 8, intensity: 35, value: "₹5k", event: "First large withdrawal" },
        { day: 15, intensity: 55, value: "₹12k", event: "Increasing frequency" },
        { day: 22, intensity: 70, value: "₹20k", event: "Major withdrawal" },
        { day: 30, intensity: 80, value: "₹30k total", event: "CRITICAL" }
      ],
      "UPI transfers": [
        { day: 1, intensity: 10 },
        { day: 12, intensity: 30, event: "First UPI spike" },
        { day: 20, intensity: 50, event: "Multiple transfers" },
        { day: 28, intensity: 65, event: "High volume" }
      ]
    }
  },
  // CUST_07 - Emergency Cash Withdrawer (FAMILY CASCADE) (Orange #FF8C00)
  {
    id: "CUST_07",
    name: "Rajesh Kulkarni",
    email: "rajesh.k@email.com",
    phone: "+91-98765-43007",
    risk: 88,
    riskLevel: "Imminent Default",
    persona: "Emergency Cash Withdrawer",
    signals: [
      { id: 1, type: "critical", text: "Failed auto-debit" },
      { id: 2, type: "critical", text: "Loan apps" }
    ],
    loanAmount: "₹5.2L",
    emi: "₹52k",
    emiDueDays: 1,
    recoveryProb: 15,
    struggleProb: 25,
    defaultProb: 60,
    entanglements: [
      { id: "SPOUSE_R", name: "Meera Kulkarni", risk: 45, relationship: "Spouse", riskImpact: "+20%" },
      { id: "PARENT_R", name: "Suresh Kulkarni", risk: 32, relationship: "Parent", riskImpact: "+10%" }
    ],
    affordabilitySurplus: 500,
    waveData: [],
    signalHistory: {
      "Failed auto-debit": [
        { day: 1, intensity: 10 },
        { day: 8, intensity: 25, event: "First missed payment" },
        { day: 15, intensity: 45, event: "Second failure" },
        { day: 22, intensity: 65, event: "Multiple failures" },
        { day: 30, intensity: 88, event: "CRITICAL - 4 failures" }
      ],
      "Loan apps": [
        { day: 1, intensity: 0 },
        { day: 10, intensity: 20, event: "First app installed" },
        { day: 18, intensity: 50, event: "3 apps active" },
        { day: 25, intensity: 75, event: "5 apps active" },
        { day: 30, intensity: 95, event: "CRITICAL - debt stacking" }
      ]
    }
  },
  // CUST_08 - Credit-Heavy Overuser (MULTI-NODE) (Gold #F5A623)
  {
    id: "CUST_08",
    name: "Ankit Joshi",
    email: "ankit.j@email.com",
    phone: "+91-98765-43008",
    risk: 92,
    riskLevel: "Imminent Default",
    persona: "Credit-Heavy Overuser",
    signals: [
      { id: 1, type: "critical", text: "Multiple loan apps" },
      { id: 2, type: "critical", text: "Credit rollover" }
    ],
    loanAmount: "₹6.7L",
    emi: "₹67k",
    emiDueDays: 0,
    recoveryProb: 10,
    struggleProb: 20,
    defaultProb: 70,
    entanglements: [
      { id: "SIBLING_A", name: "Neha Joshi", risk: 38, relationship: "Sibling", riskImpact: "+15%" },
      { id: "PARENT_A", name: "Ramesh Joshi", risk: 25, relationship: "Parent", riskImpact: "+8%" }
    ],
    affordabilitySurplus: 0,
    waveData: [],
    signalHistory: {
      "Multiple loan apps": [
        { day: 1, intensity: 15, event: "2 apps detected" },
        { day: 10, intensity: 40, event: "4 apps active" },
        { day: 18, intensity: 65, event: "6 apps active" },
        { day: 25, intensity: 85, event: "8 apps active" },
        { day: 30, intensity: 100, event: "CRITICAL - 8+ apps" }
      ],
      "Credit rollover": [
        { day: 1, intensity: 25 },
        { day: 12, intensity: 50, event: "First rollover" },
        { day: 20, intensity: 75, event: "Multiple rollovers" },
        { day: 28, intensity: 95, event: "CRITICAL - debt spiral" }
      ]
    }
  },
  // CUST_09 - Salary-Dependent Struggler (RECOVERY CASE) (Kavita Rao)
  {
    id: "CUST_09",
    name: "Kavita Rao",
    email: "kavita.r@email.com",
    phone: "+91-98765-43009",
    risk: 18,
    riskLevel: "Early Stress",
    persona: "Salary-Dependent Struggler",
    signals: [
      { id: 1, type: "success", text: "Improved salary regularity" }
    ],
    loanAmount: "₹2.1L",
    emi: "₹21k",
    emiDueDays: 8,
    recoveryProb: 85,
    struggleProb: 10,
    defaultProb: 5,
    entanglements: [],
    affordabilitySurplus: 15000,
    waveData: [],
    signalHistory: {
      "Salary Regularity": [
        { day: 1, intensity: 60, event: "Irregularity high" },
        { day: 10, intensity: 50 },
        { day: 20, intensity: 30, event: "Stabilization" },
        { day: 30, intensity: 10, event: "RECOVERY" }
      ]
    }
  },
  // CUST_10 - Paycheck-to-Paycheck Survivor (FAILURE CASE) (Manoj Deshpande)
  {
    id: "CUST_10",
    name: "Manoj Deshpande",
    email: "manoj.d@email.com",
    phone: "+91-98765-43010",
    risk: 80,
    riskLevel: "Critical",
    persona: "Paycheck-to-Paycheck Survivor",
    signals: [
      { id: 1, type: "critical", text: "Missed bill payments" },
      { id: 2, type: "critical", text: "Zero-balance days" }
    ],
    loanAmount: "₹95k",
    emi: "₹9.5k",
    emiDueDays: 2,
    recoveryProb: 18,
    struggleProb: 32,
    defaultProb: 50,
    entanglements: [],
    affordabilitySurplus: 1200,
    waveData: [],
    signalHistory: {
      "Missed Bills": [
        { day: 1, intensity: 20 },
        { day: 15, intensity: 50 },
        { day: 30, intensity: 85, event: "CRITICAL" }
      ]
    }
  },
  // CUST_11 - Additional Salary-Dependent (High Risk) (Divya Krishnan)
  {
    id: "CUST_11",
    name: "Divya Krishnan",
    email: "divya.k@email.com",
    phone: "+91-98765-43011",
    risk: 68,
    riskLevel: "Critical",
    persona: "Salary-Dependent Struggler",
    signals: [
      { id: 1, type: "critical", text: "Salary delay 7 days" },
      { id: 2, type: "warning", text: "Multiple savings withdrawals" }
    ],
    loanAmount: "₹3.8L",
    emi: "₹38k",
    emiDueDays: 5,
    recoveryProb: 30,
    struggleProb: 45,
    defaultProb: 25,
    entanglements: [],
    affordabilitySurplus: 4200,
    waveData: [],
    signalHistory: {
      "7-Day Salary Delay": [
        { day: 1, intensity: 0 },
        { day: 15, intensity: 40 },
        { day: 25, intensity: 80 },
        { day: 30, intensity: 100, event: "SEVERE" }
      ],
      "Multiple Withdrawals": [
        { day: 1, intensity: 10 },
        { day: 15, intensity: 50 },
        { day: 30, intensity: 90, event: "DRAIN" }
      ]
    }
  },
  // CUST_12 - Additional Credit-Heavy (Medium Risk) (Gold #F5A623)
  {
    id: "CUST_12",
    name: "Karthik Subramanian",
    email: "karthik.s@email.com",
    phone: "+91-98765-43012",
    risk: 45,
    riskLevel: "Warning",
    persona: "Credit-Heavy Overuser",
    signals: [
      { id: 1, type: "warning", text: "Credit utilization 72%" },
      { id: 2, type: "info", text: "Recent balance transfer" }
    ],
    loanAmount: "₹2.9L",
    emi: "₹29k",
    emiDueDays: 10,
    recoveryProb: 55,
    struggleProb: 30,
    defaultProb: 15,
    entanglements: [],
    waveData: [
      { date: "Week1", risk: 35 },
      { date: "Week2", risk: 38 },
      { date: "Week3", risk: 42 },
      { date: "Week4", risk: 45 },
    ]
  },
  // CUST_13 - Additional Silent Saver (Worsening) (Blue #4169E1)
  {
    id: "CUST_13",
    name: "Meera Chandran",
    email: "meera.c@email.com",
    phone: "+91-98765-43013",
    risk: 35,
    riskLevel: "Early Stress",
    persona: "Silent Saver Drain",
    signals: [
      { id: 1, type: "warning", text: "Steady savings decline (3 mos)" }
    ],
    loanAmount: "₹1.5L",
    emi: "₹15k",
    emiDueDays: 15,
    recoveryProb: 70,
    struggleProb: 20,
    defaultProb: 10,
    entanglements: [],
    waveData: [
      { date: "Week1", risk: 25 },
      { date: "Week2", risk: 28 },
      { date: "Week3", risk: 32 },
      { date: "Week4", risk: 35 },
    ]
  },
  // CUST_14 - Additional Paycheck-to-Paycheck (Stable) (Green #2E8B57)
  {
    id: "CUST_14",
    name: "Sunil Gawande",
    email: "sunil.g@email.com",
    phone: "+91-98765-43014",
    risk: 22,
    riskLevel: "Early Stress",
    persona: "Paycheck-to-Paycheck Survivor",
    signals: [
      { id: 1, type: "warning", text: "Consistent low balance" },
      { id: 2, type: "success", text: "No missed payments" }
    ],
    loanAmount: "₹75k",
    emi: "₹7.5k",
    emiDueDays: 5,
    recoveryProb: 80,
    struggleProb: 15,
    defaultProb: 5,
    entanglements: [],
    waveData: [
      { date: "Week1", risk: 20 },
      { date: "Week2", risk: 21 },
      { date: "Week3", risk: 22 },
      { date: "Week4", risk: 22 },
    ]
  },
  // CUST_15 - Additional Emergency Cash (New) (Orange #FF8C00)
  {
    id: "CUST_15",
    name: "Pooja Desai",
    email: "pooja.d@email.com",
    phone: "+91-98765-43015",
    risk: 42,
    riskLevel: "Warning",
    persona: "Emergency Cash Withdrawer",
    signals: [
      { id: 1, type: "warning", text: "Recent large ATM withdrawals" },
      { id: 2, type: "warning", text: "UPI to family" }
    ],
    loanAmount: "₹2.2L",
    emi: "₹22k",
    emiDueDays: 8,
    recoveryProb: 60,
    struggleProb: 30,
    defaultProb: 10,
    entanglements: [
      { id: "SIBLING_P", name: "Sibling", risk: 28, relationship: "Sibling", riskImpact: "+8%" }
    ],
    waveData: [
      { date: "Week1", risk: 30 },
      { date: "Week2", risk: 35 },
      { date: "Week3", risk: 38 },
      { date: "Week4", risk: 42 },
    ]
  }
];

export function getPersonaColor(persona: PersonaType): string {
  const personaMap: Record<PersonaType, string> = {
    "Salary-Dependent Struggler": "#BD10E0",
    "Credit-Heavy Overuser": "#F5A623",
    "Emergency Cash Withdrawer": "#FF8C00",
    "Silent Saver Drain": "#4169E1",
    "Paycheck-to-Paycheck Survivor": "#2E8B57"
  };
  return personaMap[persona] || "#6A0DAD";
}

export function getPersonaEmoji(persona: PersonaType): string {
  const emojiMap: Record<PersonaType, string> = {
    "Salary-Dependent Struggler": "🟣",
    "Credit-Heavy Overuser": "🟡",
    "Emergency Cash Withdrawer": "🟠",
    "Silent Saver Drain": "🔵",
    "Paycheck-to-Paycheck Survivor": "🟢"
  };
  return emojiMap[persona] || "⚪";
}