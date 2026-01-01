import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
  Line
} from 'recharts';
import { Transaction } from '../types';

interface PerformanceChartsProps {
  data: Transaction[];
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ data }) => {
  // Aggregate data by earningMonth
  const monthlyDataMap = new Map();

  // Sort transactions by earning month first to ensure correct order
  const sortedTrans = [...data].sort((a, b) => 
    new Date(a.earningMonth).getTime() - new Date(b.earningMonth).getTime()
  );

  sortedTrans.forEach(t => {
    // Earning month key (e.g., "Apr '24")
    const dateObj = new Date(t.earningMonth);
    const key = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    if (!monthlyDataMap.has(key)) {
      monthlyDataMap.set(key, { 
        name: key, 
        rawDate: dateObj,
        Youtube: 0, 
        Tiktok: 0, 
        Total: 0 
      });
    }
    
    const entry = monthlyDataMap.get(key);
    if (t.platform === 'Youtube') entry.Youtube += t.netUsd;
    if (t.platform === 'Tiktok') entry.Tiktok += t.netUsd;
    entry.Total += t.netUsd;
  });

  // Convert map to array and calculate growth
  const monthlyData = Array.from(monthlyDataMap.values()).map((entry, index, array) => {
    let growth = 0;
    if (index > 0) {
      const prevTotal = array[index - 1].Total;
      if (prevTotal > 0) {
        growth = ((entry.Total - prevTotal) / prevTotal) * 100;
      }
    }
    return {
      ...entry,
      Growth: parseFloat(growth.toFixed(1))
    };
  });

  // Aggregate by platform for Pie Chart
  const platformData = [
    { name: 'Youtube', value: 0, color: '#FF0000' },
    { name: 'Tiktok', value: 0, color: '#00F2EA' }
  ];

  data.forEach(t => {
    if (t.platform === 'Youtube') platformData[0].value += t.netUsd;
    if (t.platform === 'Tiktok') platformData[1].value += t.netUsd;
  });

  // Avoid division by zero in UI calculation
  const totalPlatformValue = platformData[0].value + platformData[1].value;
  const youtubePercent = totalPlatformValue > 0 
    ? ((platformData[0].value / totalPlatformValue) * 100).toFixed(0) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Revenue Trend Area Chart with Growth */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Revenue & Performance Gain</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                yAxisId="left"
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10b981" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}%`}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b' }}
                formatter={(value: number, name: string) => {
                  if (name === 'Growth') return [`${value > 0 ? '+' : ''}${value}%`, 'MoM Growth'];
                  return [`$${value.toFixed(2)}`, name];
                }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="Total" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                strokeWidth={3}
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Growth"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="Growth"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {monthlyData.map((d, i) => (
                <div key={i} className="flex-shrink-0 text-center min-w-[60px]">
                    <div className="text-xs text-slate-500">{d.name}</div>
                    <div className={`text-xs font-bold ${d.Growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {i === 0 ? '-' : `${d.Growth > 0 ? '+' : ''}${d.Growth}%`}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Platform Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Platform Share</h3>
        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
             <span className="block text-2xl font-bold text-slate-800">
               {youtubePercent}%
             </span>
             <span className="text-xs text-slate-400">Youtube</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;