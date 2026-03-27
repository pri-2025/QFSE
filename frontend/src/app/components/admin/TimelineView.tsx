import React, { useCallback } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Minus, Zap, MessageSquare, Phone } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { fetchCustomer, fetchTimeline } from "../../services/api";

interface TimelineViewProps {
  customerId: string;
  onBack:     () => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#FF4444",
  warning:  "#FFD700",
  info:     "#4169E1",
  success:  "#00C853",
};
const SEVERITY_BG: Record<string, string> = {
  critical: "bg-[#FF4444]/10 border-[#FF4444]/30",
  warning:  "bg-[#FFD700]/10 border-[#FFD700]/30",
  info:     "bg-[#4169E1]/10 border-[#4169E1]/30",
  success:  "bg-[#00C853]/10 border-[#00C853]/30",
};
function getTrendIcon(cur: number | null, prev: number | null) {
  if (cur === null || prev === null) return <Minus className="w-3 h-3 text-[#B0B0C0]" />;
  if (cur < prev) return <TrendingDown className="w-3 h-3 text-[#00C853]" />;
  if (cur > prev) return <TrendingUp className="w-3 h-3 text-[#FF4444]" />;
  return <Minus className="w-3 h-3 text-[#B0B0C0]" />;
}

export function TimelineView({ customerId, onBack }: TimelineViewProps) {
  const customerFetch = useCallback(() => fetchCustomer(customerId), [customerId]);
  const timelineFetch = useCallback(() => fetchTimeline(customerId), [customerId]);

  const { data: customer, loading: custLoading } = useApi(customerFetch);
  const { data: events,   loading: evtLoading  } = useApi<Array<{
    id: string; date: string; type: string; severity: string;
    title: string; description?: string; riskAtEvent?: number;
  }>>(timelineFetch);

  // Combine wave data points + timeline events for unified timeline
  const waveData   = customer?.waveData || [];
  const loading    = custLoading || evtLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 bg-white/5 border border-white/10 rounded-lg text-[#B0B0C0] hover:text-white hover:border-[#6A0DAD] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#8A2BE2]" />
            Risk Timeline
          </h1>
          {customer && (
            <p className="text-[#B0B0C0] text-sm mt-1">
              {customer.personaEmoji} <span className="text-white">{customer.name}</span> · {customer.persona}
            </p>
          )}
        </div>
        {customer && (
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#B0B0C0] uppercase tracking-wider">Current Risk</p>
              <p className={`text-2xl font-bold font-['JetBrains_Mono'] ${customer.risk > 75 ? "text-[#FF4444]" : customer.risk > 50 ? "text-[#FFD700]" : "text-[#00C853]"}`}>
                {customer.risk}%
              </p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-12 gap-6">
          {/* Risk sparkline */}
          <div className="col-span-12 bg-[#141424] border border-[#2A2A3A] rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Risk Probability Trend</h2>
            <div className="relative h-20 flex items-end gap-1">
              {waveData.map((pt, i) => {
                const prev = i > 0 ? waveData[i - 1].risk : pt.risk;
                const barH  = `${pt.risk}%`;
                const color  = pt.risk > 75 ? "#FF4444" : pt.risk > 50 ? "#FFD700" : "#00C853";
                return (
                  <div key={pt.date} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                    <div className="relative w-full" style={{ height: barH }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-sm transition-all"
                        style={{ height: "100%", backgroundColor: color, opacity: 0.7 }}
                      />
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block text-[10px] text-white whitespace-nowrap bg-[#0A0A14] px-1 py-0.5 rounded z-10">
                        {pt.risk}%
                      </div>
                    </div>
                    {getTrendIcon(pt.risk, prev)}
                    <span className="text-[9px] text-[#B0B0C0] rotate-45 mt-1">{pt.date.slice(5)}</span>
                  </div>
                );
              })}
              {waveData.length === 0 && (
                <p className="text-[#B0B0C0] text-xs w-full text-center">No risk history data available</p>
              )}
            </div>
          </div>

          {/* Vertical timeline */}
          <div className="col-span-12">
            <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Event Timeline</h2>
            {(!events || events.length === 0) && !loading && (
              <div className="p-8 text-center bg-[#141424] border border-[#2A2A3A] rounded-xl text-[#B0B0C0] text-sm">
                No timeline events recorded for this customer yet.
              </div>
            )}
            <div className="relative">
              {/* Vertical line */}
              {events && events.length > 0 && (
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#8A2BE2] via-[#4169E1] to-transparent" />
              )}

              <div className="space-y-6">
                {events?.map((evt, i) => {
                  const color = SEVERITY_COLOR[evt.severity] || "#B0B0C0";
                  const bg    = SEVERITY_BG[evt.severity]   || "bg-white/5 border-white/10";
                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-6"
                    >
                      {/* Dot */}
                      <div className="relative flex-shrink-0 w-8">
                        <div
                          className="w-4 h-4 rounded-full border-2 absolute top-1 left-0 shadow-lg"
                          style={{ borderColor: color, backgroundColor: `${color}20`, boxShadow: `0 0 8px ${color}` }}
                        />
                      </div>

                      {/* Card */}
                      <div className={`flex-1 rounded-xl border p-4 mb-2 ${bg}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{evt.type.replace(/_/g, " ")}</span>
                              {evt.riskAtEvent !== undefined && (
                                <span className="text-[10px] font-mono text-white bg-white/5 px-1.5 py-0.5 rounded">
                                  Risk: {evt.riskAtEvent}%
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                            {evt.description && (
                              <p className="text-xs text-[#B0B0C0] mt-1">{evt.description}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-[#B0B0C0] whitespace-nowrap ml-4">{evt.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interventions summary */}
          {customer?.interventions && customer.interventions.length > 0 && (
            <div className="col-span-12 bg-[#141424] border border-[#2A2A3A] rounded-xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#8A2BE2]" /> Applied Interventions
              </h2>
              <div className="space-y-3">
                {customer.interventions.map(intv => (
                  <div key={intv.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{intv.actionType}</p>
                      <p className="text-xs text-[#B0B0C0]">{new Date(intv.simulatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#00C853]">↓ {Math.round(intv.riskReductionPct)}% risk</p>
                      <p className="text-xs text-[#B0B0C0]">{Math.round(intv.confidenceScore * 100)}% conf.</p>
                    </div>
                    <span className={`ml-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${intv.status === "applied" ? "bg-[#00C853]/20 text-[#00C853]" : "bg-white/5 text-[#B0B0C0]"}`}>
                      {intv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
