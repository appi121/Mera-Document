import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Merge multiple PDFs into one
export const mergePdfFiles = async (files: File[]): Promise<Blob> => {
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

// Split PDF by page range (e.g. "1-3" or "2,4,5" or extract all)
export const splitPdfFile = async (file: File, pageRange: string): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const pagesToExtract: number[] = [];

  const cleanRange = pageRange.trim();
  if (!cleanRange || cleanRange === 'all') {
    // Default first page or all
    pagesToExtract.push(0);
  } else if (cleanRange.includes('-')) {
    const [startStr, endStr] = cleanRange.split('-');
    const start = Math.max(1, parseInt(startStr, 10) || 1);
    const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
    for (let i = start; i <= end; i++) {
      pagesToExtract.push(i - 1);
    }
  } else if (cleanRange.includes(',')) {
    cleanRange.split(',').forEach((numStr) => {
      const num = parseInt(numStr.trim(), 10);
      if (num >= 1 && num <= totalPages) {
        pagesToExtract.push(num - 1);
      }
    });
  } else {
    const num = parseInt(cleanRange, 10);
    if (num >= 1 && num <= totalPages) {
      pagesToExtract.push(num - 1);
    } else {
      pagesToExtract.push(0);
    }
  }

  const validIndices = Array.from(new Set(pagesToExtract)).filter(idx => idx >= 0 && idx < totalPages);
  const copiedPages = await newPdf.copyPages(pdf, validIndices.length ? validIndices : [0]);
  copiedPages.forEach((p) => newPdf.addPage(p));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Rotate PDF pages by 90, 180, or 270 degrees
export const rotatePdfFile = async (file: File, rotationAngle: number = 90): Promise<Blob> => {
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
export const addPageNumbersToPdf = async (file: File, position: 'bottom-center' | 'bottom-right' = 'bottom-center'): Promise<Blob> => {
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
export const addWatermarkToPdf = async (file: File, watermarkText: string = 'CONFIDENTIAL'): Promise<Blob> => {
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

// Convert Images (JPG/PNG) into single high-resolution PDF
export const convertImagesToPdf = async (files: File[]): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let img;
    if (file.type.includes('png')) {
      img = await pdfDoc.embedPng(arrayBuffer);
    } else {
      img = await pdfDoc.embedJpg(arrayBuffer);
    }

    const { width, height } = img.scale(1.0);
    // Standard A4 aspect fit
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
export const convertPdfToJpgImages = async (file: File): Promise<{ dataUrl: string; pageNum: number }[]> => {
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