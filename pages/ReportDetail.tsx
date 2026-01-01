import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import PerformanceCharts from '../components/PerformanceCharts';
import TransactionTable from '../components/TransactionTable';
import ClosingReport from '../components/ClosingReport';
import { Button } from '../components/ui/Button';
import SyncStatusBadge from '../components/SyncStatusBadge';
import SheetSyncModal from '../components/SheetSyncModal';
import { Report } from '../types';
import { formatCurrency } from '../constants';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSheetSync } from '../hooks/useSheetSync';
import { 
  Wallet, DollarSign, TrendingUp, PiggyBank, ArrowLeft, RefreshCw, Link2, Settings
} from 'lucide-react';

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
  onReportUpdate: (updates: Partial<Report>) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack, onReportUpdate }) => {
  const data = report.transactions;
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  // Use analytics hook for calculations
  const { totalRevenue, pendingRevenue, receivedRevenue, receivedPKR, totalTax } = useAnalytics(data);
  
  // Use sheet sync hook
  const { syncStatus, lastSyncedAt, syncError, isLoading, syncReport, linkSheet } = useSheetSync(
    report,
    onReportUpdate
  );

  const handleLinkSheet = async (url: string, autoSync: boolean, interval: number) => {
    const success = await linkSheet(url);
    if (success) {
      // Update report with sync settings
      onReportUpdate({
        autoSync,
        syncInterval: interval
      });
      
      // Perform initial sync
      await syncReport();
    }
    return success;
  };

  const handleSync = async () => {
    await syncReport();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      <div className="mb-6 no-print">
        <Button 
          variant="ghost"
          onClick={onBack}
          className="group pl-0 hover:bg-transparent hover:text-blue-600"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-2 shadow-sm group-hover:border-blue-200 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Dashboard
        </Button>
        
        {/* Sync Controls - Only for sheet-sourced reports */}
        {report.source === 'sheet' && (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{report.companyName}</h1>
              {report.sheetUrl && (
                <div className="mt-2">
                  <SyncStatusBadge
                    status={syncStatus}
                    lastSyncedAt={lastSyncedAt}
                    error={syncError}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {report.sheetUrl ? (
                <>
                  <Button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="gap-2"
                    variant="outline"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Syncing...' : 'Sync Now'}
                  </Button>
                  <Button
                    onClick={() => setIsLinkModalOpen(true)}
                    variant="ghost"
                    size="icon"
                    title="Sync Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Link Google Sheet
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Title for uploaded reports */}
        {report.source === 'upload' && (
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-slate-900">{report.companyName}</h1>
            <p className="text-sm text-slate-500 mt-1">View-only report from uploaded file</p>
          </div>
        )}
      </div>

      <div className="mb-8" id="report-content">
         <ClosingReport data={data} companyName={report.companyName} />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Net Revenue (USD)"
          value={formatCurrency(totalRevenue, 'USD')}
          subValue="Total fiscal year"
          icon={<Wallet className="w-6 h-6 text-blue-600" />}
          colorClass="bg-blue-600/10"
          trend="up"
          trendValue="+24.5%"
        />
        <DashboardCard
          title="Received Amount"
          value={formatCurrency(receivedRevenue, 'USD')}
          subValue={`${formatCurrency(receivedPKR, 'PKR')} (PKR)`}
          icon={<PiggyBank className="w-6 h-6 text-emerald-600" />}
          colorClass="bg-emerald-600/10"
        />
        <DashboardCard
          title="Pending Clearance"
          value={formatCurrency(pendingRevenue, 'USD')}
          subValue="Expected within 30 days"
          icon={<DollarSign className="w-6 h-6 text-amber-600" />}
          colorClass="bg-amber-600/10"
        />
        <DashboardCard
          title="Tax Deductions"
          value={formatCurrency(totalTax, 'USD')}
          subValue="Withholding tax"
          icon={<TrendingUp className="w-6 h-6 text-rose-600" />}
          colorClass="bg-rose-600/10"
          trend="down"
          trendValue="-2.4%"
        />
      </div>

      <div className="mb-8">
         <PerformanceCharts data={data} />
      </div>

      <div className="mb-8">
        <TransactionTable data={data} />
      </div>

      {/* Sheet Sync Modal - Only for sheet-sourced reports */}
      {report.source === 'sheet' && (
        <SheetSyncModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          onLink={handleLinkSheet}
          initialUrl={report.sheetUrl}
          initialAutoSync={report.autoSync}
          initialInterval={report.syncInterval}
        />
      )}
    </div>
  );
};

export default ReportDetail;
