import React from "react";
import { Zap, Bell, Settings, Activity, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

interface HeaderProps {
  onSettings?: () => void;
  onNotifications?: () => void;
  onLogout?: () => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  tabs?: Array<{ id: string; label: string; icon: React.ReactNode }>;
  titleExtension?: string;
  userName?: string;
  userRole?: string;
}

export function Header({ 
  onSettings, 
  onNotifications, 
  onLogout,
  activeTab, 
  onTabChange, 
  tabs,
  titleExtension = "State Financial Engine",
  userName = "Sarah Chen",
  userRole = "Senior Analyst"
}: HeaderProps) {
  const defaultTabs = [
    { 
      id: "dashboard" as const, 
      label: "Dashboard", 
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      id: "simulator" as const, 
      label: "Intervene", 
      icon: <Zap className="w-5 h-5" />
    },
    { 
      id: "analytics" as const, 
      label: "Analytics", 
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex flex-col bg-[#0A0A14]/80 backdrop-blur-xl border-b border-[#2A2A3A] z-20">
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#6A0DAD]/20 border border-[#8A2BE2]/40 shadow-[0_0_15px_rgba(138,43,226,0.2)]">
            <Activity className="w-6 h-6 text-[#8A2BE2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none uppercase">
              QUANTUM <span className="text-[#8A2BE2]">STATE FINANCIAL ENGINE</span>
            </h1>
            <p className="text-[10px] text-[#E6E6E6] uppercase tracking-[1.5px] mt-1 font-semibold">
              {titleExtension}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#141424] border border-[#2A2A3A] px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]" />
            <span className="text-xs font-bold text-[#E6E6E6] uppercase tracking-wide">Quantum State: Coherent</span>
          </div>

          {onNotifications && (
            <button 
              onClick={onNotifications}
              className="relative p-2 text-[#E6E6E6] hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4444] rounded-full border-2 border-[#0A0A14]" />
            </button>
          )}

          {onSettings && (
            <button 
              onClick={onSettings}
              className="p-2 text-[#E6E6E6] hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/10 rounded-lg flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <div className="h-8 w-[1px] bg-[#2A2A3A] mx-2" />

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none">{userName}</p>
              <p className="text-xs text-[#E6E6E6] uppercase mt-1">{userRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#6A0DAD] p-0.5 shadow-[0_0_10px_rgba(106,13,173,0.3)]">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center text-white font-bold">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Beautiful Tab Navigation */}
      {(tabs || defaultTabs) && onTabChange && (
        <div className="flex items-center px-6 py-2 gap-3 border-t border-[#2A2A3A] bg-[#0A0A14]/40">
          {(tabs || defaultTabs).map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-lg flex items-center gap-2.5 font-semibold text-[16px] tracking-wide transition-all duration-200 ${
                isActive
                  ? "text-white bg-[#6A0DAD]/10 shadow-[0_4px_12px_rgba(106,13,173,0.2)]"
                  : "text-[#B0B0C0] hover:text-white hover:bg-white/5"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <span className={`${isActive ? "text-[#8A2BE2]" : ""}`}>
                {tab.icon}
              </span>
              
              {/* Label */}
              <span className="uppercase" style={{ letterSpacing: "0.5px" }}>
                {tab.label}
              </span>

              {/* Active Indicator - Purple Underline */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6A0DAD] rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
        </div>
      )}
    </div>
  );
}