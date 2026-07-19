import React, { useState, useEffect } from 'react';
import { Feather } from 'lucide-react';

interface EngagingLoaderProps {
  type: 'analyze' | 'humanize';
}

export function EngagingLoader({ type }: EngagingLoaderProps) {
  const messagesAnalyze = [
    "Reading between the lines...",
    "Weighing the ink...",
    "Consulting the archives...",
    "Analyzing cadence and flow...",
    "Detecting artificial patterns..."
  ];
  
  const messagesHumanize = [
    "Translating reality...",
    "Softening the edges...",
    "Breathing life into the words...",
    "Crafting authentic voice...",
    "Restoring the human touch..."
  ];
  
  const messages = type === 'analyze' ? messagesAnalyze : messagesHumanize;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <div className="absolute w-12 h-12 border border-primary/30 rounded-full animate-[spin_4s_linear_infinite]" />
        <div className="absolute w-16 h-16 border border-primary/10 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
        <Feather className="w-8 h-8 text-primary relative z-10 animate-pulse" />
      </div>
      <p 
        key={index}
        className="text-xl font-serif text-primary/80 animate-in slide-in-from-bottom-2 fade-in duration-1000 text-center tracking-wide"
      >
        {messages[index]}
      </p>
    </div>
  );
}
