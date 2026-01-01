import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

export const GlobalLoader: React.FC = () => {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    "INITIALIZING SECURE ENVIRONMENT...",
    "ESTABLISHING ENCRYPTED UPLINK...",
    "VERIFYING OPERATOR CREDENTIALS...",
    "SYNCING MARKET DATA STREAMS...",
    "ACCESS GRANTED."
  ];

  useEffect(() => {
    let currentText = '';
    let messageIndex = 0;
    let charIndex = 0;
    
    const typeWriter = setInterval(() => {
      if (messageIndex >= messages.length) {
        clearInterval(typeWriter);
        return;
      }

      const currentMessage = messages[messageIndex];
      
      if (charIndex < currentMessage.length) {
        currentText += currentMessage[charIndex];
        setText(currentMessage.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setTimeout(() => {
          messageIndex++;
          charIndex = 0;
          setPhase(p => p + 1);
        }, 300); // Pause between messages
      }
    }, 30); // Typing speed

    return () => clearInterval(typeWriter);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1; // Smooth progress to 100%
      });
    }, 20); // 20ms * 100 = 2000ms = 2 seconds total load

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-md px-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />
            <Terminal className="w-16 h-16 text-accent relative z-10" />
          </div>
        </div>

        {/* Typing Text */}
        <div className="h-8 mb-4 flex items-center justify-center">
          <p className="text-accent text-sm tracking-wider font-bold">
            {text}<span className="animate-pulse">_</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-accent transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>SYSTEM_BOOT_SEQ_V2.4</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
