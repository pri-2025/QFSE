import React from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

const data = Array.from({ length: 45 }).map((_, i) => ({
  id: `customer-${i}`,
  name: i === 0 ? "Amit Sharma" : `Customer ${i}`,
  risk: Math.random() * 100,
  time: Math.random() * 100,
  amount: Math.random() * 10 + 1, // Proportional to loan amount
  color: ""
}));

// Assign colors based on risk
data.forEach(d => {
  if (d.risk > 80) d.color = "#FF4444";
  else if (d.risk > 60) d.color = "#FF8C00";
  else if (d.risk > 40) d.color = "#FFD700";
  else if (d.risk > 20) d.color = "#4169E1";
  else d.color = "#2E8B57";
});

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#141424] border border-[#6A0DAD] p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-white font-bold text-sm mb-1">{d.name}</p>
        <p className="text-[#B0B0C0] text-[10px] uppercase">Risk Level: <span style={{ color: d.color }}>{d.risk.toFixed(1)}%</span></p>
        <p className="text-[#B0B0C0] text-[10px] uppercase">Loan: ₹{(d.amount * 100000).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function HeatMap({ onSelectCustomer, selectedId }: { onSelectCustomer: (id: string) => void, selectedId?: string }) {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🌡️ PROBABILITY AMPLITUDE HEAT MAP
          <span className="text-[10px] font-normal text-[#B0B0C0] uppercase tracking-widest ml-4">Real-time Superposition State</span>
        </h2>
      </div>

      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="time" 
              name="time" 
              unit="ms" 
              stroke="#2A2A3A"
              tick={{ fill: "#B0B0C0", fontSize: 10 }}
              label={{ value: "Temporal Evolution →", position: "bottom", fill: "#B0B0C0", fontSize: 10, offset: 20 }}
            />
            <YAxis 
              type="number" 
              dataKey="risk" 
              name="risk" 
              unit="%" 
              stroke="#2A2A3A"
              tick={{ fill: "#B0B0C0", fontSize: 10 }}
              label={{ value: "Risk Level", angle: -90, position: "left", fill: "#B0B0C0", fontSize: 10, offset: 10 }}
            />
            <ZAxis type="number" dataKey="amount" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#6A0DAD' }} />
            <Scatter 
              name="Customers" 
              data={data} 
              onClick={(e) => onSelectCustomer(e.id)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  fillOpacity={entry.id === selectedId ? 1 : 0.6}
                  stroke={entry.id === selectedId ? "#fff" : entry.color}
                  strokeWidth={entry.id === selectedId ? 3 : 2}
                  className="hover:fill-opacity-100 transition-all duration-300 drop-shadow-[0_0_8px_rgba(106,13,173,0.5)]"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#2A2A3A] pt-4 text-[10px] text-[#B0B0C0] uppercase tracking-widest">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4444] inline-block" /> Imminent</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF8C00] inline-block" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block" /> Warning</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4169E1] inline-block" /> Stress</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2E8B57] inline-block" /> Healthy</span>
        </div>
        <div>N = 1,420 Quantum States Observed</div>
      </div>
    </div>
  );
}