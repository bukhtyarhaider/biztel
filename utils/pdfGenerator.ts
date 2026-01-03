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

  // Brand colors - Ventura Capital Theme
  const primaryColor: [number, number, number] = [11, 15, 25]; // Deep Charcoal #0B0F19
  const secondaryColor: [number, number, number] = [212, 175, 55]; // Gold #D4AF37
  const accentColor: [number, number, number] = [16, 185, 129]; // Green #10B981
  const surfaceColor: [number, number, number] = [17, 24, 39]; // Dark Gray Surface #111827
  const darkColor: [number, number, number] = [11, 15, 25]; // Matching primary
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
  // Full Dark Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative Gold Line at Top
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, pageWidth, 2, 'F');

  // Title Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('ANNUAL FINANCIAL', pageWidth / 2, 60, { align: 'center' });
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('REPORT', pageWidth / 2, 75, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(companyName.toUpperCase(), pageWidth / 2, 95, { align: 'center' });

  // Divider
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, 110, pageWidth / 2 + 40, 110);

  // Report Period
  currentY = 130;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('REPORTING PERIOD', pageWidth / 2, currentY, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  currentY += 8;
  doc.text(`${analytics.yearlyMetrics.dateRange.start} - ${analytics.yearlyMetrics.dateRange.end}`, pageWidth / 2, currentY, { align: 'center' });

  // Key metrics boxes - Redesigned for Dark Theme
  currentY = 160;
  const boxWidth = 55;
  const boxHeight = 40;
  const spacing = 5;
  const startX = (pageWidth - (boxWidth * 3 + spacing * 2)) / 2;

  // Box Drawing Helper
  const drawMetricBox = (x: number, y: number, label: string, value: string, color: [number, number, number]) => {
    // Background (Surface Color)
    doc.setFillColor(surfaceColor[0], surfaceColor[1], surfaceColor[2]);
    doc.setDrawColor(40, 40, 40);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'FD');
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), x + boxWidth / 2, y + 15, { align: 'center' });
    
    // Value
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(value, x + boxWidth / 2, y + 28, { align: 'center' });
  };

  // Total Revenue Box
  drawMetricBox(startX, currentY, 'Gross Revenue', formatCurrency(analytics.yearlyMetrics.totalExpectedUsd, 'USD'), secondaryColor);

  // Growth Box
  const growthColor = analytics.yearlyMetrics.overallGrowth >= 0 ? accentColor : [239, 68, 68];
  const growthText = `${analytics.yearlyMetrics.overallGrowth >= 0 ? '+' : ''}${analytics.yearlyMetrics.overallGrowth.toFixed(1)}%`;
  drawMetricBox(startX + boxWidth + spacing, currentY, 'YoY Growth', growthText, growthColor as [number, number, number]);

  // Transactions Box
  drawMetricBox(startX + (boxWidth + spacing) * 2, currentY, 'Total Transactions', analytics.yearlyMetrics.totalTransactions.toString(), [255, 255, 255]);


  // Footer branding
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('CONFIDENTIAL - FOR INTERNAL USE ONLY', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Quarterly Performance Preview - Moved up slightly or adjusted
  currentY = 220;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('QUARTERLY PERFORMANCE', pageWidth / 2, currentY, { align: 'center' });
  
  // Calculate quarterly data (reuse logic)
  const quarters: { [key: string]: { revenue: number; count: number } } = {};
  
  transactions.forEach(t => {
    let dateStr = t.earningMonth;
    if (!dateStr || dateStr === 'Unknown') dateStr = t.releaseDate;
    if (!dateStr) return;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const quarterKey = `Q${quarter} ${year}`;
    
    if (!quarters[quarterKey]) quarters[quarterKey] = { revenue: 0, count: 0 };
    quarters[quarterKey].revenue += t.netUsd || 0;
    quarters[quarterKey].count += 1;
  });
  
  currentY += 10;
  const quarterBoxWidth = 42;
  const quarterSpacing = 3;
  const quarterKeys = Object.keys(quarters).sort().slice(-4);
  const quarterStartX = (pageWidth - (quarterBoxWidth * quarterKeys.length + quarterSpacing * (quarterKeys.length - 1))) / 2;
  
  quarterKeys.forEach((quarter, idx) => {
    const data = quarters[quarter];
    const x = quarterStartX + (quarterBoxWidth + quarterSpacing) * idx;
    
    // Darker box for quarters
    doc.setFillColor(surfaceColor[0], surfaceColor[1], surfaceColor[2]);
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]); 
    doc.setLineWidth(0.1);
    doc.roundedRect(x, currentY, quarterBoxWidth, 32, 1, 1, 'FD');
    
    // Quarter label
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(quarter, x + quarterBoxWidth / 2, currentY + 8, { align: 'center' });
    
    // Revenue
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(formatCurrency(data.revenue, 'USD'), x + quarterBoxWidth / 2, currentY + 18, { align: 'center' });

    // Count
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`${data.count} txns`, x + quarterBoxWidth / 2, currentY + 26, { align: 'center' });
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
    `Average monthly gross revenue: ${formatCurrency(analytics.yearlyMetrics.avgMonthlyGrossRevenue, 'USD')}`,
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
            data.cell.styles.textColor = accentColor;
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
            data.cell.styles.textColor = accentColor;
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
