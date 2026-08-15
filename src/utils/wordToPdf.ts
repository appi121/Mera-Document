import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Extracts formatted HTML and clean text from .docx or text files.
 */
export const parseWordDocument = async (file: File): Promise<{ html: string; text: string }> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    
    // Clean and wrap HTML with proper typography styles
    const contentHtml = result.value || textResult.value.split('\n').map(l => `<p>${l}</p>`).join('');
    return {
      html: contentHtml,
      text: textResult.value || '',
    };
  }

  // Plain text or text file
  const text = await file.text();
  const safeHtml = text
    .split('\n')
    .map(line => line.trim() ? `<p style="margin-bottom: 8px;">${line}</p>` : '<p style="margin-bottom: 4px;">&nbsp;</p>')
    .join('');

  return {
    html: safeHtml,
    text,
  };
};

/**
 * Generates a clean PDF Blob from title and string content using standard jsPDF.
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
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title || 'Document', margin, currentY);
  currentY += 8;

  // Rule line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  const lines = (content || '').split('\n');

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
        doc.setFillColor(234, 88, 12);
        doc.rect(0, 0, pageWidth, 3, 'F');
      }

      doc.text(wLine, margin, currentY);
      currentY += 6.5;
    });
  });

  // Footer
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

  return doc.output('blob');
};

/**
 * High-accuracy multi-page PDF generator supporting 100% Hindi Devanagari, English, 
 * Special Symbols, Tables & Custom formatting with High-DPI canvas slices.
 */
export const generateAccuratePdfFromHtml = async (
  title: string,
  contentHtmlOrText: string,
  fileName: string = 'Converted_Document.pdf'
): Promise<Blob> => {
  // Create an off-screen high-fidelity rendering container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width in pixels at 96 DPI
  container.style.minHeight = '1123px'; // Standard A4 height in pixels
  container.style.padding = '48px 50px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Noto Sans Devanagari', 'Mangal', 'Nirmala UI', 'Segoe UI', Calibri, Arial, sans-serif";
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.7';
  container.style.boxSizing = 'border-box';

  const isHtml = /<[a-z][\s\S]*>/i.test(contentHtmlOrText);

  let formattedBody = '';
  if (isHtml) {
    formattedBody = contentHtmlOrText;
  } else {
    formattedBody = (contentHtmlOrText || '')
      .split('\n')
      .map(line => {
        const tr = line.trim();
        if (!tr) return '<p style="margin-bottom: 6px;">&nbsp;</p>';
        if (tr.includes('|') || tr.includes('\t')) {
          const cells = tr.split(/[|\t]/).map(c => `<td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${c.trim()}</td>`).join('');
          return `<table style="width: 100%; border-collapse: collapse; margin: 8px 0;"><tr>${cells}</tr></table>`;
        }
        return `<p style="margin-bottom: 8px; text-align: justify; word-break: break-word;">${tr}</p>`;
      })
      .join('');
  }

  container.innerHTML = `
    <div style="border-top: 4px solid #ea580c; padding-top: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
      <h1 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; font-family: inherit;">${title || 'दस्तावेज़ (Document)'}</h1>
      <span style="font-size: 10px; font-weight: 600; color: #ea580c; background: #fff7ed; padding: 3px 8px; border-radius: 4px; border: 1px solid #ffedd5;">मेरा डॉक्यूमेंट AI</span>
    </div>
    <div style="font-family: inherit; font-size: 13.5px; color: #334155;">
      ${formattedBody}
    </div>
    <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 10px; color: #94a3b8; text-align: center;">
      Generated via Mera Document • 100% Verified Quality
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // 2x High-DPI crisp sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeightMm;

    // Additional pages if document is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeightMm;
    }

    document.body.removeChild(container);
    return pdf.output('blob');
  } catch (err) {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    throw err;
  }
};