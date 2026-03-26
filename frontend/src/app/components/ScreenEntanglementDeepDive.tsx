import React from "react";
import { QuantumCard } from "./QuantumCard";
import { Customer } from "../types";
import { ArrowLeft, Shield, AlertTriangle, Zap, TrendingUp, TrendingDown, Users } from "lucide-react";
import { motion } from "motion/react";

interface ScreenEntanglementDeepDiveProps {
  customer: Customer;
  onBack: () => void;
  onIntervene: () => void;
}

export function ScreenEntanglementDeepDive({ customer, onBack, onIntervene }: ScreenEntanglementDeepDiveProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen flex flex-col p-4 gap-4"
    >
      <header className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-[#E6E6E6] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              🔗 ENTANGLEMENT CASCADE ANALYSIS
              <span className="text-sm font-normal text-[#E6E6E6]">{customer.name}</span>
            </h2>
          </div>
        </div>
        <button 
          onClick={onIntervene}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#FF4444] text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#FF6666] transition-all shadow-[0_0_20px_rgba(255,68,68,0.3)] animate-pulse"
        >
          <Zap className="w-4 h-4" /> Intervene Now
        </button>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
          <QuantumCard className="flex-1" glow title="SOCIAL-FINANCIAL TOPOLOGY">
            <div className="h-full w-full flex flex-col items-center justify-center relative bg-[#0A0A14]/50 rounded-xl overflow-hidden border border-[#2A2A3A]">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(106,13,173,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              
              {/* Center Node (Root) */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#FF4444]/20 border-2 border-[#FF4444] flex items-center justify-center shadow-[0_0_30px_rgba(255,68,68,0.4)]">
                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF4444] to-[#8B0000] flex items-center justify-center text-white text-xl font-bold border border-white/20">
                    {customer.name[0]}
                   </div>
                   <div className="absolute -top-2 -right-2 bg-[#FF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#0A0A14]">{customer.risk}%</div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-white">{customer.name}</p>
                  <p className="text-xs font-bold text-[#FF4444] uppercase tracking-wide">{customer.riskLevel}</p>
                </div>
              </div>

              {/* Connections and Leaves */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <svg className="w-full h-full">
                  {/* Connectors */}
                  <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="#FF8C00" strokeWidth="2" strokeDasharray="4,4" className="animate-[pulse_2s_infinite]" />
                  <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="#FFD700" strokeWidth="2" strokeDasharray="4,4" className="animate-[pulse_2.5s_infinite]" />
                  <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#4169E1" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
                
                {/* Spouse Node */}
                <div className="absolute top-[30%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF8C00]/20 border border-[#FF8C00] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-sm font-bold">M</div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">Spouse (Meera)</p>
                    <p className="text-xs text-[#FF8C00] font-bold">45% Risk</p>
                  </div>
                </div>

                {/* Parent Node */}
                <div className="absolute top-[30%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-sm font-bold">S</div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">Parent (Suresh)</p>
                    <p className="text-xs text-[#FFD700] font-bold">32% Risk</p>
                  </div>
                </div>

                {/* Child Node */}
                <div className="absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#4169E1]/20 border border-[#4169E1] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-sm font-bold">A</div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">Child (Aarav)</p>
                    <p className="text-xs text-[#4169E1] font-bold">15% Risk</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs uppercase font-bold tracking-wide text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4444] animate-ping" /> Root Stress Node
                </div>
                <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs uppercase font-bold tracking-wide text-[#E6E6E6] flex items-center gap-2">
                   Entangled Node
                </div>
              </div>
            </div>
          </QuantumCard>

          <div className="grid grid-cols-2 gap-4 shrink-0">
             <div className="p-4 bg-[#FF4444]/5 border border-[#FF4444]/20 rounded-xl">
                <p className="text-xs font-bold text-[#FF4444] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> IF NO INTERVENTION
                </p>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold"><span className="text-[#E6E6E6]">Rajesh:</span> <span className="text-white">88% → 95% <span className="text-[#FF4444] ml-2">(DEFAULT)</span></span></div>
                   <div className="flex justify-between text-xs font-bold"><span className="text-[#E6E6E6]">Spouse:</span> <span className="text-white">45% → 68% <span className="text-[#FF8C00] ml-2">(CRITICAL)</span></span></div>
                   <div className="flex justify-between text-xs font-bold"><span className="text-[#E6E6E6]">Parent:</span> <span className="text-white">32% → 51% <span className="text-[#FFD700] ml-2">(WARNING)</span></span></div>
                </div>
             </div>
             <div className="p-4 bg-[#00C853]/5 border border-[#00C853]/20 rounded-xl">
                <p className="text-xs font-bold text-[#00C853] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> IF INTERVENE NOW
                </p>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold"><span className="text-[#E6E6E6]">Rajesh:</span> <span className="text-white">88% → 25% <span className="text-[#00C853] ml-2">(RECOVERY)</span></span></div>
                   <div className="flex justify-between text-xs font-bold"><span className="text-[#E6E6E6]">Spouse:</span> <span className="text-white">45% → 22% <span className="text-[#00C853] ml-2">(STABLE)</span></span></div>
                   <div className="flex justify-between text-xs font-bold"><span className="text-[#E6E6E6]">Parent:</span> <span className="text-white">32% → 18% <span className="text-[#00C853] ml-2">(HEALTHY)</span></span></div>
                </div>
             </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
          <QuantumCard title="📊 CASCADE PROJECTION" glow>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-white uppercase mb-4 tracking-wide">Portfolio Risk Impact</p>
                <div className="flex items-center justify-center py-8 relative">
                   <div className="text-center">
                     <p className="text-4xl font-['JetBrains_Mono'] font-bold text-[#FF4444]">₹12.8L</p>
                     <p className="text-xs text-[#E6E6E6] uppercase font-bold tracking-wide mt-1">Total Systemic Exposure</p>
                   </div>
                </div>
              </div>
              
              <div className="space-y-4">
                 <p className="text-xs font-bold text-[#E6E6E6] uppercase tracking-wide">Root Cause Probability</p>
                 <div className="space-y-3">
                   {[
                     { label: "Salary Gaps", val: 82, color: "#8A2BE2" },
                     { label: "Family Medical", val: 12, color: "#FF8C00" },
                     { label: "Business Stress", val: 6, color: "#4169E1" },
                   ].map((item, i) => (
                     <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-white uppercase"><span>{item.label}</span><span>{item.val}%</span></div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
                        </div>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
                 <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-[#8A2BE2]" />
                    <span className="text-xs font-bold text-white uppercase">Systemic Stability</span>
                 </div>
                 <p className="text-xs text-[#E6E6E6] leading-relaxed">By stabilizing <span className="text-white font-bold">Rajesh</span>, we prevent a potential default cascade across <span className="text-white font-bold">4 connected individuals</span>, reducing aggregate cluster entropy by <span className="text-[#00C853] font-bold">34%</span>.</p>
              </div>
            </div>
            <button 
              onClick={onIntervene}
              className="w-full mt-6 py-4 bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] rounded-xl text-xs font-bold uppercase tracking-wide text-white hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all flex items-center justify-center gap-2"
            >
              Apply Intervention to Root Node
            </button>
          </QuantumCard>
          
          <div className="p-4 bg-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-xl flex items-center gap-4">
             <div className="p-2 bg-[#FF8C00]/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#FF8C00]" />
             </div>
             <div>
                <p className="text-xs font-bold text-white uppercase">Critical Sensitivity</p>
                <p className="text-xs text-[#E6E6E6]">This node has high entanglement coefficient (0.84). Early observation required.</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}