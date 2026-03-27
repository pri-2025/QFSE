import React, { useState } from "react";
import { Header } from "./Header";
import { 
  fetchMyProfile, fetchMyRisk, fetchMyTimeline, 
  fetchMyInterventions, fetchMySnapshot, acceptMyIntervention 
} from "../services/api";
import { useApi } from "../hooks/useApi";
import { motion } from "motion/react";
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, FileText, Calendar } from "lucide-react";

export function CustomerHome() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "analytics">("dashboard");
  const { data: profile } = useApi(fetchMyProfile);
  const { data: risks } = useApi(fetchMyRisk);
  const { data: timeline } = useApi(fetchMyTimeline);
  const { data: interventions, refetch: refetchInterventions } = useApi(fetchMyInterventions);
  const { data: snapshots } = useApi(fetchMySnapshot);

  const tabs = [
    { id: "dashboard", label: "My Snapshot", icon: <Shield className="w-5 h-5" /> },
    { id: "simulator", label: "Timeline & Alerts", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "analytics", label: "Interventions", icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem("qfse_token");
    localStorage.removeItem("qfse_user");
    window.location.href = "/login";
  };

  const handleAccept = async (id: string) => {
    await acceptMyIntervention(id);
    refetchInterventions();
  };

  if (!profile) return <div className="p-8 text-center text-white">Loading your Quantum Profile...</div>;

  const currentRisk = risks && risks.length > 0 ? Number(risks[0].probability) * 100 : 0;
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A14] w-full">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab as any} 
        tabs={tabs}
        onLogout={handleLogout}
        titleExtension="Customer Portal"
        userName={profile?.name || "Customer"}
        userRole={profile?.persona?.name || "Account Holder"}
      />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Financial Snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#141424] border border-[#2A2A3A] p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                <h3 className="text-[#B0B0C0] uppercase text-xs tracking-wider mb-2">My Risk Score</h3>
                <div className="text-5xl font-bold text-emerald-400 mb-2">{Math.round(currentRisk)}</div>
                <p className="text-sm text-[#E6E6E6]">Status: {currentRisk < 50 ? "Healthy" : "Needs Attention"}</p>
              </div>

              <div className="bg-[#141424] border border-[#2A2A3A] p-6 rounded-xl">
                <h3 className="text-[#B0B0C0] uppercase text-xs tracking-wider mb-2">My Finances</h3>
                <p className="text-[#E6E6E6] mb-1">Monthly Income: <span className="text-white font-mono">${profile?.monthlyIncome || 0}</span></p>
                <p className="text-[#E6E6E6] mb-1">Loan EMI: <span className="text-white font-mono">${profile?.emiAmount || 0}</span></p>
                <p className="text-[#E6E6E6]">Surplus: <span className="text-emerald-400 font-mono">${profile?.affordabilitySurplus || 0}</span></p>
              </div>
            </div>

            <div className="bg-[#141424] border border-[#2A2A3A] p-6 rounded-xl mt-6">
              <h3 className="text-[#B0B0C0] uppercase text-xs tracking-wider mb-4">Risk Trend</h3>
              <div className="h-40 flex items-end gap-2">
                {risks?.slice(0, 10).reverse().map((r: any, i: number) => {
                  const h = Math.max(10, Number(r.probability) * 100);
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }} 
                      className={`w-full max-w-[40px] rounded-t-sm ${h > 70 ? 'bg-red-500' : h > 40 ? 'bg-yellow-500' : 'bg-emerald-500'} opacity-80`} 
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "simulator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            {timeline?.map((evt: any) => (
              <div key={evt.id} className="bg-[#141424] border border-[#2A2A3A] p-4 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-[#2A2A3A] rounded-full mt-1">
                  <Calendar className="w-4 h-4 text-[#8A2BE2]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{evt.title}</h4>
                  <p className="text-sm text-[#B0B0C0]">{new Date(evt.eventDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Recommendations & Interventions</h2>
            {interventions?.map((inv: any) => (
              <div key={inv.id} className="bg-[#141424] border border-[#8A2BE2]/40 p-5 rounded-xl flex justify-between items-center shadow-[0_4px_20px_rgba(106,13,173,0.1)]">
                <div>
                  <h4 className="text-white font-bold">{inv.actionType.replace(/_/g, ' ').toUpperCase()}</h4>
                  <p className="text-sm text-[#B0B0C0] mt-1">Status: <span className={inv.status === 'applied' ? "text-emerald-400" : "text-yellow-400"}>{inv.status}</span></p>
                  {inv.notes && <p className="text-xs text-[#E6E6E6] mt-2 italic">"{inv.notes}"</p>}
                </div>
                {inv.status === 'simulated' && (
                  <button 
                    onClick={() => handleAccept(inv.id)}
                    className="bg-[#6A0DAD] hover:bg-[#8A2BE2] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-[0_0_10px_rgba(106,13,173,0.5)]"
                  >
                    Accept Offer
                  </button>
                )}
              </div>
            ))}
            {interventions?.length === 0 && (
              <p className="text-[#B0B0C0]">You have no active interventions or recommendations at this time.</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
