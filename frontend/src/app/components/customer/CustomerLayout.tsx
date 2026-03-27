import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, Home, ShieldCheck, Activity, 
  Clock, Bell, User, LogOut, CreditCard,
  Menu, X, Zap
} from "lucide-react";

export function CustomerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("qfse_token");
    localStorage.removeItem("qfse_user");
    navigate("/login");
  };

  const navItems = [
    { name: "Home", icon: <Home size={20} />, path: "/customer/home" },
    { name: "My Risk", icon: <ShieldCheck size={20} />, path: "/customer/risk" },
    { name: "Financial Snapshot", icon: <BarChart3 size={20} />, path: "/customer/snapshot" },
    { name: "Interventions", icon: <Zap size={20} />, path: "/customer/interventions" },
    { name: "Repayment Plan", icon: <CreditCard size={20} />, path: "/customer/repayment" },
    { name: "Timeline", icon: <Clock size={20} />, path: "/customer/timeline" },
    { name: "Notifications", icon: <Bell size={20} />, path: "/customer/notifications" },
    { name: "Profile", icon: <User size={20} />, path: "/customer/profile" },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A14] text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-40 bg-[#0F0F1E] border-r border-[#1E1E2E] flex flex-col transition-all duration-300 ease-in-out shadow-2xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="text-white fill-white" size={18} />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight whitespace-nowrap"
            >
              QUANTUM <span className="text-purple-500">PRE-D</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" 
                  : "text-gray-400 hover:bg-[#1A1A2E] hover:text-white border border-transparent"}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.name}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1E1E2E]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-[#0A0A14] hover:bg-purple-500 transition-colors"
        >
          {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        {/* Top Gradient Blur */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
