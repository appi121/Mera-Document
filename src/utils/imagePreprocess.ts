/**
 * Advanced Devanagari & English Image Preprocessor for OCR.
 * Bounds image dimensions to safe canvas limits (max 2200px) to prevent memory crashes
 * and returns valid, clean high-contrast image data for Tesseract.js.
 */
export const preprocessImageForOcr = (imageSource: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!imageSource || typeof imageSource !== 'string') {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(imageSource);
          return;
        }

        // Safe target bounds for OCR (optimal range: 1400px to 2200px)
        const MAX_DIM = 2200;
        const MIN_DIM = 1200;
        const maxCurrent = Math.max(width, height);

        let scale = 1.0;
        if (maxCurrent < MIN_DIM) {
          scale = Math.min(2.0, MIN_DIM / maxCurrent);
        } else if (maxCurrent > MAX_DIM) {
          scale = MAX_DIM / maxCurrent;
        }

        const targetW = Math.max(100, Math.round(width * scale));
        const targetH = Math.max(100, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(imageSource);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;
        const len = data.length;

        // 1. Calculate luminance histogram & Otsu/Adaptive cutoff
        let totalLuma = 0;
        const totalPixels = targetW * targetH;

        for (let i = 0; i < len; i += 4) {
          // Standard perception luminance
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          totalLuma += luma;
        }

        const avgLuma = totalLuma / totalPixels;
        const cutoff = Math.max(140, Math.min(210, avgLuma * 0.85));

        // 2. High contrast stroke reinforcement for Hindi Devanagari text
        for (let i = 0; i < len; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          let finalVal = 255;

          if (luma < cutoff) {
            // Darken ink strokes
            finalVal = luma < 100 ? 0 : Math.max(0, Math.round(luma * 0.45));
          }

          data[i] = finalVal;
          data[i + 1] = finalVal;
          data[i + 2] = finalVal;
          data[i + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        const resultDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        if (resultDataUrl && resultDataUrl.length > 500 && resultDataUrl.startsWith('data:image/')) {
          resolve(resultDataUrl);
        } else {
          resolve(imageSource);
        }
      } catch (err) {
        console.warn('Preprocessing fallback due to canvas error:', err);
        resolve(imageSource);
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during preprocessing:', err);
      resolve(imageSource);
    };

    img.src = imageSource;
  });
};