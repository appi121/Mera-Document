import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  isReduced: boolean;
  reductionPercentage: number;
}

// Merge multiple PDFs into one
export const mergePdfFiles = async (files: File[]): Promise<Blob> => {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Split PDF by page range (e.g. "1-3", "2,4,5", "1-4,7")
export const splitPdfFile = async (file: File, pageRange: string): Promise<Blob> => {
  if (!file) throw new Error('No PDF file provided.');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const pagesToExtract: number[] = [];

  const cleanRange = pageRange.trim();
  if (!cleanRange || cleanRange.toLowerCase() === 'all') {
    for (let i = 0; i < totalPages; i++) pagesToExtract.push(i);
  } else {
    const parts = cleanRange.split(/[,;\s]+/).filter(Boolean);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
          throw new Error(`Invalid page range "${part}". Example format: 1-3 or 2,4.`);
        }

        const validStart = Math.max(1, start);
        const validEnd = Math.min(totalPages, end);
        for (let i = validStart; i <= validEnd; i++) {
          pagesToExtract.push(i - 1);
        }
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 1 || num > totalPages) {
          throw new Error(`Invalid page number ${part}. PDF has ${totalPages} pages.`);
        }
        pagesToExtract.push(num - 1);
      }
    }
  }

  const uniqueIndices = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);
  if (uniqueIndices.length === 0) {
    throw new Error('No valid pages found in the specified range.');
  }

  const copiedPages = await newPdf.copyPages(pdf, uniqueIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Rotate PDF pages by 90, 180, or 270 degrees
export const rotatePdfFile = async (file: File, rotationAngle: number = 90): Promise<Blob> => {
  if (!file) throw new Error('No PDF file provided.');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAngle) % 360));
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Add Page Numbers to PDF
export const addPageNumbersToPdf = async (
  file: File,
  position: 'bottom-center' | 'bottom-right' = 'bottom-center'
): Promise<Blob> => {
  if (!file) throw new Error('No PDF file provided.');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const total = pages.length;
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const text = `Page ${index + 1} of ${total}`;
    const textSize = 10;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    let x = (width - textWidth) / 2;
    if (position === 'bottom-right') {
      x = width - textWidth - 30;
    }

    page.drawText(text, {
      x,
      y: 20,
      size: textSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Add Stamp / Watermark Text to PDF
export const addWatermarkToPdf = async (
  file: File,
  watermarkText: string = 'CONFIDENTIAL'
): Promise<Blob> => {
  if (!file) throw new Error('No PDF file provided.');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textSize = Math.max(28, Math.floor(width / 14));
    const textWidth = font.widthOfTextAtSize(watermarkText, textSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2 + 30,
      y: height / 2 - 20,
      size: textSize,
      font,
      color: rgb(0.85, 0.2, 0.2),
      opacity: 0.28,
      rotate: degrees(45),
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Helper: Convert any image (including WEBP, PNG, JPG) to JPEG/PNG bytes via canvas
async function convertFileToJpegBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          reject(new Error('Failed to convert image to Blob'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, 'image/jpeg', 0.92);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image file ${file.name}`));
    };
    img.src = url;
  });
}

// Convert Images (JPG/PNG/WEBP) into single high-resolution PDF with zero blank pages
export const convertImagesToPdf = async (files: File[]): Promise<Blob> => {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image.');
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const jpegBytes = await convertFileToJpegBytes(file);
    const img = await pdfDoc.embedJpg(jpegBytes);

    const { width, height } = img.scale(1.0);
    // Standard A4 dimensions
    const a4Width = 595.28;
    const a4Height = 841.89;
    const scaleFactor = Math.min((a4Width - 40) / width, (a4Height - 40) / height, 1.0);
    const finalW = width * scaleFactor;
    const finalH = height * scaleFactor;

    const page = pdfDoc.addPage([a4Width, a4Height]);
    page.drawImage(img, {
      x: (a4Width - finalW) / 2,
      y: (a4Height - finalH) / 2,
      width: finalW,
      height: finalH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Convert PDF pages to JPG images
export const convertPdfToJpgImages = async (
  file: File
): Promise<{ dataUrl: string; pageNum: number }[]> => {
  if (!file) throw new Error('No PDF file provided.');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results: { dataUrl: string; pageNum: number }[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      results.push({
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        pageNum: i,
      });
    }
  }

  return results;
};

// Real Browser-Compatible PDF Size Optimization & Compression Pipeline
export const compressPdfFile = async (
  file: File,
  onProgress?: (msg: string) => void
): Promise<CompressResult> => {
  if (!file) throw new Error('No PDF file provided.');

  const originalSize = file.size;
  if (onProgress) onProgress('PDF का विश्लेषण और इमेज कंप्रेसन शुरू हो रहा है...');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) onProgress(`पन्ना ${i} / ${totalPages} कंप्रेस किया जा रहा है...`);
    const page = await pdf.getPage(i);

    // Render at optimized 1.5x scale for good readability and smaller footprint
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Re-encode as 65% quality JPEG
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.65);
      const base64Data = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }

      const img = await newPdf.embedJpg(bytes);
      const a4Width = 595.28;
      const a4Height = 841.89;
      const imgScale = Math.min(a4Width / img.width, a4Height / img.height, 1.0);
      const w = img.width * imgScale;
      const h = img.height * imgScale;

      const newPage = newPdf.addPage([a4Width, a4Height]);
      newPage.drawImage(img, {
        x: (a4Width - w) / 2,
        y: (a4Height - h) / 2,
        width: w,
        height: h,
      });
    }
  }

  const compressedBytes = await newPdf.save();
  const compressedSize = compressedBytes.length;
  const isReduced = compressedSize < originalSize;
  const reductionPercentage = isReduced
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return {
    blob: new Blob([compressedBytes], { type: 'application/pdf' }),
    originalSize,
    compressedSize,
    isReduced,
    reductionPercentage,
  };
};