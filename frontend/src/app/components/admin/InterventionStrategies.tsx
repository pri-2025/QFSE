import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Zap, CreditCard, Phone, Smartphone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PersonaType, getPersonaColor, getPersonaEmoji } from "../../types";

interface InterventionStrategy {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  targetSignals: string[];
  riskReduction: number;
  successRate: number;
  avgSavings: string;
  attempts?: number;
  isRecommended?: boolean;
}

const PERSONA_STRATEGIES: Record<PersonaType, InterventionStrategy[]> = {
  "Emergency Cash Withdrawer": [
    {
      id: "emergency-credit",
      icon: <CreditCard className="w-6 h-6" />,
      name: "Emergency Credit Line",
      description: "0% interest credit line for 30 days up to ₹50,000. No documentation required.",
      targetSignals: [
        "Large ATM withdrawals (82% frequency)",
        "UPI to individuals (71% frequency)"
      ],
      riskReduction: 35,
      successRate: 82,
      avgSavings: "₹4,200",
      attempts: 89,
      isRecommended: true
    },
    {
      id: "emi-holiday",
      icon: <Zap className="w-6 h-6" />,
      name: "EMI Holiday",
      description: "15-day no-interest pause on existing loans",
      targetSignals: ["Failed auto-debits (45% frequency)"],
      riskReduction: 28,
      successRate: 76,
      avgSavings: "₹2,800",
      attempts: 156
    },
    {
      id: "counseling",
      icon: <Phone className="w-6 h-6" />,
      name: "Financial Counseling",
      description: "One-on-one session with financial advisor",
      targetSignals: ["Average risk score (69%)"],
      riskReduction: 22,
      successRate: 81,
      avgSavings: "₹1,900",
      attempts: 67
    },
    {
      id: "sms-alert",
      icon: <Smartphone className="w-6 h-6" />,
      name: "SMS Alert System",
      description: "Personalized spending alerts and reminders",
      targetSignals: ["UPI to individuals (71% frequency)"],
      riskReduction: 15,
      successRate: 64,
      avgSavings: "₹1,200",
      attempts: 234
    },
    {
      id: "escalation",
      icon: <AlertTriangle className="w-6 h-6" />,
      name: "Human Escalation",
      description: "Direct human intervention for high-risk cases",
      targetSignals: ["Failed auto-debits (45% frequency)"],
      riskReduction: 42,
      successRate: 91,
      avgSavings: "₹5,100",
      attempts: 23
    }
  ],
  "Salary-Dependent Struggler": [
    {
      id: "emi-holiday",
      icon: <Zap className="w-6 h-6" />,
      name: "EMI Holiday Campaign",
      description: "15-30 day payment pause on existing loans",
      targetSignals: [
        "Salary delay frequency (67%)",
        "Savings withdrawal rate (54%)"
      ],
      riskReduction: 32,
      successRate: 78,
      avgSavings: "₹3,200",
      attempts: 156,
      isRecommended: true
    },
    {
      id: "salary-advance",
      icon: <CreditCard className="w-6 h-6" />,
      name: "Salary Advance Partnership",
      description: "Early salary access up to ₹25,000",
      targetSignals: ["Bill payment delay (42%)"],
      riskReduction: 28,
      successRate: 73,
      avgSavings: "₹2,400",
      attempts: 92
    },
    {
      id: "automated-savings",
      icon: <CheckCircle2 className="w-6 h-6" />,
      name: "Automated Savings",
      description: "Micro-savings program with flexible withdrawals",
      targetSignals: ["Savings withdrawal rate (54%)"],
      riskReduction: 19,
      successRate: 68,
      avgSavings: "₹1,500",
      attempts: 145
    },
    {
      id: "counseling",
      icon: <Phone className="w-6 h-6" />,
      name: "Financial Counseling",
      description: "One-on-one session with financial advisor",
      targetSignals: ["Average risk score (50%)"],
      riskReduction: 24,
      successRate: 79,
      avgSavings: "₹2,100",
      attempts: 78
    }
  ],
  "Credit-Heavy Overuser": [
    {
      id: "credit-counseling",
      icon: <Phone className="w-6 h-6" />,
      name: "Credit Counseling",
      description: "Debt consolidation and financial planning",
      targetSignals: [
        "High utilization >85% (91%)",
        "Multiple loan apps (58%)"
      ],
      riskReduction: 38,
      successRate: 84,
      avgSavings: "₹4,800",
      attempts: 124,
      isRecommended: true
    },
    {
      id: "balance-transfer",
      icon: <CreditCard className="w-6 h-6" />,
      name: "Balance Transfer Offer",
      description: "0% interest balance transfer for 6 months",
      targetSignals: ["Balance transfers (63%)"],
      riskReduction: 31,
      successRate: 76,
      avgSavings: "₹3,600",
      attempts: 98
    },
    {
      id: "credit-limit",
      icon: <Zap className="w-6 h-6" />,
      name: "Credit Limit Adjustment",
      description: "Strategic credit limit optimization",
      targetSignals: ["High utilization >85% (91%)"],
      riskReduction: 25,
      successRate: 71,
      avgSavings: "₹2,200",
      attempts: 156
    }
  ],
  "Silent Saver Drain": [
    {
      id: "proactive-checkin",
      icon: <Phone className="w-6 h-6" />,
      name: "Proactive Health Check",
      description: "Early financial health assessment",
      targetSignals: [
        "Gradual depletion (76%)",
        "Fixed expenses rising (52%)"
      ],
      riskReduction: 29,
      successRate: 89,
      avgSavings: "₹2,900",
      attempts: 87,
      isRecommended: true
    },
    {
      id: "expense-optimizer",
      icon: <Zap className="w-6 h-6" />,
      name: "Expense Optimizer",
      description: "AI-powered expense tracking and optimization",
      targetSignals: ["Fixed expenses rising (52%)"],
      riskReduction: 21,
      successRate: 74,
      avgSavings: "₹1,800",
      attempts: 134
    },
    {
      id: "savings-boost",
      icon: <CheckCircle2 className="w-6 h-6" />,
      name: "Savings Boost Program",
      description: "Automated micro-savings with rewards",
      targetSignals: ["Gradual depletion (76%)"],
      riskReduction: 18,
      successRate: 69,
      avgSavings: "₹1,400",
      attempts: 98
    }
  ],
  "Paycheck-to-Paycheck Survivor": [
    {
      id: "salary-advance",
      icon: <CreditCard className="w-6 h-6" />,
      name: "Salary Advance Program",
      description: "Early salary access up to ₹15,000",
      targetSignals: [
        "Low balance <₹5k (82%)",
        "Just-in-time bills (71%)"
      ],
      riskReduction: 31,
      successRate: 77,
      avgSavings: "₹2,700",
      attempts: 112,
      isRecommended: true
    },
    {
      id: "automated-savings",
      icon: <CheckCircle2 className="w-6 h-6" />,
      name: "Automated Micro-Savings",
      description: "Round-up savings with instant access",
      targetSignals: ["Zero-balance days (63%)"],
      riskReduction: 24,
      successRate: 71,
      avgSavings: "₹1,900",
      attempts: 145
    },
    {
      id: "bill-optimizer",
      icon: <Zap className="w-6 h-6" />,
      name: "Bill Payment Optimizer",
      description: "Smart bill scheduling and reminders",
      targetSignals: ["Just-in-time bills (71%)"],
      riskReduction: 19,
      successRate: 68,
      avgSavings: "₹1,500",
      attempts: 189
    }
  ]
};

interface InterventionStrategiesProps {
  persona: PersonaType;
  onBack: () => void;
}

export function InterventionStrategies({ persona, onBack }: InterventionStrategiesProps) {
  const strategies = PERSONA_STRATEGIES[persona] || [];
  const recommendedStrategy = strategies.find(s => s.isRecommended) || strategies[0];
  const alternativeStrategies = strategies.filter(s => !s.isRecommended);
  
  const color = getPersonaColor(persona);
  const emoji = getPersonaEmoji(persona);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col bg-[#0A0A14]"
    >
      {/* Header */}
      <div className="border-b border-[#2A2A3A] bg-[#141424]/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/5 rounded-full text-[#B0B0C0] hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-white uppercase tracking-wide">
                  {persona} - INTERVENTION STRATEGIES
                </h1>
                <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px] mt-1">
                  Evidence-based interventions ranked by impact
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded text-[12px] font-medium text-[#E6E6E6] hover:bg-[#6A0DAD]/20 transition-all">
              Export Strategies
            </button>
            <button className="px-4 py-2 bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded text-[12px] font-medium text-[#E6E6E6] hover:bg-[#6A0DAD]/20 transition-all">
              Save View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Recommended Strategy */}
        <div className="bg-gradient-to-br from-[#6A0DAD]/10 to-[#8A2BE2]/5 border-2 border-[#6A0DAD]/40 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#8A2BE2]" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              RECOMMENDED STRATEGY (Highest Impact)
            </h2>
          </div>

          <div className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
              >
                {recommendedStrategy.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {recommendedStrategy.name}
                </h3>
                <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
                  {recommendedStrategy.description}
                </p>
              </div>
            </div>

            {/* Target Signals */}
            <div className="mb-4 pb-4 border-b border-[#2A2A3A]">
              <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-2 font-bold">
                TARGET SIGNALS
              </p>
              <ul className="space-y-1">
                {recommendedStrategy.targetSignals.map((signal, index) => (
                  <li key={index} className="text-[12px] font-medium text-[#E6E6E6] leading-[16px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Metrics */}
            <div className="mb-6 pb-4 border-b border-[#2A2A3A]">
              <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-3 font-bold">
                EXPECTED IMPACT
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-[#00C853] font-['JetBrains_Mono']">
                    {recommendedStrategy.riskReduction}% ↓
                  </div>
                  <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mt-1">
                    Risk Reduction
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-['JetBrains_Mono']">
                    {recommendedStrategy.successRate}%
                  </div>
                  <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mt-1">
                    Success Rate
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-['JetBrains_Mono']">
                    {recommendedStrategy.avgSavings}
                  </div>
                  <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mt-1">
                    Avg Customer Savings
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 px-4 bg-[#6A0DAD] hover:bg-[#8A2BE2] rounded-lg text-white text-sm font-bold uppercase tracking-wider transition-all">
                Apply to Selected Customers
              </button>
              <button className="py-3 px-4 bg-[#141424] border border-[#6A0DAD]/30 hover:border-[#6A0DAD] rounded-lg text-[#E6E6E6] text-sm font-bold uppercase tracking-wider transition-all">
                View Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Alternative Strategies */}
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
            ALTERNATIVE STRATEGIES
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {alternativeStrategies.map((strategy) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-4 hover:border-[#6A0DAD]/50 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    {strategy.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">
                      {strategy.name}
                    </h4>
                    <p className="text-[10px] text-[#E6E6E6] leading-tight">
                      {strategy.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3 pt-3 border-t border-[#2A2A3A]">
                  <div>
                    <div className="text-lg font-bold text-[#00C853] font-['JetBrains_Mono']">
                      {strategy.riskReduction}% ↓
                    </div>
                    <p className="text-[10px] text-[#B0B0C0] uppercase">Impact</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white font-['JetBrains_Mono']">
                      {strategy.successRate}%
                    </div>
                    <p className="text-[10px] text-[#B0B0C0] uppercase">Confidence</p>
                  </div>
                </div>

                <button className="w-full py-2 px-3 bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded text-[12px] font-medium text-[#E6E6E6] hover:bg-[#6A0DAD]/20 transition-all">
                  Select Strategy
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Historical Performance Table */}
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
            HISTORICAL PERFORMANCE
          </h2>
          <div className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1A1A2A]">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">
                    Strategy
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">
                    Attempts
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">
                    Success Rate
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">
                    Avg Risk ↓
                  </th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((strategy, index) => (
                  <tr 
                    key={strategy.id}
                    className={`${index % 2 === 0 ? 'bg-[#141424]/40' : 'bg-transparent'} hover:bg-white/5 transition-colors`}
                  >
                    <td className="px-4 py-3 text-[12px] font-medium text-[#E6E6E6]">
                      {strategy.name}
                      {strategy.isRecommended && (
                        <span className="ml-2 text-[10px] text-[#8A2BE2]">★</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] font-medium text-[#E6E6E6] font-['JetBrains_Mono']">
                      {strategy.attempts}
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] font-medium text-[#E6E6E6] font-['JetBrains_Mono']">
                      {strategy.successRate}%
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] font-medium text-[#00C853] font-['JetBrains_Mono']">
                      {strategy.riskReduction}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
