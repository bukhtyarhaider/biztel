import React from 'react';
import { MetricCardProps } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';

const DashboardCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  colorClass,
}) => {
  return (
    <Card className="glass-card border-none rounded-lg overflow-hidden group hover:bg-white/5 transition-all duration-300">
      <CardContent className="p-5 flex flex-col justify-between h-full relative">
        {/* Glow effect */}
        <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20", 
            trend === 'up' ? 'bg-emerald-500' : trend === 'down' ? 'bg-rose-500' : 'bg-blue-500'
        )}></div>

        <div className="flex justify-between items-start mb-2 relative z-10">
          <div>
            <h3 className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{value}</p>
          </div>
          <div className={cn("p-2 rounded-md bg-white/5 text-white/70", colorClass)}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-4 relative z-10">
            {subValue && <p className="text-xs text-muted-foreground font-mono">{subValue}</p>}
            
            {(trend || trendValue) && (
            <div className={cn("flex items-center text-xs font-mono px-1.5 py-0.5 rounded", 
                trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 
                trend === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400'
            )}>
                {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                <span>{trendValue}</span>
            </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;