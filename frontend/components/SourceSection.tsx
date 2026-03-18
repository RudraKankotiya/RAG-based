"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";

interface Source {
  source: string;
  page: number;
  snippet: string;
}

interface SourceSectionProps {
  sources: Source[];
}

export default function SourceSection({ sources }: SourceSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors py-2 px-1"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">Supporting Evidence ({sources.length} sources)</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3 pt-2"
          >
            {sources.map((source, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 glass rounded-xl border-l-2 border-primary/20 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary/80 uppercase tracking-tighter">
                    {source.source} — Page {source.page}
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  "{source.snippet}"
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
