/**
 * Compress an image dataURL to keep localStorage usage manageable.
 * - Resizes to max 1200px on the longest side
 * - Re-encodes as JPEG at quality 0.72
 * Returns the compressed dataURL string.
 */
export function compressImage(
  dataUrl: string,
  maxSide = 1200,
  quality = 0.72,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if needed
      if (width > maxSide || height > maxSide) {
        if (width >= height) {
          height = Math.round((height / width) * maxSide);
          width = maxSide;
        } else {
          width = Math.round((width / height) * maxSide);
          height = maxSide;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl); // fallback — return original
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
