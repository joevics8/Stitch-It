'use client';

interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

/**
 * Downscales and re-encodes an image file as JPEG before upload. Phone
 * camera photos are routinely 4000x3000+ and several MB — uploading them
 * raw is what makes "upload a photo" feel like it hangs forever on a
 * normal connection. Drawing through a canvas also normalizes EXIF
 * orientation as a side effect.
 */
export async function compressImageFile(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: CompressOptions = {}
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}
