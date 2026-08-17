/**
 * Advanced Devanagari & English Image Preprocessor for OCR.
 * Converts input images/PDF canvases into optimized Blob objects with adaptive contrast.
 */
export const preprocessImageForOcr = (imageSource: string | File | Blob | HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    // If already a canvas, process canvas directly
    if (imageSource instanceof HTMLCanvasElement) {
      processCanvas(imageSource, resolve);
      return;
    }

    let srcUrl = '';
    let shouldRevoke = false;

    if (imageSource instanceof Blob || imageSource instanceof File) {
      srcUrl = URL.createObjectURL(imageSource);
      shouldRevoke = true;
    } else if (typeof imageSource === 'string' && imageSource) {
      srcUrl = imageSource;
    } else {
      // Fallback empty blob
      resolve(new Blob([], { type: 'image/png' }));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 1000;

        const MAX_DIM = 2000;
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
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          canvas.toBlob((b) => resolve(b || new Blob([], { type: 'image/png' })), 'image/png');
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

        let totalLuma = 0;
        const totalPixels = targetW * targetH;

        for (let i = 0; i < len; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          totalLuma += luma;
        }

        const avgLuma = totalLuma / totalPixels;
        const cutoff = Math.max(140, Math.min(210, avgLuma * 0.85));

        for (let i = 0; i < len; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          let finalVal = 255;

          if (luma < cutoff) {
            finalVal = luma < 100 ? 0 : Math.max(0, Math.round(luma * 0.45));
          }

          data[i] = finalVal;
          data[i + 1] = finalVal;
          data[i + 2] = finalVal;
          data[i + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        canvas.toBlob((blob) => {
          resolve(blob || new Blob([], { type: 'image/png' }));
        }, 'image/png');
      } catch (err) {
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        // Return default blob fallback
        const fbCanvas = document.createElement('canvas');
        fbCanvas.width = 400; fbCanvas.height = 400;
        fbCanvas.toBlob((b) => resolve(b || new Blob([], { type: 'image/png' })), 'image/png');
      }
    };

    img.onerror = () => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      const fbCanvas = document.createElement('canvas');
      fbCanvas.width = 400; fbCanvas.height = 400;
      fbCanvas.toBlob((b) => resolve(b || new Blob([], { type: 'image/png' })), 'image/png');
    };

    img.src = srcUrl;
  });
};

function processCanvas(canvas: HTMLCanvasElement, resolve: (b: Blob) => void) {
  canvas.toBlob((blob) => {
    resolve(blob || new Blob([], { type: 'image/png' }));
  }, 'image/png');
}