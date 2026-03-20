"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileUp, MessageSquare, History, Shield, Zap } from "lucide-react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Command className="w-full glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-primary" />
                <Command.Input 
                  placeholder="Execute mission command (Ctrl + K)..." 
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-white/20 text-lg font-light tracking-tight italic"
                />
              </div>

              <Command.List className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                <Command.Empty className="text-center py-12 text-white/20 font-mono uppercase tracking-widest text-xs">No matching protocols found</Command.Empty>

                <Command.Group heading="QUICK PROTOCOLS" className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4 py-2">
                  <Item icon={FileUp} text="Ingest Shipment PDF" shortcut="U" />
                  <Item icon={MessageSquare} text="Initialize Neuro-Chat" shortcut="C" />
                  <Item icon={Shield} text="Full Security Scan" shortcut="S" />
                </Command.Group>

                <Command.Group heading="HISTORICAL DATA" className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4 py-2 mt-4">
                  <Item icon={History} text="Review Last 5 Anomalies" />
                  <Item icon={Zap} text="Fast Response Mode" />
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Item({ icon: Icon, text, shortcut }: { icon: any, text: string, shortcut?: string }) {
  return (
    <Command.Item className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all">
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
        <span className="text-white/80 font-medium">{text}</span>
      </div>
      {shortcut && (
        <kbd className="text-[10px] font-mono font-bold text-white/20 bg-white/5 p-1 rounded border border-white/5">{shortcut}</kbd>
      )}
    </Command.Item>
  );
}
