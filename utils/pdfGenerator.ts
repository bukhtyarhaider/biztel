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
    .sort((a, b) => new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime())
    .map(t => [
      new Date(t.releaseDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
      t.platform || '-',
      t.method || '-',
      formatCurrency(t.expectedUsd || 0, 'USD'),
      formatCurrency(t.taxUsd || 0, 'USD'),
      formatCurrency(t.netUsd || 0, 'USD'),
      t.status || '-'
    ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Platform', 'Method', 'Expected', 'Tax', 'Net', 'Status']],
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
