import React from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMySnapshot } from "../../services/api";
import { 
  BarChart3, Wallet, Landmark, TrendingUp, 
  ArrowUpRight, ArrowDownRight, PieChart, Activity
} from "lucide-react";

export function CustomerSnapshot() {
  const { data: snapshot, loading } = useApi(fetchMySnapshot);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Financial Records...</div>;

  const metrics = [
    { label: "Loan-to-Income", value: `${(snapshot?.loan_to_income_ratio * 100).toFixed(1)}%`, icon: <Landmark className="text-blue-400" /> },
    { label: "Credit Utilization", value: `${(snapshot?.credit_utilization_ratio * 100).toFixed(1)}%`, icon: <Wallet className="text-purple-400" /> },
    { label: "Repayment Consistency", value: `${(snapshot?.emi_consistency_score * 100).toFixed(1)}%`, icon: <Activity className="text-emerald-400" /> },
    { label: "Income Latency", value: `${snapshot?.salary_delay_frequency} days avg`, icon: <TrendingUp className="text-amber-400" /> },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">Financial Snapshot</h1>
        <p className="text-gray-400 mt-1">Real-time aggregation of your active liabilities and behavioral signals.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#141424] border border-[#1E1E2E] p-6 rounded-2xl"
          >
            <div className="p-3 bg-[#1A1A2E] rounded-xl w-fit mb-4">
              {m.icon}
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{m.label}</h3>
            <div className="text-2xl font-bold mt-1">{m.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-purple-600" />
             <h3 className="text-xl font-bold mb-6">Liability Breakdown</h3>
             <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-[#1A1A2E] rounded-2xl border border-[#2A2A3A]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Personal Loan (Active)</p>
                      <p className="text-xs text-gray-500">ID: QFSE-LN-7729</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="font-bold">${snapshot?.active_emis || 0}</p>
                    <p className="text-xs text-gray-500">Monthly EMI</p>
                 </div>
               </div>
               
               <div className="p-6 bg-[#0F0F1E] rounded-2xl border border-[#1E1E2E] flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-400">Available Monthly Surplus</p>
                   <p className="text-3xl font-bold text-emerald-400 mt-1">$1,240.00</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-gray-500">Stability Buffer</p>
                   <p className="text-sm font-medium text-emerald-500 flex items-center justify-end gap-1 mt-1">
                     <ArrowUpRight size={14} /> Low Risk
                   </p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <PieChart className="text-purple-400 mb-4" size={48} />
          <h3 className="text-lg font-bold">Allocation IQ</h3>
          <p className="text-sm text-gray-500 mt-2 line-clamp-3">
            Your current loan-to-income ratio is optimized. We recommend maintaining at least 12% in your emergency buffer.
          </p>
          <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-8 overflow-hidden">
            <div className="w-1/3 h-full bg-purple-600" />
          </div>
          <div className="flex justify-between w-full text-[10px] uppercase font-bold text-gray-600 mt-2">
            <span>Debt</span>
            <span>Surplus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
