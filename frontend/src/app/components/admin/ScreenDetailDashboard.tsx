import React, { useState, useCallback } from "react";
import { QuantumCard } from "../common/QuantumCard";
import { WaveFunctionGraph } from "../common/WaveFunctionGraph";
import { CUSTOMERS, Customer } from "../../types";
import { ArrowLeft, ArrowRight, MessageSquare, Shield, Clock, Phone, Mail, Zap, Target, RefreshCcw, Search, ChevronRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApi } from "../../hooks/useApi";
import { fetchCustomer } from "../../services/api";

interface ScreenDetailDashboardProps {
  customerId:        string;
  onBack:            () => void;
  onViewEntanglement:() => void;
  onViewTimeline?:   () => void;
  onSwitchCustomer:  (id: string) => void;
  onIntervention:    () => void;
}

export function ScreenDetailDashboard({ customerId, onBack, onViewEntanglement, onViewTimeline, onSwitchCustomer, onIntervention }: ScreenDetailDashboardProps) {
  const [tone, setTone] = useState("Empathetic");
  const [channel, setChannel] = useState("SMS");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch live customer data
  const { data: apiCustomer, loading } = useApi(useCallback(() => fetchCustomer(customerId), [customerId]));

  // Build compatible mock shape while live data loads, or use the 15 real customers as a fallback
  const customer: Customer | null = React.useMemo(() => {
    if (!apiCustomer) return null;
    // Find the existing mock customer for signal history / wave data if present
    const mock = CUSTOMERS.find(c => c.id === apiCustomer.id) || null;
    if (mock) return { ...mock, risk: apiCustomer.risk };
    // Build a minimal Customer-compatible shape
    return {
      id:                   apiCustomer.id,
      name:                 apiCustomer.name,
      email:                apiCustomer.email,
      phone:                apiCustomer.phone,
      persona:              apiCustomer.persona as any,
      risk:                 apiCustomer.risk,
      riskLevel:            apiCustomer.riskState as any,
      defaultProb:          Math.round(apiCustomer.defaultProb * 100),
      recoveryProb:         Math.round((1 - apiCustomer.defaultProb) * 80),
      struggleProb:         Math.round(apiCustomer.defaultProb * 60),
      loanAmount:           `₹${(apiCustomer.loanAmount/100000).toFixed(1)}L`,
      emi:                  `₹${(apiCustomer.emiAmount/1000).toFixed(1)}k`,
      emiDueDays:           apiCustomer.emiDueDays,
      affordabilitySurplus: apiCustomer.affordabilitySurplus,
      signals:              [],
      entanglements:        apiCustomer.entanglements || [],
      signalHistory:        {},
      waveData:             (apiCustomer as any).waveData || [],
    } as any;
  }, [apiCustomer]);

  const personaCustomers = CUSTOMERS.filter(c => customer && c.persona === customer.persona);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Imminent Default': return '#FF4444';
      case 'Critical': return '#FF8C00';
      case 'Warning': return '#FFD700';
      case 'Early Stress': return '#4169E1';
      default: return '#2E8B57';
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#0A0A14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6A0DAD] border-t-white animate-spin" />
      </div>
    );
  }

  const currentIndex = personaCustomers.findIndex(c => c.id === customer.id);
  const nextCustomer = personaCustomers[currentIndex + 1];
  const prevCustomer = personaCustomers[currentIndex - 1];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex relative"
    >
      {/* Sidebar Navigation - SCROLLABLE */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-[#141424] border-r border-[#2A2A3A] flex flex-col shrink-0 overflow-hidden z-30"
          >
            <div className="p-6 border-b border-[#2A2A3A] shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">PERSONA QUEUE</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-[#E6E6E6] transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /></button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
                <input 
                  type="text" 
                  placeholder="Search in this persona..." 
                  className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-xl py-3 pl-10 pr-4 text-[12px] text-white focus:outline-none focus:border-[#6A0DAD] transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {personaCustomers.map((c) => (
                <button 
                  key={c.id}
                  onClick={() => onSwitchCustomer(c.id)}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex flex-col gap-2 group ${
                    c.id === customer.id 
                    ? 'bg-[#6A0DAD]/10 border-[#6A0DAD] shadow-[0_0_15px_rgba(106,13,173,0.1)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[12px] font-bold transition-colors ${c.id === customer.id ? 'text-white' : 'text-[#B0B0C0] group-hover:text-white'}`}>{c.name}</span>
                    <span className="text-[12px] font-['JetBrains_Mono'] font-bold" style={{ color: getRiskColor(c.riskLevel) }}>{c.risk}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#B0B0C0] font-bold uppercase tracking-widest">{c.riskLevel}</span>
                    {c.id === customer.id && <div className="w-1.5 h-1.5 rounded-full bg-[#6A0DAD] shadow-[0_0_8px_#6A0DAD]" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-[#2A2A3A]">
              <button onClick={onBack} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[12px] font-bold text-[#E6E6E6] uppercase tracking-widest transition-all border border-white/10">
                Back to Dashboard
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A14]">
        {/* Top Header */}
        <header className="h-20 border-b border-[#2A2A3A] bg-[#0A0A14]/90 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[#E6E6E6] transition-all"><ChevronRight className="w-4 h-4" /></button>
            )}
            <button 
              onClick={onBack}
              className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold uppercase tracking-widest text-[#E6E6E6] hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
            
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-bold text-white tracking-tight uppercase flex items-center gap-4">
                QUANTUM STATE PROFILE - {customer.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#141424] border border-[#2A2A3A] rounded-xl overflow-hidden mr-4">
              <button 
                disabled={!prevCustomer}
                onClick={() => prevCustomer && onSwitchCustomer(prevCustomer.id)}
                className={`p-3 hover:bg-white/5 transition-all text-[#B0B0C0] border-r border-[#2A2A3A] disabled:opacity-30`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest">
                {currentIndex + 1} / {personaCustomers.length}
              </span>
              <button 
                disabled={!nextCustomer}
                onClick={() => nextCustomer && onSwitchCustomer(nextCustomer.id)}
                className={`p-3 hover:bg-white/5 transition-all text-[#B0B0C0] disabled:opacity-30`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold uppercase tracking-widest text-[#E6E6E6] hover:text-white hover:bg-white/10 transition-all">Save</button>
            <button className="px-5 py-2.5 bg-[#6A0DAD] rounded-xl text-[12px] font-bold uppercase tracking-widest text-white hover:bg-[#8A2BE2] transition-all shadow-[0_0_20px_rgba(106,13,173,0.3)]">Export</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Top Info Cards */}
          <div className="grid grid-cols-12 gap-6">
            <QuantumCard title="👤 QUANTUM STATE PROFILE" className="col-span-12 md:col-span-4" glow>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(106,13,173,0.3)] border border-white/10">
                  {customer.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] flex items-center gap-2"><Mail className="w-3 h-3 text-[#B0B0C0]" /> {customer.email}</span>
                    <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] flex items-center gap-2"><Phone className="w-3 h-3 text-[#B0B0C0]" /> {customer.phone}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider">Persona</span>
                  <span className="text-[12px] font-bold text-white bg-[#BD10E0]/20 px-3 py-1 rounded-full border border-[#BD10E0]/30">{customer.persona}</span>
                </div>
                <div className="space-y-4 pt-2">
                   <p className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#8A2BE2]" /> SUPERPOSITION PROBABILITIES
                   </p>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[12px] font-medium text-[#E6E6E6]"><span>RECOVERY</span><span>{customer.recoveryProb}%</span></div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${customer.recoveryProb}%` }} className="h-full bg-[#00C853] shadow-[0_0_10px_rgba(0,200,83,0.3)]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[12px] font-medium text-[#E6E6E6]"><span>STRESS</span><span>{customer.struggleProb}%</span></div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${customer.struggleProb}%` }} className="h-full bg-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[12px] font-medium text-[#E6E6E6]"><span>DEFAULT</span><span>{customer.defaultProb}%</span></div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${customer.defaultProb}%` }} className="h-full bg-[#FF4444] shadow-[0_0_10px_rgba(255,68,68,0.3)]" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </QuantumCard>

            <QuantumCard title="🎯 RISK METRICS" className="col-span-12 md:col-span-4" glow>
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider mb-2">Current Risk State</p>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-[48px] font-['JetBrains_Mono'] font-bold leading-none" style={{ color: getRiskColor(customer.riskLevel) }}>{customer.risk}%</span>
                    <span className="text-[14px] font-bold text-white uppercase tracking-widest">{customer.riskLevel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF4444] bg-[#FF4444]/10 px-4 py-2 rounded-xl border border-[#FF4444]/20 w-fit">
                    <TrendingUp className="w-4 h-4" /> 
                    <span className="text-[12px] font-bold uppercase tracking-wider">7-day trend: +12%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest mb-1">Loan Portfolio</p>
                    <p className="text-[16px] font-['JetBrains_Mono'] font-bold text-white">{customer.loanAmount}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest mb-1">EMI Schedule</p>
                    <p className="text-[14px] font-['JetBrains_Mono'] font-bold text-white">{customer.emi} / {customer.emiDueDays}d</p>
                  </div>
                </div>
              </div>
            </QuantumCard>

            <QuantumCard title="🚨 ACTIVE SIGNALS" className="col-span-12 md:col-span-4" glow>
               <div className="space-y-4">
                 {customer.signals.map((signal) => (
                   <div key={signal.id} className={`flex items-start gap-4 p-4 rounded-xl border ${
                     signal.type === 'critical' ? 'bg-[#FF4444]/10 border-[#FF4444]/30' :
                     signal.type === 'warning' ? 'bg-[#FFD700]/10 border-[#FFD700]/30' :
                     'bg-[#4169E1]/10 border-[#4169E1]/30'
                   }`}>
                     <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                       signal.type === 'critical' ? 'bg-[#FF4444]' :
                       signal.type === 'warning' ? 'bg-[#FFD700]' : 'bg-[#4169E1]'
                     }`} />
                     <div>
                        <p className="text-[14px] font-bold text-white">{signal.text}</p>
                        <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] mt-1 uppercase tracking-wider">Detected: 4h ago</p>
                     </div>
                   </div>
                 ))}
                 <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider">Affordability Surplus</span>
                    <span className="text-[16px] font-['JetBrains_Mono'] font-bold text-[#00C853]">₹{(customer.affordabilitySurplus || 0).toLocaleString()}</span>
                 </div>
               </div>
            </QuantumCard>
          </div>

          {/* Charts & Breakdown */}
          <div className="grid grid-cols-12 gap-6">
            <QuantumCard title="" className="col-span-12 lg:col-span-8" glow>
              <WaveFunctionGraph customer={customer} />
              
              {/* Event Timeline Component */}
              <div className="mt-8 border-t border-[#2A2A3A] pt-6">
                <h4 className="text-[12px] font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6A0DAD]" /> KEY EVENTS TIMELINE:
                </h4>
                <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-[#2A2A3A]">
                  {(Object.entries(customer.signalHistory || {}).flatMap(([name, hist]) => 
                    hist.filter(h => h.event).map(h => ({ ...h, signal: name }))
                  ).sort((a, b) => b.day - a.day)).map((event, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-8 top-1.5 w-7 h-7 rounded-full bg-[#141424] border border-[#6A0DAD] flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-[#6A0DAD]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[12px] font-bold text-[#6A0DAD] font-['JetBrains_Mono']">DAY {event.day}</span>
                          <span className="text-[12px] font-bold text-white uppercase tracking-wide">{event.event}</span>
                        </div>
                        <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">{event.signal}: {event.intensity}% Intensity {event.value ? `(${event.value})` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </QuantumCard>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <QuantumCard title="🔗 QUANTUM ENTANGLEMENT NETWORK" glow>
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col items-center justify-center py-8 relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center text-white text-xl font-bold relative z-10 shadow-2xl border-4 border-white/10">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#FF4444] rounded-full border-2 border-[#141424] text-[10px] flex items-center justify-center font-bold">{customer.risk}%</div>
                    </div>
                    
                    {customer.entanglements.length > 0 ? (
                      <div className="w-full mt-6">
                        <div className="flex flex-col items-center">
                          <div className="w-px h-10 bg-gradient-to-b from-[#6A0DAD] to-transparent" />
                          <div className="flex gap-10">
                            {customer.entanglements.map((ent, i) => (
                              <div key={ent.id} className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                  {ent.name[0]}
                                </div>
                                <div className="text-center">
                                  <p className="text-[12px] font-bold text-white">{ent.name}</p>
                                  <p className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-tighter">{ent.riskImpact} IMPACT</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-8 bg-[#FF8C00]/10 border border-[#FF8C00]/30 p-4 rounded-xl text-center">
                          <p className="text-[12px] text-white font-bold uppercase mb-2 flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4 text-[#FF8C00]" /> CASCADE ALERT
                          </p>
                          <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">If {customer.name.split(' ')[0]} defaults, family risk profile increases by average 12%.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mt-10 space-y-3">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-[12px] font-bold text-white uppercase tracking-widest mb-1">NO SOCIAL ENTANGLEMENTS</p>
                          <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">This customer operates independently with no connected nodes showing stress.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={onViewEntanglement}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[12px] font-bold uppercase tracking-widest text-[#E6E6E6] hover:text-white transition-all mt-4"
                  >
                    View Full Network →
                  </button>
                </div>
              </QuantumCard>

              {/* Recommended Interventions Table */}
              <QuantumCard title="📋 RECOMMENDED INTERVENTIONS" glow>
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 pb-2 border-b border-[#2A2A3A]">
                      <span className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest">Strategy</span>
                      <span className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest text-right">Recovery Prob</span>
                   </div>
                   {[
                     { label: "🌟 EMI Holiday", prob: 65, icon: <Clock className="w-4 h-4" />, best: true },
                     { label: "💳 Small Credit Line", prob: 48, icon: <Shield className="w-4 h-4" />, best: false },
                     { label: "📞 Counseling", prob: 52, icon: <Phone className="w-4 h-4" />, best: false },
                   ].map((action, i) => (
                     <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                       action.best ? 'bg-[#00C853]/10 border-[#00C853]/40' : 'bg-white/5 border-white/10'
                     }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-white">{action.label}</span>
                        </div>
                        <span className="text-[12px] font-bold font-['JetBrains_Mono']" style={{ color: action.best ? '#00C853' : '#E6E6E6' }}>+{action.prob}%</span>
                     </div>
                   ))}
                 </div>
              </QuantumCard>
            </div>
          </div>

          {/* Signal Breakdown Cards */}
          <div className="grid grid-cols-12 gap-6 pb-12">
            <QuantumCard title="💬 COHERENT COMMUNICATION LAYER" className="col-span-12 lg:col-span-12" glow>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest">Tone Profile</label>
                  <div className="flex gap-2">
                    {["Empathetic", "Direct", "Solution-Oriented"].map(t => (
                      <button key={t} onClick={() => setTone(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${tone === t ? "bg-[#6A0DAD] border-[#8A2BE2] text-white" : "bg-white/5 border-white/10 text-[#E6E6E6]"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest">Delivery Channel</label>
                  <div className="flex gap-2">
                    {["SMS", "WhatsApp", "Push"].map(c => (
                      <button key={c} onClick={() => setChannel(c)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${channel === c ? "bg-[#6A0DAD] border-[#8A2BE2] text-white" : "bg-white/5 border-white/10 text-[#E6E6E6]"}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest">ACTIVE SIGNALS - DETAILED BREAKDOWN</h4>
                  <div className="space-y-4">
                    {Object.entries(customer.signalHistory || {}).map(([name, history], idx) => {
                      if (!history || history.length === 0) return null;
                      const current = history[history.length - 1];
                      const peak = [...history].sort((a,b) => b.intensity - a.intensity)[0];
                      const eventsCount = history.filter(h => h.event).length;
                      
                      return (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                          <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{name}</span>
                            <span className="text-[10px] font-bold text-[#FF4444] uppercase tracking-widest">⬆️ WORSENING</span>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-y-3">
                            <div>
                              <p className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest">Current</p>
                              <p className="text-[12px] font-bold text-white">{current?.intensity || 0}% Intensity</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest">Peak</p>
                              <p className="text-[12px] font-bold text-white">{peak?.intensity || 0}% (Day {peak?.day || 0})</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest">Frequency</p>
                              <p className="text-[12px] font-bold text-white">{eventsCount} Events / 30d</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest">Detected</p>
                              <p className="text-[12px] font-bold text-white">4 hours ago</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h4 className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest mb-4">GENERATED MESSAGE PREVIEW</h4>
                  <div className="flex-1 bg-[#141424] border border-[#6A0DAD] rounded-2xl p-6 shadow-2xl relative group mb-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#6A0DAD]/20 border border-[#8A2BE2]/40 flex items-center justify-center">
                         <MessageSquare className="w-5 h-5 text-[#8A2BE2]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium leading-[20px] text-white">
                          "Hi {customer.name.split(' ')[0]}, we noticed your salary has been delayed for {customer.signalHistory?.["Salary Delay"]?.slice(-1)[0]?.intensity === 80 ? "4 days" : "several days"} and you've made significant savings withdrawals this month. Would a 15-day EMI holiday help stabilize your finances? Reply YES to opt in."
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#E6E6E6] border border-white/10 transition-all"><RefreshCcw className="w-3.5 h-3.5" /> Regenerate</button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={onIntervention}
                      className="flex-[2] py-4 bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] rounded-xl text-[12px] font-bold uppercase tracking-widest text-white hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] transition-all flex items-center justify-center gap-3"
                    >
                      <Zap className="w-5 h-5" /> SEND INTERVENTION NOW
                    </button>
                    <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold uppercase tracking-widest text-[#E6E6E6] hover:text-white transition-all flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" /> SCHEDULE
                    </button>
                  </div>
                </div>
              </div>
            </QuantumCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Edit2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}