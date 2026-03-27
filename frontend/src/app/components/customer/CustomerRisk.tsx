import React from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyRisk, fetchMyRiskTrend } from "../../services/api";
import { 
  ShieldAlert, TrendingDown, Info, AlertTriangle, 
  CheckCircle, Zap, Activity
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

export function CustomerRisk() {
  const { data: riskDetails, loading: riskLoading } = useApi(fetchMyRisk);
  const { data: trend } = useApi(fetchMyRiskTrend);

  if (riskLoading) return <div className="p-8 text-center">Loading Quantum Risk Data...</div>;

  const currentProb = riskDetails?.probability || 0;
  const drivers = riskDetails?.top_drivers || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">My Risk Intelligence</h1>
        <p className="text-gray-400 mt-1">Deep analysis of your financial instability probability.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Probability Meter */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="relative w-64 h-64 mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-[#1E1E2E] stroke-current" strokeWidth="6" fill="transparent" r="44" cx="50" cy="50" />
              <circle 
                className={`${currentProb > 0.7 ? 'text-red-500' : currentProb > 0.3 ? 'text-yellow-500' : 'text-emerald-500'} stroke-current`} 
                strokeWidth="8" 
                strokeDasharray={`${2.76 * (currentProb * 100)} 276.4`}
                strokeLinecap="round" 
                fill="transparent" 
                r="44" cx="50" cy="50" 
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{(currentProb * 100).toFixed(1)}%</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Default Probability</span>
            </div>
          </div>
          <div className={`px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-widest
            ${currentProb > 0.7 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
              currentProb > 0.3 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 
              'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}
          `}>
            {riskDetails?.risk_state || "Unknown State"}
          </div>
          <p className="text-gray-400 text-sm mt-6 max-w-xs">
            Your risk is calculated using 42 real-time financial variables and behavior patterns.
          </p>
        </motion.div>

        {/* Behavioral Drivers */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-purple-400" size={24} />
            Key Risk Drivers
          </h3>
          <div className="space-y-6">
            {drivers.map((driver: any, i: number) => (
              <div key={driver.feature} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-medium capitalize">{driver.feature.replace(/_/g, ' ')}</span>
                  <span className={driver.impact > 0 ? "text-red-400" : "text-emerald-400"}>
                    {driver.impact > 0 ? "+" : ""}{(driver.impact * 100).toFixed(1)}% Impact
                  </span>
                </div>
                <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.abs(driver.impact) * 200)}%` }}
                    className={`h-full ${driver.impact > 0 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                  />
                </div>
              </div>
            ))}
            {drivers.length === 0 && (
              <p className="text-gray-500 italic">No significant drivers detected currently.</p>
            )}
          </div>

          <div className="mt-10 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-start gap-4">
            <Zap className="text-purple-400 shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-purple-300">Strategy Recommendation</h4>
              <p className="text-xs text-gray-400 mt-1">Reducing your Debt-to-Income ratio by 15% could lower your risk state to "Stable".</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Historical Context */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8"
      >
        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
          <TrendingDown className="text-purple-400" size={20} />
          Long-term Risk Trajectory
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="colorRiskRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short' })}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F0F1E', border: '1px solid #2A2A3A', borderRadius: '12px' }}
                cursor={{ stroke: '#8B5CF6', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="probability" 
                stroke="#8B5CF6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRiskRisk)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
