/**
 * Produces a circular-cropped image as a data URL from a source image and crop area.
 * Used for profile/avatar pictures.
 */

export type CropArea = { x: number; y: number; width: number; height: number };

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Returns a data URL (PNG) of the image cropped to the given area and then masked to a circle.
 */
export async function getCroppedImgAsDataUrl(
  imageSrc: string,
  pixelCrop: CropArea,
  size = 400
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    size,
    size
  );

  // Circular mask: use a second canvas to composite circle
  const circleCanvas = document.createElement('canvas');
  circleCanvas.width = size;
  circleCanvas.height = size;
  const circleCtx = circleCanvas.getContext('2d');
  if (!circleCtx) return canvas.toDataURL('image/png');

  circleCtx.beginPath();
  circleCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  circleCtx.closePath();
  circleCtx.clip();
  circleCtx.drawImage(canvas, 0, 0);

  return circleCanvas.toDataURL('image/png');
}
