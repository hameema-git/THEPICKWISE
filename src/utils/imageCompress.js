// Resizes and re-compresses an image entirely in the browser before it's
// uploaded — this is what keeps the free-tier Storage quota (1GB) and
// bandwidth quota (10GB/month) from filling up fast. A typical phone photo
// (3-6MB) becomes roughly 150-350KB after this, with no visible quality
// loss at the sizes this site actually displays images.
//
// If anything goes wrong (a format the browser can't decode, e.g. some
// iPhones' HEIC photos in older browsers), this falls back to returning
// the original file rather than blocking the upload — a larger file that
// uploads successfully beats a compressed one that fails.
const MAX_WIDTH = 1600
const JPEG_QUALITY = 0.8

export async function compressImage(file, { maxWidth = MAX_WIDTH, quality = JPEG_QUALITY } = {}) {
  try {
    const bitmap = await createImageBitmap(file)

    // Never upscale — only shrink photos wider than maxWidth.
    const scale = Math.min(1, maxWidth / bitmap.width)
    const targetWidth = Math.round(bitmap.width * scale)
    const targetHeight = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close?.()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file // canvas encoding failed — fall back to original

    // Don't "compress" into something bigger than the original (can happen
    // with already-small, already-compressed images) — keep whichever is smaller.
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch (err) {
    console.warn('Image compression skipped, uploading original file:', err.message)
    return file
  }
}
