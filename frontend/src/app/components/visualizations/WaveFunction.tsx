import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceDot
} from "recharts";

const data = [
  { date: "Jan 15", default: 20, recovery: 80, event: "" },
  { date: "Jan 18", default: 25, recovery: 75, event: "" },
  { date: "Jan 19", default: 45, recovery: 55, event: "Salary delay detected" },
  { date: "Jan 21", default: 55, recovery: 45, event: "" },
  { date: "Jan 22", default: 65, recovery: 35, event: "Installed loan app ⚠️" },
  { date: "Jan 23", default: 60, recovery: 50, event: "Bank intervention ✅" },
  { date: "Jan 26", default: 40, recovery: 70, event: "" },
  { date: "Jan 29", default: 25, recovery: 85, event: "" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#141424] border border-[#6A0DAD] p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-white font-bold text-sm mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-[#FF4444] text-xs flex justify-between gap-4 font-['JetBrains_Mono']">
            <span>DEFAULT PROB:</span>
            <span>{payload[0].value}%</span>
          </p>
          <p className="text-[#00C853] text-xs flex justify-between gap-4 font-['JetBrains_Mono']">
            <span>RECOVERY PROB:</span>
            <span>{payload[1].value}%</span>
          </p>
        </div>
        {d.event && (
          <div className="mt-2 pt-2 border-t border-[#2A2A3A]">
            <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider">EVENT:</p>
            <p className="text-xs text-[#8A2BE2] font-bold">{d.event}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function WaveFunction() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          📈 PROBABILITY EVOLUTION - Amit Sharma
          <span className="text-[10px] font-normal text-[#B0B0C0] uppercase tracking-widest ml-4">Wave Function Collapse Path</span>
        </h2>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDefault" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#2A2A3A" 
              tick={{ fill: "#B0B0C0", fontSize: 10 }} 
            />
            <YAxis 
              stroke="#2A2A3A" 
              tick={{ fill: "#B0B0C0", fontSize: 10 }}
              label={{ value: "Probability %", angle: -90, position: "insideLeft", fill: "#B0B0C0", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine x="Jan 23" stroke="#8A2BE2" strokeDasharray="3 3" label={{ position: 'top', value: 'Intervention', fill: '#8A2BE2', fontSize: 10 }} />
            
            <Area 
              type="monotone" 
              dataKey="default" 
              stroke="#FF4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorDefault)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="recovery" 
              stroke="#00C853" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRecovery)" 
              animationDuration={1500}
            />

            {data.filter(d => d.event).map((d, i) => (
              <ReferenceDot 
                key={i}
                x={d.date} 
                y={d.default} 
                r={4} 
                fill="#FF4444" 
                stroke="#0A0A14" 
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-[#1A1A2A] rounded-lg p-3 border border-[#2A2A3A]">
          <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-1">State Transition</p>
          <div className="flex items-center gap-2">
            <span className="text-[#FF4444] font-bold">Critical</span>
            <span className="text-[#B0B0C0]">→</span>
            <span className="text-[#FFD700] font-bold">Warning</span>
          </div>
        </div>
        <div className="bg-[#1A1A2A] rounded-lg p-3 border border-[#2A2A3A]">
          <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-1">Intervention Impact</p>
          <p className="text-white font-bold">+35% Recovery Gain</p>
        </div>
        <div className="bg-[#1A1A2A] rounded-lg p-3 border border-[#2A2A3A]">
          <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider mb-1">Stability Forecast</p>
          <p className="text-[#00C853] font-bold">85% Success Path</p>
        </div>
      </div>
    </div>
  );
}