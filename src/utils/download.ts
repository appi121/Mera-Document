import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { formatOcrDataWithLayout } from './ocrFormatter';
import { generatePdfFromContent } from './wordToPdf';

// Set worker source for PDF.js using cdnjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const downloadFile = (content: string | Blob, filename: string, mimeType: string = 'text/plain') => {
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Download error:', err);
  }
};

/**
 * Generates an Adobe / ChatGPT grade MS Word compatible document with UTF-8 BOM encoding.
 * Strictly preserves center alignment, poem/slogan stanza line breaks, bold headers, 
 * serial numbers (1., 2.), tables and Hindi Devanagari typography.
 */
export const downloadWordDoc = (filename: string, textContent: string, title: string = 'Document') => {
  const lines = textContent.split('\n');

  const formattedHtml = lines
    .map(line => {
      const lineTrimmed = line.trim();
      if (!lineTrimmed) {
        return '<p style="margin: 0; line-height: 1.0; font-size: 8pt;">&nbsp;</p>';
      }

      // Check if it's a table row
      if (line.includes('|') || line.includes('\t')) {
        const cells = line.split(/[\t|]/).map(c => `<td style="border:1px solid #cbd5e1; padding:6px 10px; font-family:'Calibri', 'Mangal', 'Segoe UI', sans-serif; font-size: 11pt;">${c.trim()}</td>`).join('');
        return `<table style="border-collapse:collapse; width:100%; margin: 8pt 0;"><tr>${cells}</tr></table>`;
      }

      // Detect center alignment in Indian documents (Headings, Slogans, Quotes, Titles)
      const leadingSpaces = line.length - line.trimStart().length;
      const isCenter = (
        leadingSpaces >= 10 ||
        /^(स्लोगन|नारे|स्वतंत्रता दिवस|कार्यालय|शासकीय|प्रमाण पत्र|शपथ पत्र|अनुसूची|RESUME|BIODATA|CURRICULUM|EXPERIENCE|SALARY|RENT|AFFIDAVIT|DECLARATION|INDEPENDENCE DAY)/i.test(lineTrimmed) ||
        (lineTrimmed.startsWith('"') && lineTrimmed.endsWith('"')) ||
        (lineTrimmed.startsWith('“') && lineTrimmed.endsWith('”')) ||
        lineTrimmed.startsWith('---') ||
        lineTrimmed.startsWith('===')
      );

      // Detect numbered list or bullet (1., 2., •, -, आदि)
      const isNumbered = /^([0-9]+[.)]|[-•*]|\([0-9]+\))\s+/i.test(lineTrimmed);

      // Detect Right-aligned metadata (dates, signatures)
      const isRightAligned = (
        leadingSpaces >= 30 ||
        /^(हस्ताक्षर|भवदीय|दिनांक:|Date:|स्थान:|Place:|प्राचार्य|अधीक्षक|शाखा प्रभारी)/i.test(lineTrimmed)
      );

      let textAlign = 'left';
      let fontWeight = 'normal';
      let fontSize = '11.5pt';
      let color = '#1e293b';

      if (isCenter) {
        textAlign = 'center';
        fontWeight = 'bold';
        fontSize = '12.5pt';
        color = '#0f172a';
      } else if (isRightAligned) {
        textAlign = 'right';
      } else if (isNumbered) {
        fontWeight = 'normal';
      }

      return `<p style="margin: 0 0 6pt 0; line-height: 1.5; font-family:'Mangal', 'Noto Sans Devanagari', 'Calibri', 'Segoe UI', Arial, sans-serif; font-size:${fontSize}; text-align:${textAlign}; font-weight:${fontWeight}; color:${color}; word-break: break-word;">${lineTrimmed}</p>`;
    })
    .join('');

  const htmlDoc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 54.0pt 54.0pt 54.0pt 54.0pt;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Mangal', 'Noto Sans Devanagari', 'Calibri', 'Segoe UI', Arial, sans-serif;
    }
    p { margin: 0 0 6pt 0; }
  </style>
</head>
<body style="font-family:'Mangal', 'Noto Sans Devanagari', 'Calibri', 'Segoe UI', Arial, sans-serif; padding: 20px;">
  <div class="Section1">
    ${formattedHtml}
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff' + htmlDoc], { type: 'application/msword;charset=utf-8' });
  downloadFile(blob, filename.endsWith('.doc') ? filename : `${filename}.doc`, 'application/msword');
};

/**
 * Generates a clean, populated real PDF blob using jsPDF engine with zero blank pages.
 */
export const generateSamplePdfBlob = (title: string, textContent: string): Blob => {
  return generatePdfFromContent(title, textContent);
};

/**
 * Renders a PDF page onto an offscreen HTML5 Canvas to get an image data URL
 */
const renderPdfPageToCanvas = async (pdfPage: any): Promise<string> => {
  const viewport = pdfPage.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (context) {
    await pdfPage.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/png');
  }
  return '';
};

interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Advanced Spatial PDF Text Extractor:
 * Reconstructs precise lines and visual paragraphs by grouping words using their actual Y and X positions.
 * Guarantees that poetry, slogans, numbered lists, and letter structures don't get joined together or garbled.
 */
export const extractPdfContentAccurate = async (
  file: File, 
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress('PDF फ़ाइल का विश्लेषण किया जा रहा है...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageOutputs: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (onProgress) onProgress(`पन्ना ${pageNum} / ${pdf.numPages} का लेआउट पढ़ा जा रहा है...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      const items: PdfTextItem[] = [];

      textContent.items.forEach((item: any) => {
        const str = item.str || '';
        if (str.trim()) {
          // item.transform: [scaleX, skewY, skewX, scaleY, transX, transY]
          const x = item.transform ? item.transform[4] : 0;
          const y = item.transform ? viewport.height - item.transform[5] : 0;
          items.push({
            str,
            x,
            y,
            width: item.width || 0,
            height: item.height || 12,
          });
        }
      });

      if (items.length > 0) {
        // Group items into lines based on vertical Y proximity (tolerance ~ 4-6px)
        items.sort((a, b) => a.y - b.y);

        const lines: { y: number; items: PdfTextItem[] }[] = [];
        const Y_TOLERANCE = 5;

        items.forEach(item => {
          let matchedLine = lines.find(l => Math.abs(l.y - item.y) <= Y_TOLERANCE);
          if (matchedLine) {
            matchedLine.items.push(item);
          } else {
            lines.push({ y: item.y, items: [item] });
          }
        });

        // Sort lines top-to-bottom
        lines.sort((a, b) => a.y - b.y);

        // Sort items inside each line left-to-right
        const formattedPageLines: string[] = [];
        let prevLineY = 0;

        lines.forEach(line => {
          line.items.sort((a, b) => a.x - b.x);

          // Build string with spaces between words
          let lineText = '';
          let prevItemX1 = 0;
          
          line.items.forEach(it => {
            if (prevItemX1 > 0) {
              const gap = it.x - prevItemX1;
              if (gap > 4) {
                lineText += ' ';
              }
            }
            lineText += it.str;
            prevItemX1 = it.x + (it.width || 0);
          });

          // Check paragraph gap (extra blank line if vertical distance is large)
          if (prevLineY > 0 && line.y - prevLineY > 24) {
            formattedPageLines.push('');
          }

          formattedPageLines.push(lineText.trim());
          prevLineY = line.y;
        });

        pageOutputs.push(formattedPageLines.join('\n'));
      }
    }

    const directExtracted = pageOutputs.join('\n\n').trim();

    // If PDF was a flat image scan (scanned photocopy), fallback to Deep OCR
    if (!directExtracted || directExtracted.length < 20) {
      if (onProgress) onProgress('स्कैन/फोटो PDF पाई गई! AI OCR स्कैनिंग शुरू हो रही है...');
      
      let ocrText = '';
      const worker = await createWorker(['hin', 'eng']);

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        if (onProgress) onProgress(`पन्ना ${i} / ${pdf.numPages} का अक्षर व टेबल स्कैन किया जा रहा है...`);
        const page = await pdf.getPage(i);
        const pageImageDataUrl = await renderPdfPageToCanvas(page);

        if (pageImageDataUrl) {
          const { data } = await worker.recognize(pageImageDataUrl);
          const pageFormatted = formatOcrDataWithLayout(data);
          if (pageFormatted.formattedText.trim()) {
            ocrText += pageFormatted.formattedText.trim() + '\n\n';
          }
        }
      }

      await worker.terminate();

      if (ocrText.trim()) {
        return ocrText.trim();
      }
    }

    return directExtracted;
  } catch (err) {
    console.error('OCR Extraction Error:', err);
    return '';
  }
};