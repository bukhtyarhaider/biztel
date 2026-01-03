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
import { Link } from 'react-router-dom';

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
  onReportUpdate: (updates: Partial<Report>) => void;
  canDownload?: boolean;
  isAdmin?: boolean;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack, onReportUpdate, canDownload = false, isAdmin = false }) => {
  const data = report.transactions;
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  // Use analytics hook for calculations
  const { totalGrossRevenue, pendingRevenue, receivedRevenue, receivedPKR, totalTax } = useAnalytics(data);
  
  // Use sheet sync hook
  const { syncStatus, lastSyncedAt, syncError, isLoading, syncReport, linkSheet } = useSheetSync(
    report,
    onReportUpdate
  );

  const handleLinkSheet = async (url: string, autoSync: boolean, interval: number) => {
    const success = await linkSheet(url);
    if (success) {
      onReportUpdate({
        autoSync,
        syncInterval: interval
      });
      await syncReport();
    }
    return success;
  };

  const handleSync = async () => {
    await syncReport();
  };

  return (
    <div className="pb-20">
      <div className="mb-8 no-print">
        <Button 
          variant="ghost"
          onClick={onBack}
          className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-white mb-4"
        >
          <div className="p-1 rounded bg-white/5 mr-2 group-hover:bg-white/10 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Portfolio
        </Button>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight">{report.companyName}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent/20">FY 24-25</span>
            </div>
            
            {isAdmin && report.source === 'sheet' && report.sheetUrl && (
              <div className="mt-2 text-xs font-mono text-muted-foreground">
                Live Data Link Active
              </div>
            )}
            
            {report.source === 'upload' && (
               <p className="text-xs text-muted-foreground mt-1 font-mono">Static Report (Upload)</p>
            )}
          </div>
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              {report.source === 'sheet' ? (
                report.sheetUrl ? (
                  <>
                    <Button
                      onClick={handleSync}
                      disabled={isLoading}
                      className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0"
                      size="sm"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'SYNCING...' : 'SYNC DATA'}
                    </Button>
                    <Button
                      onClick={() => setIsLinkModalOpen(true)}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-white"
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
                    Link Data Source
                  </Button>
                )
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Gross Revenue"
          value={formatCurrency(totalGrossRevenue, 'USD')}
          subValue="Total Invoiced"
          icon={<Wallet className="w-5 h-5 text-blue-400" />}
          colorClass="bg-blue-400/10 text-blue-400"
          trend="up"
          trendValue="+24.5%"
        />
        <DashboardCard
          title="Net Realized"
          value={formatCurrency(receivedRevenue, 'USD')}
          subValue={`${formatCurrency(receivedPKR, 'PKR')} (PKR)`}
          icon={<PiggyBank className="w-5 h-5 text-emerald-400" />}
          colorClass="bg-emerald-400/10 text-emerald-400"
        />
        <DashboardCard
          title="Pending Settlement"
          value={formatCurrency(pendingRevenue, 'USD')}
          subValue="Expected < 30 days"
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
          colorClass="bg-amber-400/10 text-amber-400"
        />
        <DashboardCard
          title="Tax Withholding"
          value={formatCurrency(totalTax, 'USD')}
          subValue="Fiscal Obligation"
          icon={<TrendingUp className="w-5 h-5 text-rose-400" />}
          colorClass="bg-rose-400/10 text-rose-400"
          trend="down"
          trendValue="-2.4%"
        />
      </div>

      <div className="mb-8 p-1">
         <PerformanceCharts data={data} />
      </div>

      <div className="mb-8">
        <TransactionTable data={data} />
      </div>

      <div className="mb-8" id="report-content">
         <ClosingReport data={data} companyName={report.companyName} canDownload={canDownload} />
      </div>

      {/* Sheet Sync Modal */}
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
