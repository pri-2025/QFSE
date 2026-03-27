import React, { useState } from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyInterventions, acceptMyIntervention } from "../../services/api";
import { Zap, ShieldCheck, Sparkles, TrendingDown, Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CustomerInterventions() {
  const { data: interventions, loading, refetch } = useApi(fetchMyInterventions);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await acceptMyIntervention(id);
      toast.success("Intervention successfully applied. Your risk profile is being updated.");
      refetch();
    } catch (err) {
      toast.error("Failed to apply intervention. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Simulating Quantum Recovery Paths...</div>;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intervention Hub</h1>
          <p className="text-gray-400 mt-1">Accept proactive adjustments to stabilize your financial future.</p>
        </div>
        <div className="bg-purple-600/10 border border-purple-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
          <Sparkles className="text-purple-400" size={20} />
          <span className="text-sm font-bold text-purple-300">AI Enabled Recovery</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {interventions?.map((inv: any, i: number) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-[#141424] border rounded-3xl p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden group
              ${inv.status === 'applied' ? 'border-emerald-500/20' : 'border-[#1E1E2E] hover:border-purple-500/50'}
            `}
          >
            {inv.status === 'applied' && (
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-500/20">Active Protection</div>
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${inv.status === 'applied' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  <Zap size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">{inv.type.replace(/_/g, ' ')}</h3>
                  <p className="text-gray-400 text-sm mt-1">Probability Reduction Strategy</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
                Applying this intervention will adjust your loan parameters to better match your current behavioral stability, directly impacting your recovery probability.
              </p>
            </div>

            <div className="flex items-center gap-12 shrink-0">
               <div className="text-center">
                 <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Risk Reduction</p>
                 <p className="text-3xl font-black text-emerald-400">-{inv.risk_reduction}%</p>
               </div>
               
               <div className="text-center">
                 <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">New Prob.</p>
                 <p className="text-3xl font-black text-white">{(inv.projected_probability * 100).toFixed(0)}%</p>
               </div>

               {inv.status !== 'applied' ? (
                 <button 
                   onClick={() => handleAccept(inv.id)}
                   disabled={acceptingId === inv.id}
                   className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-purple-900/40 flex items-center gap-2 group"
                 >
                   {acceptingId === inv.id ? (
                     <Loader2 className="animate-spin" size={20} />
                   ) : (
                     <>Accept Plan <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} /></>
                   )}
                 </button>
               ) : (
                 <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold py-4 px-8 rounded-2xl flex items-center gap-2">
                   <ShieldCheck size={20} /> Applied
                 </div>
               )}
            </div>
          </motion.div>
        ))}

        {interventions?.length === 0 && (
          <div className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-16 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold">You're in the Quantum Realm</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Your financial stability markers are currently optimal. No interventions are required at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
