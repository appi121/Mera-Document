/**
 * Advanced Soft-Contrast Image Preprocessor for Hindi Devanagari & English Documents.
 * Preserves continuous stroke connectivity, Hindi shirorekha, matras, and dots
 * without harsh binary clipping that creates symbol artifacts.
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

      // Upscale DPI to 3.0x for crisp recognition of Devanagari ligatures
      const maxDim = Math.max(img.width, img.height);
      const scale = maxDim < 1400 ? 3.0 : maxDim < 2200 ? 2.0 : 1.5;

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Convert to high-definition luminance map
      const gray = new Float32Array(w * h);
      let minLuma = 255;
      let maxLuma = 0;

      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        // High accuracy luminance
        const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        gray[j] = luma;
        if (luma < minLuma) minLuma = luma;
        if (luma > maxLuma) maxLuma = luma;
      }

      // 2. Soft Sigmoid Contrast Stretching (Keeps ink black and cleans yellow/grey background)
      const range = Math.max(1, maxLuma - minLuma);
      const midpoint = minLuma + range * 0.55;

      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const val = gray[j];
        
        // Soft curve that enhances text strokes while gently removing background shadow
        let normalized = (val - minLuma) / range;
        
        // Enhance ink density without breaking thin matras
        if (val < midpoint) {
          normalized = Math.pow(normalized, 1.4); // Darken text
        } else {
          normalized = Math.min(1.0, normalized * 1.15); // Lighten paper background
        }

        const finalVal = Math.max(0, Math.min(255, Math.round(normalized * 255)));

        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
        data[i + 3] = 255;
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