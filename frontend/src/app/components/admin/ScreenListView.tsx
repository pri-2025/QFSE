import React, { useState, useCallback } from "react";
import { QuantumCard } from "../common/QuantumCard";
import { Ticker } from "../common/Ticker";
import {
  Customer,
  PersonaType,
  getPersonaColor,
  getPersonaEmoji,
  getRiskLevelColor
} from "../../types";
import { Shield, ArrowLeft, ArrowRight, UserPlus, Filter, Search, Activity, User, Download, Share2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchCustomers, ApiCustomer } from "../../services/api";

interface ScreenListViewProps {
  persona:           PersonaType | null;
  riskLevels?:       string[];
  onBack:            () => void;
  onSelectCustomer:  (id: string) => void;
}

/** Map QFSE risk state names → accent colour */
function getRiskColor(riskState: string): string {
  switch (riskState) {
    case "Imminent Default": return "#FF4444";
    case "At Risk":          return "#FFD700";
    case "Watchlist":        return "#4169E1";
    default:                 return "#2E8B57";
  }
}
function getRiskEmoji(riskState: string): string {
  switch (riskState) {
    case "Imminent Default": return "🔴";
    case "At Risk":          return "🟡";
    case "Watchlist":        return "🔵";
    default:                 return "⚪";
  }
}

export function ScreenListView({ persona, riskLevels = [], onBack, onSelectCustomer }: ScreenListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const params = React.useMemo(() => {
    const p: Record<string, string> = {};
    if (persona)            p.persona   = persona;
    if (riskLevels.length)  p.riskState = riskLevels.join(",");
    return p;
  }, [persona, riskLevels]);

  const fetchFn      = useCallback(() => fetchCustomers(params), [JSON.stringify(params)]);
  const { data, loading, error } = useApi(fetchFn);

  const customers: ApiCustomer[] = React.useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    const q = searchQuery.toLowerCase();
    return data.data.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.persona.toLowerCase().includes(q) ||
      c.riskState.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const isRiskFilterMode = riskLevels.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen grid grid-cols-12 gap-4 p-4"
    >
      {/* Left filter panel */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <QuantumCard title="👥 CURRENT FILTER">
          {isRiskFilterMode ? (
            <div className="mb-6">
              <p className="text-[10px] text-[#B0B0C0] uppercase tracking-widest mb-3">RISK STATE FILTERS</p>
              <div className="space-y-2">
                {riskLevels.map((level, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#6A0DAD]/10 border border-[#6A0DAD]/30">
                    <span className="text-2xl">{getRiskEmoji(level)}</span>
                    <span className="text-sm font-bold text-white">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] text-[#B0B0C0] uppercase tracking-widest mb-3">VIEWING PERSONA</p>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#6A0DAD]/10 border border-[#6A0DAD]/30">
                <span className="text-base font-bold text-white">{persona || "All Personas"}</span>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={onBack} className="w-full py-3 text-xs font-medium uppercase tracking-widest text-[#E6E6E6] hover:text-white hover:bg-white/5 rounded-lg transition-all border border-[#2A2A3A]">
              Clear All Filters
            </button>
            <button onClick={onBack} className="w-full py-3 px-4 bg-[#6A0DAD]/20 text-[#8A2BE2] hover:bg-[#6A0DAD]/30 rounded-lg text-xs font-medium uppercase tracking-widest transition-all border border-[#6A0DAD]/30">
              ← Back to Persona View
            </button>
          </div>
        </QuantumCard>
      </div>

      {/* Customer list */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-white/5 border border-white/10 rounded-lg text-[#B0B0C0] hover:text-white hover:border-[#6A0DAD] transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-3">
                {isRiskFilterMode
                  ? <>{riskLevels.map(l => getRiskEmoji(l)).join(" ")} {riskLevels.join(" + ").toUpperCase()}</>
                  : <>{persona ? persona.toUpperCase() : "ALL CUSTOMERS"}</>
                }
                <span className="text-xs font-normal text-[#B0B0C0] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {loading ? "…" : `${customers.length} Customers`}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium uppercase tracking-widest text-[#E6E6E6] hover:bg-white/10 transition-all">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
          <input
            type="text"
            placeholder="Search by name, persona, or risk state..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#141424] border border-[#2A2A3A] rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#E6E6E6] placeholder:text-[#B0B0C0] focus:outline-none focus:border-[#6A0DAD] transition-all"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="p-6 text-center text-[#FF4444] text-sm">{error}</div>
          )}
          {!loading && customers.map(customer => {
            const riskColor = getRiskColor(customer.riskState);
            return (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className="group relative bg-[#141424]/60 hover:bg-[#141424] border border-[#2A2A3A] hover:border-[#6A0DAD]/40 rounded-xl p-4 cursor-pointer transition-all duration-300 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: riskColor }} />

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6A0DAD]/20 to-[#8A2BE2]/20 border border-[#6A0DAD]/30 flex items-center justify-center text-lg font-bold text-white">
                      {customer.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#8A2BE2] transition-colors">{customer.name}</h3>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          <span className="text-[10px] font-bold font-['JetBrains_Mono']" style={{ color: riskColor }}>
                            RISK: {customer.risk}%
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: riskColor }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-[#B0B0C0]">
                          {customer.personaEmoji} {customer.persona}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded border" style={{ color: riskColor, borderColor: `${riskColor}40`, backgroundColor: `${riskColor}10` }}>
                          {customer.riskState}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 mt-3 text-xs text-[#E6E6E6]">
                        <div>
                          <p className="uppercase tracking-wider mb-0.5 text-[10px]">Loan</p>
                          <p className="font-['JetBrains_Mono']">₹{(customer.loanAmount / 100000).toFixed(1)}L</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-wider mb-0.5 text-[10px]">EMI</p>
                          <p className="font-['JetBrains_Mono']">₹{(customer.emiAmount / 1000).toFixed(1)}k due in {customer.emiDueDays}d</p>
                        </div>
                        {customer.entanglementCount > 0 && (
                          <div className="flex items-center gap-1.5 bg-[#8A2BE2]/10 px-2 py-1 rounded border border-[#8A2BE2]/20">
                            <Share2 className="w-3 h-3 text-[#8A2BE2]" />
                            <span className="text-xs text-[#8A2BE2]">{customer.entanglementCount} Linked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 bg-[#6A0DAD]/20 text-[#8A2BE2] rounded-lg text-xs font-medium hover:bg-[#6A0DAD] hover:text-white transition-all">
                    View Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {!loading && !error && customers.length === 0 && (
            <div className="p-8 text-center text-[#B0B0C0] text-sm">No customers match this filter.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}