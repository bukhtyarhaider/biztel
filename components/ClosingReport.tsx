import React, { useState } from 'react';
import { formatCurrency } from '../constants';
import { Transaction } from '../types';
import { FileText, Calculator, Landmark, CheckCircle2, Download, Printer, Loader2, Building2 } from 'lucide-react';

interface ClosingReportProps {
  data: Transaction[];
  companyName: string;
}

const ClosingReport: React.FC<ClosingReportProps> = ({ data, companyName }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Calculate Total Fiscal Expected Revenue (May 23 - Jan 25)
  const totalExpectedUSD = data.reduce((acc, curr) => acc + curr.expectedUsd, 0);
  const totalReceivedUSD = data.filter(t => t.status === 'Received').reduce((acc, curr) => acc + curr.expectedUsd, 0); // Gross
  
  // 2. Net Income Realized (After tax/deductions)
  const totalNetRealizedUSD = data.filter(t => t.status === 'Received').reduce((acc, curr) => acc + curr.netUsd, 0);
  const totalNetRealizedPKR = data.filter(t => t.status === 'Received').reduce((acc, curr) => acc + curr.netPkr, 0);

  // 3. Projected Income (Pending + Expected)
  const projectedUSD = data.filter(t => t.status !== 'Received').reduce((acc, curr) => acc + curr.netUsd, 0);

  // 4. Closing Balance (Total Net)
  const closingBalanceUSD = totalNetRealizedUSD + projectedUSD;

  const handleDownloadCSV = () => {
    const headers = [
      'ID', 'Earning Month', 'Release Date', 'Received Date', 'Platform', 'Method', 
      'Expected USD', 'Expected PKR', 'Received PKR', 
      'Tax USD', 'Tax PKR', 'Tax %', 'Net USD', 'Net PKR', 'Status'
    ];
    
    const rows = data.map(t => [
      t.id,
      t.earningMonth,
      t.releaseDate,
      t.receivedDate || '',
      t.platform,
      t.method,
      t.expectedUsd,
      t.expectedPkr,
      t.receivedPkr,
      t.taxUsd,
      t.taxPkr,
      t.taxPercent,
      t.netUsd,
      t.netPkr,
      t.status
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${companyName.replace(/\s+/g, '_')}_FiscalReport_2025.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('report-content');
    
    if (!element) {
        setIsGenerating(false);
        return;
    }

    // Add PDF export class to force desktop styling and full width
    element.classList.add('pdf-export-active');
    
    // Check if html2pdf is loaded
    // @ts-ignore
    if (typeof window !== 'undefined' && window.html2pdf) {
      const opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right in mm
        filename: `${companyName.replace(/\s+/g, '_')}_FiscalReport_2025.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, // Higher scale for text clarity
          useCORS: true,
          logging: false,
          windowWidth: 1280, // Force the canvas to be at least this wide
          ignoreElements: (element: Element) => {
             return element.classList.contains('no-print') || element.hasAttribute('data-html2canvas-ignore');
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      try {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
      } catch (e) {
        console.error("PDF generation failed", e);
      } finally {
        element.classList.remove('pdf-export-active');
        setIsGenerating(false);
      }
    } else {
      element.classList.remove('pdf-export-active');
      console.error('html2pdf library not loaded');
      setIsGenerating(false);
      alert('PDF generation library not loaded. Please try Print/Save PDF instead.');
    }
  };

  return (
    <div className="bg-slate-800 text-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Simplified background for better PDF rasterization compatibility */}
      <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full opacity-10 filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 p-32 bg-emerald-500 rounded-full opacity-10 filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="p-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
               <FileText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {companyName}
              </h2>
              <p className="text-slate-400 text-sm mt-1">2025 Fiscal Year Closing Report • May 2024 - Jan 2025</p>
            </div>
          </div>
          
          <div className="flex gap-3 no-print" data-html2canvas-ignore="true">
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        <p className="text-slate-300 mb-8 max-w-3xl">
          This report summarizes the financial performance for <strong className="text-white">{companyName}</strong> from May 2024 to January 2025. 
          It includes realized income from YouTube and TikTok platforms, accounting for tax deductions and pending releases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Gross Revenue */}
          <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Gross Expected Revenue</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(totalExpectedUSD, 'USD')}
            </div>
            <div className="text-xs text-slate-400">Total invoice value before deductions</div>
          </div>

          {/* Section 2: Realized Net */}
          <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Net Income Realized</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {formatCurrency(totalNetRealizedUSD, 'USD')}
            </div>
            <div className="text-xs text-slate-400">
              ≈ {formatCurrency(totalNetRealizedPKR, 'PKR')} (Cleared)
            </div>
          </div>

          {/* Section 3: Projected Closing */}
          <div className="bg-blue-600/20 backdrop-blur-sm p-6 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium text-blue-200">Projected Closing Balance</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(closingBalanceUSD, 'USD')}
            </div>
            <div className="text-xs text-blue-200/70">
              Includes {formatCurrency(projectedUSD, 'USD')} pending/expected
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <div className="flex items-center gap-2">
             <Building2 className="w-4 h-4 text-slate-500" />
             <span>Prepared for {companyName}</span>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Validated
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> Projected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingReport;