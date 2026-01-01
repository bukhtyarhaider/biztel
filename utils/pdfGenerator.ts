import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { analyzeReport, ReportAnalytics } from './reportAnalytics';
import { formatCurrency } from '../constants';

interface PDFOptions {
  companyName: string;
  transactions: Transaction[];
}

export const generateProfessionalPDF = async (options: PDFOptions): Promise<void> => {
  const { companyName, transactions } = options;
  const analytics = analyzeReport(transactions);
  
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  // Brand colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const secondaryColor: [number, number, number] = [16, 185, 129]; // Green
  const darkColor: [number, number, number] = [30, 41, 59]; // Slate
  const lightGray: [number, number, number] = [241, 245, 249];

  // Helper function to check if we need a new page
  const checkPageBreak = (spaceNeeded: number) => {
    if (currentY + spaceNeeded > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // Helper to add section header
  const addSectionHeader = (title: string, icon?: string) => {
    checkPageBreak(15);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, currentY, 4, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(title, 22, currentY + 6);
    currentY += 12;
  };

  // ===== COVER PAGE =====
  // Header band
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('Annual Financial Report', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(companyName, pageWidth / 2, 40, { align: 'center' });

  // Report period
  currentY = 80;
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Period', pageWidth / 2, currentY, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  currentY += 8;
  doc.text(`${analytics.yearlyMetrics.dateRange.start} - ${analytics.yearlyMetrics.dateRange.end}`, pageWidth / 2, currentY, { align: 'center' });

  // Key metrics boxes
  currentY = 110;
  const boxWidth = 55;
  const boxHeight = 35;
  const spacing = 5;
  const startX = (pageWidth - (boxWidth * 3 + spacing * 2)) / 2;

  // Total Revenue Box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(startX, currentY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Revenue', startX + boxWidth / 2, currentY + 10, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(formatCurrency(analytics.yearlyMetrics.totalNetUsd, 'USD'), startX + boxWidth / 2, currentY + 22, { align: 'center' });

  // Growth Box
  const growthColor = analytics.yearlyMetrics.overallGrowth >= 0 ? secondaryColor : [239, 68, 68];
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(startX + boxWidth + spacing, currentY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Overall Growth', startX + boxWidth + spacing + boxWidth / 2, currentY + 10, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(growthColor[0], growthColor[1], growthColor[2]);
  doc.text(`${analytics.yearlyMetrics.overallGrowth >= 0 ? '+' : ''}${analytics.yearlyMetrics.overallGrowth.toFixed(1)}%`, startX + boxWidth + spacing + boxWidth / 2, currentY + 22, { align: 'center' });

  // Transactions Box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(startX + (boxWidth + spacing) * 2, currentY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Transactions', startX + (boxWidth + spacing) * 2 + boxWidth / 2, currentY + 10, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(analytics.yearlyMetrics.totalTransactions.toString(), startX + (boxWidth + spacing) * 2 + boxWidth / 2, currentY + 22, { align: 'center' });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Add quarterly performance preview on cover
  currentY = 165;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Quarterly Performance', pageWidth / 2, currentY, { align: 'center' });
  
  // Calculate quarterly data using earningMonth
  const quarters: { [key: string]: { revenue: number; count: number } } = {};
  transactions.forEach(t => {
    const date = new Date(t.earningMonth || t.releaseDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const quarterKey = `Q${quarter} ${year}`;
    
    if (!quarters[quarterKey]) {
      quarters[quarterKey] = { revenue: 0, count: 0 };
    }
    quarters[quarterKey].revenue += t.netUsd || 0;
    quarters[quarterKey].count += 1;
  });
  
  currentY += 8;
  const quarterBoxWidth = 42;
  const quarterSpacing = 3;
  const quarterKeys = Object.keys(quarters).sort().slice(-4); // Last 4 quarters, chronologically sorted
  const quarterStartX = (pageWidth - (quarterBoxWidth * quarterKeys.length + quarterSpacing * (quarterKeys.length - 1))) / 2;
  
  quarterKeys.forEach((quarter, idx) => {
    const data = quarters[quarter];
    doc.setFillColor(247, 250, 252);
    doc.roundedRect(quarterStartX + (quarterBoxWidth + quarterSpacing) * idx, currentY, quarterBoxWidth, 32, 2, 2, 'F');
    
    // Quarter label (Q1 2023)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(quarter, quarterStartX + (quarterBoxWidth + quarterSpacing) * idx + quarterBoxWidth / 2, currentY + 7, { align: 'center' });
    
    // Month range (Apr-Jun)
    const quarterNum = parseInt(quarter.charAt(1));
    const quarterMonths = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'][quarterNum - 1];
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(quarterMonths, quarterStartX + (quarterBoxWidth + quarterSpacing) * idx + quarterBoxWidth / 2, currentY + 12, { align: 'center' });
    
    // Revenue
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(formatCurrency(data.revenue, 'USD'), quarterStartX + (quarterBoxWidth + quarterSpacing) * idx + quarterBoxWidth / 2, currentY + 22, { align: 'center' });
    
    // Transaction count
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${data.count} txns`, quarterStartX + (quarterBoxWidth + quarterSpacing) * idx + quarterBoxWidth / 2, currentY + 28, { align: 'center' });
  });

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();
  currentY = 20;

  addSectionHeader('Executive Summary');

  // Summary text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  const summaryText = `This report provides a comprehensive analysis of ${companyName}'s financial performance from ${analytics.yearlyMetrics.dateRange.start} to ${analytics.yearlyMetrics.dateRange.end}. During this period, the company generated ${formatCurrency(analytics.yearlyMetrics.totalExpectedUsd, 'USD')} in gross revenue, with a net income of ${formatCurrency(analytics.yearlyMetrics.totalNetUsd, 'USD')} after accounting for taxes and deductions.`;
  
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 30);
  doc.text(splitSummary, 15, currentY);
  currentY += splitSummary.length * 5 + 8;

  // Key Highlights
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Key Highlights', 15, currentY);
  currentY += 8;

  const highlights = [
    `Best performing month: ${analytics.bestMonth.month} (${formatCurrency(analytics.bestMonth.revenue, 'USD')})`,
    `Average monthly revenue: ${formatCurrency(analytics.yearlyMetrics.avgMonthlyRevenue, 'USD')}`,
    `Average tax rate: ${analytics.yearlyMetrics.avgTaxPercent.toFixed(2)}%`,
    `Total transactions cleared: ${analytics.yearlyMetrics.receivedCount} of ${analytics.yearlyMetrics.totalTransactions}`,
  ];

  if (analytics.bestBank) {
    highlights.push(`Most efficient payment method: ${analytics.bestBank.method} (${(analytics.bestBank.effectiveRate * 100).toFixed(1)}% effective rate)`);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  highlights.forEach(highlight => {
    checkPageBreak(8);
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.circle(17, currentY - 1.5, 1.5, 'F');
    doc.text(highlight, 22, currentY);
    currentY += 7;
  });

  currentY += 5;

  // ===== MONTHLY BREAKDOWN TABLE =====
  checkPageBreak(40);
  addSectionHeader('Monthly Revenue Breakdown');

  const monthlyTableData = analytics.monthlyData.map(m => [
    m.month,
    m.transactionCount.toString(),
    formatCurrency(m.expectedUsd, 'USD'),
    formatCurrency(m.taxUsd, 'USD'),
    m.taxPercent.toFixed(2) + '%',
    formatCurrency(m.netUsd, 'USD'),
    formatCurrency(m.receivedPkr, 'PKR')
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Month', 'Txns', 'Expected', 'Tax', 'Tax %', 'Net USD', 'Received PKR']],
    body: monthlyTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 25 },
      6: { halign: 'right', cellWidth: 30 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ===== MOM GROWTH =====
  if (analytics.momGrowth.length > 0) {
    checkPageBreak(40);
    addSectionHeader('Month-over-Month Growth Analysis');

    const momTableData = analytics.momGrowth.map(m => [
      m.month,
      formatCurrency(m.netUsd, 'USD'),
      m.growthPercent !== 0 ? `${m.growthPercent >= 0 ? '+' : ''}${m.growthPercent.toFixed(1)}%` : '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Month', 'Net Revenue', 'Growth %']],
      body: momTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkColor
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'right', cellWidth: 50 },
        2: { halign: 'right', cellWidth: 'auto' }
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          const value = data.cell.raw as string;
          if (value.startsWith('+')) {
            data.cell.styles.textColor = secondaryColor;
            data.cell.styles.fontStyle = 'bold';
          } else if (value.startsWith('-') && value !== '-') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // ===== NEW PAGE: PLATFORM & BANK ANALYSIS =====
  doc.addPage();
  currentY = 20;

  addSectionHeader('Platform Performance Analysis');

  if (analytics.platformStats.length > 0) {
    const platformTableData = analytics.platformStats.map(p => [
      p.platform,
      p.transactionCount.toString(),
      formatCurrency(p.totalExpected, 'USD'),
      formatCurrency(p.totalNet, 'USD'),
      p.avgTaxPercent.toFixed(2) + '%',
      formatCurrency(p.avgPerTransaction, 'USD')
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Platform', 'Txns', 'Gross Revenue', 'Net Revenue', 'Avg Tax %', 'Avg/Txn']],
      body: platformTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkColor
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Bank/Payment Method Analysis
  checkPageBreak(40);
  addSectionHeader('Payment Method Comparison');

  if (analytics.bankMethodStats.length > 0) {
    const bankTableData = analytics.bankMethodStats.map(b => [
      b.method,
      b.transactionCount.toString(),
      formatCurrency(b.totalExpected, 'USD'),
      formatCurrency(b.totalNet, 'USD'),
      (b.effectiveRate * 100).toFixed(1) + '%',
      b.avgConversionRate.toFixed(2)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Payment Method', 'Txns', 'Gross', 'Net', 'Effective Rate', 'Avg PKR Rate']],
      body: bankTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkColor
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      margin: { left: 15, right: 15 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          // Highlight best effective rate
          const rates = analytics.bankMethodStats.map(b => b.effectiveRate);
          const maxRate = Math.max(...rates);
          const cellValue = parseFloat(data.cell.raw as string);
          
          if (Math.abs(cellValue - maxRate * 100) < 0.1) {
            data.cell.styles.fillColor = [220, 252, 231]; // Light green
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = secondaryColor;
          }
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // ===== PAYMENT TIMING & EFFICIENCY ANALYSIS =====
  checkPageBreak(60);
  addSectionHeader('Payment Timing & Efficiency Analysis');

  // Calculate average payment processing time
  const paidTransactions = transactions.filter(t => t.receivedDate && t.releaseDate);
  let avgDays = 0;
  if (paidTransactions.length > 0) {
    const totalDays = paidTransactions.reduce((sum, t) => {
      const release = new Date(t.releaseDate);
      const received = new Date(t.receivedDate!);
      const days = Math.floor((received.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    avgDays = totalDays / paidTransactions.length;
  }

  // Payment status breakdown
  const statusBreakdown: { [key: string]: { count:number; revenue: number } } = {};
  transactions.forEach(t => {
    const status = t.status || 'Unknown';
    if (!statusBreakdown[status]) statusBreakdown[status] = { count: 0, revenue: 0 };
    statusBreakdown[status].count += 1;
    statusBreakdown[status].revenue += t.netUsd || 0;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  
  const timingText = `Average payment processing time: ${avgDays.toFixed(1)} days. ${paidTransactions.length} of ${transactions.length} transactions have been cleared.`;
  const splitTiming = doc.splitTextToSize(timingText, pageWidth - 30);
  doc.text(splitTiming, 15, currentY);
  currentY += splitTiming.length * 5 + 10;

  // Status breakdown table
  const statusTableData = Object.entries(statusBreakdown).map(([status, data]) => [
    status,
    data.count.toString(),
    formatCurrency(data.revenue, 'USD'),
    ((data.count / transactions.length) * 100).toFixed(1) + '%',
    ((data.revenue / analytics.yearlyMetrics.totalNetUsd) * 100).toFixed(1) + '%'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Status', 'Count', 'Total Revenue', '% of Txns', '% of Revenue']],
    body: statusTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: 15, right: 15 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // ===== REVENUE CONCENTRATION ANALYSIS =====
  checkPageBreak(60);
  addSectionHeader('Revenue Concentration & Diversification');

  // Platform concentration
  const totalRevenue = analytics.yearlyMetrics.totalNetUsd;
  const platformConcentration = analytics.platformStats.map(p => ({
    platform: p.platform,
    percentage: (p.totalNet / totalRevenue) * 100
  })).sort((a, b) => b.percentage - a.percentage);

  const top3Revenue = platformConcentration.slice(0, 3).reduce((sum, p) => sum + p.percentage, 0);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const concentrationText = `Top 3 platforms account for ${top3Revenue.toFixed(1)}% of total revenue. ${platformConcentration.length} platforms contribute to revenue stream.`;
  const splitConcentration = doc.splitTextToSize(concentrationText, pageWidth - 30);
  doc.text(splitConcentration, 15, currentY);
  currentY += splitConcentration.length * 5 + 10;

  // Concentration table
  const concentrationTableData = platformConcentration.map(p => [
    p.platform,
    `${p.percentage.toFixed(1)}%`,
    p.percentage >= 50 ? 'High' : p.percentage >= 25 ? 'Medium' : 'Low'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Platform', 'Revenue Share', 'Concentration']],
    body: concentrationTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 'auto' }
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 2) {
        const risk = data.cell.raw as string;
        if (risk === 'High') {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = 'bold';
        } else if (risk === 'Low') {
          data.cell.styles.textColor = secondaryColor;
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ===== TAX ANALYSIS =====
  doc.addPage();
  currentY = 20;

  addSectionHeader('Tax Analysis');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  
  const taxSummary = `Total tax paid during the period: ${formatCurrency(analytics.yearlyMetrics.totalTaxUsd, 'USD')} representing ${analytics.yearlyMetrics.avgTaxPercent.toFixed(2)}% of gross revenue.`;
  const splitTax = doc.splitTextToSize(taxSummary, pageWidth - 30);
  doc.text(splitTax, 15, currentY);
  currentY += splitTax.length * 5 + 10;

  // Tax by platform
  if (analytics.platformStats.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tax by Platform', 15, currentY);
    currentY += 8;

    const taxByPlatformData = analytics.platformStats.map(p => [
      p.platform,
      formatCurrency(p.totalTax, 'USD'),
      p.avgTaxPercent.toFixed(2) + '%',
      ((p.totalTax / analytics.yearlyMetrics.totalTaxUsd) * 100).toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Platform', 'Total Tax', 'Avg Tax Rate', '% of Total Tax']],
      body: taxByPlatformData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkColor
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // ===== REVENUE FORECASTING =====
  doc.addPage();
  currentY = 20;
  addSectionHeader('Revenue Forecasting & Trends');

  // Calculate 3-month moving average
  const recentMonths = analytics.monthlyData.slice(-6);
  let avgRevenue = 0;
  let trendDirection = 'stable';
  
  if (recentMonths.length >= 3) {
    const last3Months = recentMonths.slice(-3);
    avgRevenue = last3Months.reduce((sum, m) => sum + m.netUsd, 0) / 3;
    
    if (last3Months.length >= 2) {
      const growth = ((last3Months[last3Months.length - 1].netUsd - last3Months[0].netUsd) / last3Months[0].netUsd) * 100;
      trendDirection = growth > 10 ? 'growing' : growth < -10 ? 'declining' : 'stable';
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const forecastText = `Based on recent trends, average monthly revenue is ${formatCurrency(avgRevenue, 'USD')}. Revenue trend is ${trendDirection}.`;
  const splitForecast = doc.splitTextToSize(forecastText, pageWidth - 30);
  doc.text(splitForecast, 15, currentY);
  currentY += splitForecast.length * 5 + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Projected Revenue (Next 3 Months)', 15, currentY);
  currentY += 8;

  const forecastTableData = [];
  if (recentMonths.length > 0) {
    const lastMonth = recentMonths[recentMonths.length - 1];
    const lastMonthDate = new Date(`${lastMonth.month} 1, ${lastMonth.year}`);
    
    for (let i = 1; i <= 3; i++) {
      const forecastDate = new Date(lastMonthDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const monthName = forecastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const conservativeEst = avgRevenue;
      const growthFactor = trendDirection === 'growing' ? 1.1 : trendDirection === 'declining' ? 0.9 : 1.0;
      const optimisticEst = avgRevenue * growthFactor;
      
      forecastTableData.push([
        monthName,
        formatCurrency(conservativeEst, 'USD'),
        formatCurrency(optimisticEst, 'USD')
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      head: [['Month', 'Conservative', 'Optimistic']],
      body: forecastTableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: darkColor },
      alternateRowStyles: { fillColor: lightGray },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // ===== INSIGHTS & RECOMMENDATIONS =====
  doc.addPage();
  currentY = 20;

  addSectionHeader('Key Insights & Recommendations');

  if (analytics.insights.length > 0) {
    analytics.insights.forEach((insight, index) => {
      checkPageBreak(25);
      
      // Insight box
      const insightColor = insight.type === 'positive' ? secondaryColor : 
                          insight.type === 'negative' ? [239, 68, 68] as [number, number, number] : 
                          [100, 116, 139] as [number, number, number];
      
      doc.setFillColor(insightColor[0], insightColor[1], insightColor[2]);
      doc.rect(15, currentY, 3, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(insightColor[0], insightColor[1], insightColor[2]);
      doc.text(insight.title, 22, currentY + 5);
      currentY += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      const splitDesc = doc.splitTextToSize(insight.description, pageWidth - 35);
      doc.text(splitDesc, 22, currentY);
      currentY += splitDesc.length * 5 + 8;
    });
  }

  // ===== TRANSACTION HISTORY =====
  doc.addPage();
  currentY = 20;

  addSectionHeader('Complete Transaction History');

  const transactionData = transactions
    .sort((a, b) => new Date(a.earningMonth || a.releaseDate || 0).getTime() - new Date(b.earningMonth || b.releaseDate || 0).getTime())
    .map(t => [
      new Date(t.earningMonth || t.releaseDate || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      t.platform || '-',
      t.method || '-',
      formatCurrency(t.expectedUsd || 0, 'USD'),
      formatCurrency(t.taxUsd || 0, 'USD'),
      formatCurrency(t.netUsd || 0, 'USD'),
      t.status || '-'
    ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Month', 'Platform', 'Method', 'Expected', 'Tax', 'Net', 'Status']],
    body: transactionData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 25 },
      6: { halign: 'center', cellWidth: 'auto' }
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 6) {
        const status = data.cell.raw as string;
        if (status === 'Received') {
          data.cell.styles.textColor = secondaryColor;
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Pending' || status === 'Expected') {
          data.cell.styles.textColor = [251, 191, 36];
        }
      }
    }
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }

  // Get year from first transaction's earning month for filename
  const reportYear = transactions.length > 0 && transactions[0].earningMonth
    ? new Date(transactions[0].earningMonth).getFullYear()
    : new Date().getFullYear();

  // Save the PDF
  doc.save(`${companyName.replace(/\s+/g, '_')}_Annual_Report_${reportYear}.pdf`);
};
