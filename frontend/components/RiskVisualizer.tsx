"use client";

import { motion } from "framer-motion";

interface RiskVisualizerProps {
  level: "Low" | "Medium" | "High";
}

export default function RiskVisualizer({ level }: RiskVisualizerProps) {
  const colors = {
    Low: "text-green-400 border-green-400 bg-green-400/10",
    Medium: "text-yellow-400 border-yellow-400 bg-yellow-400/10",
    High: "text-red-500 border-red-500 bg-red-500/10",
  };

  const percentages = {
    Low: 25,
    Medium: 60,
    High: 95,
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 glass rounded-2xl">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={364}
            initial={{ strokeDashoffset: 364 }}
            animate={{ strokeDashoffset: 364 - (364 * percentages[level]) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={colors[level].split(" ")[0]}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-white/60 uppercase tracking-widest"
          >
            Risk
          </motion.span>
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xl font-bold ${colors[level].split(" ")[0]}`}
          >
            {level}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-white/70">
          {level === "High" ? "Immediate attention required." : 
           level === "Medium" ? "Exercise caution and monitor." : 
           "Status clear. No anomalies detected."}
        </p>
      </div>
    </div>
  );
}
