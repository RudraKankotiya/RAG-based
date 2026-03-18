"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, Cpu, History, Bell, Settings } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ResponsePanel from "@/components/ResponsePanel";
import RiskVisualizer from "@/components/RiskVisualizer";
import SourceSection from "@/components/SourceSection";
import { AskResponse } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Query failed");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary"
          >
            <ShieldAlert className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tighter text-white">
              Smart Container <span className="text-gradient">Risk Engine</span>
            </h1>
          </motion.div>
          <p className="text-white/40 max-w-md font-light">
            AI-powered intelligence for shipment security and regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 glass rounded-xl hover:text-primary transition-colors">
            <History className="w-5 h-5" />
          </button>
          <button className="p-3 glass rounded-xl hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-3 glass rounded-xl hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input & Upload */}
        <aside className="lg:col-span-4 space-y-8 h-full">
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">
              Data Ingestion
            </h2>
            <FileUpload 
              onUploadStart={() => setLoading(true)}
              onUploadSuccess={() => setLoading(false)}
              onUploadError={(err) => { setError(err); setLoading(false); }}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">
              Active Query
            </h3>
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about shipment anomalies..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <button 
                type="submit"
                disabled={loading || !query}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/20 rounded-lg text-primary transition-all disabled:opacity-0"
              >
                <Cpu className="w-5 h-5" />
              </button>
            </form>
          </section>
        </aside>

        {/* Right Column: Visualization & Response */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm"
              >
                Error: {error}
              </motion.div>
            )}

            {(response || loading) ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <ResponsePanel loading={loading} text={response?.answer || ""} />
                  </div>
                  <div>
                    {loading ? (
                       <div className="h-[200px] glass rounded-2xl shimmer" />
                    ) : (
                      <RiskVisualizer level={response?.risk_level || "Medium"} />
                    )}
                  </div>
                </div>

                {!loading && response && (
                  <SourceSection sources={response.sources} />
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-20 glass rounded-3xl border-dashed border-2 border-white/5 text-center gap-4"
              >
                <Search className="w-16 h-16 text-white/5" />
                <div className="space-y-1">
                  <p className="text-xl font-medium text-white/40">Ready to Scan</p>
                  <p className="text-sm text-white/20">Analyze shipment documents to detect potential risks.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer / Branding */}
      <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-xs font-mono">
        <p>© 2026 Smart Container | Secure Logistics Intelligence</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">API Status</a>
          <a href="#" className="hover:text-primary transition-colors">Compliance</a>
        </div>
      </footer>
    </main>
  );
}
