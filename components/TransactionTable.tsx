import React from 'react';
import { formatCurrency } from '../constants';
import { Transaction } from '../types';
import { ArrowUpDown, Search, Calendar, Youtube, Video, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { SortKey } from '../services/transactionService';

interface TransactionTableProps {
  data: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data }) => {
  const { filter, setFilter, sortConfig, handleSort, sortedData } = useTransactionFilter(data);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-muted-foreground ml-1 inline opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-accent ml-1 inline" />
      : <ChevronDown className="w-3 h-3 text-accent ml-1 inline" />;
  };

  return (
    <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-8">
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.02]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Transaction Blotter</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
          <input 
            type="text" 
            placeholder="Filter transactions..." 
            className="w-full pl-9 pr-4 py-1.5 bg-black/20 border border-white/10 rounded-md text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all font-mono"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead className="bg-[#0B0F19] text-muted-foreground text-[10px] uppercase tracking-wider sticky top-0 z-10 shadow-sm border-b border-white/5">
            <tr>
              <th 
                className="p-3 font-medium cursor-pointer group hover:text-white transition-colors select-none"
                onClick={() => handleSort('earningMonth')}
              >
                Month <SortIcon columnKey="earningMonth" />
              </th>
              <th 
                className="p-3 font-medium cursor-pointer group hover:text-white transition-colors select-none"
                onClick={() => handleSort('releaseDate')}
              >
                Date <SortIcon columnKey="releaseDate" />
              </th>
              <th 
                className="p-3 font-medium cursor-pointer group hover:text-white transition-colors select-none"
                onClick={() => handleSort('platform')}
              >
                Asset <SortIcon columnKey="platform" />
              </th>
              <th className="p-3 font-medium text-right">Gross ($)</th>
              <th className="p-3 font-medium text-right">Tax (%)</th>
              <th 
                className="p-3 font-medium text-right cursor-pointer group hover:text-white transition-colors select-none"
                onClick={() => handleSort('netUsd')}
              >
                Net ($) <SortIcon columnKey="netUsd" />
              </th>
              <th className="p-3 font-medium text-right">Net (PKR)</th>
              <th 
                className="p-3 font-medium text-center cursor-pointer group hover:text-white transition-colors select-none"
                onClick={() => handleSort('status')}
              >
                State <SortIcon columnKey="status" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-3">
                    <div className="flex items-center text-white font-mono text-xs">
                        {new Date(t.earningMonth).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center text-muted-foreground text-xs font-mono">
                    {new Date(t.releaseDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center">
                     {(t.platform && t.platform.toLowerCase() === 'youtube') ? (
                       <span className="flex items-center gap-1.5 text-xs text-red-400">
                         <Youtube className="w-3 h-3" /> YT
                       </span>
                     ) : (
                       <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                         <Video className="w-3 h-3" /> TT
                       </span>
                     )}
                  </div>
                </td>
                <td className="p-3 text-right text-xs text-muted-foreground font-mono">{formatCurrency(t.expectedUsd, 'USD')}</td>
                <td className="p-3 text-right text-xs text-muted-foreground font-mono">
                  {t.taxPercent > 0 ? `${t.taxPercent.toFixed(1)}%` : '-'}
                </td>
                <td className="p-3 text-right text-xs font-bold text-accent font-mono">{formatCurrency(t.netUsd, 'USD')}</td>
                <td className="p-3 text-right text-xs text-muted-foreground font-mono opacity-50">{formatCurrency(t.netPkr, 'PKR')}</td>
                <td className="p-3 text-center">
                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    t.status === 'Received' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                    t.status === 'Pending' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                    'border-blue-500/30 text-blue-400 bg-blue-500/10'
                  }`}>
                    {t.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No records found.
        </div>
      )}
    </div>
  );
};

export default TransactionTable;