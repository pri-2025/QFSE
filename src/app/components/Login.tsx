import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, User, Zap } from "lucide-react";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 flex items-center justify-center h-screen w-full px-4"
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 rounded-full bg-[#6A0DAD]/20 border border-[#8A2BE2]/40 mb-4 shadow-[0_0_30px_rgba(138,43,226,0.3)]"
          >
            <Zap className="w-10 h-10 text-[#8A2BE2]" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            QUANTUM <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#6A0DAD]">PRE-DELINQUENCY</span>
          </h1>
          <p className="text-[#B0B0C0] uppercase text-xs tracking-[2px]">Command Center v4.0.0</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141424]/80 backdrop-blur-xl rounded-2xl border border-[#6A0DAD]/30 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#B0B0C0] uppercase tracking-wider mb-2">Operator ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
                <input 
                  type="text" 
                  defaultValue="QUANTUM_ADMIN_01"
                  className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors"
                  placeholder="Enter operator ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B0B0C0] uppercase tracking-wider mb-2">Security Hash</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors"
                  placeholder="Enter passphrase"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white font-bold py-4 rounded-lg shadow-[0_4px_20px_rgba(106,13,173,0.4)] hover:shadow-[0_4px_30px_rgba(138,43,226,0.6)] transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>ENTER THE QUANTUM REALM</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Zap className="w-4 h-4 fill-white" />
                  </motion.div>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2A2A3A] text-center">
            <p className="text-[10px] text-[#B0B0C0] uppercase tracking-widest">Barclays PS3 Innovation Challenge • 2026</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
