import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

import { Login } from "./components/common/Login";
import { Dashboard as AdminDashboard } from "./components/admin/Dashboard";
import { ProtectedRoute, RoleBasedRedirect } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { CustomerLayout } from "./components/customer/CustomerLayout";
import { CustomerHome } from "./components/customer/CustomerHome";
import { CustomerRisk } from "./components/customer/CustomerRisk";
import { CustomerSnapshot } from "./components/customer/CustomerSnapshot";
import { CustomerInterventions } from "./components/customer/CustomerInterventions";
import { CustomerTimeline } from "./components/customer/CustomerTimeline";
import { CustomerRepayment } from "./components/customer/CustomerRepayment";
import { CustomerNotifications } from "./components/customer/CustomerNotifications";
import { CustomerProfile } from "./components/customer/CustomerProfile";

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
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RoleBasedRedirect />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="portfolio" element={<div className="p-8">Admin Portfolio (Placeholder)</div>} />
                  <Route path="analytics" element={<div className="p-8">Admin Analytics (Placeholder)</div>} />
                  <Route path="customer/:id" element={<div className="p-8">Customer Profile (Placeholder)</div>} />
                </Route>

                {/* Customer Routes */}
                <Route path="/customer" element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <CustomerLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="home" replace />} />
                  <Route path="home" element={<CustomerHome />} />
                  <Route path="risk" element={<CustomerRisk />} />
                  <Route path="snapshot" element={<CustomerSnapshot />} />
                  <Route path="interventions" element={<CustomerInterventions />} />
                  <Route path="timeline" element={<CustomerTimeline />} />
                  <Route path="repayment" element={<CustomerRepayment />} />
                  <Route path="notifications" element={<CustomerNotifications />} />
                  <Route path="profile" element={<CustomerProfile />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </motion.div>
        )}
      </AnimatePresence>


      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}