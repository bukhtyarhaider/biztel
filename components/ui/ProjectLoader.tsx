import React, { useEffect, useState } from 'react';
import { Lock, FileText, Database } from 'lucide-react';

export const ProjectLoader: React.FC = () => {
  const [text, setText] = useState('DECRYPTING ASSETS');

  useEffect(() => {
    const states = ['DECRYPTING ASSETS', 'FETCHING TRANSACTIONS', 'CALCULATING YIELDS', 'RENDERING DASHBOARD'];
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

      {/* Hex Dump Effect Simulation */}
      <div className="mt-8 p-4 bg-black/40 border border-white/5 rounded-lg w-64 h-32 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
        <div className="font-mono text-[10px] text-emerald-500/50 leading-tight">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex justify-between opacity-50">
              <span>0x{Math.random().toString(16).substr(2, 4).toUpperCase()}</span>
              <span>{Math.random().toString(2).substr(2, 8)}</span>
              <span>{Math.random().toString(16).substr(2, 2).toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
