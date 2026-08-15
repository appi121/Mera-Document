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
  const margin = 16;
  const maxLineWidth = pageWidth - margin * 2;
  let currentY = 20;

  // Simple Clean Mera Document Header (No extra colored bars)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12);
  doc.text('Mera Document', margin, currentY);
  currentY += 8;

  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  const lines = (content || '').split('\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      currentY += 4;
      return;
    }

    const wrappedLines = doc.splitTextToSize(trimmed, maxLineWidth);

    wrappedLines.forEach((wLine: string) => {
      if (currentY + 7 > pageHeight - 15) {
        doc.addPage();
        currentY = 18;
      }

      doc.text(wLine, margin, currentY);
      currentY += 5.8;
    });
  });

  return doc.output('blob');
};

/**
 * High-accuracy multi-page PDF generator supporting 100% Hindi Devanagari, English, 
 * Special Symbols, Tables & Custom formatting. Only generates extra pages if content overflows.
 */
export const generateAccuratePdfFromHtml = async (
  title: string,
  contentHtmlOrText: string,
  fileName: string = 'Converted_Document.pdf'
): Promise<Blob> => {
  // Container width: standard A4 width in pixels
  const a4WidthPx = 794;
  const a4PageHeightPx = 1123; // Exact 1 A4 page height at 96 DPI

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${a4WidthPx}px`;
  container.style.padding = '40px 48px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Noto Sans Devanagari', 'Mangal', 'Nirmala UI', 'Segoe UI', Calibri, Arial, sans-serif";
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.65';
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
        if (!tr) return '<p style="margin-bottom: 5px;">&nbsp;</p>';
        if (tr.includes('|') || tr.includes('\t')) {
          const cells = tr.split(/[|\t]/).map(c => `<td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${c.trim()}</td>`).join('');
          return `<table style="width: 100%; border-collapse: collapse; margin: 8px 0;"><tr>${cells}</tr></table>`;
        }
        return `<p style="margin-bottom: 7px; text-align: justify; word-break: break-word;">${tr}</p>`;
      })
      .join('');
  }

  // Clean Header with ONLY "मेरा डॉक्यूमेंट" (No extra lines or bars)
  container.innerHTML = `
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">मेरा डॉक्यूमेंट</span>
    </div>
    <div style="font-family: inherit; font-size: 13.5px; color: #1e293b;">
      ${formattedBody}
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Crisp retina quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidthMm = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const totalHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // If total content fits within 1 A4 page (with a small margin tolerance)
    if (totalHeightMm <= pageHeightMm + 2) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, totalHeightMm, undefined, 'FAST');
    } else {
      // Multi-page slicing: only if content exceeds 1 page
      let heightLeft = totalHeightMm;
      let position = 0;

      // Page 1
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidthMm, totalHeightMm, undefined, 'FAST');
      heightLeft -= pageHeightMm;

      // Subsequent pages only if remaining height > 5mm (avoids trailing blank pages)
      while (heightLeft > 5) {
        position -= pageHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidthMm, totalHeightMm, undefined, 'FAST');
        heightLeft -= pageHeightMm;
      }
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