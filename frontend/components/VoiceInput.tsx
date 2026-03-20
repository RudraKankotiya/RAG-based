"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Waves } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (!isListening) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`p-4 rounded-full transition-all duration-500 relative z-10 ${
          isListening ? "bg-red-500 scale-110 glow-red" : "bg-white/5 hover:bg-white/10 hover:scale-105"
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white/60" />}
        
        {isListening && (
           <motion.div
            layoutId="ripple"
            className="absolute inset-0 bg-red-500/30 rounded-full -z-1"
            initial={{ scale: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </button>

      {isListening && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl whitespace-nowrap"
        >
          <Waves className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Listening Engine...</span>
        </motion.div>
      )}
    </div>
  );
}
