import mammoth from 'mammoth';
import jsPDF from 'jspdf';

/**
 * Extracts raw HTML and clean text from .docx or text files.
 */
export const parseWordDocument = async (file: File): Promise<{ html: string; text: string }> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    return {
      html: result.value || `<p>${textResult.value}</p>`,
      text: textResult.value || '',
    };
  }

  // Plain text / standard doc read fallback
  const text = await file.text();
  const safeHtml = text
    .split('\n')
    .map(line => line.trim() ? `<p style="margin-bottom:8px;">${line}</p>` : '<br/>')
    .join('');

  return {
    html: safeHtml,
    text,
  };
};

/**
 * Generates a high-quality multi-page PDF from document text or an HTML container.
 * Supports auto word-wrapping, margins, and page numbering.
 */
export const generatePdfFromContent = (
  title: string,
  content: string,
  fileName: string = 'Converted_Document.pdf'
): Blob => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxLineWidth = pageWidth - margin * 2;
  let currentY = 25;

  // Header Bar Styling
  doc.setFillColor(234, 88, 12); // Orange header accent
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title || 'Document', margin, currentY);
  currentY += 8;

  // Decorative rule line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Body content configuration
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  const lines = content.split('\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      currentY += 5;
      return;
    }

    const wrappedLines = doc.splitTextToSize(trimmed, maxLineWidth);

    wrappedLines.forEach((wLine: string) => {
      if (currentY + 8 > pageHeight - 20) {
        doc.addPage();
        currentY = 22;
        // Accent bar on new page
        doc.setFillColor(234, 88, 12);
        doc.rect(0, 0, pageWidth, 3, 'F');
      }

      doc.text(wLine, margin, currentY);
      currentY += 6.5;
    });
  });

  // Footer page numbering
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages} • Mera Document AI`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const pdfBlob = doc.output('blob');
  return pdfBlob;
};