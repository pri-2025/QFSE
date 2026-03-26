import React, { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Zap, Check, X, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApi } from "../hooks/useApi";
import { fetchCustomers, simulateIntervention, saveIntervention, ApiCustomer, SimulationResult } from "../services/api";

interface SimulatorViewProps {
  initialCustomerId?: string | null;
}

const ACTION_TYPES = [
  { id: "EMI Holiday",          label: "EMI Holiday",              desc: "Offer 15-day EMI holiday with no additional interest" },
  { id: "Loan Restructuring",   label: "Loan Restructuring",       desc: "Restructure outstanding loan at lower EMI" },
  { id: "Partial Payment Plan", label: "Partial Payment Plan",     desc: "Allow partial EMI payment for 2 months" },
  { id: "Flexible Repayment",   label: "Flexible Repayment",       desc: "Customised repayment schedule" },
];

export function SimulatorView({ initialCustomerId }: SimulatorViewProps) {
  const [searchQuery,        setSearchQuery]        = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialCustomerId || null);
  const [selectedAction,     setSelectedAction]     = useState(ACTION_TYPES[0]);
  const [simStatus,          setSimStatus]          = useState<"idle"|"simulating"|"complete">("idle");
  const [simProgress,        setSimProgress]        = useState(0);
  const [result,             setResult]             = useState<SimulationResult | null>(null);
  const [simError,           setSimError]           = useState<string | null>(null);
  const [filterHighRisk,     setFilterHighRisk]     = useState(false);
  const [history,            setHistory]            = useState<Array<{ id: string; name: string; action: string; reduction: string; conf: number; time: string }>>([]);
  const [saving,             setSaving]             = useState(false);

  const { data: customersData, loading: custLoading } = useApi(useCallback(() => fetchCustomers(), []));

  const customers: ApiCustomer[] = React.useMemo(() => {
    if (!customersData?.data) return [];
    let list = customersData.data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.persona.toLowerCase().includes(q));
    }
    if (filterHighRisk) list = list.filter(c => c.risk > 60);
    return list;
  }, [customersData, searchQuery, filterHighRisk]);

  // Auto-select first customer
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Sync initialCustomerId
  useEffect(() => {
    if (initialCustomerId) setSelectedCustomerId(initialCustomerId);
  }, [initialCustomerId]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleExecute = async () => {
    if (!selectedCustomerId) return;
    setSimStatus("simulating");
    setSimProgress(0);
    setSimError(null);
    setResult(null);

    // Animate progress bar while API call runs
    const interval = setInterval(() => {
      setSimProgress(p => (p < 90 ? p + 8 : p));
    }, 120);

    try {
      const res = await simulateIntervention(selectedCustomerId, selectedAction.id);
      clearInterval(interval);
      setSimProgress(100);
      setResult(res);
      setSimStatus("complete");

      // Add to local history
      setHistory(prev => [{
        id:         Date.now().toString(),
        name:       selectedCustomer?.name || "Unknown",
        action:     selectedAction.label,
        reduction:  res.riskReductionPct,
        conf:       Math.round(res.confidenceScore * 100),
        time:       "Just now",
      }, ...prev.slice(0, 9)]);
    } catch (err: unknown) {
      clearInterval(interval);
      setSimError(err instanceof Error ? err.message : "Simulation failed");
      setSimStatus("idle");
    }
  };

  const handleApply = async () => {
    if (!result || !selectedCustomerId) return;
    setSaving(true);
    try {
      await saveIntervention({
        customerId:          selectedCustomerId,
        actionType:          selectedAction.id,
        preProbability:      result.preProbability,
        projectedProbability:result.projectedProbability,
        confidenceScore:     result.confidenceScore,
        riskReductionPct:    parseFloat(result.riskReductionPct),
        notes:               `Applied via QFSE Simulator at ${new Date().toISOString()}`,
      });
      setSimStatus("idle");
      setResult(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-112px)] bg-[#0A0A14] overflow-hidden">

      {/* ── LEFT: Customer Selection ─────────────────────────── */}
      <div className="w-full lg:w-1/4 border-r border-[#2A2A3A] flex flex-col">
        <div className="p-4 border-b border-[#2A2A3A]">
          <h2 className="text-xs font-semibold text-[#E6E6E6] mb-3 uppercase tracking-wider">Customer Selection</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
              className="w-full bg-[#141424] border border-[#2A2A3A] rounded-lg pl-9 pr-4 py-2 text-xs text-[#E6E6E6] focus:outline-none focus:border-[#6A0DAD]"
            />
          </div>
          <button
            onClick={() => setFilterHighRisk(v => !v)}
            className={`mt-2 flex items-center gap-2 text-xs font-medium transition-colors ${filterHighRisk ? "text-[#FF4444]" : "text-[#B0B0C0] hover:text-white"}`}
          >
            <div className={`w-3 h-3 rounded border ${filterHighRisk ? "bg-[#FF4444] border-[#FF4444]" : "border-[#B0B0C0]"}`} />
            High Risk Only (&gt;60%)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {custLoading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <AnimatePresence>
            {customers.map(c => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setSelectedCustomerId(c.id); setSimStatus("idle"); setResult(null); }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedCustomerId === c.id
                    ? "bg-[#6A0DAD]/20 border-[#8A2BE2]"
                    : "bg-transparent border-transparent hover:bg-[#141424]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-medium text-[#E6E6E6]">{c.name}</span>
                    <div className="text-[10px] text-[#B0B0C0] mt-0.5 truncate w-32">{c.persona}</div>
                  </div>
                  <div className={`text-right text-xs font-bold font-['JetBrains_Mono'] ${c.risk > 75 ? "text-[#FF4444]" : c.risk > 50 ? "text-[#FFD700]" : "text-[#00C853]"}`}>
                    {c.risk}%
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── CENTER: Simulation Panel ─────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(106,13,173,0.05),transparent_70%)] pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🧪 QUANTUM INTERVENTION SIMULATOR
          </h2>
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-[#141424] border border-[#2A2A3A] rounded-lg">
              <div className="text-xs font-medium text-[#E6E6E6] mb-1">
                SIMULATING: <span className="text-white font-bold">{selectedCustomer.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-[#E6E6E6]">
                <div>Risk: <span className={`font-bold ${selectedCustomer.risk > 60 ? "text-[#FF4444]" : "text-[#FFD700]"}`}>{selectedCustomer.risk}%</span></div>
                <div>State: <span className="text-white">{selectedCustomer.riskState}</span></div>
                <div>Entanglements: <span className="text-white">{selectedCustomer.entanglementCount}</span></div>
                <div>Persona: <span className="text-white">{selectedCustomer.personaEmoji} {selectedCustomer.persona.split(" ")[0]}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Gauges */}
        {selectedCustomer && result && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-[#141424]/50 border border-[#2A2A3A] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#E6E6E6] mb-4">📉 RISK REDUCTION</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-white font-['JetBrains_Mono']">↓ {result.riskReductionPct}%</span>
              </div>
              <div className="h-2 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.riskReductionPct}%` }} className="h-full bg-gradient-to-r from-[#0066FF] to-[#00C853]" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#E6E6E6]">
                <span>Current: {selectedCustomer.risk}%</span>
                <span>Projected: {Math.round(result.projectedProbability * 100)}%</span>
              </div>
            </div>
            <div className="bg-[#141424]/50 border border-[#2A2A3A] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#E6E6E6] mb-4">🔮 CONFIDENCE SCORE</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-white font-['JetBrains_Mono']">{Math.round(result.confidenceScore * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(result.confidenceScore * 100)}%` }} className="h-full bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2]" />
              </div>
              <div className="mt-2 text-[10px] text-[#8A2BE2]">Projected state: {result.projectedRiskState}</div>
            </div>
          </div>
        )}

        {/* Action selector */}
        <div className="bg-[#141424] border border-[#2A2A3A] rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-[#2A2A3A] bg-[#0A0A14]/30">
            <h3 className="text-sm font-bold text-white">🔄 SELECT INTERVENTION</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#E6E6E6] uppercase bg-[#1A1A2E]">
              <tr>
                <th className="px-4 py-3 font-medium">Strategy</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A3A]">
              {ACTION_TYPES.map(action => (
                <tr
                  key={action.id}
                  onClick={() => setSelectedAction(action)}
                  className={`cursor-pointer transition-colors ${selectedAction.id === action.id ? "bg-[#6A0DAD]/20" : "hover:bg-white/5"}`}
                >
                  <td className="px-4 py-3 font-medium text-white text-xs">{action.label}</td>
                  <td className="px-4 py-3 text-[#B0B0C0] text-xs">{action.desc}</td>
                  <td className="px-4 py-3">
                    {selectedAction.id === action.id && <div className="w-2 h-2 rounded-full bg-[#8A2BE2] shadow-[0_0_8px_#8A2BE2]" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {simError && <div className="mb-4 p-3 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded-lg text-[#FF4444] text-xs">{simError}</div>}

        {/* Execute */}
        <div className="mt-auto">
          {simStatus === "idle" && (
            <button
              onClick={handleExecute}
              disabled={!selectedCustomer}
              className="w-full py-4 rounded-xl bg-[#0066FF] hover:bg-[#0055D4] disabled:opacity-40 text-white font-bold text-lg shadow-[0_8px_24px_rgba(0,102,255,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              🚀 EXECUTE {selectedAction.label.toUpperCase()}
            </button>
          )}

          {simStatus === "simulating" && (
            <div className="w-full bg-[#141424] border border-[#2A2A3A] rounded-xl p-6 text-center">
              <h3 className="text-[#8A2BE2] font-bold mb-4 animate-pulse">⚡ QUERYING ML ENGINE...</h3>
              <div className="h-4 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#0066FF] via-[#8A2BE2] to-[#0066FF]"
                  style={{ width: `${simProgress}%` }}
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-xs text-[#E6E6E6] mt-3">{simProgress}% — calling FastAPI ML engine</p>
            </div>
          )}

          {simStatus === "complete" && result && (
            <div className="w-full bg-[#141424] border border-[#00C853]/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#00C853]" />
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#00C853] font-bold flex items-center gap-2">
                  <Check className="w-5 h-5" /> SIMULATION COMPLETE
                </h3>
                <button onClick={() => setSimStatus("idle")} className="text-[#B0B0C0] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20">
                  <div className="text-xs text-[#E6E6E6] uppercase">Current Risk</div>
                  <div className="text-2xl font-bold text-white">{Math.round(result.preProbability * 100)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-[#6A0DAD]/10 border border-[#6A0DAD]/20">
                  <div className="text-xs text-[#E6E6E6] uppercase">Projected Risk</div>
                  <div className="text-2xl font-bold text-white">{Math.round(result.projectedProbability * 100)}%</div>
                  <div className="text-xs text-[#00C853]">↓ {result.riskReductionPct}% reduced</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApply}
                  disabled={saving}
                  className="flex-1 py-2 bg-[#00C853] hover:bg-[#00B048] disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "APPLY TO CUSTOMER"}
                </button>
                <button onClick={() => setSimStatus("idle")} className="px-4 py-2 border border-[#2A2A3A] hover:bg-white/5 text-[#E6E6E6] rounded-lg">
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: History ──────────────────────────────────── */}
      <div className="w-full lg:w-1/4 border-l border-[#2A2A3A] flex flex-col">
        <div className="p-4 border-b border-[#2A2A3A]">
          <h2 className="text-xs font-semibold text-[#E6E6E6] flex items-center gap-2 uppercase tracking-wider">
            <History className="w-4 h-4" /> Recent Simulations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 && (
            <p className="text-center text-[#B0B0C0] text-xs py-8">No simulations yet. Run one above!</p>
          )}
          {history.map(item => (
            <div key={item.id} className="p-3 rounded-xl bg-[#141424] border border-[#2A2A3A] hover:border-[#6A0DAD]/50 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-white text-xs">{item.name}</span>
                <span className="text-[10px] text-[#B0B0C0]">{item.time}</span>
              </div>
              <div className="text-xs text-[#B0B0C0] mb-2">{item.action}</div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#00C853] font-bold font-['JetBrains_Mono']">↓ {item.reduction}%</span>
                <span className="text-[#B0B0C0]">{item.conf}% conf.</span>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio metrics */}
        <div className="p-4 border-t border-[#2A2A3A]">
          <h3 className="text-xs font-semibold text-[#E6E6E6] mb-3 uppercase">Quantum Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "Avg Confidence", val: 84, color: "#6A0DAD" },
              { label: "Session Success", val: history.length > 0 ? 100 : 0, color: "#00C853" },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#E6E6E6]">{m.label}</span>
                  <span className="text-white">{m.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#2A2A3A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}