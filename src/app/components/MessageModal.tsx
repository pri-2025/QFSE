import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, RefreshCcw, Edit2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface MessageModalProps {
  customer: any;
  onClose: () => void;
}

export function MessageModal({ customer, onClose }: MessageModalProps) {
  const [step, setStep] = useState<"compose" | "success">("compose");
  const [message, setMessage] = useState(
    `Hi ${customer.name.split(' ')[0]}, we noticed a potential delay in your income flow. At Barclays, we prioritize your stability. We've pre-approved a temporary 30-day EMI deferral to help you manage this transition. Click to activate or reply HELP to speak with a human advisor.`
  );

  const handleSend = () => {
    toast.success(`Intervention sent to ${customer.name}`);
    setStep("success");
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#141424] rounded-2xl border border-[#6A0DAD]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === "compose" ? (
            <motion.div 
              key="compose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#6A0DAD]/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-[#8A2BE2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">COHERENT COMMUNICATION LAYER</h3>
                    <p className="text-[10px] text-[#B0B0C0] uppercase tracking-widest font-semibold">GenAI Intervention Assistant</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-[#B0B0C0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">Tone Selector</label>
                    <select className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-lg p-2 text-xs text-white focus:border-[#6A0DAD] outline-none">
                      <option>Empathetic (Default)</option>
                      <option>Direct & Professional</option>
                      <option>Solution-Oriented</option>
                      <option>Urgent Action</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">Channel</label>
                    <select className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-lg p-2 text-xs text-white focus:border-[#6A0DAD] outline-none">
                      <option>SMS (Recommended)</option>
                      <option>WhatsApp</option>
                      <option>In-App Push</option>
                      <option>Email</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#B0B0C0] uppercase tracking-wider font-bold">Generated Message</label>
                    <button className="text-[10px] text-[#8A2BE2] hover:underline flex items-center gap-1">
                      <RefreshCcw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-32 bg-[#0A0A14] border border-[#2A2A3A] rounded-lg p-3 text-sm text-white focus:border-[#6A0DAD] outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg p-3 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#FFD700] shrink-0" />
                  <p className="text-[10px] text-[#FFD700] leading-normal">
                    <span className="font-bold">Human-in-the-loop:</span> This message was generated for a high-risk (65%) customer. Manual review is required before transmission.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-[#1A1A2A] text-[#B0B0C0] rounded-lg text-sm font-bold hover:bg-[#2A2A3A] transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSend}
                    className="flex-[2] px-4 py-2.5 bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white rounded-lg text-sm font-bold hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Coherent Message
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#00C853]/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#00C853]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Message Dispatched</h3>
              <p className="text-[#B0B0C0] text-sm max-w-xs">
                Observation successful. The customer's quantum state is being monitored for collapse into recovery.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
