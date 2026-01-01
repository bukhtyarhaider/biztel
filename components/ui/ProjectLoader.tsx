import React, { useEffect, useState } from 'react';
import { Database, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

export const ProjectLoader: React.FC = () => {
  const [text, setText] = useState('LOADING PORTFOLIO');

  useEffect(() => {
    const states = ['LOADING PORTFOLIO', 'RETRIEVING RECORDS', 'CALCULATING METRICS', 'PREPARING DASHBOARD'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setText(states[index]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-black/50">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full animate-pulse" />
        <div className="relative z-10 p-4 border border-accent/20 rounded-xl bg-black/40 backdrop-blur-sm">
          <Database className="w-10 h-10 text-accent animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold text-white font-mono tracking-widest">
          {text}<span className="animate-pulse">...</span>
        </h3>
        <p className="text-xs text-muted-foreground font-mono">
          SECURE CONNECTION ESTABLISHED
        </p>
      </div>

      {/* Financial Data Loading Simulation */}
      <div className="mt-8 flex gap-4 opacity-50">
        <div className="w-2 h-8 bg-emerald-500/20 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-12 bg-emerald-500/20 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
        <div className="w-2 h-6 bg-emerald-500/20 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-10 bg-emerald-500/20 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
        <div className="w-2 h-4 bg-emerald-500/20 rounded animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
};
