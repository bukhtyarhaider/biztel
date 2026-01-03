import { Transaction } from '../types';

export interface MonthlyData {
  month: string;
  year: number;
  expectedUsd: number;
  netUsd: number;
  taxUsd: number;
  taxPercent: number;
  transactionCount: number;
  receivedPkr: number;
}

export interface MoMGrowth {
  month: string;
  growthPercent: number;
  expectedUsd: number;
  netUsd: number;
}

export interface PlatformStats {
  platform: string;
  totalExpected: number;
  totalNet: number;
  totalTax: number;
  avgTaxPercent: number;
  transactionCount: number;
  avgPerTransaction: number;
}

export interface BankMethodStats {
  method: string;
  totalExpected: number;
  totalNet: number;
  totalTax: number;
  avgTaxPercent: number;
  avgConversionRate: number;
  transactionCount: number;
  effectiveRate: number; // Net/Expected ratio
}

export interface YearlyMetrics {
  totalExpectedUsd: number;
  totalNetUsd: number;
  totalReceivedPkr: number;
  totalTaxUsd: number;
  avgTaxPercent: number;
  avgMonthlyRevenue: number;
  avgMonthlyGrossRevenue: number;
  totalTransactions: number;
  dateRange: { start: string; end: string };
  overallGrowth: number;
  receivedCount: number;
  pendingCount: number;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
}

export interface ReportAnalytics {
  monthlyData: MonthlyData[];
  momGrowth: MoMGrowth[];
  platformStats: PlatformStats[];
  bankMethodStats: BankMethodStats[];
  yearlyMetrics: YearlyMetrics;
  insights: Insight[];
  bestMonth: { month: string; revenue: number };
  worstMonth: { month: string; revenue: number };
  bestBank: BankMethodStats | null;
}

export const analyzeReport = (transactions: Transaction[]): ReportAnalytics => {
  // Group by month using earningMonth
  const monthlyMap = new Map<string, Transaction[]>();
  
  transactions.forEach(txn => {
    if (!txn.earningMonth) return;
    
    const date = new Date(txn.earningMonth);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, []);
    }
    monthlyMap.get(monthKey)!.push(txn);
  });

  // Calculate monthly data
  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([monthKey, txns]) => {
      const [year, month] = monthKey.split('-');
      const expectedUsd = txns.reduce((sum, t) => sum + (t.expectedUsd || 0), 0);
      const netUsd = txns.reduce((sum, t) => sum + (t.netUsd || 0), 0);
      const taxUsd = txns.reduce((sum, t) => sum + (t.taxUsd || 0), 0);
      const receivedPkr = txns.reduce((sum, t) => sum + (t.receivedPkr || 0), 0);
      
      return {
        month: new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: parseInt(year),
        expectedUsd,
        netUsd,
        taxUsd,
        taxPercent: expectedUsd > 0 ? (taxUsd / expectedUsd) * 100 : 0,
        transactionCount: txns.length,
        receivedPkr
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  // Calculate MoM growth
  const momGrowth: MoMGrowth[] = monthlyData.map((current, index) => {
    if (index === 0) {
      return {
        month: current.month,
        growthPercent: 0,
        expectedUsd: current.expectedUsd,
        netUsd: current.netUsd
      };
    }
    
    const previous = monthlyData[index - 1];
    const growthPercent = previous.netUsd > 0 
      ? ((current.netUsd - previous.netUsd) / previous.netUsd) * 100 
      : 0;
    
    return {
      month: current.month,
      growthPercent,
      expectedUsd: current.expectedUsd,
      netUsd: current.netUsd
    };
  });

  // Platform statistics
  const platformMap = new Map<string, Transaction[]>();
  transactions.forEach(txn => {
    const platform = txn.platform || 'Unknown';
    if (!platformMap.has(platform)) {
      platformMap.set(platform, []);
    }
    platformMap.get(platform)!.push(txn);
  });

  const platformStats: PlatformStats[] = Array.from(platformMap.entries()).map(([platform, txns]) => {
    const totalExpected = txns.reduce((sum, t) => sum + (t.expectedUsd || 0), 0);
    const totalNet = txns.reduce((sum, t) => sum + (t.netUsd || 0), 0);
    const totalTax = txns.reduce((sum, t) => sum + (t.taxUsd || 0), 0);
    
    return {
      platform,
      totalExpected,
      totalNet,
      totalTax,
      avgTaxPercent: totalExpected > 0 ? (totalTax / totalExpected) * 100 : 0,
      transactionCount: txns.length,
      avgPerTransaction: txns.length > 0 ? totalNet / txns.length : 0
    };
  });

  // Bank/Method statistics
  const methodMap = new Map<string, Transaction[]>();
  transactions.forEach(txn => {
    const method = txn.method || 'Unknown';
    if (!methodMap.has(method)) {
      methodMap.set(method, []);
    }
    methodMap.get(method)!.push(txn);
  });

  const bankMethodStats: BankMethodStats[] = Array.from(methodMap.entries()).map(([method, txns]) => {
    const totalExpected = txns.reduce((sum, t) => sum + (t.expectedUsd || 0), 0);
    const totalNet = txns.reduce((sum, t) => sum + (t.netUsd || 0), 0);
    const totalTax = txns.reduce((sum, t) => sum + (t.taxUsd || 0), 0);
    const avgRate = txns.reduce((sum, t) => sum + (t.rate || 0), 0) / txns.length;
    
    return {
      method,
      totalExpected,
      totalNet,
      totalTax,
      avgTaxPercent: totalExpected > 0 ? (totalTax / totalExpected) * 100 : 0,
      avgConversionRate: avgRate,
      transactionCount: txns.length,
      effectiveRate: totalExpected > 0 ? (totalNet / totalExpected) : 0
    };
  });

  // Yearly metrics
  const totalExpectedUsd = transactions.reduce((sum, t) => sum + (t.expectedUsd || 0), 0);
  const totalNetUsd = transactions.reduce((sum, t) => sum + (t.netUsd || 0), 0);
  const totalReceivedPkr = transactions.reduce((sum, t) => sum + (t.receivedPkr || 0), 0);
  const totalTaxUsd = transactions.reduce((sum, t) => sum + (t.taxUsd || 0), 0);
  const receivedCount = transactions.filter(t => t.status === 'Received').length;
  const pendingCount = transactions.length - receivedCount;

  const dates = transactions
    .map(t => {
      const dateStr = t.earningMonth || t.releaseDate;
      return dateStr ? new Date(dateStr).getTime() : 0;
    })
    .filter(t => t > 0 && !isNaN(t));
  
  const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
  const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();

  const firstMonthRevenue = monthlyData[0]?.netUsd || 0;
  const lastMonthRevenue = monthlyData[monthlyData.length - 1]?.netUsd || 0;
  const overallGrowth = firstMonthRevenue > 0 
    ? ((lastMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100 
    : 0;

  const yearlyMetrics: YearlyMetrics = {
    totalExpectedUsd,
    totalNetUsd,
    totalReceivedPkr,
    totalTaxUsd,
    avgTaxPercent: totalExpectedUsd > 0 ? (totalTaxUsd / totalExpectedUsd) * 100 : 0,
    avgMonthlyRevenue: monthlyData.length > 0 ? totalNetUsd / monthlyData.length : 0,
    avgMonthlyGrossRevenue: monthlyData.length > 0 ? totalExpectedUsd / monthlyData.length : 0,
    totalTransactions: transactions.length,
    dateRange: {
      start: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    overallGrowth,
    receivedCount,
    pendingCount
  };

  // Best/Worst months
  const sortedByRevenue = [...monthlyData].sort((a, b) => b.netUsd - a.netUsd);
  const bestMonth = sortedByRevenue[0] || { month: 'N/A', netUsd: 0 };
  const worstMonth = sortedByRevenue[sortedByRevenue.length - 1] || { month: 'N/A', netUsd: 0 };

  // Best bank (highest effective rate)
  const bestBank = bankMethodStats.length > 0
    ? [...bankMethodStats].sort((a, b) => b.effectiveRate - a.effectiveRate)[0]
    : null;

  // Generate insights
  const insights: Insight[] = [];

  // Growth insight
  if (overallGrowth > 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Growth Trajectory',
      description: `Revenue has grown by ${overallGrowth.toFixed(1)}% from ${monthlyData[0]?.month} to ${monthlyData[monthlyData.length - 1]?.month}, demonstrating excellent business momentum.`
    });
  } else if (overallGrowth < -10) {
    insights.push({
      type: 'negative',
      title: 'Declining Revenue',
      description: `Revenue has declined by ${Math.abs(overallGrowth).toFixed(1)}% over the period. Consider reviewing content strategy and platform engagement.`
    });
  }

  // Tax insight
  if (yearlyMetrics.avgTaxPercent < 5) {
    insights.push({
      type: 'positive',
      title: 'Low Tax Burden',
      description: `Average tax rate of ${yearlyMetrics.avgTaxPercent.toFixed(2)}% is favorable, maximizing net income retention.`
    });
  } else if (yearlyMetrics.avgTaxPercent > 15) {
    insights.push({
      type: 'negative',
      title: 'High Tax Impact',
      description: `Average tax rate of ${yearlyMetrics.avgTaxPercent.toFixed(2)}% significantly impacts profitability. Consider consulting with a tax advisor.`
    });
  }

  // Best bank insight
  if (bestBank) {
    insights.push({
      type: 'positive',
      title: `${bestBank.method} Offers Best Rates`,
      description: `${bestBank.method} provides the highest effective rate at ${(bestBank.effectiveRate * 100).toFixed(1)}%, minimizing fees and maximizing net income.`
    });
  }

  // Platform diversity
  if (platformStats.length === 1) {
    insights.push({
      type: 'neutral',
      title: 'Single Platform Dependency',
      description: `All revenue comes from ${platformStats[0].platform}. Consider diversifying to reduce platform risk.`
    });
  } else if (platformStats.length > 1) {
    const dominant = platformStats.sort((a, b) => b.totalNet - a.totalNet)[0];
    const dominantPercent = (dominant.totalNet / totalNetUsd) * 100;
    
    if (dominantPercent > 70) {
      insights.push({
        type: 'neutral',
        title: 'Platform Concentration',
        description: `${dominant.platform} accounts for ${dominantPercent.toFixed(0)}% of revenue. Diversification could reduce risk.`
      });
    }
  }

  // Consistency insight
  const monthlyVariance = monthlyData.reduce((sum, m) => {
    const diff = m.netUsd - yearlyMetrics.avgMonthlyRevenue;
    return sum + (diff * diff);
  }, 0) / monthlyData.length;
  const stdDev = Math.sqrt(monthlyVariance);
  const coefficientOfVariation = yearlyMetrics.avgMonthlyRevenue > 0 
    ? (stdDev / yearlyMetrics.avgMonthlyRevenue) * 100 
    : 0;

  if (coefficientOfVariation < 30) {
    insights.push({
      type: 'positive',
      title: 'Consistent Revenue Stream',
      description: 'Monthly revenue shows low volatility, indicating stable and predictable income.'
    });
  } else if (coefficientOfVariation > 60) {
    insights.push({
      type: 'neutral',
      title: 'Variable Revenue Pattern',
      description: 'Monthly revenue shows high volatility. Understanding seasonal patterns could help with forecasting.'
    });
  }

  return {
    monthlyData,
    momGrowth,
    platformStats,
    bankMethodStats,
    yearlyMetrics,
    insights,
    bestMonth: { month: bestMonth.month, revenue: bestMonth.netUsd },
    worstMonth: { month: worstMonth.month, revenue: worstMonth.netUsd },
    bestBank
  };
};
