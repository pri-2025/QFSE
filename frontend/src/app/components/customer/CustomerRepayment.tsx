import React from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyRepaymentPlan } from "../../services/api";
import { 
  CreditCard, Calendar, CheckCircle, 
  Clock, DollarSign, Download, AlertCircle 
} from "lucide-react";

export function CustomerRepayment() {
  const { data: plan, loading } = useApi(fetchMyRepaymentPlan);

  if (loading) return <div className="p-8 text-center text-gray-400">Fetching Repayment Schedule...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit']">Repayment Plan</h1>
          <p className="text-gray-400 mt-1 uppercase text-[10px] tracking-widest font-black">Active Adjustment Protection</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1A1A2E] border border-[#2A2A3A] px-4 py-2 rounded-xl text-sm font-bold hover:border-purple-500/50 transition-all">
          <Download size={18} /> Export PDF
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141424] border border-[#1E1E2E] p-6 rounded-3xl">
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Outstanding</p>
           <p className="text-3xl font-black text-white">$12,450.00</p>
        </div>
        <div className="bg-[#141424] border border-purple-500/20 p-6 rounded-3xl">
           <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">Next Installment</p>
           <p className="text-3xl font-black text-white">${plan?.schedule[0]?.amount || "0.00"}</p>
        </div>
        <div className="bg-[#141424] border border-[#1E1E2E] p-6 rounded-3xl">
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Tenure Remaining</p>
           <p className="text-3xl font-black text-white">42 Months</p>
        </div>
      </div>

      <div className="bg-[#141424] border border-[#1E1E2E] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1E1E2E] bg-[#0F0F1E]/50 flex items-center gap-2">
           <Calendar className="text-purple-500" size={20} />
           <h3 className="font-bold uppercase tracking-widest text-xs">Upcoming Schedule</h3>
        </div>
        <div className="divide-y divide-[#1E1E2E]">
          {plan?.schedule?.map((item: any, i: number) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-[#0F0F1E] transition-colors group">
              <div className="flex items-center gap-6">
                <div className="text-center w-12">
                   <p className="text-xs font-black uppercase text-gray-500 tracking-tighter">
                     {new Date(item.due_date).toLocaleDateString([], { month: 'short' })}
                   </p>
                   <p className="text-xl font-black text-white">
                     {new Date(item.due_date).toLocaleDateString([], { day: '2-digit' })}
                   </p>
                </div>
                <div className="h-10 w-px bg-[#1E1E2E]" />
                <div>
                  <p className="font-bold text-white uppercase tracking-tight">EMI Payment</p>
                  <p className="text-xs text-gray-500">Method: Automatic Debit</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                 <p className="text-lg font-black text-white">${Number(item.amount).toLocaleString()}</p>
                 <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border
                    ${item.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}
                 `}>
                   {item.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                   {item.status}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start gap-4">
         <AlertCircle className="text-amber-500 shrink-0" size={24} />
         <div>
            <h4 className="font-bold text-amber-400 uppercase text-xs tracking-widest">Quantum Adjustment Notice</h4>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Your repayment plan has been dynamically adjusted based on your active "Salary Recovery" intervention. Installments are now optimized for your current income stability markers.
            </p>
         </div>
      </div>
    </div>
  );
}
