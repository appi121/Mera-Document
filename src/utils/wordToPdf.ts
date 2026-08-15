import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Extracts formatted HTML and clean text from .docx or text files while strictly preserving
 * paragraph alignments (Center, Right, Left, Justify), tables, bold, italics & font sizes.
 */
export const parseWordDocument = async (file: File): Promise<{ html: string; text: string }> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    
    // Mammoth style map to preserve centered titles, right-aligned dates/signatures and tables
    const options = {
      styleMap: [
        "p[style-name='Title'] => h1.center:fresh",
        "p[style-name='Subtitle'] => h2.center:fresh",
        "p[style-name='Header'] => div.center:fresh",
        "r[style-name='Strong'] => strong",
        "table => table.custom-doc-table:fresh"
      ]
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    
    let htmlContent = result.value;

    // Enhance raw paragraph tags with word layout fidelity
    if (htmlContent) {
      htmlContent = htmlContent
        .replace(/<p>/g, '<p style="margin-bottom: 8px; line-height: 1.6;">')
        .replace(/<table/g, '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1;"')
        .replace(/<td/g, '<td style="border: 1px solid #cbd5e1; padding: 6px 10px; vertical-align: top;"')
        .replace(/<th/g, '<th style="border: 1px solid #cbd5e1; padding: 6px 10px; background-color: #f8fafc; font-weight: bold;"');
    } else {
      htmlContent = textResult.value.split('\n').map(l => {
        const tr = l.trim();
        if (!tr) return '<p style="margin-bottom: 4px;">&nbsp;</p>';
        return `<p style="margin-bottom: 8px; line-height: 1.6;">${tr}</p>`;
      }).join('');
    }

    return {
      html: htmlContent,
      text: textResult.value || '',
    };
  }

  // Plain text or text file
  const text = await file.text();
  const safeHtml = formatTextToStructuredHtml(text);

  return {
    html: safeHtml,
    text,
  };
};

/**
 * Helper to detect center and right aligned lines from raw text drafts (like official memos, subject, headers, signatures)
 */
function formatTextToStructuredHtml(textContent: string): string {
  return (textContent || '')
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<p style="margin-bottom: 4px;">&nbsp;</p>';

      // Detect table rows with delimiters
      if (line.includes('|') || line.includes('\t')) {
        const cells = line.split(/[|\t]/).map(c => `<td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 13px;">${c.trim()}</td>`).join('');
        return `<table style="width: 100%; border-collapse: collapse; margin: 8px 0;"><tr>${cells}</tr></table>`;
      }

      // Check if line was visually centered (starts with significant spaces)
      const leadingSpaces = line.length - line.trimStart().length;
      
      // Known Center titles & headings in Indian Govt / Official formats
      const isExplicitCenter = (
        leadingSpaces > 18 ||
        /^(कार्यालय|शासकीय|प्रमाण पत्र|शपथ पत्र|अनुसूची|RESUME|BIODATA|CURRICULUM VITAE|EXPERIENCE CERTIFICATE|SALARY SLIP|RENT AGREEMENT|AFFIDAVIT)/i.test(trimmed) ||
        trimmed.startsWith('---') ||
        trimmed.startsWith('===')
      );

      // Known Right side elements (dates, signatory names, memo numbers on the right)
      const isRightAligned = (
        (leadingSpaces > 35) ||
        /^(हस्ताक्षर|भवदीय|दिनांक:|Date:|स्थान:|Place:|प्राचार्य|अधीक्षक|शाखा प्रभारी)/i.test(trimmed)
      );

      let alignStyle = 'text-align: justify;';
      let fontStyle = '';

      if (isExplicitCenter) {
        alignStyle = 'text-align: center;';
        fontStyle = 'font-weight: 700; font-size: 15px;';
      } else if (isRightAligned) {
        alignStyle = 'text-align: right;';
      } else if (trimmed.startsWith('विषय') || trimmed.startsWith('Subject:') || trimmed.startsWith('महोदय') || trimmed.startsWith('Respected')) {
        fontStyle = 'font-weight: 600;';
      }

      return `<p style="margin-bottom: 7px; ${alignStyle} ${fontStyle} word-break: break-word; line-height: 1.65;">${trimmed}</p>`;
    })
    .join('');
}

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

  // Simple Clean Mera Document Header
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

    const leadingSpaces = line.length - line.trimStart().length;
    const isCenter = leadingSpaces > 18 || /^(RESUME|BIODATA|AFFIDAVIT|CERTIFICATE|AGREEMENT)/i.test(trimmed);

    const wrappedLines = doc.splitTextToSize(trimmed, maxLineWidth);

    wrappedLines.forEach((wLine: string) => {
      if (currentY + 7 > pageHeight - 18) {
        doc.addPage();
        currentY = 18;
      }

      if (isCenter) {
        doc.text(wLine, pageWidth / 2, currentY, { align: 'center' });
      } else {
        doc.text(wLine, margin, currentY);
      }
      currentY += 5.8;
    });
  });

  // Add "Mera Document" to the bottom right footer of each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Mera Document', pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc.output('blob');
};

/**
 * High-accuracy multi-page PDF generator supporting 100% Hindi Devanagari, English, 
 * Special Symbols, Tables & Custom formatting with preserved alignments (Center, Right, Justify).
 */
export const generateAccuratePdfFromHtml = async (
  title: string,
  contentHtmlOrText: string,
  fileName: string = 'Converted_Document.pdf'
): Promise<Blob> => {
  // Container width: standard A4 width in pixels at 96 DPI
  const a4WidthPx = 794;

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
    formattedBody = formatTextToStructuredHtml(contentHtmlOrText);
  }

  // Clean Header and Footer with "Mera Document" on the right side
  container.innerHTML = `
    <div style="font-family: inherit; font-size: 13.5px; color: #1e293b; min-height: 850px;">
      ${formattedBody}
    </div>
    <div style="margin-top: 36px; text-align: right; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: inherit;">
      Mera Document
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