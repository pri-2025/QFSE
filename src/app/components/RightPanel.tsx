import React from "react";
import { QuantumCard } from "./QuantumCard";
import { User, Phone, Mail, ArrowRight, Share2, MessageSquare, Zap, Clock, Shield } from "lucide-react";

interface RightPanelProps {
  customer: any;
  onOpenMessageModal: () => void;
}

export function RightPanel({ customer, onOpenMessageModal }: RightPanelProps) {
  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-4">
      <QuantumCard title="QUANTUM STATE PROFILE" glow className="flex-none">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {customer.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{customer.name}</h2>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2 text-xs text-[#B0B0C0]">
                <Mail className="w-3 h-3" /> {customer.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#B0B0C0]">
                <Phone className="w-3 h-3" /> {customer.phone}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#B0B0C0] uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8A2BE2]" />
                Current Superposition
              </span>
              <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> Updated 2m ago
              </span>
            </div>
            
            <div className="space-y-2 bg-[#0A0A14] p-3 rounded-lg border border-[#2A2A3A]">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#B0B0C0]">
                  <span>RECOVERY</span>
                  <span className="text-[#00C853] font-bold">{customer.states.recovery}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00C853]" style={{ width: `${customer.states.recovery}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#B0B0C0]">
                  <span>STRUGGLE</span>
                  <span className="text-[#FFD700] font-bold">{customer.states.struggle}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFD700]" style={{ width: `${customer.states.struggle}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#B0B0C0]">
                  <span>DEFAULT</span>
                  <span className="text-[#FF4444] font-bold">{customer.states.default}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF4444]" style={{ width: `${customer.states.default}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#1A1A2A] p-2 rounded-lg border border-[#2A2A3A]">
              <p className="text-[9px] text-[#B0B0C0] uppercase">Persona</p>
              <p className="text-[10px] font-bold text-white mt-1 leading-tight">{customer.persona}</p>
            </div>
            <div className="bg-[#1A1A2A] p-2 rounded-lg border border-[#2A2A3A]">
              <p className="text-[9px] text-[#B0B0C0] uppercase">Loan</p>
              <div className="text-[10px] font-bold text-white mt-1 leading-tight">
                {customer.loanAmount}
                <div className="text-[8px] font-normal text-[#B0B0C0]">{customer.loanType}</div>
              </div>
            </div>
          </div>
        </div>
      </QuantumCard>

      <QuantumCard title="🚨 ACTIVE SIGNALS" icon={<Zap className="w-4 h-4" />} className="flex-none">
        <div className="space-y-2">
          {customer.signals.map((signal: any) => (
            <div 
              key={signal.id} 
              className={`p-2 rounded-lg border text-[11px] flex items-center gap-3 ${
                signal.type === 'critical' ? 'bg-[#FF4444]/10 border-[#FF4444]/30 text-white' : 
                signal.type === 'warning' ? 'bg-[#FF8C00]/10 border-[#FF8C00]/30 text-white' : 
                'bg-[#4169E1]/10 border-[#4169E1]/30 text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                signal.type === 'critical' ? 'bg-[#FF4444]' : 
                signal.type === 'warning' ? 'bg-[#FF8C00]' : 
                'bg-[#4169E1]'
              }`} />
              {signal.text}
            </div>
          ))}
        </div>
      </QuantumCard>

      <QuantumCard title="🔗 ENTANGLEMENT" icon={<Share2 className="w-4 h-4" />} className="flex-none">
        <div className="space-y-3">
          {customer.entanglements.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-1 rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">
                  {e.name.split(' ')[0][0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{e.name}</p>
                  <p className="text-[9px] text-[#B0B0C0] uppercase mt-1">
                    {e.role ? e.role : `linked ${e.riskImpact} risk`}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3 h-3 text-[#B0B0C0] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          <button className="w-full mt-2 text-[10px] font-bold uppercase tracking-widest text-[#8A2BE2] hover:text-white transition-colors flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" /> View Full Network
          </button>
        </div>
      </QuantumCard>

      <QuantumCard title="💬 COHERENT OUTREACH" icon={<MessageSquare className="w-4 h-4" />} glow className="flex-none">
        <div className="space-y-3">
          <div className="bg-[#0A0A14] p-3 rounded-lg border border-[#6A0DAD]/30 text-[11px] leading-relaxed italic text-[#B0B0C0]">
            "Hi Amit, we noticed a potential delay in your income flow. At Barclays, we prioritize your stability. We've pre-approved a temporary 30-day EMI deferral to help you manage this transition. Click to activate..."
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onOpenMessageModal}
              className="flex-1 bg-[#6A0DAD] hover:bg-[#8A2BE2] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-[0_4px_15px_rgba(106,13,173,0.3)]"
            >
              Send Now
            </button>
            <button 
              onClick={onOpenMessageModal}
              className="w-10 flex items-center justify-center bg-[#1A1A2A] hover:bg-[#2A2A3A] border border-[#2A2A3A] rounded-lg text-white transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </QuantumCard>
    </div>
  );
}