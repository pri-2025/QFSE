import React from "react";
import { motion } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyProfile, fetchMyEntanglementSummary } from "../../services/api";
import { User, Mail, Shield, Zap, Info, HelpCircle, Activity } from "lucide-react";

export function CustomerProfile() {
  const { data: profile, loading: profileLoading } = useApi(fetchMyProfile);
  const { data: entanglement, loading: entanglementLoading } = useApi(fetchMyEntanglementSummary);

  if (profileLoading || entanglementLoading) return <div className="p-8 text-center text-gray-400">Syncing Quantum Identity...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center gap-6">
         <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-purple-900/40">
           {profile?.name?.charAt(0)}
         </div>
         <div>
            <h1 className="text-3xl font-bold">{profile?.name}</h1>
            <p className="text-gray-400 flex items-center gap-2 mt-1">
              <Mail size={14} /> {profile?.email}
            </p>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8"
         >
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <User className="text-purple-400" size={20} />
             Identity Persona
           </h3>
           <div className="flex items-center gap-4 p-6 bg-[#1A1A2E] rounded-2xl border border-purple-500/20">
             <div className="text-3xl">{profile?.persona?.emoji || '👤'}</div>
             <div>
               <p className="font-bold text-lg text-purple-300">{profile?.persona?.name}</p>
               <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Standard Risk Alignment</p>
             </div>
           </div>
           
           <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm py-2 border-b border-[#1E1E2E]">
                <span className="text-gray-500">Customer ID</span>
                <span className="font-mono text-xs">{profile?.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-[#1E1E2E]">
                <span className="text-gray-500">Security State</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase">Role: CUSTOMER</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-gray-500">Account Verified</span>
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-[#0A0A14]">✓</div>
              </div>
           </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-[#141424] border border-[#1E1E2E] rounded-3xl p-8"
         >
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <LandmarkIcon className="text-blue-400" size={20} />
             Entanglement Summary
           </h3>
           <div className="space-y-4 text-center p-8">
             <div className="text-4xl font-black text-white">{entanglement?.linked_accounts_count || 0}</div>
             <p className="text-gray-500 text-sm">Linked Ecosystem Contacts</p>
             <div className="h-2 w-full bg-[#1A1A2E] rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (entanglement?.instability_score || 0) * 10)}%` }}
                  className="h-full bg-blue-500" 
                />
             </div>
             <div className="flex justify-between text-[10px] font-black uppercase text-gray-600 mt-2">
               <span>Impact Level: {entanglement?.impact_level || 'None'}</span>
               <span>{entanglement?.instability_score?.toFixed(1)}% Contagion</span>
             </div>
           </div>
           
           <div className="mt-2 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
              <Info className="text-blue-400 shrink-0" size={18} />
              <p className="text-xs text-gray-400 leading-relaxed">
                Entanglements represent shared liability nodes (guarantors, co-borrowers) that contribute to your cumulative instability score.
              </p>
           </div>
         </motion.div>
      </div>

      <div className="flex gap-4">
         <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-2xl transition-all shadow-xl shadow-purple-900/20">
           Edit Profile Security
         </button>
         <button className="flex-1 bg-[#141424] border border-[#1E1E2E] text-white font-bold py-3 rounded-2xl hover:border-red-500/50 hover:text-red-400 transition-all">
           Request Data Deletion
         </button>
      </div>
    </div>
  );
}

function LandmarkIcon({ className, size = 20 }: { className?: string, size?: number }) {
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
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7 12 2" />
    </svg>
  );
}
