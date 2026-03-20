"use client";

import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { ShieldAlert, Zap, Target, AlertTriangle } from "lucide-react";

interface RiskDashboardProps {
  level: "Low" | "Medium" | "High";
  anomalyScore: number;
  confidence: number;
  reasoning: string[];
}

export default function RiskDashboard({ level, anomalyScore, confidence, reasoning }: RiskDashboardProps) {
  const radarData = [
    { subject: 'Anomaly', A: anomalyScore, fullMark: 100 },
    { subject: 'Confidence', A: confidence, fullMark: 100 },
    { subject: 'Security', A: level === 'High' ? 30 : 90, fullMark: 100 },
    { subject: 'Complexity', A: 70, fullMark: 100 },
    { subject: 'Urgency', A: level === 'High' ? 95 : 20, fullMark: 100 },
  ];

  const colors = {
    Low: "text-green-400 border-green-400 bg-green-400/10",
    Medium: "text-yellow-400 border-yellow-400 bg-yellow-400/10",
    High: "text-red-500 border-red-500 bg-red-500/10",
  };

  const borderColors = {
    Low: "rgba(74, 222, 128, 0.5)",
    Medium: "rgba(250, 204, 21, 0.5)",
    High: "rgba(239, 68, 68, 0.5)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Risk Gauge & Stats */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-[2rem] p-8 flex flex-col gap-8 relative overflow-hidden"
      >
        <div className="flex items-center justify-between z-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white tracking-tight">Risk Vector</h3>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest leading-none">Intelligence Engine v2.0</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full border text-sm font-bold ${colors[level]}`}>
            {level} Risk
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[250px] z-10">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Radar
                name="Risk"
                dataKey="A"
                stroke={level === 'High' ? '#ef4444' : level === 'Medium' ? '#facc15' : '#4ade80'}
                fill={level === 'High' ? '#ef4444' : level === 'Medium' ? '#facc15' : '#4ade80'}
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Backdrop Glow */}
        <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 -z-0`} style={{ backgroundColor: borderColors[level] }} />
      </motion.div>

      {/* Breakdown Metrics */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 flex items-center gap-6"
        >
          <div className="p-4 bg-primary/10 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-white/40 text-sm font-medium uppercase">Anomaly Score</span>
              <span className="text-2xl font-bold text-white tracking-tighter">{anomalyScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${anomalyScore}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 flex items-center gap-6"
        >
          <div className="p-4 bg-secondary/10 rounded-2xl">
            <Zap className="w-8 h-8 text-secondary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-white/40 text-sm font-medium uppercase">Confidence level</span>
              <span className="text-2xl font-bold text-white tracking-tighter">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                className="h-full bg-secondary"
              />
            </div>
          </div>
        </motion.div>

        {/* Reasoning Points */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-white/60">
            <Target className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Assessment Reasoning</h4>
          </div>
          <div className="space-y-3">
            {reasoning.map((point, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-150 transition-transform ${level === 'High' ? 'bg-red-500' : 'bg-white/20'}`} />
                <p className="text-sm text-white/60 leading-tight group-hover:text-white/90 transition-colors uppercase italic font-medium tracking-tight">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
