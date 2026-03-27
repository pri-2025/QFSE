import React, { useState } from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyProfile, fetchMySnapshot, fetchMyRiskTrend } from "../../services/api";
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, FileText, Calendar, Activity, ShieldCheck, CreditCard, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function CustomerHome() {
  const { data: profile, loading: profileLoading } = useApi(fetchMyProfile);
  const { data: snapshot, loading: snapshotLoading } = useApi(fetchMySnapshot);
  const { data: trend } = useApi(fetchMyRiskTrend);

  if (profileLoading || snapshotLoading) {
    return (
      <div className="flex items-center justify-center h-full p-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentRisk = profile?.current_probability * 100 || 0;
  const riskStatus = profile?.risk_state || "Stable";

  const cards = [
    { 
      label: "My Risk Status", 
      value: riskStatus, 
      sub: `${currentRisk.toFixed(1)}% Probability`,
      icon: <ShieldCheckIcon className="text-purple-400" />,
      color: currentRisk > 70 ? "text-red-400" : currentRisk > 30 ? "text-yellow-400" : "text-emerald-400"
    },
    { 
      label: "Active Loans", 
      value: snapshot?.total_loans || 0, 
      sub: "Active and healthy",
      icon: <CreditCard className="text-blue-400" />
    },
    { 
      label: "Monthly EMI", 
      value: `$${snapshot?.active_emis || 0}`, 
      sub: "Total monthly commitment",
      icon: <DollarSign className="text-emerald-400" />
    },
    { 
      label: "Next Payment", 
      value: `In ${snapshot?.next_emi_due || 0} days`, 
      sub: "Scheduled automatically",
      icon: <Calendar className="text-indigo-400" />
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.name}</h1>
          <p className="text-gray-400 mt-1">Here's your real-time financial stability overview.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#1A1A2E] px-4 py-2 rounded-xl border border-[#2A2A3A]">
          <div className={`w-3 h-3 rounded-full animate-pulse ${currentRisk > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className="text-sm font-medium text-gray-300">System Monitoring: Active</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#141424] border border-[#1E1E2E] p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/5 to-transparent rounded-full -mr-8 -mt-8" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#1A1A2E] rounded-lg border border-[#2A2A3A]">
                {card.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{card.label}</h3>
            <div className={`text-2xl font-bold mt-1 ${card.color || 'text-white'}`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-[#141424] border border-[#1E1E2E] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-purple-400" size={20} />
              Risk Instability Trend
            </h3>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Live Wavefunction</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F0F1E', border: '1px solid #2A2A3A', borderRadius: '12px' }}
                  itemStyle={{ color: '#8B5CF6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#0F0F1E' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Financial Health Circle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#141424] border border-[#1E1E2E] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-[#1E1E2E] stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
              <circle 
                className={`${currentRisk > 70 ? 'text-red-500' : 'text-purple-500'} stroke-current transition-all duration-1000 ease-out`} 
                strokeWidth="8" 
                strokeDasharray={`${2.51 * (100 - currentRisk)} 251.2`}
                strokeLinecap="round" 
                fill="transparent" 
                r="40" cx="50" cy="50" 
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{(100 - currentRisk).toFixed(0)}%</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Health Score</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white">Quantum Stability</h4>
            <p className="text-sm text-gray-500 px-4 mt-2">Your probability of maintaining financial equilibrium remains optimal.</p>
          </div>
          <button className="w-full py-3 bg-[#1A1A2E] border border-[#2A2A3A] rounded-xl text-xs font-bold uppercase tracking-widest hover:border-purple-500/50 transition-all text-purple-400">
            View Analytics
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function ShieldCheckIcon({ className, size = 20 }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
