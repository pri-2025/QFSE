import React from "react";
import { QuantumCard } from "./QuantumCard";
import { PersonaType, CUSTOMERS, Customer, getPersonaColor, getPersonaEmoji } from "../types";
import { ArrowLeft, Search, Filter, Download, ChevronRight, Share2, Zap } from "lucide-react";
import { motion } from "motion/react";

interface ScreenListViewProps {
  persona: PersonaType | null;
  riskLevels?: string[];
  onBack: () => void;
  onSelectCustomer: (id: string) => void;
}

export function ScreenListView({ persona, riskLevels = [], onBack, onSelectCustomer }: ScreenListViewProps) {
  // Filter by persona OR risk levels
  const filteredCustomers = CUSTOMERS.filter(c => {
    if (riskLevels.length > 0) {
      return riskLevels.includes(c.riskLevel);
    }
    return !persona || c.persona === persona;
  });

  const personaColor = persona ? getPersonaColor(persona) : "#6A0DAD";
  const personaEmoji = persona ? getPersonaEmoji(persona) : "⚪";
  
  // Determine if we're in risk filter mode
  const isRiskFilterMode = riskLevels.length > 0;
  
  // Get risk level emoji
  const getRiskEmoji = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Imminent Default': return '🔴';
      case 'Critical': return '🟠';
      case 'Warning': return '🟡';
      case 'Early Stress': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen grid grid-cols-12 gap-4 p-4"
    >
      {/* Left Panel - Persistent Filter - SCROLLABLE */}
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
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: personaColor, boxShadow: `0 0 8px ${personaColor}` }} />
                <span className="text-base font-bold text-white">{personaEmoji} {persona || "All Personas"}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button onClick={onBack} className="w-full py-3 text-xs font-medium leading-4 uppercase tracking-widest text-[#E6E6E6] hover:text-white hover:bg-white/5 rounded-lg transition-all border border-[#2A2A3A] hover:border-[#6A0DAD]/40">
              Clear All Filters
            </button>
            <button onClick={onBack} className="w-full py-3 px-4 bg-[#6A0DAD]/20 text-[#8A2BE2] hover:bg-[#6A0DAD]/30 rounded-lg text-xs font-medium leading-4 uppercase tracking-widest transition-all border border-[#6A0DAD]/30">
              ← Back to Persona View
            </button>
          </div>
        </QuantumCard>
      </div>

      {/* Center Panel - Customer List - FULLY SCROLLABLE */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-[#B0B0C0] hover:text-white hover:border-[#6A0DAD] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-3">
                {isRiskFilterMode ? (
                  <>
                    {riskLevels.map(level => getRiskEmoji(level)).join(' ')} {riskLevels.join(' + ').toUpperCase()}
                  </>
                ) : (
                  <>
                    {personaEmoji} {persona ? persona.toUpperCase() : "ALL CUSTOMERS"}
                  </>
                )}
                <span className="text-xs font-normal text-[#B0B0C0] bg-white/5 px-2 py-0.5 rounded border border-white/10">{filteredCustomers.length} Customers</span>
              </h2>
              {isRiskFilterMode && (
                <p className="text-[10px] text-[#8A2BE2] mt-1 uppercase tracking-wider">
                  🔮 Risk State Filter Active
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium leading-4 uppercase tracking-widest text-[#E6E6E6] hover:text-white hover:bg-white/10 transition-all">
              <Download className="w-3.5 h-3.5" /> Export List
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium leading-4 uppercase tracking-widest text-[#E6E6E6] hover:text-white hover:bg-white/10 transition-all">
              <Filter className="w-3.5 h-3.5" /> Bulk Actions
            </button>
          </div>
        </div>

        <div className="relative shrink-0 mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
          <input 
            type="text" 
            placeholder="Search customers by name, risk level, or signals..."
            className="w-full bg-[#141424] border border-[#2A2A3A] rounded-xl py-3 pl-10 pr-4 text-xs font-medium leading-4 text-[#E6E6E6] placeholder:text-[#E6E6E6] focus:outline-none focus:border-[#6A0DAD] transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-8">
          {filteredCustomers.map((customer) => (
            <div 
              key={customer.id}
              onClick={() => onSelectCustomer(customer.id)}
              className="group relative bg-[#141424]/60 hover:bg-[#141424] border border-[#2A2A3A] hover:border-[#6A0DAD]/40 rounded-xl p-4 cursor-pointer transition-all duration-300 overflow-hidden"
            >
              {/* Risk Indicator Border */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1" 
                style={{ backgroundColor: 
                  customer.riskLevel === 'Imminent Default' ? '#FF4444' :
                  customer.riskLevel === 'Critical' ? '#FF8C00' :
                  customer.riskLevel === 'Warning' ? '#FFD700' :
                  customer.riskLevel === 'Early Stress' ? '#4169E1' : '#2E8B57'
                }} 
              />

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6A0DAD]/20 to-[#8A2BE2]/20 border border-[#6A0DAD]/30 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                    {customer.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#8A2BE2] transition-colors">{customer.name}</h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        <span className="text-[10px] font-bold font-['JetBrains_Mono']" style={{ color: 
                           customer.riskLevel === 'Imminent Default' ? '#FF4444' :
                           customer.riskLevel === 'Critical' ? '#FF8C00' :
                           customer.riskLevel === 'Warning' ? '#FFD700' :
                           customer.riskLevel === 'Early Stress' ? '#4169E1' : '#2E8B57'
                        }}>RISK: {customer.risk}%</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 
                           customer.riskLevel === 'Imminent Default' ? '#FF4444' :
                           customer.riskLevel === 'Critical' ? '#FF8C00' :
                           customer.riskLevel === 'Warning' ? '#FFD700' :
                           customer.riskLevel === 'Early Stress' ? '#4169E1' : '#2E8B57'
                        }} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {customer.signals.map((s) => (
                          <div key={s.id} className={`text-xs font-medium leading-4 flex items-center gap-1 px-2 py-1 rounded border ${
                            s.type === 'critical' ? 'bg-[#FF4444]/10 border-[#FF4444]/20 text-[#FF4444]' :
                            s.type === 'warning' ? 'bg-[#FFD700]/10 border-[#FFD700]/20 text-[#FFD700]' :
                            s.type === 'success' ? 'bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]' : 'bg-white/5 border-white/10 text-[#E6E6E6]'
                          }`}>
                            <Zap className="w-3 h-3" /> {s.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                      <div>
                        <p className="text-xs font-medium leading-4 text-[#E6E6E6] uppercase tracking-wider mb-0.5">Loan Amount</p>
                        <p className="text-xs font-medium leading-4 text-[#E6E6E6] font-['JetBrains_Mono']">{customer.loanAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium leading-4 text-[#E6E6E6] uppercase tracking-wider mb-0.5">EMI Schedule</p>
                        <p className="text-xs font-medium leading-4 text-[#E6E6E6] font-['JetBrains_Mono']">{customer.emi} due in {customer.emiDueDays}d</p>
                      </div>
                      {customer.entanglements.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-[#8A2BE2]/10 px-2 py-1 rounded border border-[#8A2BE2]/20">
                          <Share2 className="w-3 h-3 text-[#8A2BE2]" />
                          <span className="text-xs font-medium leading-4 text-[#8A2BE2]">{customer.entanglements.length} Entangled Nodes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#6A0DAD]/20 text-[#8A2BE2] rounded-lg text-xs font-medium leading-4 hover:bg-[#6A0DAD] hover:text-white transition-all group/btn">
                    View Full Profile <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-xs font-medium leading-4 text-[#E6E6E6] font-['JetBrains_Mono'] uppercase tracking-wider">Updated: 2m ago</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}