import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CheckCircle2, Zap, X, ArrowRight } from "lucide-react";

interface SuccessModalProps {
  customerName: string;
  onClose: () => void;
}

export function SuccessModal({ customerName, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-[#141424] rounded-2xl border border-[#00C853]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C853] via-[#8A2BE2] to-[#00C853] animate-[move_2s_linear_infinite]" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#B0B0C0] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          <div className="w-20 h-20 bg-[#00C853]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,200,83,0.3)] border border-[#00C853]/40">
            <CheckCircle2 className="w-10 h-10 text-[#00C853]" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Intervention Sent</h3>
          <p className="text-[11px] text-[#B0B0C0] uppercase tracking-widest font-bold mb-6 flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#8A2BE2]" /> Quantum State Collapsed
          </p>
          
          <div className="space-y-4 text-left bg-black/20 p-4 rounded-xl border border-white/5 mb-8">
            <div className="flex justify-between text-xs">
              <span className="text-[#B0B0C0]">Recipient:</span>
              <span className="text-white font-bold">{customerName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#B0B0C0]">Channel:</span>
              <span className="text-white font-bold uppercase tracking-wider">SMS Gateway</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#B0B0C0]">Expected Recovery:</span>
              <span className="text-[#00C853] font-bold">+65% Probability</span>
            </div>
          </div>

          <p className="text-[10px] text-[#B0B0C0] leading-relaxed mb-8">
            Intervention successfully dispatched to root node. We expect a systemic risk reduction across the connected family cluster within 24 hours.
          </p>

          <div className="flex flex-col gap-2">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-[#00C853] hover:bg-[#00E676] rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-[#00C853]/20"
            >
              Track Response
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-[#B0B0C0] transition-all"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
