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
    <Card className="hover:shadow-md transition-all border-slate-200 shadow-sm bg-white">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {subValue && <p className="text-xs text-slate-400 mt-1 font-mono">{subValue}</p>}
          </div>
          <div className={cn("p-3 rounded-lg flex items-center justify-center", colorClass)}>
            {icon}
          </div>
        </div>
        
        {(trend || trendValue) && (
          <div className="flex items-center mt-2">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500 mr-1" />}
            {trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400 mr-1" />}
            <span className={cn(
              "text-sm font-medium",
              trend === 'up' ? 'text-emerald-500' : 
              trend === 'down' ? 'text-rose-500' : 'text-slate-500'
            )}>
              {trendValue}
            </span>
            <span className="text-xs text-muted-foreground ml-2">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;