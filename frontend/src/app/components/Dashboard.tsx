import React, { useState } from "react";
import { Header } from "./Header";
import { MetricsBar } from "./MetricsBar";
import { ScreenPersonaView } from "./ScreenPersonaView";
import { ScreenListView } from "./ScreenListView";
import { ScreenDetailDashboard } from "./ScreenDetailDashboard";
import { ScreenEntanglementDeepDive } from "./ScreenEntanglementDeepDive";
import { SuccessModal } from "./SuccessModal";
import { SimulatorView } from "./SimulatorView";
import { AnalyticsPersona } from "./AnalyticsPersona";
import { InterventionStrategies } from "./InterventionStrategies";
import { PersonaType, Customer, CUSTOMERS } from "../types";
import { AnimatePresence, motion } from "motion/react";

export type ScreenID = "persona-view" | "list-view" | "detail-view" | "entanglement-view" | "risk-filtered-view";
export type TabID = "dashboard" | "simulator" | "analytics";
export type AnalyticsView = "persona-analytics" | "intervention-strategies";

import { MobileDashboard } from "./MobileDashboard";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabID>("dashboard");
  const [currentScreen, setCurrentScreen] = useState<ScreenID>("persona-view");
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>("persona-analytics");
  const [strategiesPersona, setStrategiesPersona] = useState<PersonaType | null>(null);

  const selectedCustomer = CUSTOMERS.find(c => c.id === selectedCustomerId) || null;

  const navigateToPersona = (persona: PersonaType) => {
    setSelectedPersona(persona);
    setCurrentScreen("list-view");
  };

  const navigateToRiskFiltered = (riskLevels: string[]) => {
    setSelectedRiskLevels(riskLevels);
    setCurrentScreen("risk-filtered-view");
  };

  const navigateToCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentScreen("detail-view");
  };

  const navigateToEntanglement = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentScreen("entanglement-view");
  };

  const goBack = () => {
    if (currentScreen === "entanglement-view") setCurrentScreen("detail-view");
    else if (currentScreen === "detail-view") setCurrentScreen("list-view");
    else if (currentScreen === "list-view") setCurrentScreen("persona-view");
  };

  const handleInterventionSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleTabChange = (tab: TabID) => {
    if (tab === "dashboard") {
      setCurrentScreen("persona-view");
      setSelectedPersona(null);
      setSelectedCustomerId(null);
      setSelectedRiskLevels([]);
    }
    if (tab === "analytics") {
      setAnalyticsView("persona-analytics");
      setStrategiesPersona(null);
    }
    setActiveTab(tab);
  };

  const handleViewStrategies = (persona: PersonaType) => {
    setStrategiesPersona(persona);
    setAnalyticsView("intervention-strategies");
  };

  const handleBackToAnalytics = () => {
    setAnalyticsView("persona-analytics");
    setStrategiesPersona(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="hidden lg:flex flex-col min-h-screen">
        <Header 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onSettings={() => {}} 
          onNotifications={() => {}} 
        />
        
        {activeTab === "dashboard" && <MetricsBar />}

        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {currentScreen === "persona-view" && (
                  <ScreenPersonaView 
                    key="persona" 
                    onSelectPersona={navigateToPersona}
                    onSelectRiskLevels={navigateToRiskFiltered}
                  />
                )}

                {currentScreen === "list-view" && (
                  <ScreenListView 
                    key="list" 
                    persona={selectedPersona} 
                    onBack={() => setCurrentScreen("persona-view")} 
                    onSelectCustomer={navigateToCustomer}
                  />
                )}

                {currentScreen === "detail-view" && selectedCustomer && (
                  <ScreenDetailDashboard 
                    key="detail" 
                    customer={selectedCustomer} 
                    onBack={() => setCurrentScreen("list-view")}
                    onViewEntanglement={() => navigateToEntanglement(selectedCustomer.id)}
                    onSwitchCustomer={navigateToCustomer}
                    onIntervention={handleInterventionSuccess}
                  />
                )}

                {currentScreen === "entanglement-view" && selectedCustomer && (
                  <ScreenEntanglementDeepDive 
                    key="entanglement" 
                    customer={selectedCustomer} 
                    onBack={() => setCurrentScreen("detail-view")}
                    onIntervene={handleInterventionSuccess}
                  />
                )}

                {currentScreen === "risk-filtered-view" && (
                  <ScreenListView 
                    key="risk-filtered" 
                    persona={null}
                    riskLevels={selectedRiskLevels}
                    onBack={() => setCurrentScreen("persona-view")} 
                    onSelectCustomer={navigateToCustomer}
                  />
                )}
              </motion.div>
            )}

            {activeTab === "simulator" && (
              <motion.div 
                key="simulator-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full"
              >
                <SimulatorView initialCustomerId={selectedCustomerId} />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div 
                key="analytics-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {analyticsView === "persona-analytics" && (
                  <AnalyticsPersona onViewStrategies={handleViewStrategies} />
                )}
                {analyticsView === "intervention-strategies" && strategiesPersona && (
                  <InterventionStrategies 
                    persona={strategiesPersona} 
                    onBack={handleBackToAnalytics}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileDashboard />

      {showSuccessModal && (
        <SuccessModal 
          customerName={selectedCustomer?.name || ""} 
          onClose={() => setShowSuccessModal(false)} 
        />
      )}
    </div>
  );
}