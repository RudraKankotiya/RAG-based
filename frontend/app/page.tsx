"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Search, 
  MessageSquare, 
  LayoutDashboard, 
  History, 
  Settings, 
  Bell, 
  User, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  Share2
} from "lucide-react";

import FileUpload from "@/components/FileUpload";
import RiskDashboard from "@/components/RiskDashboard";
import ChatInterface from "@/components/ChatInterface";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";
import CommandPalette from "@/components/CommandPalette";
import VoiceInput from "@/components/VoiceInput";
import SourceSection from "@/components/SourceSection";

import { AskResponse } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat" | "history">("dashboard");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (question: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("Neural Link Failed");
      const data = await res.json();
      setResponse(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Check for dangerous goods compliance",
    "Identify any port congestion risks",
    "Analyze weight discrepancy thresholds",
    "Verify regulatory paperwork status"
  ];

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/30">
      <CommandPalette />

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col p-6 gap-8 hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-primary rounded-xl glow-primary">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white hidden lg:block uppercase italic">Smart Container</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
            icon={LayoutDashboard} 
            label="Dashboard" 
          />
          <NavItem 
            active={activeTab === "chat"} 
            onClick={() => setActiveTab("chat")} 
            icon={MessageSquare} 
            label="Neural Chat" 
          />
          <NavItem 
            active={activeTab === "history"} 
            onClick={() => setActiveTab("history")} 
            icon={History} 
            label="Shipment Logs" 
          />
        </nav>

        <div className="space-y-2 pt-8 border-t border-white/5">
          <NavItem active={false} icon={Settings} label="Engine Config" />
          <div className="p-4 glass rounded-[1.5rem] mt-4 hidden lg:block">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Status</span>
            </div>
            <p className="text-xs text-white/60 font-medium">Llama 3.3 Active</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-primary" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/40 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              PROD-CLUSTER-A
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-white/40" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <Search className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-4 rounded-xl transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent overflow-hidden">
                <User className="w-full h-full p-1.5 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-none">Rudra Kankotiya</p>
                <p className="text-[10px] text-white/40 font-medium tracking-tight">Lead Engineer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Section Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div 
                key="dash"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-7xl mx-auto space-y-12 pb-20"
              >
                {/* Hero / Hero Input */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Next Generation Risk Intelligence
                    </motion.div>
                    <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter leading-[0.9]">
                      Identify Threats, <br/> 
                      <span className="text-gradient">Faster than ever.</span>
                    </h2>
                    <p className="text-white/40 text-lg font-light max-w-xl italic leading-relaxed">
                      Our Risk Engine leverages deep neural retrieval to cross-reference global regulations 
                      and shipment history in milliseconds.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {suggestions.map((s, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleQuery(s)}
                          className="px-4 py-2 glass rounded-xl text-xs font-medium text-white/50 hover:text-white hover:border-primary/50 transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-full">
                    <FileUpload 
                      onUploadStart={() => setLoading(true)}
                      onUploadSuccess={() => setLoading(false)}
                      onUploadError={() => setLoading(false)}
                    />
                  </div>
                </section>

                {/* Dashboard Metrics */}
                <AnimatePresence>
                  {(response || loading) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                      {/* Top Bar for Results */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-white uppercase italic">Session ID: <span className="text-primary tracking-tighter">RX-990-2</span></h3>
                            <button className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white transition-colors">
                               <Download className="w-3.5 h-3.5" /> EXPORT REPORT
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white transition-colors">
                               <Share2 className="w-3.5 h-3.5" /> SHARE LINK
                            </button>
                         </div>
                      </div>

                      <RiskDashboard 
                        level={response?.risk_level || "Medium"}
                        anomalyScore={response?.anomaly_score || 0}
                        confidence={response?.confidence_score || 0}
                        reasoning={response?.reasoning_points || []}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                         <div className="lg:col-span-8">
                            <ChatInterface onSendMessage={handleQuery} />
                         </div>
                         <div className="lg:col-span-4">
                            <ExplainabilityPanel />
                         </div>
                      </div>

                      <SourceSection sources={response?.sources || []} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "chat" && (
              <motion.div 
                 key="chat"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="max-w-4xl mx-auto h-full flex flex-col"
              >
                  <ChatInterface onSendMessage={handleQuery} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Overlay (Absolute bottom right) */}
        <div className="absolute bottom-8 right-8 z-50">
           <VoiceInput onTranscript={handleQuery} />
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        active 
          ? "bg-primary/10 text-primary border border-primary/20 glow-primary" 
          : "text-white/40 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-primary" : "text-white/20"}`} />
      <span className="font-bold text-sm tracking-tight hidden lg:block uppercase italic">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto hidden lg:block" />}
    </button>
  );
}
