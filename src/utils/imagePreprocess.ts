/**
 * Deep Vision Adaptive Image Preprocessor for Hindi & English OCR.
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

      // Calculate optimal resolution (~2200px max dimension for deep OCR clarity)
      const maxDim = Math.max(img.width, img.height);
      const scale = maxDim < 1200 ? 2.0 : (maxDim > 2400 ? 2000 / maxDim : 1.3);
      
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Deep Luma & Contrast Enhancement protecting Devanagari Vowel Signs & Table Grid Lines
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Mild adaptive contrast curve to prevent burning out top-lines (Shirorekha) & matras
        let color = gray;
        if (gray < 210) {
          color = gray * 0.88; // Darken text ink
        } else {
          color = Math.min(255, gray * 1.08); // Clean background paper noise
        }

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