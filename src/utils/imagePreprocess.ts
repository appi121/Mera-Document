/**
 * Smart Gentle Image Preprocessor for Hindi & English OCR.
 * Preserves thin Devanagari matras, numbers, and light text without destructive contrast clipping.
 */
export const preprocessImageForOcr = (imageSource: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }

      // Calculate optimal resolution (~1800px max dimension for optimal OCR performance)
      const maxDim = Math.max(img.width, img.height);
      const scale = maxDim < 1000 ? 1.8 : (maxDim > 2200 ? 1500 / maxDim : 1.2);
      
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Gentle Luma Grayscale preserving Hindi Vowel Matras & Accents
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Mild contrast enhancement to avoid burning out Hindi matras
        const factor = 1.15;
        let color = factor * (gray - 128) + 128;
        color = Math.min(255, Math.max(0, color));

        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      resolve(imageSource);
    };

    img.src = imageSource;
  });
};