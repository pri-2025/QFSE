import React from "react";
import { Header } from "../common/Header";
import { MetricsBar } from "./MetricsBar";
import { QuantumCard } from "../common/QuantumCard";
import { CUSTOMERS } from "../../types";
import { Zap, Menu, Bell, User, LayoutDashboard, Search, ChevronRight } from "lucide-react";

export function MobileDashboard() {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A14] overflow-hidden lg:hidden">
      {/* Mobile Top Bar */}
      <header className="h-16 border-b border-[#2A2A3A] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
           <Zap className="w-6 h-6 text-[#8A2BE2]" />
           <span className="font-bold text-white uppercase tracking-tight text-sm">Quantum Command</span>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-[#B0B0C0]" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center text-[10px] font-bold">SC</div>
        </div>
      </header>

      {/* Metrics Scroll */}
      <div className="h-14 border-b border-[#2A2A3A] flex items-center px-4 overflow-x-auto no-scrollbar gap-6 shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[9px] text-[#B0B0C0] uppercase font-bold">Risk</div>
          <div className="text-sm font-['JetBrains_Mono'] font-bold text-white">32%</div>
        </div>
        <div className="w-[1px] h-4 bg-[#2A2A3A]" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[9px] text-[#B0B0C0] uppercase font-bold">In Sup-Pos</div>
          <div className="text-sm font-['JetBrains_Mono'] font-bold text-white">1,420</div>
        </div>
        <div className="w-[1px] h-4 bg-[#2A2A3A]" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[9px] text-[#B0B0C0] uppercase font-bold">Success</div>
          <div className="text-sm font-['JetBrains_Mono'] font-bold text-[#00C853]">78%</div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
           <LayoutDashboard className="w-4 h-4 text-[#8A2BE2]" /> At-Risk Customers
        </h2>

        {CUSTOMERS.slice(0, 5).map((customer) => (
          <div key={customer.id} className="bg-[#141424] border border-[#2A2A3A] rounded-xl p-4 relative overflow-hidden">
             <div 
                className="absolute left-0 top-0 bottom-0 w-1" 
                style={{ backgroundColor: 
                  customer.riskLevel === 'Imminent Default' ? '#FF4444' :
                  customer.riskLevel === 'Critical' ? '#FF8C00' :
                  customer.riskLevel === 'Warning' ? '#FFD700' : '#4169E1'
                }} 
              />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white">{customer.name}</h3>
                  <p className="text-[10px] text-[#B0B0C0] uppercase tracking-wider">{customer.persona}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-['JetBrains_Mono'] font-bold" style={{ color: 
                    customer.riskLevel === 'Imminent Default' ? '#FF4444' :
                    customer.riskLevel === 'Critical' ? '#FF8C00' : '#FFD700'
                  }}>{customer.risk}%</p>
                  <p className="text-[8px] text-[#B0B0C0] uppercase">{customer.riskLevel}</p>
                </div>
              </div>
              <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4">
                 {customer.signals.map(s => (
                   <span key={s.id} className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[#B0B0C0] whitespace-nowrap">{s.text}</span>
                 ))}
              </div>
              <button className="w-full py-2 bg-[#6A0DAD]/20 text-[#8A2BE2] rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                Manage Intervention <ChevronRight className="w-3 h-3" />
              </button>
          </div>
        ))}
      </main>

      {/* Mobile Nav */}
      <nav className="h-16 border-t border-[#2A2A3A] bg-[#0A0A14] px-6 flex items-center justify-between shrink-0">
        <button className="flex flex-col items-center gap-1 text-[#8A2BE2]">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[8px] uppercase font-bold">Feed</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#B0B0C0]">
          <Users className="w-5 h-5" />
          <span className="text-[8px] uppercase font-bold">Network</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#B0B0C0]">
          <Search className="w-5 h-5" />
          <span className="text-[8px] uppercase font-bold">Search</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#B0B0C0]">
          <Menu className="w-5 h-5" />
          <span className="text-[8px] uppercase font-bold">Menu</span>
        </button>
      </nav>
    </div>
  );
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
