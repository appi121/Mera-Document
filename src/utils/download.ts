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
 * Generates an MS Word compatible document with UTF-8 BOM encoding.
 * Opens seamlessly in MS Word, WPS Office, Mobile Word & Google Docs.
 */
export const downloadWordDoc = (filename: string, textContent: string, title: string = 'Document') => {
  const formattedHtml = textContent
    .split('\n')
    .map(line => {
      const lineTrimmed = line.trim();
      if (!lineTrimmed) return '<br/>';

      if (line.includes('|') || line.includes('\t')) {
        const cells = line.split(/[\t|]/).map(c => `<td style="border:1px solid #ddd; padding:6px 10px; font-family:'Calibri',sans-serif;">${c.trim()}</td>`).join('');
        return `<table style="border-collapse:collapse; width:100%; margin-bottom:4pt;"><tr>${cells}</tr></table>`;
      }

      return `<p style="margin-bottom:6pt; font-size:11.0pt; font-family:'Calibri','Segoe UI',sans-serif; color:#111; line-height:1.3;">${line}</p>`;
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
      <w:View>Normal</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
</head>
<body style="font-family:'Calibri','Segoe UI',sans-serif; padding: 25px;">
  ${formattedHtml}
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
  const viewport = pdfPage.getViewport({ scale: 1.5 });
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

/**
 * High-accuracy PDF text extractor combining PDF.js with automatic Tesseract AI OCR.
 * Strictly returns genuine detected text without any fake mock content.
 */
export const extractPdfContentAccurate = async (
  file: File, 
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress('PDF फ़ाइल पढ़ी जा रही है...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Step 1: Attempt direct text content extraction
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tokenizedText = await page.getTextContent();
      const pageText = tokenizedText.items
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim()) {
        fullText += pageText + '\n\n';
      }
    }

    // Step 2: If PDF is scanned/photo with no embedded text streams, run AI OCR
    if (!fullText.trim() || fullText.trim().length < 15) {
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

    return fullText.trim();
  } catch (err) {
    console.error('OCR Extraction Error:', err);
    return '';
  }
};