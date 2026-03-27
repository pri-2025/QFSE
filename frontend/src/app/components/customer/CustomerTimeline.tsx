import React from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyTimeline } from "../../services/api";
import { Clock, AlertTriangle, ShieldCheck, Zap, CreditCard, Bell } from "lucide-react";

export function CustomerTimeline() {
  const { data: timeline, loading } = useApi(fetchMyTimeline);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading your history...</div>;

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes("risk")) return <AlertTriangle className="text-amber-400" />;
    if (type.toLowerCase().includes("intervention")) return <Zap className="text-purple-400" />;
    if (type.toLowerCase().includes("payment")) return <CreditCard className="text-emerald-400" />;
    return <Bell className="text-blue-400" />;
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">Activity Timeline</h1>
        <p className="text-gray-400 mt-1">A verifiable record of your financial events and stability triggers.</p>
      </header>

      <div className="relative border-l-2 border-[#1E1E2E] ml-4 pb-8">
        {timeline?.map((event: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="mb-8 ml-8 relative"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[45px] top-1 w-8 h-8 rounded-full bg-[#0A0A14] border-2 border-[#1E1E2E] flex items-center justify-center p-1.5 z-10">
              {getIcon(event.type)}
            </div>

            <div className="bg-[#141424] border border-[#1E1E2E] rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-500">{event.type}</span>
                  <span className="text-xs text-gray-500 font-mono">{new Date(event.date).toLocaleDateString()}</span>
               </div>
               <h3 className="text-lg font-bold text-white">{event.description}</h3>
               <div className="mt-4 flex items-center gap-4">
                  <div className="text-[10px] uppercase font-bold text-gray-600 tracking-tighter">Status Verified</div>
                  {event.riskAtEvent && (
                    <div className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded">
                       Risk Snapshot: {(event.riskAtEvent * 100).toFixed(0)}%
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        ))}
        
        {timeline?.length === 0 && (
          <p className="ml-8 text-gray-500 italic">No timeline records found for your account.</p>
        )}
      </div>
    </div>
  );
}
