import React, { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A14] text-white font-['Inter'] relative">
      {/* Quantum Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(106,13,173,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(106,13,173,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-[#0A0A14]/40 to-[#0A0A14]" />
        
        {/* Animated Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-[#8A2BE2] rounded-full blur-[1px]"
          />
        ))}
      </div>

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full min-h-screen"
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}