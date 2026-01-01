import React from 'react';
import DashboardCard from '../components/DashboardCard';
import PerformanceCharts from '../components/PerformanceCharts';
import TransactionTable from '../components/TransactionTable';
import ClosingReport from '../components/ClosingReport';
import { Button } from '../components/ui/Button';
import { Report } from '../types';
import { formatCurrency } from '../constants';
import { 
  Wallet, DollarSign, TrendingUp, PiggyBank, ArrowLeft 
} from 'lucide-react';

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack }) => {
  const data = report.transactions;
    
  // Calculate Summary Metrics
  const totalRevenue = data.reduce((acc, curr) => acc + curr.netUsd, 0);
  const pendingRevenue = data.filter(t => t.status === 'Pending' || t.status === 'Expected').reduce((acc, curr) => acc + curr.netUsd, 0);
  const receivedRevenue = data.filter(t => t.status === 'Received').reduce((acc, curr) => acc + curr.netUsd, 0);
  
  // Calculate received PKR
  const receivedPKR = data.filter(t => t.status === 'Received').reduce((acc, curr) => acc + curr.receivedPkr, 0);

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
          value={formatCurrency(data.reduce((acc, curr) => acc + curr.taxUsd, 0), 'USD')}
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
    </div>
  );
};

export default ReportDetail;
