"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Copy, Check, Terminal } from "lucide-react";

interface ResponsePanelProps {
  text: string;
  loading: boolean;
}

export default function ResponsePanel({ text, loading }: ResponsePanelProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading) {
      setDisplayedText("");
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i += 3; // Speed of typing
      if (i > text.length) clearInterval(interval);
    }, 10);

    return () => clearInterval(interval);
  }, [text, loading]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">AI Insight</span>
        </div>
        {text && !loading && (
          <button 
            onClick={copyToClipboard}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="relative glass p-6 rounded-2xl min-h-[150px] overflow-hidden">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/4 shimmer rounded" />
            <div className="h-4 w-full shimmer rounded" />
            <div className="h-4 w-5/6 shimmer rounded" />
          </div>
        ) : (
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/90 leading-relaxed text-lg font-light italic"
            >
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-5 ml-1 bg-primary align-middle"
              />
            </motion.p>
          </AnimatePresence>
        )}

        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <Terminal className="w-12 h-12 text-primary" />
        </div>
      </div>
    </div>
  );
}
