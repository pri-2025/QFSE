import React from "react";
import { QuantumCard } from "./QuantumCard";
import { DonutChart, DonutSegment } from "./DonutChart";
import { PersonaType } from "../types";
import { useApi } from "../hooks/useApi";
import { fetchPersonaDistribution, fetchPortfolioSummary } from "../services/api";
import { motion } from "motion/react";

interface ScreenPersonaViewProps {
  onSelectPersona:    (persona: PersonaType) => void;
  onSelectRiskLevels?: (riskLevels: string[]) => void;
}

// Risk state colours and labels
const RISK_COLORS: Record<string, string> = {
  "Healthy":          "#2E8B57",
  "Watchlist":        "#4169E1",
  "At Risk":          "#FFD700",
  "Imminent Default": "#FF4444",
};
const RISK_EMOJI: Record<string, string> = {
  "Healthy":          "⚪",
  "Watchlist":        "🔵",
  "At Risk":          "🟡",
  "Imminent Default": "🔴",
};

export function ScreenPersonaView({ onSelectPersona, onSelectRiskLevels }: ScreenPersonaViewProps) {
  const [selectedPersonaSegment, setSelectedPersonaSegment] = React.useState<string | null>(null);
  const [selectedRiskSegment,    setSelectedRiskSegment]    = React.useState<string | null>(null);

  const { data: personas, loading: personasLoading } = useApi(fetchPersonaDistribution);
  const { data: summary,  loading: summaryLoading  } = useApi(fetchPortfolioSummary);

  // ── Build DonutChart segments from API data ───────────────
  const personaDonutData: DonutSegment[] = React.useMemo(() => {
    if (!personas) return [];
    return personas.map(p => ({
      id:             p.id,
      label:          p.name.replace("Salary-Dependent Struggler", "Salary-Dependent")
                             .replace("Credit-Heavy Overuser", "Credit-Heavy")
                             .replace("Emergency Cash Withdrawer", "Emergency Cash")
                             .replace("Silent Saver Drain", "Silent Saver")
                             .replace("Paycheck-to-Paycheck Survivor", "Paycheck-Paycheck"),
      value:          p.count,
      count:          p.count,
      color:          p.color,
      emoji:          p.emoji,
      additionalInfo: p.additionalInfo,
    }));
  }, [personas]);

  const riskDonutData: DonutSegment[] = React.useMemo(() => {
    if (!summary) return [];
    const dist = summary.riskStateDistribution;
    return (Object.entries(dist) as [string, number][]).map(([state, count]) => ({
      id:             state.toLowerCase().replace(/\s+/g, "-"),
      label:          state,
      value:          count,
      count,
      color:          RISK_COLORS[state] || "#888",
      emoji:          RISK_EMOJI[state]  || "⚪",
      additionalInfo: count === 0
        ? "No customers"
        : state === "Imminent Default"
          ? "Requires immediate action"
          : state === "At Risk"
            ? "High priority intervention"
            : state === "Watchlist"
              ? "Monitor closely"
              : "Low risk, routine monitoring",
    }));
  }, [summary]);

  const totalCustomers = summary?.totalCustomers ?? 0;

  const handlePersonaSegmentClick = (segment: DonutSegment) => {
    setSelectedPersonaSegment(segment.id === selectedPersonaSegment ? null : segment.id);
    // Map segment id back to persoan name for navigation
    if (personas) {
      const matched = personas.find(p => p.id === segment.id);
      if (matched) onSelectPersona(matched.name as PersonaType);
    }
  };

  const handleRiskSegmentClick = (segment: DonutSegment) => {
    setSelectedRiskSegment(segment.id === selectedRiskSegment ? null : segment.id);
    if (onSelectRiskLevels) onSelectRiskLevels([segment.label]);
  };

  const loading = personasLoading || summaryLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 h-full"
    >
      {/* Two charts side-by-side — horizontal, responsive */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">

        {/* ── Left: Persona Distribution ── */}
        <div className="flex-1 min-w-0">
          <QuantumCard title="" className="h-full" glow>
            {loading ? (
              <div className="flex items-center justify-center h-full py-20">
                <div className="w-8 h-8 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <DonutChart
                data={personaDonutData}
                title="PERSONA DISTRIBUTION"
                centerLabel="CUSTOMERS"
                centerValue={totalCustomers.toLocaleString()}
                onSegmentClick={handlePersonaSegmentClick}
                selectedSegmentId={selectedPersonaSegment}
                size={220}
                innerRadius={65}
                outerRadius={85}
                showLegend={true}
              />
            )}
          </QuantumCard>
        </div>

        {/* ── Right: Risk State Distribution ── */}
        <div className="flex-1 min-w-0">
          <QuantumCard title="" className="h-full" glow>
            {loading ? (
              <div className="flex items-center justify-center h-full py-20">
                <div className="w-8 h-8 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <DonutChart
                  data={riskDonutData}
                  title="RISK STATE DISTRIBUTION"
                  centerLabel="CUSTOMERS"
                  centerValue={totalCustomers.toLocaleString()}
                  onSegmentClick={handleRiskSegmentClick}
                  selectedSegmentId={selectedRiskSegment}
                  size={220}
                  innerRadius={65}
                  outerRadius={85}
                  showLegend={true}
                />

                {/* Quick actions */}
                <div className="mt-auto pt-6 border-t border-[#2A2A3A]">
                  <p className="text-[12px] font-medium text-[#E6E6E6] uppercase mb-4 tracking-wider">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="py-2.5 px-4 bg-[#6A0DAD] text-white rounded-lg text-[12px] font-medium hover:bg-[#8A2BE2] transition-all shadow-[0_0_15px_rgba(106,13,173,0.3)]"
                      onClick={() => {
                        if (selectedRiskSegment && onSelectRiskLevels) {
                          const seg = riskDonutData.find(s => s.id === selectedRiskSegment);
                          if (seg) onSelectRiskLevels([seg.label]);
                        }
                      }}
                    >
                      Apply Filter
                    </button>
                    <button
                      className="py-2.5 px-4 bg-white/5 border border-white/10 text-[#E6E6E6] rounded-lg text-[12px] font-medium hover:bg-white/10 transition-all"
                      onClick={() => {
                        setSelectedRiskSegment(null);
                        if (onSelectRiskLevels) onSelectRiskLevels([]);
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </>
            )}
          </QuantumCard>
        </div>
      </div>
    </motion.div>
  );
}