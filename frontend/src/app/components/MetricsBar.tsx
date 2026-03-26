import React from "react";
import { Users, Percent, CheckCircle, TrendingDown, ArrowDownRight } from "lucide-react";

export function MetricsBar() {
  const metrics = [
    { label: "TOTAL CUSTOMERS", value: "1,462", icon: <Users className="w-4 h-4" />, color: "text-[#8A2BE2]" },
    { label: "AVG RISK SCORE", value: "54%", icon: <Percent className="w-4 h-4" />, color: "text-[#FFD700]", trend: <TrendingDown className="w-4 h-4 text-[#00C853]" /> },
    { label: "INTERVENTIONS (7D)", value: "87", icon: <CheckCircle className="w-4 h-4" />, color: "text-[#00C853]" },
    { label: "SUCCESS RATE", value: "78%", icon: <Percent className="w-4 h-4" />, color: "text-[#4169E1]" },
    { label: "RISK REDUCTION", value: "-23%", icon: <ArrowDownRight className="w-4 h-4" />, color: "text-[#00C853]" },
  ];

  return (
    <div className="h-14 bg-[#0A0A14] border-b border-[#2A2A3A] flex items-center px-6 overflow-x-auto no-scrollbar gap-8 shrink-0">
      {metrics.map((m, i) => (
        <div key={i} className="flex items-center gap-3 whitespace-nowrap">
          <div className={`p-1.5 rounded-lg bg-white/5 ${m.color}`}>
            {m.icon}
          </div>
          <div>
            <p className="text-xs text-[#E6E6E6] font-medium uppercase tracking-wide">{m.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-['JetBrains_Mono'] font-bold text-white leading-none">{m.value}</span>
              {m.trend && <span>{m.trend}</span>}
            </div>
          </div>
          {i < metrics.length - 1 && <div className="h-6 w-[1px] bg-[#2A2A3A] ml-8" />}
        </div>
      ))}
    </div>
  );
}