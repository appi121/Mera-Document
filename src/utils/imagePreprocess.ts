/**
 * Pre-processes an image on canvas before passing to OCR engine:
 * 1. Upscales small fonts for better recognition.
 * 2. Applies high-contrast grayscale and sharpening to remove background noise.
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

      // Upscale for small font clarity
      const scale = Math.max(1, Math.min(2, 2200 / Math.max(img.width, img.height)));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // High-contrast grayscale conversion
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // Contrast enhancement
        const contrast = 1.4;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
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