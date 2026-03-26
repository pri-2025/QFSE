import React from "react";
import { motion } from "motion/react";
import { QuantumCard } from "./QuantumCard";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Shield, Target, Cpu } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line
} from "recharts";

const performanceData = [
  { month: "Sep", success: 65, default: 35 },
  { month: "Oct", success: 68, default: 32 },
  { month: "Nov", success: 72, default: 28 },
  { month: "Dec", success: 75, default: 25 },
  { month: "Jan", success: 78, default: 22 },
  { month: "Feb", success: 82, default: 18 },
];

const riskDistribution = [
  { persona: "S-D Struggler", prevented: 45, actual: 12 },
  { persona: "C-H Overuser", prevented: 38, actual: 15 },
  { persona: "E-C Withdrawer", prevented: 22, actual: 8 },
  { persona: "S-S Drain", prevented: 29, actual: 11 },
  { persona: "P-P Survivor", prevented: 52, actual: 20 },
];

export function Analytics({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-[#0A0A14] overflow-hidden"
    >
      <header className="h-16 border-b border-[#2A2A3A] flex items-center px-6 justify-between bg-[#141424]/40">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full text-[#B0B0C0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">ANALYTICS DEEP-DIVE</h1>
            <p className="text-[10px] text-[#B0B0C0] uppercase tracking-widest mt-1">Hamiltonian Recalibration Dashboard</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 text-[#8A2BE2] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3 h-3" /> Model: Quantum-GPT-4v
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#00C853]/10 border border-[#00C853]/30 text-[#00C853] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3 h-3" /> State: Optimized
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <QuantumCard title="ROI MULTIPLIER" glow className="py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-['JetBrains_Mono'] font-bold text-white">27.4x</span>
              <span className="text-[#00C853] text-xs font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +12%</span>
            </div>
            <p className="text-[10px] text-[#B0B0C0] mt-1 uppercase tracking-wider">Per Intervention Cost/Benefit</p>
          </QuantumCard>
          
          <QuantumCard title="PORTFOLIO HEALTH" className="py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-['JetBrains_Mono'] font-bold text-white">92.8</span>
              <span className="text-[#00C853] text-xs font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +4.2</span>
            </div>
            <p className="text-[10px] text-[#B0B0C0] mt-1 uppercase tracking-wider">Aggregate Stability Index</p>
          </QuantumCard>

          <QuantumCard title="TOTAL DEFAULTS PREVENTED" className="py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-['JetBrains_Mono'] font-bold text-[#FF8C00]">₹12.4Cr</span>
            </div>
            <p className="text-[10px] text-[#B0B0C0] mt-1 uppercase tracking-wider">Lifetime Platform Impact</p>
          </QuantumCard>

          <QuantumCard title="INTERVENTION SUCCESS" className="py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-['JetBrains_Mono'] font-bold text-[#4169E1]">81%</span>
              <span className="text-[#00C853] text-xs font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +3%</span>
            </div>
            <p className="text-[10px] text-[#B0B0C0] mt-1 uppercase tracking-wider">Last 30 Days Benchmark</p>
          </QuantumCard>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Success Trend */}
          <QuantumCard title="📈 LONG-TERM STABILITY TREND" icon={<TrendingUp className="w-4 h-4" />}>
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="month" stroke="#B0B0C0" fontSize={10} />
                  <YAxis stroke="#B0B0C0" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141424', borderColor: '#6A0DAD', color: '#fff' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="success" name="Recovery Rate %" stroke="#00C853" strokeWidth={3} dot={{ fill: '#00C853' }} />
                  <Line type="monotone" dataKey="default" name="Default Rate %" stroke="#FF4444" strokeWidth={3} dot={{ fill: '#FF4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </QuantumCard>

          {/* Persona Impact */}
          <QuantumCard title="🎯 IMPACT BY STRESS PERSONA" icon={<Target className="w-4 h-4" />}>
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="persona" stroke="#B0B0C0" fontSize={10} />
                  <YAxis stroke="#B0B0C0" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141424', borderColor: '#6A0DAD', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="prevented" name="Defaults Prevented" fill="#6A0DAD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Defaults" fill="#FF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </QuantumCard>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <QuantumCard title="🔗 CASCADE REDUCTION" icon={<Shield className="w-4 h-4" />}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold font-['JetBrains_Mono']">428</div>
              <div className="text-[#00C853] text-xs font-bold">-18% Cluster Growth</div>
            </div>
            <p className="text-[10px] text-[#B0B0C0] leading-relaxed">
              Detection and isolation of secondary stress nodes has reduced systemic risk propagation by 18% month-over-month.
            </p>
          </QuantumCard>

          <QuantumCard title="⚡ REACTION LATENCY" icon={<Activity className="w-4 h-4" />}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold font-['JetBrains_Mono']">4.2m</div>
              <div className="text-[#00C853] text-xs font-bold">-1.5m Detection Speed</div>
            </div>
            <p className="text-[10px] text-[#B0B0C0] leading-relaxed">
              Average time from signal detection to intervention trigger. Quantum monitoring enables predictive actions before actual default events.
            </p>
          </QuantumCard>

          <QuantumCard title="🧬 MODEL ENTROPY" icon={<Cpu className="w-4 h-4" />}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold font-['JetBrains_Mono']">0.024</div>
              <div className="text-[#00C853] text-xs font-bold">Stable Convergence</div>
            </div>
            <p className="text-[10px] text-[#B0B0C0] leading-relaxed">
              The Hamiltonian recalibration process has achieved high convergence stability, ensuring consistent risk assessment across all personas.
            </p>
          </QuantumCard>
        </div>
      </main>
    </motion.div>
  );
}