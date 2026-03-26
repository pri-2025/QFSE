import React from "react";
import { QuantumCard } from "./QuantumCard";
import { EntanglementMap } from "./visualizations/EntanglementMap";
import { WaveFunction } from "./visualizations/WaveFunction";
import { motion, AnimatePresence } from "motion/react";

interface CenterPanelProps {
  activeView: "entanglement" | "wave-function";
  setActiveView: (view: "entanglement" | "wave-function") => void;
  onSelectCustomer: (id: string) => void;
  selectedCustomerId: string | null;
}

export function CenterPanel({ activeView, setActiveView, onSelectCustomer, selectedCustomerId }: CenterPanelProps) {
  const tabs = [
    { id: "entanglement", label: "Entanglement Map", icon: "??" },
    { id: "wave-function", label: "Wave Function", icon: "??" },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex bg-[#141424] border border-[#2A2A3A] p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeView === tab.id ? 'bg-[#6A0DAD] text-white shadow-[0_2px_10px_rgba(106,13,173,0.3)]' : 'text-[#B0B0C0] hover:text-white'}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#B0B0C0] uppercase tracking-widest font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
          Live Evolution Monitor
        </div>
      </div>
      <QuantumCard className="flex-1 min-h-0 overflow-hidden p-0 relative border-none bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full min-h-0 bg-[#141424]/90 rounded-xl border border-[#6A0DAD]/20 overflow-hidden flex flex-col"
          >
            {activeView === "entanglement" && <EntanglementMap />}
            {activeView === "wave-function" && <WaveFunction />}
          </motion.div>
        </AnimatePresence>
      </QuantumCard>
    </div>
  );
}
