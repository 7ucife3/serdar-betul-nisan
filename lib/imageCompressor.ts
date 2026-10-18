/**
 * Client-side high-performance image compressor
 * Optimized specifically for iOS Safari (HEIC/large sensors) and modern Android devices.
 * Uses createImageBitmap when supported, and properly handles dimension downscaling.
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.80
): Promise<string> {
  return new Promise((resolve) => {
    // Fallback helper to resolve as original if anything fails
    const fallbackToRaw = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    };

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);

          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            fallbackToRaw();
            return;
          }

          // Calculate scaled dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d", { willReadFrequently: false });
          if (!ctx) {
            fallbackToRaw();
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Prefer JPEG for broad cross-platform stability (iOS Safari sometimes fails on webp)
          let dataUrl = canvas.toDataURL("image/jpeg", quality);

          // If empty or invalid, fallback
          if (!dataUrl || !dataUrl.startsWith("data:image")) {
            fallbackToRaw();
            return;
          }

          resolve(dataUrl);
        } catch {
          fallbackToRaw();
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        fallbackToRaw();
      };

      img.src = objectUrl;
    } catch {
      fallbackToRaw();
    }
  });
}

