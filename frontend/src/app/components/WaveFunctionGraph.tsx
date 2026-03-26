import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from "recharts";
import { Customer, SignalHistory } from "../types";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Clock } from "lucide-react";

interface WaveFunctionGraphProps {
  customer: Customer;
  className?: string;
}

// Helper function to generate customer-specific 4-month data based on their actual signals
function generate4MonthData(customer: Customer) {
  if (!customer.signalHistory) return { chartData: [], monthlyData: [], events: [] };

  const signals = Object.keys(customer.signalHistory);
  const signalNames = signals;
  
  // Analyze the customer's 30-day pattern to extrapolate 4 months
  const data = Array.from({ length: 120 }, (_, i) => {
    const day = i + 1;
    const point: any = { day, name: `Day ${day}` };
    
    signals.forEach(sigName => {
      const history = customer.signalHistory![sigName];
      const currentIntensity = history[history.length - 1].intensity;
      const startIntensity = history[0].intensity;
      
      // Calculate growth rate from 30-day history
      const growthRate = (currentIntensity - startIntensity) / 30;
      
      // Generate 4-month progression based on actual signal behavior
      let intensity = 0;
      
      if (day <= 30) {
        // Month 1: Low baseline (10-20% of current intensity)
        intensity = startIntensity * 0.1 + (day / 30) * (startIntensity * 0.2);
      } else if (day <= 60) {
        // Month 2: Early warnings (20-40% of current intensity)
        const dayInMonth = day - 30;
        intensity = startIntensity * 0.2 + (dayInMonth / 30) * (startIntensity * 0.3);
      } else if (day <= 90) {
        // Month 3: Escalation (40-70% of current intensity)
        const dayInMonth = day - 60;
        intensity = startIntensity * 0.4 + (dayInMonth / 30) * (currentIntensity * 0.5);
      } else {
        // Month 4: Current state (70-100% of current intensity)
        const dayInMonth = day - 90;
        intensity = currentIntensity * 0.7 + (dayInMonth / 30) * (currentIntensity * 0.3);
      }
      
      point[sigName] = Math.min(100, Math.max(0, intensity));
    });

    return point;
  });

  // Generate customer-specific monthly data
  const monthlyData = generateMonthlySnapshots(customer, signalNames);
  
  // Generate customer-specific events
  const events = generateQuarterlyEvents(customer, signalNames);

  return { chartData: data, monthlyData, events };
}

// Generate monthly snapshots based on customer's actual signals
function generateMonthlySnapshots(customer: Customer, signalNames: string[]) {
  const monthly = [];
  
  for (let monthNum = 1; monthNum <= 4; monthNum++) {
    const monthData: any = {
      month: ["NOV 2023", "DEC 2023", "JAN 2024", "FEB 2024"][monthNum - 1],
      monthNum,
      signals: {}
    };

    signalNames.forEach(sigName => {
      const history = customer.signalHistory![sigName];
      const currentIntensity = history[history.length - 1].intensity;
      
      // Calculate intensity for this month
      let intensity = 0;
      let trend = "";
      let status = "🟢";
      
      if (monthNum === 1) {
        intensity = Math.round(currentIntensity * 0.1);
        trend = "Baseline";
        status = "🟢";
      } else if (monthNum === 2) {
        intensity = Math.round(currentIntensity * 0.25);
        trend = intensity > 0 ? `↑ ${Math.round((intensity / Math.max(1, currentIntensity * 0.1)) * 100 - 100)}%` : "Stable";
        status = intensity > 20 ? "🟡" : "🟢";
      } else if (monthNum === 3) {
        intensity = Math.round(currentIntensity * 0.6);
        const prevIntensity = currentIntensity * 0.25;
        trend = `↑ ${Math.round((intensity / Math.max(1, prevIntensity)) * 100 - 100)}%`;
        status = intensity > 50 ? "🟠" : intensity > 30 ? "🟡" : "🟢";
      } else {
        intensity = Math.round(currentIntensity);
        const prevIntensity = currentIntensity * 0.6;
        trend = `↑ ${Math.round((intensity / Math.max(1, prevIntensity)) * 100 - 100)}%`;
        status = intensity > 70 ? "🔴" : intensity > 50 ? "🟠" : intensity > 30 ? "🟡" : "🟢";
      }
      
      monthData.signals[sigName] = { intensity, trend, status };
    });
    
    // Add persona-specific values
    if (customer.persona === "Salary-Dependent Struggler") {
      monthData.salaryDelay = monthData.signals["Salary Delay"] || monthData.signals["Rent Overdue"];
      monthData.secondarySignal = monthData.signals["Savings Withdrawal"] || monthData.signals["Rent Overdue"];
    } else if (customer.persona === "Credit-Heavy Overuser") {
      monthData.creditUtil = monthData.signals["Credit utilization >85%"] || { intensity: [65, 78, 85, 91][monthNum - 1], trend: monthNum === 1 ? "Baseline" : `↑ ${[0, 20, 9, 7][monthNum - 1]}%`, status: ["🟡", "🟠", "🔴", "🔴"][monthNum - 1] };
    } else if (customer.persona === "Emergency Cash Withdrawer") {
      monthData.withdrawals = { amount: ["₹5k", "₹12k", "₹20k", "₹30k"][monthNum - 1], status: ["🟢", "🟡", "🟠", "🔴"][monthNum - 1] };
    }
    
    monthData.status = status;
    monthly.push(monthData);
  }
  
  return monthly;
}

// Generate quarterly events specific to customer's signal history
function generateQuarterlyEvents(customer: Customer, signalNames: string[]) {
  const events = [];
  const history = customer.signalHistory;
  
  if (!history) return events;
  
  // Analyze signal history to create realistic events
  signalNames.forEach(sigName => {
    const sigHistory = history[sigName];
    const currentIntensity = sigHistory[sigHistory.length - 1].intensity;
    
    if (sigName.includes("Salary")) {
      events.push(
        { date: "NOV 15", event: `First ${sigName.toLowerCase()} (minor)`, month: 1 },
        { date: "DEC 10", event: `${sigName} pattern emerges`, month: 2 },
        { date: "JAN 05", event: `${sigName} escalates`, month: 3 },
        { date: "FEB 01", event: `CRITICAL: ${sigName} persistent`, month: 4 }
      );
    } else if (sigName.includes("Savings") || sigName.includes("Withdrawal")) {
      events.push(
        { date: "DEC 10", event: `First ${sigName.toLowerCase()}`, month: 2 },
        { date: "JAN 20", event: `${sigName} frequency increases`, month: 3 },
        { date: "FEB 15", event: `Peak ${sigName.toLowerCase()}`, month: 4 }
      );
    } else if (sigName.includes("Rent")) {
      events.push(
        { date: "NOV 01", event: "Rent paid on time", month: 1 },
        { date: "JAN 15", event: "First rent overdue", month: 3 },
        { date: "FEB 10", event: "Multiple rent delays", month: 4 }
      );
    } else if (sigName.includes("Credit")) {
      events.push(
        { date: "NOV 01", event: "Credit utilization: 65%", month: 1 },
        { date: "DEC 10", event: "Utilization reaches 78%", month: 2 },
        { date: "JAN 05", event: "Warning: 85% utilization", month: 3 },
        { date: "FEB 01", event: "CRITICAL: 91% utilization", month: 4 }
      );
    }
  });
  
  // Add entanglement events if present
  if (customer.entanglements && customer.entanglements.length > 0) {
    events.push(
      { date: "JAN 30", event: `${customer.entanglements[0].relationship} begins showing stress (+5%)`, month: 3 },
      { date: "FEB 20", event: `Family cascade active (${customer.entanglements[0].riskImpact})`, month: 4 }
    );
  }
  
  events.push({ date: "TODAY", event: "Active critical state", month: 4 });
  
  return events.sort((a, b) => a.month - b.month || a.date.localeCompare(b.date));
}

// Generate personalized message based on customer's unique situation
function generatePersonalizedMessage(customer: Customer) {
  const signals = Object.keys(customer.signalHistory || {});
  const firstName = customer.name.split(' ')[0];
  
  if (customer.persona === "Salary-Dependent Struggler") {
    if (customer.entanglements.length > 0) {
      return `Hi ${firstName}, we noticed your rent is now overdue and your salary delays are becoming frequent. Our system shows this is affecting your ${customer.entanglements[0].relationship.toLowerCase()}'s financial health (${customer.entanglements[0].riskImpact} risk). Would a family financial check-in and EMI holiday help? Reply YES to schedule.`;
    } else {
      return `Hi ${firstName}, we've noticed your salary delays have increased from 1 day to 4 days over the last 4 months, and you've withdrawn ₹77,000 from savings. Would a 15-day EMI holiday on your ${customer.loanAmount} loan help stabilize? Reply YES.`;
    }
  } else if (customer.persona === "Credit-Heavy Overuser") {
    return `Dear ${firstName}, your credit utilization has increased from 65% to 91% over 4 months with 3 balance transfers. This is affecting your credit score and increasing your default risk to ${customer.defaultProb}%. Would a debt consolidation loan at 8% interest help? Schedule a call with our financial advisor.`;
  } else if (customer.persona === "Emergency Cash Withdrawer") {
    if (customer.entanglements.length > 0) {
      return `${firstName.toUpperCase()} - URGENT: Our system shows you have ${customer.signals.length} active loan apps and ${customer.emiDueDays === 0 ? 'missed' : 'upcoming'} payments. This is affecting your family - your ${customer.entanglements[0].relationship.toLowerCase()}'s risk is now ${customer.entanglements[0].risk}%. Please call our emergency financial support at 1800-555-1234 within 24 hours.`;
    } else {
      return `Hi ${firstName}, we've detected large ATM withdrawals totaling ₹30k+ this month. Would emergency credit assistance or financial counseling help? Reply YES for immediate support.`;
    }
  } else if (customer.persona === "Silent Saver Drain") {
    return `Hi ${firstName}, your savings have gradually decreased from ₹50k to ₹44k over 4 months. While payments are current, this trend suggests building financial pressure. Would you like a financial health check-in? Reply YES.`;
  } else if (customer.persona === "Paycheck-to-Paycheck Survivor") {
    if (customer.risk > 70) {
      return `${firstName}, we've noticed ${customer.signals.length} missed payments in the last 2 months and increasing zero-balance days. Your risk has increased to ${customer.risk}%. Immediate intervention needed - would a payment restructuring plan help? Reply YES.`;
    } else {
      return `Hi ${firstName}, your account shows consistent low balances (₹2-3k average). While stable, this leaves little room for emergencies. Would you like to explore flexible payment options? Reply YES.`;
    }
  }
  
  return `Hi ${firstName}, we've noticed changes in your financial behavior. Would you like to discuss support options? Reply YES.`;
}

export function WaveFunctionGraph({ customer, className = "" }: WaveFunctionGraphProps) {
  const { chartData, monthlyData, events } = useMemo(() => 
    generate4MonthData(customer), 
    [customer.id]
  );

  const personalizedMessage = useMemo(() => 
    generatePersonalizedMessage(customer), 
    [customer.id]
  );

  const signalNames = Object.keys(customer.signalHistory || {});
  const colors = ["#FF4444", "#FF8C00", "#FFD700", "#4169E1", "#BD10E0"];

  if (!customer.signalHistory || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-xl border border-dashed border-white/10">
        <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6] uppercase tracking-wider">
          Wave function data not available
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-[16px] font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          📈 4-MONTH WAVE FUNCTION - {customer.name.toUpperCase()}'S UNIQUE PATTERN
        </h3>
        <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
          Tracking: {signalNames.map((name, idx) => {
            const history = customer.signalHistory![name];
            const current = history[history.length - 1].intensity;
            const start = history[0].intensity;
            const change = start > 0 ? Math.round(((current - start) / start) * 100) : 100;
            return `${name} (${change > 0 ? '↑' : '↓'}${Math.abs(change)}%)`;
          }).join(" & ")}
        </p>
      </div>

      <div className="h-[350px] w-full relative mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
            
            <ReferenceArea x1={1} x2={60} fill="#6A0DAD" fillOpacity={0.03} label={{ value: "Q1 - Early Warnings", position: "top", fill: "#B0B0C0", fontSize: 10 }} />
            <ReferenceArea x1={61} x2={120} fill="#FF4444" fillOpacity={0.05} label={{ value: "Q2 - Critical Escalation", position: "top", fill: "#B0B0C0", fontSize: 10 }} />
            
            <XAxis 
              dataKey="day" 
              stroke="#2A2A3A" 
              tick={{ fill: "#B0B0C0", fontSize: 10, fontWeight: 500 }}
              tickFormatter={(val) => {
                if (val === 1) return "NOV";
                if (val === 30) return "DEC";
                if (val === 60) return "JAN";
                if (val === 90) return "FEB";
                if (val === 120) return "TODAY";
                return "";
              }}
              ticks={[1, 30, 60, 90, 120]}
            />
            <YAxis 
              stroke="#2A2A3A" 
              tick={{ fill: "#B0B0C0", fontSize: 10, fontWeight: 500 }}
              tickFormatter={(val) => `${val}%`}
              domain={[0, 100]}
              label={{ value: "Signal Intensity", angle: -90, position: "insideLeft", fill: "#B0B0C0", fontSize: 10 }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const monthLabel = label <= 30 ? "NOV" : label <= 60 ? "DEC" : label <= 90 ? "JAN" : "FEB";
                  const dayInMonth = label <= 30 ? label : label <= 60 ? label - 30 : label <= 90 ? label - 60 : label - 90;
                  
                  return (
                    <div className="bg-[#141424] border border-[#6A0DAD] p-4 rounded-xl shadow-2xl backdrop-blur-md">
                      <p className="text-white font-bold text-[12px] mb-2 uppercase tracking-wide">
                        {monthLabel} - Day {dayInMonth}
                      </p>
                      <div className="space-y-2">
                        {signalNames.map((name, idx) => (
                          <div key={idx} className="flex flex-col">
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[10px] text-[#B0B0C0] uppercase font-medium">{name}:</span>
                              <span className="text-[12px] font-bold" style={{ color: colors[idx % colors.length] }}>
                                {Math.round(data[name])}% intensity
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="line"
              wrapperStyle={{ paddingBottom: 10, fontSize: 10, textTransform: 'uppercase', fontWeight: 500, color: "#B0B0C0" }}
            />
            
            {signalNames.map((name, idx) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
                strokeDasharray={idx === 1 ? "5 5" : "0"}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: colors[idx % colors.length] }}
                animationDuration={2000}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quarterly Summary - Customer Specific */}
      <div className="bg-[#141424]/40 border border-[#2A2A3A] rounded-xl p-6 mb-6">
        <h4 className="text-[12px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          📊 {customer.name.split(' ')[0].toUpperCase()}'S QUARTERLY SUMMARY:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-white uppercase tracking-wide">Q1 (Nov-Dec)</span>
              <span className="text-[10px] text-[#6A0DAD] font-bold uppercase tracking-wider">
                {customer.risk < 30 ? "Stable → Minor concerns" : "Stable → Early warnings"}
              </span>
            </div>
            <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
              • {customer.persona === "Salary-Dependent Struggler" ? "Isolated salary incidents" : 
                 customer.persona === "Credit-Heavy Overuser" ? "Credit utilization rising" :
                 customer.persona === "Emergency Cash Withdrawer" ? "First withdrawal patterns" :
                 customer.persona === "Silent Saver Drain" ? "Gradual savings decline" :
                 "Low balance patterns emerge"}<br/>
              • Signals appear but {customer.risk > 60 ? "worsen quickly" : "resolve temporarily"}<br/>
              • {customer.affordabilitySurplus ? `Surplus: ₹${(customer.affordabilitySurplus * 1.27).toFixed(0)}` : "Financial cushion present"}
            </p>
          </div>
          <div className="bg-white/5 border border-[#FF4444]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-white uppercase tracking-wide">Q2 (Jan-Feb)</span>
              <span className="text-[10px] text-[#FF4444] font-bold uppercase tracking-wider">
                {customer.risk > 70 ? "Critical → Imminent default" : customer.risk > 50 ? "Accelerating → Critical" : "Improving → Recovery"}
              </span>
            </div>
            <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
              • Signals become {customer.risk > 60 ? "persistent and severe" : "more frequent"}<br/>
              • {signalNames[0]}: {customer.risk > 60 ? "Critical escalation" : "Moderate increase"}<br/>
              • {customer.affordabilitySurplus ? `Surplus: ₹${customer.affordabilitySurplus} (↓${Math.round((1 - customer.affordabilitySurplus / (customer.affordabilitySurplus * 1.27)) * 100)}%)` : "Financial pressure increases"}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#2A2A3A]">
          <p className="text-[12px] font-bold text-white uppercase tracking-wide mb-2">4-MONTH TREND FOR {customer.name.split(' ')[0].toUpperCase()}:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {signalNames.map((name, idx) => {
              const history = customer.signalHistory![name];
              const current = history[history.length - 1].intensity;
              const start = history[0].intensity;
              const change = start > 0 ? Math.round(((current - start) / start) * 100) : 100;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF4444]" />
                  <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
                    {name}: {start.toFixed(0)}% → {current}% (↑{change}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quarterly Events - Customer Specific */}
      <div className="bg-[#141424]/40 border border-[#2A2A3A] rounded-xl p-6 mb-6">
        <h4 className="text-[12px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6A0DAD]" /> {customer.name.split(' ')[0].toUpperCase()}'S KEY QUARTERLY EVENTS:
        </h4>
        <div className="relative pl-8 space-y-4 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-[#2A2A3A]">
          {events.map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-[#141424] border border-[#6A0DAD] flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-[#6A0DAD]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-[#6A0DAD] font-['JetBrains_Mono'] min-w-[60px]">{item.date}</span>
                <span className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">{item.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Snapshots - Customer Specific */}
      <div className="mb-6">
        <h4 className="text-[12px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          📅 {customer.name.split(' ')[0].toUpperCase()}'S MONTHLY SNAPSHOTS - UNIQUE TO THIS JOURNEY:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {monthlyData.map((month, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-white uppercase tracking-wide">{month.month}</span>
                <span className="text-[16px]">{month.status}</span>
              </div>
              <div className="space-y-3">
                {Object.entries(month.signals).map(([sigName, sigData]: [string, any], sigIdx) => (
                  <div key={sigIdx}>
                    <p className="text-[10px] text-[#B0B0C0] uppercase font-medium tracking-wider mb-1">{sigName}:</p>
                    <p className="text-[12px] font-bold text-white">{sigData.intensity}% intensity</p>
                    <p className="text-[10px] text-[#FF8C00] font-medium">{sigData.trend}</p>
                  </div>
                ))}
                {customer.affordabilitySurplus && (
                  <div>
                    <p className="text-[10px] text-[#B0B0C0] uppercase font-medium tracking-wider mb-1">Surplus:</p>
                    <p className="text-[12px] font-bold text-[#00C853]">
                      ₹{Math.round(customer.affordabilitySurplus * [1.27, 1.17, 1.06, 1.0][idx])}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Personalized Message Preview */}
      <div className="bg-[#141424]/40 border border-[#2A2A3A] rounded-xl p-6">
        <h4 className="text-[12px] font-bold text-white uppercase tracking-widest mb-4">
          💬 PERSONALIZED MESSAGE PREVIEW FOR {customer.name.split(' ')[0].toUpperCase()}
        </h4>
        <div className="bg-[#141424] border border-[#6A0DAD] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#6A0DAD]/20 border border-[#8A2BE2]/40 flex items-center justify-center shrink-0">
              <span className="text-[14px]">💬</span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium leading-[20px] text-white">
                {personalizedMessage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Panel */}
      <div className="mt-6 bg-[#6A0DAD]/10 border border-[#6A0DAD]/30 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#6A0DAD] mt-0.5 shrink-0" />
          <div>
            <h5 className="text-[12px] font-bold text-white uppercase tracking-widest mb-2">
              PROJECTION FOR {customer.name.split(' ')[0].toUpperCase()} (NEXT 30 DAYS):
            </h5>
            <div className="space-y-1">
              <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
                • Without intervention: Risk → {Math.min(100, customer.risk + 20)}-{Math.min(100, customer.risk + 25)}%
              </p>
              <p className="text-[12px] font-medium leading-[16px] text-[#E6E6E6]">
                • With EMI holiday: Risk → {Math.max(10, customer.risk - 30)}-{Math.max(15, customer.risk - 25)}%
              </p>
              <p className="text-[12px] font-bold text-[#FF4444] uppercase tracking-wide mt-2">
                • Urgency: {customer.risk > 70 ? "CRITICAL - intervene within 24h" : customer.risk > 50 ? "HIGH - intervene within 48h" : "MODERATE - monitor closely"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
