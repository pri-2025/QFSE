import React from "react";
import { motion } from "motion/react";
import { RefreshCcw, Play, Pause } from "lucide-react";

export function Ticker() {
  const updates = [
    "2 mins ago: Priya Mehta moved to Warning (52%) 🔶",
    "5 mins ago: Intervention sent to Rajesh ✓",
    "8 mins ago: Kavita's recovery probability ↑ 85% ✨",
    "12 mins ago: New entanglement cluster detected (4 nodes) 🔗",
    "15 mins ago: EMI payment detected for Vikram Singh (Stable) 🟢",
    "18 mins ago: Model recalibration complete (Entropy reduced -0.04) 🧬",
  ];

  return (
    <div className="h-10 bg-[#0A0A14] border-t border-[#2A2A3A] flex items-center px-4 gap-4 overflow-hidden z-20">
      <div className="flex items-center gap-2 shrink-0 border-r border-[#2A2A3A] pr-4">
        <RefreshCcw className="w-3 h-3 text-[#8A2BE2] animate-spin-slow" />
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">WAVE FUNCTION UPDATES</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 items-center"
        >
          {updates.concat(updates).map((text, i) => (
            <span key={i} className="text-[11px] text-[#B0B0C0] font-['JetBrains_Mono']">
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 shrink-0 border-l border-[#2A2A3A] pl-4">
        <button className="p-1 hover:text-[#8A2BE2] text-[#B0B0C0] transition-colors">
          <Pause className="w-3 h-3" />
        </button>
        <div className="w-[1px] h-3 bg-[#2A2A3A]" />
        <span className="text-[9px] font-bold text-[#B0B0C0] uppercase">Live Feed</span>
      </div>
    </div>
  );
}
