"use client";

import { motion } from "framer-motion";
import { Brain, Cpu, Database, Network } from "lucide-react";

export default function ExplainabilityPanel() {
  const steps = [
    { title: "Retrieval", icon: Database, desc: "Found relevant compliance documentation" },
    { title: "Processing", icon: Network, desc: "Analyzed cross-border shipment patterns" },
    { title: "Reasoning", icon: Brain, desc: "Detected potential regulatory mismatch" },
    { title: "Synthesis", icon: Cpu, desc: "Generated risk-weighted natural explanation" },
  ];

  return (
    <div className="w-full h-full glass rounded-[2rem] p-8 space-y-8">
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">Cognitive Pulse</h3>
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest leading-none">Internal AI Thought Trace</p>
      </div>

      <div className="relative space-y-12 pl-4">
        {/* Connector Line */}
        <div className="absolute left-[2.4rem] top-8 bottom-8 w-px bg-gradient-to-b from-primary via-secondary to-accent opacity-20" />

        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className="flex items-center gap-6 relative"
          >
            <div className="relative z-10 p-3 bg-white/5 rounded-2xl border border-white/10 group hover:border-primary/50 transition-colors">
              <step.icon className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-primary/20 rounded-2xl blur-md -z-1 opacity-0 group-hover:opacity-100" 
              />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-white font-bold text-lg tracking-tight leading-none uppercase italic">{step.title}</h4>
              <p className="text-white/40 text-sm font-light italic">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
