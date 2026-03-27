import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, User, Zap, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { login } from "../../services/api";

export function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [roleSelection, setRoleSelection] = useState<boolean>(true);
  const navigate = useNavigate();

  const selectRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setRoleSelection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      localStorage.setItem("qfse_token", data.token);
      localStorage.setItem("qfse_user", JSON.stringify(data.user));
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
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
            QUANTUM <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#6A0DAD]">STATE FINANCIAL</span> ENGINE
          </h1>
          <p className="text-[#B0B0C0] uppercase text-xs tracking-[2px]">Command Center v4.0.0</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141424]/80 backdrop-blur-xl rounded-2xl border border-[#6A0DAD]/30 p-8 shadow-2xl relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {roleSelection ? (
              <motion.div 
                key="role-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-white mb-6 text-center">Select your access level</h2>
                
                <button 
                  onClick={() => selectRole("admin@qfse.com", "Qfse@2025")}
                  className="w-full flex items-center justify-between p-4 bg-[#0A0A14] border border-[#2A2A3A] hover:border-[#8A2BE2] rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold">Bank Admin</div>
                      <div className="text-xs text-[#B0B0C0]">Access the command center dashboard</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => selectRole("customer@qfse.com", "customer123")}
                  className="w-full flex items-center justify-between p-4 bg-[#0A0A14] border border-[#2A2A3A] hover:border-emerald-500 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold">Customer</div>
                      <div className="text-xs text-[#B0B0C0]">Access the customer financial portal</div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">System Login</h2>
                  <button type="button" onClick={() => setRoleSelection(true)} className="text-xs text-[#8A2BE2] hover:underline">Change Role</button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B0B0C0] uppercase tracking-wider mb-2">Operator ID (Email)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
                    <input 
                      type="text" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B0B0C0] uppercase tracking-wider mb-2">Security Hash</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C0]" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0A0A14] border border-[#2A2A3A] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8A2BE2] transition-colors"
                      placeholder="Enter passphrase"
                    />
                  </div>
                </div>

                {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">{error}</div>}

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
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-[#2A2A3A] text-center">
            <p className="text-[10px] text-[#B0B0C0] uppercase tracking-widest">Barclays PS3 Innovation Challenge • 2026</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
