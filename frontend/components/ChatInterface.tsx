"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, Command } from "lucide-react";
import { ChatMessage, AskResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ChatInterfaceProps {
  onSendMessage: (msg: string) => Promise<AskResponse>;
}

export default function ChatInterface({ onSendMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const result = await onSendMessage(input);
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36),
        role: "assistant",
        content: result.answer,
        timestamp: new Date(),
        metadata: result,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-[2.5rem] overflow-hidden border border-white/5 relative">
      {/* Absolute floating gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40">
            <div className="p-4 bg-white/5 rounded-full border border-dashed border-white/20">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-medium text-white italic">Neural Processor Idle</p>
              <p className="text-sm font-light text-white/60 uppercase tracking-widest">Awaiting shipment intelligence query</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`p-2.5 rounded-xl border ${msg.role === "user" ? "bg-primary border-primary/50" : "bg-white/5 border-white/10"}`}>
                {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                <div className={`p-5 rounded-3xl ${
                  msg.role === "user" 
                    ? "bg-primary/20 text-white rounded-tr-none border border-primary/20" 
                    : "glass text-white/90 rounded-tl-none font-light italic text-lg leading-relaxed"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-white/20">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • MISSION CONTROL
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl border bg-white/5 border-white/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="p-4 glass rounded-3xl rounded-tl-none animate-pulse">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/5 border-t border-white/5">
        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Query engine..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-20 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all text-sm font-medium tracking-wide"
          />
          <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-1 rounded-md border border-white/5">ENTER</span>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-primary/20 hover:bg-primary/40 rounded-xl text-primary transition-all disabled:opacity-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
