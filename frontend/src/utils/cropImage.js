/**
 * Canvas crop helper for react-easy-crop (`croppedAreaPixels` from onCropComplete).
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = src;
  });
}

/**
 * @param {string} imageSrc Object URL or remote URL
 * @param {{ x: number; y: number; width: number; height: number }} pixelCrop
 * @param {{ maxSide?: number; mime?: string; quality?: number }} [opts]
 * @returns {Promise<Blob>}
 */
export async function getCroppedImg(imageSrc, pixelCrop, opts = {}) {
  const { maxSide = 1024, mime = "image/jpeg", quality = 0.92 } = opts;
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no_canvas");

  const srcW = pixelCrop.width;
  const srcH = pixelCrop.height;
  const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
  const destW = Math.round(srcW * scale);
  const destH = Math.round(srcH * scale);

  canvas.width = destW;
  canvas.height = destH;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    srcW,
    srcH,
    0,
    0,
    destW,
    destH
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("empty_blob"));
        else resolve(blob);
      },
      mime,
      quality
    );
  });
}
