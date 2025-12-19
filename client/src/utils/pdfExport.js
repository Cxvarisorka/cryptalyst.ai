import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export AI Analysis to PDF
 */
export const exportAnalysisToPDF = (analysis, language = 'en') => {
  const doc = new jsPDF();

  // Ensure autoTable is available
  if (typeof doc.autoTable !== 'function') {
    console.error('autoTable is not available on jsPDF instance');
    alert('PDF export is temporarily unavailable. Please try again.');
    return;
  }
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  // Helper functions
  const addTitle = (text, size = 20) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(text, pageWidth / 2, currentY, { align: 'center' });
    currentY += size / 2 + 5;
  };

  const addSubtitle = (text, size = 14) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 14, currentY);
    currentY += size / 2 + 3;
  };

  const addText = (text, size = 10, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 28);
    doc.text(lines, 14, currentY);
    currentY += (lines.length * size / 2) + 3;
  };

  const addSpacer = (space = 5) => {
    currentY += space;
  };

  const checkPageBreak = (requiredSpace = 40) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  const addColoredBox = (text, color, y) => {
    doc.setFillColor(...color);
    doc.roundedRect(14, y, pageWidth - 28, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(text, pageWidth / 2, y + 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  // Title
  addTitle(`AI Market Analysis Report`);
  addText(`${analysis.metadata.assetName} (${analysis.metadata.assetSymbol})`, 14, true);
  addText(`Generated: ${analysis.formattedDate}`, 9);
  addSpacer(10);

  // Recommendation Box
  checkPageBreak();
  const recColor = analysis.recommendation.action === 'BUY' ? [34, 197, 94] :
                   analysis.recommendation.action === 'SELL' ? [239, 68, 68] :
                   [234, 179, 8];
  addColoredBox(`RECOMMENDATION: ${analysis.recommendation.action}`, recColor, currentY);
  currentY += 20;

  addText(`Confidence: ${analysis.recommendation.confidence}%`, 11, true);
  addSpacer(5);

  // Summary
  checkPageBreak();
  addSubtitle('Executive Summary');
  addText(analysis.summary);
  addSpacer(10);

  // Market Overview
  checkPageBreak();
  addSubtitle('Market Overview');
  doc.autoTable({
    startY: currentY,
    head: [['Metric', 'Value']],
    body: [
      ['Current Price', `$${analysis.metadata.currentPrice.toFixed(2)}`],
      ['24h Change', `${analysis.metadata.change24h.toFixed(2)}%`],
      ['Risk Level', analysis.risk.level],
      ['Risk Score', `${analysis.risk.score}/100`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: 14, right: 14 },
  });
  currentY = doc.lastAutoTable.finalY + 10;

  // Sentiment Analysis
  checkPageBreak();
  addSubtitle('News Sentiment Analysis');
  doc.autoTable({
    startY: currentY,
    head: [['Indicator', 'Value']],
    body: [
      ['Sentiment Score', `${analysis.sentiment.score}%`],
      ['Sentiment', analysis.sentiment.sentiment.toUpperCase()],
      ['Confidence', `${analysis.sentiment.confidence}%`],
      ['News Analyzed', analysis.sentiment.newsCount.toString()]
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });
  currentY = doc.lastAutoTable.finalY + 10;

  // Technical Analysis
  checkPageBreak();
  addSubtitle('Technical Analysis');
  doc.autoTable({
    startY: currentY,
    head: [['Indicator', 'Value']],
    body: [
      ['Technical Score', `${analysis.technical.score}%`],
      ['Trend', analysis.technical.trend.toUpperCase()],
      ['Bullish Signals', analysis.technical.bullishCount.toString()],
      ['Bearish Signals', analysis.technical.bearishCount.toString()]
    ],
    theme: 'grid',
    headStyles: { fillColor: [168, 85, 247] },
    margin: { left: 14, right: 14 },
  });
  currentY = doc.lastAutoTable.finalY + 10;

  // Technical Signals
  if (analysis.technical.signals.length > 0) {
    checkPageBreak(50);
    addSubtitle('Technical Signals');
    const signalsData = analysis.technical.signals.map(signal => [
      signal.indicator,
      signal.signal,
      signal.description
    ]);
    doc.autoTable({
      startY: currentY,
      head: [['Indicator', 'Signal', 'Description']],
      body: signalsData,
      theme: 'striped',
      headStyles: { fillColor: [107, 114, 128] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        2: { cellWidth: 80 }
      }
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Price Targets
  checkPageBreak();
  addSubtitle('Price Targets & Support/Resistance');
  doc.autoTable({
    startY: currentY,
    head: [['Level', 'Price']],
    body: [
      ['Resistance 2', `$${analysis.priceTargets.resistance2.toFixed(2)}`],
      ['Resistance 1', `$${analysis.priceTargets.resistance1.toFixed(2)}`],
      ['Current Price', `$${analysis.priceTargets.currentPrice.toFixed(2)}`],
      ['Support 1', `$${analysis.priceTargets.support1.toFixed(2)}`],
      ['Support 2', `$${analysis.priceTargets.support2.toFixed(2)}`],
      ['30-Day Target', `$${analysis.priceTargets.targetPrice.toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: 14, right: 14 },
  });
  currentY = doc.lastAutoTable.finalY + 10;

  // Key Insights
  if (analysis.insights.length > 0) {
    checkPageBreak();
    addSubtitle('Key Insights');
    analysis.insights.forEach((insight, index) => {
      addText(`${index + 1}. ${insight}`, 10);
    });
    addSpacer(10);
  }

  // Recommendation Reasoning
  if (analysis.recommendation.reasoning.length > 0) {
    checkPageBreak();
    addSubtitle('Recommendation Reasoning');
    analysis.recommendation.reasoning.forEach((reason, index) => {
      addText(`• ${reason}`, 10);
    });
    addSpacer(10);
  }

  // Disclaimer
  checkPageBreak(30);
  addSpacer(5);
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, currentY, pageWidth - 28, 25);
  currentY += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DISCLAIMER', 16, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  const disclaimer = 'This analysis is for educational and informational purposes only and should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 32);
  doc.text(disclaimerLines, 16, currentY);

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated by Cryptalyst',
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save PDF
  const filename = `${analysis.metadata.assetSymbol}_AI_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
