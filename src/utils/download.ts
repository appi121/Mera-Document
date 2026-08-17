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
    // Fallback plain text download if DOCX generation encounters an error
    downloadFile(textContent, filename.replace(/\.docx?$/i, '.txt'), 'text/plain;charset=utf-8');
  }
};

/**
 * Generates a clean, populated real PDF blob using jsPDF engine with zero blank pages.
 */
export const generateSamplePdfBlob = (title: string, textContent: string): Blob => {
  return generatePdfFromContent(title, textContent);
};

/**
 * Renders a PDF page onto an offscreen HTML5 Canvas at 3.0x high-DPI resolution for deep neural Hindi Devanagari OCR
 */
const renderPdfPageToCanvas = async (pdfPage: any): Promise<string> => {
  const viewport = pdfPage.getViewport({ scale: 3.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (context) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
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
 * Real PDF Text & Scanned OCR Extractor:
 * 1. Checks if PDF contains vector text with spatial layout.
 * 2. If scanned or photo PDF -> runs neural Tesseract.js (Hindi + English) with high-DPI adaptive preprocessing and artifact cleanup.
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

      // Check if real Unicode Hindi/English text layer is present
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

    // If scanned document or poor vector text, run real high-res Tesseract OCR
    if (isScannedPdf || !directExtracted || directExtracted.length < 30) {
      if (onProgress) onProgress('स्कैन/फोटो PDF: AI डीप विजन OCR (हिंदी + इंग्लिश) 300+ DPI पर प्रारंभ...');
      
      let ocrText = '';
      const worker = await createWorker(['hin', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(`स्कैनिंग प्रगति... ${pct}%`);
          }
        }
      });

      // PSM 3: Fully automatic page segmentation without OSD (ideal for complex official memos & letters)
      await worker.setParameters({
        tessedit_pageseg_mode: '3' as any,
      });

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        if (onProgress) onProgress(`पन्ना ${i} / ${pdf.numPages} का हाई-DPI OCR स्कैन किया जा रहा है...`);
        const page = await pdf.getPage(i);
        const rawCanvasDataUrl = await renderPdfPageToCanvas(page);
        
        const preprocessedDataUrl = await preprocessImageForOcr(rawCanvasDataUrl);

        if (preprocessedDataUrl) {
          const { data } = await worker.recognize(preprocessedDataUrl);
          const pageFormatted = formatOcrDataWithLayout(data);
          const cleanedText = cleanDevanagariOcrText(pageFormatted.formattedText);
          if (cleanedText.trim()) {
            ocrText += cleanedText.trim() + '\n\n';
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