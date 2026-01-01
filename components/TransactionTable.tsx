import React, { useState } from 'react';
import { formatCurrency } from '../constants';
import { Transaction } from '../types';
import { ArrowUpDown, Search, Calendar, Youtube, Video, Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TransactionTableProps {
  data: Transaction[];
}

type SortKey = 'earningMonth' | 'netUsd' | 'platform' | 'status' | 'releaseDate';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'earningMonth', direction: 'asc' });

  // Filter
  const filteredData = data.filter(t => 
    t.platform.toLowerCase().includes(filter.toLowerCase()) || 
    t.status.toLowerCase().includes(filter.toLowerCase()) ||
    t.method.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-blue-500 ml-1 inline" />
      : <ChevronDown className="w-3 h-3 text-blue-500 ml-1 inline" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search platform, status..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse relative">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
            <tr>
              <th 
                className="p-4 font-semibold cursor-pointer group hover:bg-slate-100 transition-colors select-none"
                onClick={() => handleSort('earningMonth')}
              >
                Earning Month <SortIcon columnKey="earningMonth" />
              </th>
              <th 
                className="p-4 font-semibold cursor-pointer group hover:bg-slate-100 transition-colors select-none"
                onClick={() => handleSort('releaseDate')}
              >
                Release Date <SortIcon columnKey="releaseDate" />
              </th>
              <th 
                className="p-4 font-semibold cursor-pointer group hover:bg-slate-100 transition-colors select-none"
                onClick={() => handleSort('platform')}
              >
                Platform <SortIcon columnKey="platform" />
              </th>
              <th className="p-4 font-semibold text-right">Expected ($)</th>
              <th className="p-4 font-semibold text-right">Tax (%)</th>
              <th 
                className="p-4 font-semibold text-right cursor-pointer group hover:bg-slate-100 transition-colors select-none"
                onClick={() => handleSort('netUsd')}
              >
                Net ($) <SortIcon columnKey="netUsd" />
              </th>
              <th className="p-4 font-semibold text-right">Net (PKR)</th>
              <th 
                className="p-4 font-semibold text-center cursor-pointer group hover:bg-slate-100 transition-colors select-none"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon columnKey="status" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                    <div className="flex items-center text-slate-700 font-bold">
                        <Clock className="w-3 h-3 mr-2 text-blue-500" />
                        {new Date(t.earningMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center text-slate-500 text-sm">
                    <Calendar className="w-3 h-3 mr-2 text-slate-400" />
                    {new Date(t.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                     {(t.platform && t.platform.toLowerCase() === 'youtube') ? (
                       <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                         <Youtube className="w-3 h-3 mr-1" /> YouTube
                       </span>
                     ) : (
                       <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                         <Video className="w-3 h-3 mr-1" /> TikTok
                       </span>
                     )}
                  </div>
                </td>
                <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(t.expectedUsd, 'USD')}</td>
                <td className="p-4 text-right text-xs text-slate-500">
                  {t.taxPercent > 0 ? (
                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">{t.taxPercent.toFixed(1)}%</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(t.netUsd, 'USD')}</td>
                <td className="p-4 text-right font-mono text-sm text-slate-500">{formatCurrency(t.netPkr, 'PKR')}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    t.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                    t.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredData.length === 0 && (
        <div className="p-8 text-center text-slate-400">
          No transactions found matching your filter.
        </div>
      )}
    </div>
  );
};

export default TransactionTable;