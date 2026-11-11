// Browser-only photo processing. No uploads, external URLs or EXIF in stored JPEGs.
export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 1024 * 1024;
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
const MAX_EDGE = 1600;
export const photoHash = async blob => [...new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))].map(n => n.toString(16).padStart(2, "0")).join("");
export function photoError(code) { const error = new Error(code); error.code = code; return error; }
function jpegSize(bytes) {
  if (bytes[0] !== 255 || bytes[1] !== 216) throw photoError("invalid_photo");
  let p = 2;
  while (p + 3 < bytes.length) {
    if (bytes[p++] !== 255) throw photoError("invalid_photo");
    while (bytes[p] === 255) p++;
    const marker = bytes[p++];
    if (marker === 217 || marker === 218) break;
    const n = (bytes[p] << 8) | bytes[p + 1];
    if (n < 2 || p + n > bytes.length) throw photoError("invalid_photo");
    if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
      if (n < 8) throw photoError("invalid_photo");
      return { width: (bytes[p + 5] << 8) | bytes[p + 6], height: (bytes[p + 3] << 8) | bytes[p + 4] };
    }
    p += n;
  }
  throw photoError("invalid_photo");
}
async function imageFrom(blob) {
  const url = URL.createObjectURL(blob), img = new Image();
  try {
    img.src = url;
    await img.decode();
    if (!img.naturalWidth || !img.naturalHeight) throw photoError("invalid_photo");
    return img;
  } catch { throw photoError("invalid_photo"); }
  finally { URL.revokeObjectURL(url); }
}
export async function preparePhoto(file) {
  if (!(file instanceof Blob) || !file.size || file.size > MAX_ORIGINAL_BYTES) throw photoError("photo_size");
  // Accept raster files only and store a static JPEG copy.
  const bytes = new Uint8Array(await file.slice(0, 128).arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216;
  const png = [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n);
  const webp = String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
  const signature = String.fromCharCode(...bytes);
  const boxLength = bytes.length >= 16 ? new DataView(bytes.buffer).getUint32(0) : 0;
  const heicBrands = new Set(["heic", "heix", "hevc", "hevx"]);
  const heic = signature.slice(4, 8) === "ftyp" && boxLength >= 16 &&
    (heicBrands.has(signature.slice(8, 12)) ||
      Array.from({ length: Math.floor((Math.min(boxLength, bytes.length) - 16) / 4) },
        (_, i) => signature.slice(16 + i * 4, 20 + i * 4)).some(brand => heicBrands.has(brand)));
  if (!jpeg && !png && !webp && !heic) throw photoError("photo_format");
  if (png && bytes.length < 24) throw photoError("invalid_photo");
  if (jpeg || png) {
    const size = jpeg ? jpegSize(new Uint8Array(await file.arrayBuffer())) : (() => { const v = new DataView(bytes.buffer); return { width: v.getUint32(16), height: v.getUint32(20) }; })();
    if (!size.width || !size.height || size.width * size.height > 60000000) throw photoError("photo_size");
  }
  const type = jpeg ? "image/jpeg" : png ? "image/png" : webp ? "image/webp" : "image/heic";
  const img = await imageFrom(new Blob([file], { type })).catch(error => {
    if (heic) throw photoError("photo_format");
    throw error;
  });
  if (img.naturalWidth * img.naturalHeight > 60000000) throw photoError("photo_size");
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw photoError("invalid_photo");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  try {
    for (const quality of [.86, .76, .64]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob?.size && blob.size <= MAX_PHOTO_BYTES) return { id: await photoHash(blob), blob };
    }
    throw photoError("photo_size");
  } finally { canvas.width = canvas.height = 1; }
}
export async function validatePhoto(blob, id) {
  if (!(blob instanceof Blob) || blob.type !== "image/jpeg" || !blob.size || blob.size > MAX_PHOTO_BYTES || !/^[a-f0-9]{64}$/.test(id)) throw photoError("invalid_photo");
  const size = jpegSize(new Uint8Array(await blob.arrayBuffer()));
  if (!size.width || !size.height || Math.max(size.width, size.height) > MAX_EDGE || await photoHash(blob) !== id) throw photoError("invalid_photo");
  await imageFrom(blob);
}
