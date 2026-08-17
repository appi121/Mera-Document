import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { formatOcrDataWithLayout } from './ocrFormatter';
import { preprocessImageForOcr } from './imagePreprocess';
import { generatePdfFromContent } from './wordToPdf';
import { createRealDocxBlob } from './docxGenerator';
import { cleanDevanagariOcrText } from './ocrCleaner';

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
 * Generates and downloads a REAL Microsoft Word .docx binary file using the docx library.
 * Preserves Devanagari Hindi Unicode, headings, paragraphs, and tables.
 */
export const downloadWordDoc = async (
  filename: string,
  textContent: string,
  title: string = 'Document',
  gridMatrix?: string[][]
) => {
  try {
    const safeDocxName = filename.replace(/\.doc$/i, '') + '.docx';
    const docxBlob = await createRealDocxBlob(textContent, gridMatrix, title);
    downloadFile(
      docxBlob,
      safeDocxName,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  } catch (err) {
    console.error('Failed to generate DOCX:', err);
    downloadFile(textContent, filename.replace(/\.docx?$/i, '.txt'), 'text/plain;charset=utf-8');
  }
};

export const generateSamplePdfBlob = (title: string, textContent: string): Blob => {
  return generatePdfFromContent(title, textContent);
};

/**
 * Renders a PDF page onto an offscreen HTML5 Canvas with safe dimensions (scale 2.0x, max 2000px)
 */
const renderPdfPageToCanvas = async (pdfPage: any): Promise<string> => {
  try {
    const unscaledViewport = pdfPage.getViewport({ scale: 1.0 });
    // Scale factor keeping max dimension around 1800-2000px
    const maxDimension = Math.max(unscaledViewport.width, unscaledViewport.height);
    const safeScale = maxDimension > 0 ? Math.min(2.2, 1900 / maxDimension) : 1.8;

    const viewport = pdfPage.getViewport({ scale: Math.max(1.2, safeScale) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      await pdfPage.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL('image/jpeg', 0.95);
    }
  } catch (err) {
    console.error('Error rendering PDF page to canvas:', err);
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
 * Real PDF Text & Scanned OCR Extractor:
 * 1. Checks if PDF contains vector text with spatial layout.
 * 2. If scanned or photo PDF -> runs neural Tesseract.js (Hindi + English) safely.
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
    let isScannedPdf = false;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (onProgress) onProgress(`पन्ना ${pageNum} / ${pdf.numPages} का लेआउट पढ़ा जा रहा है...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      const items: PdfTextItem[] = [];

      textContent.items.forEach((item: any) => {
        const str = item.str || '';
        if (str.trim()) {
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

      const totalChars = items.reduce((acc, it) => acc + it.str.length, 0);
      const hasMeaningfulText = totalChars > 40 && items.some(it => /[\u0900-\u097F\w]/.test(it.str));

      if (hasMeaningfulText) {
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

        lines.sort((a, b) => a.y - b.y);

        const formattedPageLines: string[] = [];
        let prevLineY = 0;

        lines.forEach(line => {
          line.items.sort((a, b) => a.x - b.x);

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

          if (prevLineY > 0 && line.y - prevLineY > 24) {
            formattedPageLines.push('');
          }

          formattedPageLines.push(lineText.trim());
          prevLineY = line.y;
        });

        pageOutputs.push(formattedPageLines.join('\n'));
      } else {
        isScannedPdf = true;
      }
    }

    const directExtracted = pageOutputs.join('\n\n').trim();

    if (isScannedPdf || !directExtracted || directExtracted.length < 30) {
      if (onProgress) onProgress('स्कैन/फोटो PDF: AI डीप विजन OCR (हिंदी + इंग्लिश) प्रारंभ...');
      
      let ocrText = '';
      const worker = await createWorker(['hin', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(`स्कैनिंग प्रगति... ${pct}%`);
          }
        }
      });

      await worker.setParameters({
        tessedit_pageseg_mode: '3' as any,
      });

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        if (onProgress) onProgress(`पन्ना ${i} / ${pdf.numPages} का OCR स्कैन किया जा रहा है...`);
        const page = await pdf.getPage(i);
        const rawCanvasDataUrl = await renderPdfPageToCanvas(page);
        
        if (rawCanvasDataUrl && rawCanvasDataUrl.startsWith('data:image/')) {
          const preprocessedDataUrl = await preprocessImageForOcr(rawCanvasDataUrl);
          const imageToRecognize = preprocessedDataUrl || rawCanvasDataUrl;

          if (imageToRecognize && imageToRecognize.startsWith('data:image/')) {
            const { data } = await worker.recognize(imageToRecognize);
            const pageFormatted = formatOcrDataWithLayout(data);
            const cleanedText = cleanDevanagariOcrText(pageFormatted.formattedText);
            if (cleanedText.trim()) {
              ocrText += cleanedText.trim() + '\n\n';
            }
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