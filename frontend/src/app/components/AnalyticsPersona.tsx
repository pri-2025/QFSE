import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QuantumCard } from "./QuantumCard";
import { ArrowRight, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from "recharts";
import { PersonaType, getPersonaColor, getPersonaEmoji } from "../types";

// Persona statistics data structure
interface PersonaStatistic {
  label: string;
  value: string | number;
  trend: string;
  trendDirection: "up" | "down";
  sparklineData: number[];
  format?: "percentage" | "number" | "count";
}

interface PersonaStats {
  [key: string]: PersonaStatistic[];
}

const PERSONA_STATISTICS: PersonaStats = {
  "Salary-Dependent Struggler": [
    {
      label: "Salary delay frequency",
      value: "67%",
      trend: "↑5%",
      trendDirection: "up",
      sparklineData: [62, 64, 65, 64, 66, 68, 67],
      format: "percentage"
    },
    {
      label: "Savings withdrawal rate",
      value: "54%",
      trend: "↑3%",
      trendDirection: "up",
      sparklineData: [49, 51, 52, 51, 53, 54, 54],
      format: "percentage"
    },
    {
      label: "Bill payment delay",
      value: "42%",
      trend: "↑2%",
      trendDirection: "up",
      sparklineData: [39, 40, 41, 40, 41, 42, 42],
      format: "percentage"
    },
    {
      label: "Average risk score",
      value: "50%",
      trend: "↑4%",
      trendDirection: "up",
      sparklineData: [44, 46, 47, 48, 49, 50, 50],
      format: "percentage"
    },
    {
      label: "Population count",
      value: 468,
      trend: "↑12",
      trendDirection: "up",
      sparklineData: [456, 456, 459, 462, 465, 468, 468],
      format: "count"
    }
  ],
  "Credit-Heavy Overuser": [
    {
      label: "High utilization (>85%)",
      value: "91%",
      trend: "↑2%",
      trendDirection: "up",
      sparklineData: [88, 89, 90, 89, 90, 91, 91],
      format: "percentage"
    },
    {
      label: "Balance transfers",
      value: "63%",
      trend: "↑4%",
      trendDirection: "up",
      sparklineData: [57, 59, 60, 59, 61, 63, 63],
      format: "percentage"
    },
    {
      label: "Multiple loan apps",
      value: "58%",
      trend: "↑7%",
      trendDirection: "up",
      sparklineData: [48, 51, 53, 55, 57, 58, 58],
      format: "percentage"
    },
    {
      label: "Average risk score",
      value: "70%",
      trend: "↑3%",
      trendDirection: "up",
      sparklineData: [65, 67, 68, 68, 69, 70, 70],
      format: "percentage"
    },
    {
      label: "Population count",
      value: 351,
      trend: "↑8",
      trendDirection: "up",
      sparklineData: [343, 343, 345, 347, 349, 351, 351],
      format: "count"
    }
  ],
  "Emergency Cash Withdrawer": [
    {
      label: "Large ATM withdrawals",
      value: "82%",
      trend: "↑6%",
      trendDirection: "up",
      sparklineData: [74, 76, 78, 79, 80, 82, 82],
      format: "percentage"
    },
    {
      label: "UPI to individuals",
      value: "71%",
      trend: "↑4%",
      trendDirection: "up",
      sparklineData: [66, 67, 69, 68, 70, 71, 71],
      format: "percentage"
    },
    {
      label: "Failed auto-debits",
      value: "45%",
      trend: "↑8%",
      trendDirection: "up",
      sparklineData: [35, 37, 39, 41, 43, 45, 45],
      format: "percentage"
    },
    {
      label: "Average risk score",
      value: "69%",
      trend: "↑5%",
      trendDirection: "up",
      sparklineData: [62, 64, 65, 67, 68, 69, 69],
      format: "percentage"
    },
    {
      label: "Population count",
      value: 263,
      trend: "↑6",
      trendDirection: "up",
      sparklineData: [257, 257, 259, 261, 262, 263, 263],
      format: "count"
    }
  ],
  "Silent Saver Drain": [
    {
      label: "Gradual depletion",
      value: "76%",
      trend: "↑2%",
      trendDirection: "up",
      sparklineData: [73, 74, 75, 74, 75, 76, 76],
      format: "percentage"
    },
    {
      label: "No missed payments",
      value: "94%",
      trend: "↓1%",
      trendDirection: "down",
      sparklineData: [95, 95, 95, 94, 94, 94, 94],
      format: "percentage"
    },
    {
      label: "Fixed expenses rising",
      value: "52%",
      trend: "↑3%",
      trendDirection: "up",
      sparklineData: [48, 49, 50, 50, 51, 52, 52],
      format: "percentage"
    },
    {
      label: "Average risk score",
      value: "22%",
      trend: "↑2%",
      trendDirection: "up",
      sparklineData: [19, 20, 21, 21, 21, 22, 22],
      format: "percentage"
    },
    {
      label: "Population count",
      value: 234,
      trend: "↑4",
      trendDirection: "up",
      sparklineData: [230, 230, 231, 232, 233, 234, 234],
      format: "count"
    }
  ],
  "Paycheck-to-Paycheck Survivor": [
    {
      label: "Low balance (<₹5k)",
      value: "82%",
      trend: "↑3%",
      trendDirection: "up",
      sparklineData: [78, 79, 80, 79, 81, 82, 82],
      format: "percentage"
    },
    {
      label: "Just-in-time bills",
      value: "71%",
      trend: "↑2%",
      trendDirection: "up",
      sparklineData: [68, 69, 70, 69, 70, 71, 71],
      format: "percentage"
    },
    {
      label: "Zero-balance days",
      value: "63%",
      trend: "↑5%",
      trendDirection: "up",
      sparklineData: [56, 58, 60, 61, 62, 63, 63],
      format: "percentage"
    },
    {
      label: "Average risk score",
      value: "43%",
      trend: "↑3%",
      trendDirection: "up",
      sparklineData: [39, 40, 41, 41, 42, 43, 43],
      format: "percentage"
    },
    {
      label: "Population count",
      value: 146,
      trend: "↑3",
      trendDirection: "up",
      sparklineData: [143, 143, 144, 145, 145, 146, 146],
      format: "count"
    }
  ]
};

// Persona insights data
const PERSONA_INSIGHTS: Record<PersonaType, {
  topSignal: string;
  topSignalValue: string;
  fastestGrowing: string;
  fastestGrowingValue: string;
  recommendation: string;
}> = {
  "Salary-Dependent Struggler": {
    topSignal: "Salary delay",
    topSignalValue: "67% frequency",
    fastestGrowing: "Average risk score",
    fastestGrowingValue: "+4% this week",
    recommendation: "Focus on EMI Holiday campaigns for this persona. 65% success rate based on 156 interventions."
  },
  "Credit-Heavy Overuser": {
    topSignal: "High utilization",
    topSignalValue: "91% frequency",
    fastestGrowing: "Multiple loan apps",
    fastestGrowingValue: "+7% this week",
    recommendation: "Implement credit counseling and consolidation offers. Early intervention shows 58% default prevention."
  },
  "Emergency Cash Withdrawer": {
    topSignal: "Large ATM withdrawals",
    topSignalValue: "82% frequency",
    fastestGrowing: "Failed auto-debits",
    fastestGrowingValue: "+8% this week",
    recommendation: "Trigger emergency fund education and flexible payment options. 72% engagement rate observed."
  },
  "Silent Saver Drain": {
    topSignal: "Gradual depletion",
    topSignalValue: "76% frequency",
    fastestGrowing: "Fixed expenses rising",
    fastestGrowingValue: "+3% this week",
    recommendation: "Proactive financial health check-ins before visible stress. 89% early detection success rate."
  },
  "Paycheck-to-Paycheck Survivor": {
    topSignal: "Low balance",
    topSignalValue: "82% frequency",
    fastestGrowing: "Zero-balance days",
    fastestGrowingValue: "+5% this week",
    recommendation: "Offer salary advance partnerships and automated savings programs. 67% stability improvement."
  }
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// KPI Card Component
interface KPICardProps {
  statistic: PersonaStatistic;
  personaColor: string;
}

function KPICard({ statistic, personaColor }: KPICardProps) {
  const trendColor = statistic.trendDirection === "up" ? "#00C853" : "#FF4444";
  const trendIcon = statistic.trendDirection === "up" ? "↑" : "↓";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-4 hover:border-[#6A0DAD]/30 transition-all"
    >
      {/* Label */}
      <h3 className="text-[12px] font-medium text-[#E6E6E6] leading-[16px] mb-3">
        {statistic.label}
      </h3>

      {/* Large Value */}
      <div className="mb-2">
        <span className="text-[32px] font-bold text-white font-['JetBrains_Mono']">
          {statistic.format === "percentage" ? `${statistic.value}%` : statistic.value}
        </span>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center gap-2">
        <span 
          className="text-[14px] font-semibold"
          style={{ color: trendColor }}
        >
          {trendIcon}{statistic.trend} vs last week
        </span>
      </div>

      {/* Additional Context (Optional) */}
      <div className="mt-3 pt-3 border-t border-[#2A2A3A]">
        <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider">
          {statistic.trendDirection === "up" ? "Increasing trend" : "Decreasing trend"}
        </p>
      </div>
    </motion.div>
  );
}

// Persona Navigation Sidebar
interface PersonaSidebarProps {
  selectedPersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
}

function PersonaSidebar({ selectedPersona, onSelectPersona }: PersonaSidebarProps) {
  const personas: PersonaType[] = [
    "Salary-Dependent Struggler",
    "Credit-Heavy Overuser",
    "Emergency Cash Withdrawer",
    "Silent Saver Drain",
    "Paycheck-to-Paycheck Survivor"
  ];

  const personaPopulations: Record<PersonaType, number> = {
    "Salary-Dependent Struggler": 468,
    "Credit-Heavy Overuser": 351,
    "Emergency Cash Withdrawer": 263,
    "Silent Saver Drain": 234,
    "Paycheck-to-Paycheck Survivor": 146
  };

  const personaRisks: Record<PersonaType, number> = {
    "Salary-Dependent Struggler": 50,
    "Credit-Heavy Overuser": 70,
    "Emergency Cash Withdrawer": 69,
    "Silent Saver Drain": 22,
    "Paycheck-to-Paycheck Survivor": 43
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="sticky top-0 bg-[#0A0A14] pb-4 pt-2 z-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
          PERSONA ANALYTICS
        </h3>
        <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
          Click any persona to view details
        </p>
      </div>

      <div className="space-y-2">
        {personas.map((persona) => {
          const isActive = selectedPersona === persona;
          const color = getPersonaColor(persona);
          const emoji = getPersonaEmoji(persona);
          
          return (
            <button
              key={persona}
              onClick={() => onSelectPersona(persona)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isActive 
                  ? `border-[${color}] bg-[#6A0DAD]/10` 
                  : "border-[#2A2A3A] hover:border-[#6A0DAD]/30 hover:bg-white/5"
              }`}
              style={isActive ? { 
                borderLeftWidth: "3px", 
                borderLeftColor: color,
                backgroundColor: `${color}15`
              } : {}}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{emoji}</span>
                <h4 className="text-sm font-semibold text-white flex-1">
                  {persona}
                </h4>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
                  {personaPopulations[persona]} customers
                </span>
                <span className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
                  |
                </span>
                <span className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
                  Avg Risk: {personaRisks[persona]}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-[#2A2A3A]">
        <button className="w-full py-2 px-3 bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded text-[12px] font-medium text-[#E6E6E6] leading-[16px] hover:bg-[#6A0DAD]/20 transition-all">
          Export Persona Report
        </button>
      </div>
    </div>
  );
}

// Insights Summary Sidebar
interface InsightsSummaryProps {
  persona: PersonaType;
  onViewStrategies: () => void;
}

function InsightsSummary({ persona, onViewStrategies }: InsightsSummaryProps) {
  const insights = PERSONA_INSIGHTS[persona];
  const stats = PERSONA_STATISTICS[persona];
  const color = getPersonaColor(persona);
  const emoji = getPersonaEmoji(persona);
  const populationStat = stats.find(s => s.label === "Population count");

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="sticky top-0 bg-[#0A0A14] pb-4 pt-2 z-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          INSIGHTS SUMMARY
        </h3>
      </div>

      <div className="space-y-4">
        {/* Selected Persona */}
        <div className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-4">
          <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-2">
            SELECTED PERSONA
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <h4 className="text-sm font-bold text-white">
              {persona}
            </h4>
          </div>
        </div>

        {/* Population */}
        <div className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-4">
          <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-2">
            POPULATION
          </p>
          <div className="text-2xl font-bold text-white font-['JetBrains_Mono'] mb-1">
            {populationStat?.value}
          </div>
          <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
            {populationStat?.trend} from last month
          </p>
        </div>

        {/* Top Signal */}
        <div className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-4">
          <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-2">
            TOP SIGNAL
          </p>
          <div className="text-lg font-bold text-white mb-1">
            {insights.topSignal}
          </div>
          <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
            {insights.topSignalValue}
          </p>
        </div>

        {/* Fastest Growing */}
        <div className="bg-[#141424]/60 border border-[#2A2A3A] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 text-[#FF8C00]" />
            <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider">
              FASTEST GROWING
            </p>
          </div>
          <div className="text-lg font-bold text-white mb-1">
            {insights.fastestGrowing}
          </div>
          <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
            {insights.fastestGrowingValue}
          </p>
        </div>

        {/* Recommendation */}
        <div className="bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded-lg p-4">
          <p className="text-[10px] text-[#8A2BE2] uppercase tracking-wider mb-2 font-bold">
            RECOMMENDATION
          </p>
          <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
            {insights.recommendation}
          </p>
          <button className="mt-3 text-[12px] font-medium text-[#6A0DAD] hover:text-[#8A2BE2] transition-colors flex items-center gap-1" onClick={onViewStrategies}>
            View Intervention Strategies
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Analytics Component
interface AnalyticsPersonaProps {
  onViewStrategies: (persona: PersonaType) => void;
}

export function AnalyticsPersona({ onViewStrategies }: AnalyticsPersonaProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("Salary-Dependent Struggler");
  
  const currentStats = PERSONA_STATISTICS[selectedPersona];
  const personaColor = getPersonaColor(selectedPersona);
  const personaEmoji = getPersonaEmoji(selectedPersona);

  const handleViewStrategies = () => {
    onViewStrategies(selectedPersona);
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0A14]">
      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Sidebar - Persona Navigation (25%) */}
        <div className="w-1/4 flex-shrink-0">
          <PersonaSidebar 
            selectedPersona={selectedPersona}
            onSelectPersona={setSelectedPersona}
          />
        </div>

        {/* Center Panel - KPI Dashboard (50%) */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPersona}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-[#2A2A3A]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{personaEmoji}</span>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                    {selectedPersona}
                  </h2>
                </div>
                <p className="text-[12px] font-medium text-[#E6E6E6] leading-[16px]">
                  Persona Analytics Dashboard
                </p>
              </div>

              {/* KPI Cards Grid */}
              <div className="space-y-4">
                {currentStats.map((stat, index) => (
                  <KPICard 
                    key={index} 
                    statistic={stat} 
                    personaColor={personaColor}
                  />
                ))}
              </div>

              {/* View All Link */}
              <div className="mt-6 pt-4 border-t border-[#2A2A3A] flex justify-end">
                <button className="text-[12px] font-medium text-[#E6E6E6] leading-[16px] hover:text-[#6A0DAD] transition-colors flex items-center gap-1">
                  View All Historical Data
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Insights Summary (25%) */}
        <div className="w-1/4 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`insights-${selectedPersona}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <InsightsSummary persona={selectedPersona} onViewStrategies={handleViewStrategies} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}