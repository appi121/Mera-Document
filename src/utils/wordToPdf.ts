import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Extracts verbatim formatted HTML and text from .docx without destructive filtering or translation.
 */
export const parseWordDocument = async (file: File): Promise<{ html: string; text: string }> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();

    const options = {
      styleMap: [
        "p[style-name='Title'] => h1.center:fresh",
        "p[style-name='Subtitle'] => h2.center:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "r[style-name='Strong'] => strong",
        "table => table.custom-doc-table:fresh",
      ],
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    const textResult = await mammoth.extractRawText({ arrayBuffer });

    let htmlContent = result.value;

    if (htmlContent) {
      htmlContent = htmlContent
        .replace(/<p>/g, '<p style="margin-bottom: 8px; line-height: 1.6; font-family: \'Noto Sans Devanagari\', sans-serif;">')
        .replace(/<table/g, '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1; font-family: \'Noto Sans Devanagari\', sans-serif;"')
        .replace(/<td/g, '<td style="border: 1px solid #cbd5e1; padding: 6px 10px; vertical-align: top;"')
        .replace(/<th/g, '<th style="border: 1px solid #cbd5e1; padding: 6px 10px; background-color: #f8fafc; font-weight: bold;"');
    } else {
      htmlContent = (textResult.value || '')
        .split('\n')
        .map((l) => {
          if (!l.trim()) return '<p style="margin-bottom: 4px;">&nbsp;</p>';
          return `<p style="margin-bottom: 8px; line-height: 1.6; font-family: 'Noto Sans Devanagari', sans-serif;">${l}</p>`;
        })
        .join('');
    }

    return {
      html: htmlContent,
      text: textResult.value || '',
    };
  }

  // Plain text file: preserve exact lines verbatim
  const text = await file.text();
  const safeHtml = formatRawTextToHtml(text);

  return {
    html: safeHtml,
    text,
  };
};

/**
 * Format raw text into structured HTML preserving verbatim characters, indents, and tables.
 */
function formatRawTextToHtml(textContent: string): string {
  return (textContent || '')
    .split('\n')
    .map((line) => {
      if (!line.trim()) return '<p style="margin-bottom: 4px;">&nbsp;</p>';

      if (line.includes('|') || line.includes('\t')) {
        const cells = line
          .split(/[|\t]/)
          .map((c) => `<td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 13px;">${c.trim()}</td>`)
          .join('');
        return `<table style="width: 100%; border-collapse: collapse; margin: 8px 0;"><tr>${cells}</tr></table>`;
      }

      return `<p style="margin-bottom: 7px; text-align: left; word-break: break-word; line-height: 1.65; font-family: 'Noto Sans Devanagari', sans-serif;">${line}</p>`;
    })
    .join('');
}

/**
 * Clean vector jsPDF generator preserving text exactly.
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  const lines = (content || '').split('\n');

  lines.forEach((line) => {
    if (!line.trim()) {
      currentY += 4;
      return;
    }

    const wrappedLines = doc.splitTextToSize(line, maxLineWidth);

    wrappedLines.forEach((wLine: string) => {
      if (currentY + 7 > pageHeight - 18) {
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
 * High-accuracy multi-page PDF generator supporting 100% Devanagari Hindi Unicode, English, 
 * Numbers, and Tables using bundled Noto Sans Devanagari font.
 */
export const generateAccuratePdfFromHtml = async (
  title: string,
  contentHtmlOrText: string,
  fileName: string = 'Converted_Document.pdf'
): Promise<Blob> => {
  const a4WidthPx = 794;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${a4WidthPx}px`;
  container.style.padding = '40px 48px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Noto Sans Devanagari', 'Noto Serif Devanagari', 'Segoe UI', Calibri, Arial, sans-serif";
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.65';
  container.style.boxSizing = 'border-box';

  const isHtml = /<[a-z][\s\S]*>/i.test(contentHtmlOrText);
  const formattedBody = isHtml ? contentHtmlOrText : formatRawTextToHtml(contentHtmlOrText);

  container.innerHTML = `
    <div style="font-family: inherit; font-size: 13.5px; color: #1e293b; min-height: 850px;">
      ${formattedBody}
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidthMm = 210;
    const pageHeightMm = 297;
    const totalHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (totalHeightMm <= pageHeightMm + 2) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, totalHeightMm, undefined, 'FAST');
    } else {
      let heightLeft = totalHeightMm;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidthMm, totalHeightMm, undefined, 'FAST');
      heightLeft -= pageHeightMm;

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