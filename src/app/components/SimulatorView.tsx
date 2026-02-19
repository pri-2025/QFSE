import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, Zap, ArrowRight, Check, X, ChevronDown, ChevronRight, History } from "lucide-react";
import { CUSTOMERS, Customer, getPersonaColor, getPersonaEmoji } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SimulatorViewProps {
  initialCustomerId?: string | null;
}

interface SimulationResult {
  riskReduction: number;
  newRisk: number;
  confidence: number;
  savings: string;
  preventedLoss: string;
  spouseImpact: number;
  strategy: string;
}

interface SimulationHistoryItem {
  id: string;
  customerId?: string;
  customerName: string;
  strategy: string;
  riskReduction: number;
  confidence: number;
  status: "success" | "pending";
  timestamp: string;
  personaColor: string;
}

const STRATEGIES = [
  { id: "emi-holiday", name: "EMI Holiday", riskRed: 42, conf: 87, desc: "Offer 15-day EMI holiday with no additional interest" },
  { id: "credit-line", name: "Credit Line", riskRed: 35, conf: 82, desc: "Emergency credit line extension" },
  { id: "phone-call", name: "Phone Call", riskRed: 28, conf: 76, desc: "Personalized intervention call" },
  { id: "sms-alert", name: "SMS Alert", riskRed: 18, conf: 64, desc: "Automated warning message" },
  { id: "do-nothing", name: "Do Nothing", riskRed: 5, conf: 95, desc: "No intervention" },
];

export function SimulatorView({ initialCustomerId }: SimulatorViewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || CUSTOMERS[3].id); // Default to Sneha Iyer
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES[0]);
  const [simulationStatus, setSimulationStatus] = useState<"idle" | "simulating" | "complete">("idle");
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  
  // Filters
  const [filterHighRisk, setFilterHighRisk] = useState(false);
  const [filterEntangled, setFilterEntangled] = useState(false);

  const [history, setHistory] = useState<SimulationHistoryItem[]>([
    { id: "1", customerId: "CUST_03", customerName: "Amit Sharma", strategy: "EMI Holiday", riskReduction: 42, confidence: 87, status: "success", timestamp: "Today 10:23", personaColor: "#BD10E0" },
    { id: "2", customerId: "CUST_07", customerName: "Rajesh Kulkarni", strategy: "Emergency Credit Line", riskReduction: 35, confidence: 82, status: "pending", timestamp: "Today 09:45", personaColor: "#FF8C00" },
    { id: "3", customerId: "CUST_05", customerName: "Priya Mehta", strategy: "Debt Consolidation", riskReduction: 38, confidence: 91, status: "success", timestamp: "Yesterday 16:30", personaColor: "#F5A623" },
  ]);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);

  // Update selected customer if initialCustomerId changes
  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  const filteredCustomers = CUSTOMERS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.persona.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHighRisk = filterHighRisk ? c.risk > 60 : true;
    const matchesEntangled = filterEntangled ? c.entanglements.length > 0 : true;
    
    return matchesSearch && matchesHighRisk && matchesEntangled;
  });

  // When filters change, select the first customer in the filtered list if current selection is not in list
  useEffect(() => {
    if (filteredCustomers.length > 0) {
      const isCurrentInList = filteredCustomers.some(c => c.id === selectedCustomerId);
      if (!isCurrentInList) {
        setSelectedCustomerId(filteredCustomers[0].id);
        setSimulationStatus("idle");
        setResult(null);
      }
    }
  }, [filterHighRisk, filterEntangled, filteredCustomers, selectedCustomerId]);

  const selectedCustomer = CUSTOMERS.find(c => c.id === selectedCustomerId) || CUSTOMERS[0];

  const handleExecute = () => {
    setSimulationStatus("simulating");
    setSimulationProgress(0);
    
    // Animate progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishSimulation();
          return 100;
        }
        return prev + 5; // increment
      });
    }, 100);
  };

  const finishSimulation = () => {
    setSimulationStatus("complete");
    
    // Dynamic calculation based on customer properties
    const hasEntanglement = selectedCustomer.entanglements.length > 0;
    const spouseImpact = hasEntanglement ? 18 : 0;
    
    const newRes: SimulationResult = {
      riskReduction: selectedStrategy.riskRed,
      newRisk: Math.max(0, selectedCustomer.risk - selectedStrategy.riskRed),
      confidence: hasEntanglement ? Math.min(98, selectedStrategy.conf + 5) : selectedStrategy.conf,
      savings: "₹1.2L",
      preventedLoss: "₹3.8L",
      spouseImpact: spouseImpact,
      strategy: selectedStrategy.name
    };
    setResult(newRes);
    
    // Add to history
    setHistory(prev => [{
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      strategy: selectedStrategy.name,
      riskReduction: selectedStrategy.riskRed,
      confidence: newRes.confidence,
      status: "success",
      timestamp: "Just now",
      personaColor: getPersonaColor(selectedCustomer.persona)
    }, ...prev]);
  };

  // Generate dynamic AI message based on customer state
  const getAiMessage = () => {
    if (selectedCustomer.entanglements.length > 0 && selectedCustomer.risk > 80) {
      return `Emergency Credit Line + Family Plan: Immediate ₹50k credit line at 0% for 30 days + family financial counseling. This intervention prevents cascade affecting ${selectedCustomer.entanglements.length + 1} family members. Total system impact: ${selectedCustomer.entanglements.length + 2} nodes.`;
    } 
    
    if (selectedCustomer.entanglements.length > 0) {
       return `EMI Holiday + Family Counseling: 15-day EMI holiday plus spouse financial check-in. This addresses both salary delay and prevents family cascade. Spouse risk reduces by 8% automatically.`;
    }

    if (selectedCustomer.risk > 70) {
       return `Debt Consolidation: Consolidate 3 credit cards into one loan at 8% interest. This reduces monthly outflow by ₹4,200 and improves credit utilization from 85% to 45%.`;
    }

    return `Offer 15-day EMI holiday with no additional interest charges. This aligns with ${selectedCustomer.name}'s "${selectedCustomer.persona}" persona and current signals.`;
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-112px)] bg-[#0A0A14] overflow-hidden">
      {/* LEFT PANEL - Customer Selection & Filters */}
      <div className="w-full lg:w-1/4 border-r border-[#2A2A3A] flex flex-col bg-[#0A0A14]/50">
        <div className="p-4 border-b border-[#2A2A3A]">
          <h2 className="text-xs font-semibold text-[#E6E6E6] mb-3 uppercase tracking-wider">Customer Selection</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#E6E6E6]" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141424] border border-[#2A2A3A] rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-[#E6E6E6] focus:outline-none focus:border-[#6A0DAD]"
            />
          </div>
          
          {(filterHighRisk || filterEntangled) && (
             <div className="mt-3 py-1.5 px-3 bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#6A0DAD]" />
                <span className="text-xs font-medium text-[#E6E6E6]">
                  FILTER ACTIVE: <span className="text-white">
                    {filterHighRisk && filterEntangled ? "High Risk + Entangled" : 
                     filterHighRisk ? "High Risk Only" : "With Entanglements"}
                  </span>
                </span>
             </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <AnimatePresence>
            {filteredCustomers.map(customer => (
              <motion.button
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedCustomerId(customer.id);
                  setSimulationStatus("idle");
                  setResult(null);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedCustomerId === customer.id 
                    ? "bg-[#6A0DAD]/20 border-[#8A2BE2] shadow-[0_0_15px_rgba(106,13,173,0.1)]" 
                    : "bg-transparent border-transparent hover:bg-[#141424]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#E6E6E6]">{customer.name}</span>
                      {customer.entanglements.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/30">Fam</span>
                      )}
                    </div>
                    <div className="text-xs text-[#E6E6E6] mt-1 flex items-center gap-1">
                      <span>{getPersonaEmoji(customer.persona)}</span>
                      <span className="truncate w-32">{customer.persona}</span>
                    </div>
                  </div>
                  <div className={`text-right ${
                    customer.risk > 75 ? "text-[#FF4444]" : 
                    customer.risk > 50 ? "text-[#FF8C00]" : 
                    "text-[#00C853]"
                  }`}>
                    <div className="text-xs font-bold font-['JetBrains_Mono']">{customer.risk}%</div>
                    <div className="text-[10px] opacity-70">Risk</div>
                  </div>
                </div>
              </motion.button>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="p-4 text-center text-[#E6E6E6] text-xs">
                No customers match these filters.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM LEFT FILTERS */}
        <div className="p-4 border-t border-[#2A2A3A] bg-[#0A0A14]">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-xs font-semibold text-[#E6E6E6] uppercase">Quick Filters</h3>
             {(filterHighRisk || filterEntangled) && (
               <button 
                 onClick={() => { setFilterHighRisk(false); setFilterEntangled(false); }}
                 className="text-[10px] text-[#E6E6E6] hover:text-white underline"
               >
                 ✕ Clear All
               </button>
             )}
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => setFilterHighRisk(!filterHighRisk)}
              className={`flex items-center gap-2 w-full text-xs font-medium transition-colors group ${filterHighRisk ? "text-white" : "text-[#E6E6E6] hover:text-[#6A0DAD]"}`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                filterHighRisk 
                  ? "bg-[#6A0DAD] border-[#6A0DAD] shadow-[0_0_8px_#6A0DAD]" 
                  : "bg-transparent border-[#E6E6E6] group-hover:border-[#6A0DAD]"
              }`}>
                {filterHighRisk && <Check className="w-3 h-3 text-white" />}
              </div>
              High Risk Only (&gt;60%)
            </button>
            
            <button 
              onClick={() => setFilterEntangled(!filterEntangled)}
              className={`flex items-center gap-2 w-full text-xs font-medium transition-colors group ${filterEntangled ? "text-white" : "text-[#E6E6E6] hover:text-[#6A0DAD]"}`}
            >
               <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                filterEntangled 
                  ? "bg-[#6A0DAD] border-[#6A0DAD] shadow-[0_0_8px_#6A0DAD]" 
                  : "bg-transparent border-[#E6E6E6] group-hover:border-[#6A0DAD]"
              }`}>
                {filterEntangled && <Check className="w-3 h-3 text-white" />}
              </div>
              With Entanglements
            </button>
          </div>

          {(filterHighRisk || filterEntangled) && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-3 py-1 bg-[#FF4444]/20 border border-[#FF4444] rounded-full text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
              Showing: {filteredCustomers.length} {filterHighRisk && filterEntangled ? "high-risk entangled" : filterHighRisk ? "high-risk" : "entangled"}
            </motion.div>
          )}
        </div>
      </div>

      {/* CENTER PANEL - Main Simulation */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(106,13,173,0.05),transparent_70%)] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🧪</span> QUANTUM INTERVENTION SIMULATOR
            </h2>
            <div className="mt-2 p-3 bg-[#141424] border border-[#2A2A3A] rounded-lg">
               <div className="flex items-center gap-2 text-xs font-medium text-[#E6E6E6] mb-1">
                 SIMULATING IMPACT FOR: <span className="text-white font-bold text-sm">{selectedCustomer.name}</span>
               </div>
               <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#E6E6E6]">
                 <div className="flex items-center gap-1">
                    Risk: <span className={`${selectedCustomer.risk > 60 ? "text-[#FF4444]" : "text-[#FF8C00]"} font-bold`}>{selectedCustomer.risk}%</span>
                 </div>
                 <div className="flex items-center gap-1">
                    Entanglement: <span className="text-white">{selectedCustomer.entanglements.length > 0 ? `${selectedCustomer.entanglements[0].relationship} ${selectedCustomer.entanglements[0].riskImpact}` : "None"}</span>
                 </div>
               </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#141424] border border-[#2A2A3A] text-xs font-mono text-[#E6E6E6]">
            ID: {selectedCustomer.id}
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-[#141424] border border-[#2A2A3A] rounded-xl p-5 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#8A2BE2]" />
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[#8A2BE2] font-bold flex items-center gap-2">
              <Zap className="w-4 h-4" /> RECOMMENDED ACTION
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setAiMessageIndex((prev) => (prev + 1) % 3)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-[#E6E6E6] transition-colors" title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-white/90 leading-relaxed text-sm">
             {getAiMessage()}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#E6E6E6]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00C853]" /> 92% match score</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6A0DAD]" /> Persona aligned</span>
          </div>
        </div>

        {/* Gauges */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-[#141424]/50 border border-[#2A2A3A] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#E6E6E6] mb-4">📉 RISK REDUCTION</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-white font-['JetBrains_Mono']">↓ {selectedStrategy.riskRed}%</span>
              <span className="text-xs font-medium text-[#E6E6E6] mb-1">projected</span>
            </div>
            <div className="h-2 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${selectedStrategy.riskRed}%` }}
                className="h-full bg-gradient-to-r from-[#0066FF] to-[#00C853]"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[#E6E6E6]">
              <span>Current: {selectedCustomer.risk}%</span>
              <span>Projected: {Math.max(0, selectedCustomer.risk - selectedStrategy.riskRed)}%</span>
            </div>
          </div>

          <div className="bg-[#141424]/50 border border-[#2A2A3A] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#E6E6E6] mb-4">🔮 CONFIDENCE SCORE</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-white font-['JetBrains_Mono']">
                {selectedCustomer.entanglements.length > 0 ? selectedStrategy.conf + 5 : selectedStrategy.conf}%
              </span>
              <span className="text-xs font-medium text-[#E6E6E6] mb-1">certainty</span>
            </div>
            <div className="h-2 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${selectedCustomer.entanglements.length > 0 ? selectedStrategy.conf + 5 : selectedStrategy.conf}%` }}
                className="h-full bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2]"
              />
            </div>
            <div className="mt-2 text-[10px] text-[#E6E6E6]">
              {selectedCustomer.entanglements.length > 0 ? "+5% boost from network analysis" : "Based on 156 similar cases"}
            </div>
          </div>
        </div>

        {/* Alternatives Table */}
        <div className="bg-[#141424] border border-[#2A2A3A] rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-[#2A2A3A] bg-[#0A0A14]/30">
            <h3 className="text-sm font-bold text-white">🔄 ALTERNATIVE ACTIONS</h3>
          </div>
          <div className="w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#E6E6E6] uppercase bg-[#1A1A2E]">
                <tr>
                  <th className="px-4 py-3 font-medium">Strategy</th>
                  <th className="px-4 py-3 font-medium">Risk ↓</th>
                  <th className="px-4 py-3 font-medium">Conf.</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A3A]">
                {STRATEGIES.map((strat) => (
                  <tr 
                    key={strat.id}
                    onClick={() => setSelectedStrategy(strat)}
                    className={`cursor-pointer transition-colors ${
                      selectedStrategy.id === strat.id 
                        ? "bg-[#6A0DAD]/20" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-white flex items-center gap-2 text-xs">
                      {strat.name}
                      {strat.id === "emi-holiday" && <span className="text-[10px] bg-[#6A0DAD] px-1.5 rounded text-white">REC</span>}
                    </td>
                    <td className="px-4 py-3 text-[#00C853] font-mono text-xs">{strat.riskRed}%</td>
                    <td className="px-4 py-3 text-[#E6E6E6] font-mono text-xs">{strat.conf}%</td>
                    <td className="px-4 py-3">
                      {selectedStrategy.id === strat.id && (
                        <div className="w-2 h-2 rounded-full bg-[#8A2BE2] shadow-[0_0_8px_#8A2BE2]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Execute Area */}
        <div className="mt-auto">
          {simulationStatus === "idle" && (
            <button
              onClick={handleExecute}
              className="w-full py-4 rounded-xl bg-[#0066FF] hover:bg-[#0055D4] text-white font-bold text-lg shadow-[0_8px_24px_rgba(0,102,255,0.4)] hover:shadow-[0_12px_32px_rgba(0,102,255,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              🚀 EXECUTE {selectedStrategy.name.toUpperCase()}
            </button>
          )}

          {simulationStatus === "simulating" && (
            <div className="w-full bg-[#141424] border border-[#2A2A3A] rounded-xl p-6 text-center">
              <h3 className="text-[#8A2BE2] font-bold mb-4 animate-pulse">⚡ SIMULATING QUANTUM INTERVENTION...</h3>
              <div className="h-4 w-full bg-[#2A2A3A] rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#0066FF] via-[#8A2BE2] to-[#0066FF]"
                  style={{ width: `${simulationProgress}%`, backgroundSize: "200% 100%" }}
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-xs text-[#E6E6E6] mt-3">Running Monte Carlo simulation ({simulationProgress}%)</p>
            </div>
          )}

          {simulationStatus === "complete" && result && (
            <div className="w-full bg-[#141424] border border-[#00C853]/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#00C853]" />
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#00C853] font-bold flex items-center gap-2">
                  <Check className="w-5 h-5" /> SIMULATION COMPLETE
                </h3>
                <button 
                  onClick={() => setSimulationStatus("idle")}
                  className="text-[#E6E6E6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20">
                  <div className="text-xs text-[#E6E6E6] uppercase">New Risk</div>
                  <div className="text-2xl font-bold text-white">{result.newRisk}%</div>
                  <div className="text-xs text-[#00C853]">↓ {result.riskReduction}% reduced</div>
                </div>
                {result.spouseImpact > 0 ? (
                  <div className="p-3 rounded-lg bg-[#6A0DAD]/10 border border-[#6A0DAD]/20">
                     <div className="text-xs text-[#E6E6E6] uppercase">Spouse Impact</div>
                     <div className="text-2xl font-bold text-white">-{result.spouseImpact}%</div>
                     <div className="text-xs text-[#8A2BE2]">Risk reduction</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#6A0DAD]/10 border border-[#6A0DAD]/20">
                    <div className="text-xs text-[#E6E6E6] uppercase">Est. Savings</div>
                    <div className="text-2xl font-bold text-white">{result.savings}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-[#00C853] hover:bg-[#00B048] text-white font-bold rounded-lg transition-colors">
                  APPLY TO CUSTOMER
                </button>
                <button className="px-4 py-2 border border-[#2A2A3A] hover:bg-white/5 text-[#E6E6E6] rounded-lg">
                  Export
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Quick Stats & History */}
      <div className="w-full lg:w-1/4 border-l border-[#2A2A3A] flex flex-col bg-[#0A0A14]/50">
        <div className="p-4 border-b border-[#2A2A3A]">
          <h2 className="text-xs font-semibold text-[#E6E6E6] flex items-center gap-2 uppercase tracking-wider">
            <History className="w-4 h-4" /> Recent Simulations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => {
                if (item.customerId) {
                  setSelectedCustomerId(item.customerId);
                  setResult(null);
                  setSimulationStatus("idle");
                }
              }}
              className="p-3 rounded-xl bg-[#141424] border border-[#2A2A3A] hover:border-[#6A0DAD]/50 transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-white text-xs">{item.customerName}</div>
                <div className="text-[10px] text-[#E6E6E6]">{item.timestamp}</div>
              </div>
              <div className="text-xs text-[#E6E6E6] mb-2">{item.strategy}</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[#00C853] text-xs font-mono font-bold">
                  ↓ {item.riskReduction}%
                </div>
                <div className="h-3 w-[1px] bg-[#2A2A3A]" />
                <div className="text-[10px] text-[#E6E6E6]">
                  {item.confidence}% conf.
                </div>
              </div>
            </div>
          ))}
          
          <button className="w-full py-2 text-xs text-[#8A2BE2] hover:text-white transition-colors">
            View All History →
          </button>
        </div>

        <div className="p-4 border-t border-[#2A2A3A] bg-[#141424]/30">
          <h3 className="text-xs font-semibold text-[#E6E6E6] mb-3 uppercase">Quantum Metrics</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-[#E6E6E6]">Avg Confidence</span>
                <span className="text-white">84%</span>
              </div>
              <div className="h-1.5 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
                <div className="h-full w-[84%] bg-[#6A0DAD]" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-[#E6E6E6]">Success Rate</span>
                <span className="text-white">78%</span>
              </div>
              <div className="h-1.5 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-[#00C853]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}