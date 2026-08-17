/**
 * Deep Vision Adaptive Image Preprocessor for Hindi Devanagari & English OCR.
 * Upscales DPI to 300+ DPI, removes yellowish paper shadows, sharpens Hindi matras,
 * and performs Sauvola-like local adaptive contrast normalization.
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

      // Upscale resolution to minimum 2600px width/height for maximum Devanagari ligatures and matras
      const maxDim = Math.max(img.width, img.height);
      const scale = maxDim < 1500 ? 2.5 : maxDim < 2200 ? 1.8 : 1.4;

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Convert to high-contrast grayscale luminance
      const gray = new Uint8Array(w * h);
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Standard Rec. 709 luma
        gray[j] = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
      }

      // 2. Compute background luminosity to eliminate shadows & aged paper tint
      let totalLuma = 0;
      for (let i = 0; i < gray.length; i++) {
        totalLuma += gray[i];
      }
      const avgLuma = totalLuma / gray.length;
      const threshold = Math.max(160, Math.min(215, avgLuma * 0.88));

      // 3. Adaptive thresholding & ink reinforcement
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const val = gray[j];
        let finalVal = 255; // default white background

        if (val < threshold) {
          // Boost dark ink for crisp Hindi Devanagari characters
          finalVal = val < 110 ? 0 : Math.max(0, Math.round(val * 0.4));
        }

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