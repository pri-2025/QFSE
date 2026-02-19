import React from "react";
import { QuantumCard } from "./QuantumCard";
import { Users, Calendar, AlertCircle, Eye, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function LeftPanel() {
  const riskLevels = [
    { label: "Imminent Default", count: 48, color: "#FF4444", checked: true },
    { label: "Critical", count: 156, color: "#FF8C00", checked: true },
    { label: "Warning", count: 324, color: "#FFD700", checked: true },
    { label: "Early Stress", count: 892, color: "#4169E1", checked: true },
    { label: "Healthy", count: 15234, color: "#2E8B57", checked: false },
  ];

  const personas = [
    { label: "Salary-Dependent Struggler", count: 234, progress: 45, checked: true },
    { label: "Credit-Heavy Overuser", count: 156, progress: 30, checked: true },
    { label: "Emergency Cash Withdrawer", count: 89, progress: 18, checked: true },
    { label: "Silent Saver Drain", count: 167, progress: 32, checked: true },
    { label: "Paycheck-to-Paycheck Survivor", count: 445, progress: 65, checked: false },
  ];

  const pieData = [
    { name: "S-D Struggler", value: 234, color: "#6A0DAD" },
    { name: "C-H Overuser", value: 156, color: "#8A2BE2" },
    { name: "E-C Withdrawer", value: 89, color: "#4169E1" },
    { name: "S-S Drain", value: 167, color: "#FF8C00" },
    { name: "P-P Survivor", value: 445, color: "#FF4444" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-4">
      {/* Quantum State Filter Card */}
      <QuantumCard title="🌀 SUPERPOSITION VIEW" glow>
        <div className="space-y-3">
          {riskLevels.map((risk, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${risk.checked ? 'bg-[#6A0DAD] border-[#6A0DAD]' : 'border-[#2A2A3A] group-hover:border-[#6A0DAD]'}`}
                >
                  {risk.checked && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-xs text-[#B0B0C0] group-hover:text-white transition-colors">{risk.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: risk.color, backgroundColor: risk.color }} />
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#B0B0C0]">{risk.count.toLocaleString()}</span>
              </div>
            </div>
          ))}
          
          <div className="h-24 w-full mt-4">
            <ResponsiveContainer width="100%" height={96}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </QuantumCard>

      {/* Stress Personas Card */}
      <QuantumCard title="👥 STRESS PERSONAS" icon={<Users className="w-4 h-4" />}>
        <div className="space-y-4">
          {personas.map((persona, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-[#B0B0C0] uppercase tracking-wide">
                <span>{persona.label}</span>
                <span className="text-white">{persona.count}</span>
              </div>
              <div className="h-1 w-full bg-[#1A1A2A] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2]" 
                  style={{ width: `${persona.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </QuantumCard>

      {/* Time Horizon Card */}
      <QuantumCard title="📅 TIME HORIZON" icon={<Calendar className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-2">
          {['⚡ Real-time', '🔮 Next 7 days', '📊 Next 30 days', '📈 Historical'].map((time, i) => (
            <button 
              key={i}
              className={`text-[10px] py-2 px-3 rounded-lg border transition-all ${i === 0 ? 'bg-[#6A0DAD]/20 border-[#6A0DAD]/40 text-white' : 'border-[#2A2A3A] text-[#B0B0C0] hover:border-[#6A0DAD]/20'}`}
            >
              {time}
            </button>
          ))}
        </div>
      </QuantumCard>

      {/* Observation Queue Card */}
      <QuantumCard title="🚨 OBSERVATION QUEUE" glow icon={<Eye className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#FF4444]/10 border border-[#FF4444]/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF4444]" />
              <span className="text-xs text-white">Immediate Action</span>
            </div>
            <span className="text-sm font-bold font-['JetBrains_Mono']">12</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#FF8C00]/10 border border-[#FF8C00]/20">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF8C00]" />
              <span className="text-xs text-white">Today</span>
            </div>
            <span className="text-sm font-bold font-['JetBrains_Mono']">45</span>
          </div>
          <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-[#B0B0C0] hover:text-white transition-colors">
            View Full Queue
          </button>
        </div>
      </QuantumCard>
    </div>
  );
}