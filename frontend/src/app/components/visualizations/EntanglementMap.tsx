import React from "react";
import { motion } from "motion/react";
import { Shield, AlertTriangle, Zap } from "lucide-react";

export function EntanglementMap() {
  const nodes = [
    { id: "rajesh", label: "Rajesh (70%)", x: 400, y: 250, size: 80, color: "#FF4444", status: "Critical" },
    { id: "wife", label: "Wife (60%)", x: 600, y: 150, size: 60, color: "#FF8C00", status: "At Risk" },
    { id: "father", label: "Father (45%)", x: 600, y: 350, size: 50, color: "#FFD700", status: "Warning" },
    { id: "brother", label: "Brother (30%)", x: 200, y: 150, size: 45, color: "#4169E1", status: "Stable" },
    { id: "sister", label: "Sister (20%)", x: 200, y: 350, size: 40, color: "#4169E1", status: "Healthy" },
  ];

  const connections = [
    { from: "rajesh", to: "wife", type: "solid" },
    { from: "rajesh", to: "father", type: "solid" },
    { from: "rajesh", to: "brother", type: "dashed" },
    { from: "rajesh", to: "sister", type: "dotted" },
    { from: "wife", to: "father", type: "dotted" },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 relative">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🔗 QUANTUM ENTANGLEMENT NETWORK
            <span className="text-[10px] font-normal text-[#B0B0C0] uppercase tracking-widest ml-4">GNN Cascade Detection</span>
          </h2>
          <p className="text-xs text-[#B0B0C0] mt-1">Stress propagation across connected social-financial nodes.</p>
        </div>
        <button className="bg-[#6A0DAD]/20 border border-[#6A0DAD]/40 text-[#8A2BE2] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#6A0DAD]/30 transition-all flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Show Propagation Simulation
        </button>
      </div>

      <div className="flex-1 min-h-0 relative bg-[#0A0A14]/50 rounded-xl overflow-hidden border border-[#2A2A3A]">
        <svg viewBox="0 0 800 500" className="w-full h-full">
          {/* Grid lines in SVG */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(106,13,173,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.from)!;
            const toNode = nodes.find(n => n.id === conn.to)!;
            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={fromNode.color}
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray={conn.type === "dashed" ? "8,8" : conn.type === "dotted" ? "2,4" : "0"}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={i}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                cx={node.x}
                cy={node.y}
                r={node.size / 2}
                fill={node.color}
                fillOpacity="0.2"
                stroke={node.color}
                strokeWidth="2"
                className={node.id === 'rajesh' ? 'animate-pulse' : ''}
              />
              {node.id === 'rajesh' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2 + 5}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  className="animate-[spin_10s_linear_infinite]"
                />
              )}
              <text
                x={node.x}
                y={node.y + node.size / 2 + 20}
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y + node.size / 2 + 35}
                fill="#B0B0C0"
                fontSize="10"
                textAnchor="middle"
              >
                {node.status}
              </text>
            </g>
          ))}
        </svg>

        {/* Alert Banner */}
        <div className="absolute bottom-4 left-4 right-4 bg-[#FF8C00]/10 border border-[#FF8C00]/30 backdrop-blur-md p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF8C00]/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">⚠️ CASCADE ALERT DETECTED</p>
              <p className="text-[10px] text-[#B0B0C0]">Intervening on <span className="text-white font-bold">Rajesh</span> will stabilize 4 connected individuals in his network.</p>
            </div>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase px-4 py-2 rounded transition-colors">
            Stabilize Network
          </button>
        </div>
      </div>
    </div>
  );
}
