import React from "react";
import { QuantumCard } from "./QuantumCard";
import { DonutChart, DonutSegment } from "./DonutChart";
import { PersonaType, PERSONA_DATA, getPersonaColor } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from "recharts";
import { AlertCircle, Info, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const BUBBLE_DATA = Array.from({ length: 40 }).map((_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100,
  persona: PERSONA_DATA[Math.floor(Math.random() * PERSONA_DATA.length)],
}));

// Persona Donut Data
const PERSONA_DONUT_DATA: DonutSegment[] = [
  { 
    id: "salary-dependent", 
    label: "Salary-Dependent", 
    value: 468, 
    count: 468, 
    color: "#BD10E0", 
    emoji: "🟣",
    additionalInfo: "Avg Risk: 50% | ↑4% this week"
  },
  { 
    id: "credit-heavy", 
    label: "Credit-Heavy", 
    value: 351, 
    count: 351, 
    color: "#F5A623", 
    emoji: "🟡",
    additionalInfo: "Avg Risk: 70% | ↑3% this week"
  },
  { 
    id: "emergency-cash", 
    label: "Emergency Cash", 
    value: 263, 
    count: 263, 
    color: "#FF8C00", 
    emoji: "🟠",
    additionalInfo: "Avg Risk: 69% | ↑5% this week"
  },
  { 
    id: "silent-saver", 
    label: "Silent Saver", 
    value: 234, 
    count: 234, 
    color: "#4169E1", 
    emoji: "🔵",
    additionalInfo: "Avg Risk: 22% | ↑2% this week"
  },
  { 
    id: "paycheck-to-paycheck", 
    label: "Paycheck-to-Paycheck", 
    value: 146, 
    count: 146, 
    color: "#2E8B57", 
    emoji: "🟢",
    additionalInfo: "Avg Risk: 43% | ↑3% this week"
  }
];

// Risk State Donut Data
const RISK_STATE_DONUT_DATA: DonutSegment[] = [
  { 
    id: "imminent-default", 
    label: "Imminent Default", 
    value: 2, 
    count: 2, 
    color: "#FF4444", 
    emoji: "🔴",
    additionalInfo: "Requires immediate action"
  },
  { 
    id: "critical", 
    label: "Critical", 
    value: 4, 
    count: 4, 
    color: "#FF8C00", 
    emoji: "🟠",
    additionalInfo: "High priority intervention"
  },
  { 
    id: "warning", 
    label: "Warning", 
    value: 4, 
    count: 4, 
    color: "#FFD700", 
    emoji: "🟡",
    additionalInfo: "Monitor closely"
  },
  { 
    id: "early-stress", 
    label: "Early Stress", 
    value: 4, 
    count: 4, 
    color: "#4169E1", 
    emoji: "🔵",
    additionalInfo: "Preventive action recommended"
  },
  { 
    id: "healthy", 
    label: "Healthy", 
    value: 1, 
    count: 1, 
    color: "#2E8B57", 
    emoji: "⚪",
    additionalInfo: "Low risk, routine monitoring"
  }
];

interface ScreenPersonaViewProps {
  onSelectPersona: (persona: PersonaType) => void;
  onSelectRiskLevels?: (riskLevels: string[]) => void;
}

export function ScreenPersonaView({ onSelectPersona, onSelectRiskLevels }: ScreenPersonaViewProps) {
  const [selectedRiskLevels, setSelectedRiskLevels] = React.useState<string[]>([]);
  const [selectedPersonaSegment, setSelectedPersonaSegment] = React.useState<string | null>(null);
  const [selectedRiskSegment, setSelectedRiskSegment] = React.useState<string | null>(null);

  const toggleRiskLevel = (label: string) => {
    const newSelection = selectedRiskLevels.includes(label)
      ? selectedRiskLevels.filter(r => r !== label)
      : [...selectedRiskLevels, label];
    setSelectedRiskLevels(newSelection);
    if (onSelectRiskLevels && newSelection.length > 0) {
      onSelectRiskLevels(newSelection);
    }
  };

  const handlePersonaSegmentClick = (segment: DonutSegment) => {
    setSelectedPersonaSegment(segment.id === selectedPersonaSegment ? null : segment.id);
    // Map segment ID to PersonaType
    const personaMap: Record<string, PersonaType> = {
      "salary-dependent": "salary-dependent",
      "credit-heavy": "credit-heavy",
      "emergency-cash": "emergency-cash",
      "silent-saver": "silent-saver",
      "paycheck-to-paycheck": "paycheck-to-paycheck"
    };
    if (personaMap[segment.id]) {
      onSelectPersona(personaMap[segment.id]);
    }
  };

  const handleRiskSegmentClick = (segment: DonutSegment) => {
    setSelectedRiskSegment(segment.id === selectedRiskSegment ? null : segment.id);
    // Filter by risk level
    if (onSelectRiskLevels) {
      onSelectRiskLevels([segment.label]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-12 gap-6 p-6 h-full"
    >
      {/* Left Panel - 30% - Persona Distribution */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <QuantumCard title="" className="h-full" glow>
          <DonutChart
            data={PERSONA_DONUT_DATA}
            title="PERSONA DISTRIBUTION"
            centerLabel="CUSTOMERS"
            centerValue="1,462"
            onSegmentClick={handlePersonaSegmentClick}
            selectedSegmentId={selectedPersonaSegment}
            size={220}
            innerRadius={65}
            outerRadius={85}
            showLegend={true}
          />
        </QuantumCard>
      </div>

      {/* Center Panel - 45% - Persona Distribution Heat Map */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
        <QuantumCard title="PERSONA DISTRIBUTION HEAT MAP" className="h-full" glow>
          <div className="flex flex-col h-full">
            <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] mb-4 uppercase tracking-wider">
              HOVER ON ANY BUBBLE TO SEE CUSTOMER DETAILS
            </p>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
              <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">Legend:</span>
              {PERSONA_DATA.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">{p.emoji} {p.name}</span>
                </div>
              ))}
            </div>

            {/* Risk Scale Legend */}
            <div className="mb-6">
              <div className="flex justify-between items-center max-w-md">
                <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">Risk Score %:</span>
                <div className="flex gap-4 items-center">
                  {[0, 25, 50, 75, 100].map(val => (
                    <div key={val} className="flex flex-col items-center gap-1">
                      <div className="h-2 w-px bg-[#2A2A3A]" />
                      <span className="text-[10px] text-[#B0B0C0]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[400px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Time" 
                    stroke="#2A2A3A" 
                    tick={{ fill: "#E6E6E6", fontSize: 10 }}
                    label={{ value: "Early Time → Recent", position: "bottom", fill: "#E6E6E6", fontSize: 12, offset: 20 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Risk" 
                    stroke="#2A2A3A" 
                    tick={{ fill: "#E6E6E6", fontSize: 10 }}
                    label={{ value: "Risk Score %", angle: -90, position: "insideLeft", fill: "#E6E6E6", fontSize: 12, offset: -10 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#6A0DAD' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#141424] border border-[#6A0DAD] p-4 rounded-xl shadow-2xl backdrop-blur-md">
                            <p className="text-white font-bold text-sm mb-1">{data.persona.emoji} Amit Sharma</p>
                            <div className="space-y-1">
                              <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">Risk: {Math.round(data.y)}% | Loan: ₹2.5L</p>
                              <p className="text-[12px] font-medium leading-[16px] text-[#B0B0C0]">Signals: Salary delay, Savings withdrawal</p>
                              <button className="mt-2 text-[10px] text-[#6A0DAD] font-bold uppercase hover:underline">Click to view profile</button>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Customers" data={BUBBLE_DATA}>
                    {BUBBLE_DATA.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.persona.color} 
                        fillOpacity={0.7} 
                        stroke={entry.persona.color} 
                        strokeWidth={1}
                        className="cursor-pointer hover:fill-opacity-100 transition-all drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                        onClick={() => onSelectPersona(entry.persona.id as PersonaType)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </QuantumCard>
      </div>

      {/* Right Panel - 25% - Risk State Distribution */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <QuantumCard title="" className="h-full" glow>
          <DonutChart
            data={RISK_STATE_DONUT_DATA}
            title="RISK STATE DISTRIBUTION"
            centerLabel="CUSTOMERS"
            centerValue="15"
            onSegmentClick={handleRiskSegmentClick}
            selectedSegmentId={selectedRiskSegment}
            size={220}
            innerRadius={65}
            outerRadius={85}
            showLegend={true}
          />
          
          {/* Quick Actions */}
          <div className="mt-auto pt-6 border-t border-[#2A2A3A]">
            <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase mb-4 tracking-wider">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="py-2.5 px-4 bg-[#6A0DAD] text-white rounded-lg text-[12px] font-medium leading-[16px] hover:bg-[#8A2BE2] transition-all shadow-[0_0_15px_rgba(106,13,173,0.3)]"
                onClick={() => {
                  if (selectedRiskSegment) {
                    const segment = RISK_STATE_DONUT_DATA.find(s => s.id === selectedRiskSegment);
                    if (segment && onSelectRiskLevels) onSelectRiskLevels([segment.label]);
                  }
                }}
              >
                Apply Filter
              </button>
              <button 
                className="py-2.5 px-4 bg-white/5 border border-white/10 text-[#E6E6E6] rounded-lg text-[12px] font-medium leading-[16px] hover:bg-white/10 transition-all"
                onClick={() => {
                  setSelectedRiskSegment(null);
                  if (onSelectRiskLevels) onSelectRiskLevels([]);
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </QuantumCard>
      </div>
    </motion.div>
  );

}