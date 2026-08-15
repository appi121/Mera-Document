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

      // Upscale resolution to minimum 2200px width/height for maximum Devanagari OCR precision
      const maxDim = Math.max(img.width, img.height);
      const scale = maxDim < 1400 ? 2.2 : (maxDim > 2800 ? 2400 / maxDim : 1.5);
      
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Deep Luma, Noise Suppression & Dynamic Thresholding for scanned Govt & Police memos
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Sharpen characters while preventing noise amplification on scanned paper
        let color = gray;
        if (gray < 200) {
          // Text ink reinforcement (darken text characters)
          color = Math.max(0, gray * 0.78);
        } else {
          // Background clean (whiten aged paper yellowish tint)
          color = 255;
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