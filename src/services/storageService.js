import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/imageCompress'

const BUCKET = 'product-images'
const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024 // reject absurdly large files before even attempting compression
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024    // sanity check after compression — should rarely trigger

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]/g, '-').replace(/-+/g, '-')
}

// Compresses, then uploads a single image file, returning its public URL.
// Throws with a human-readable message on failure — callers show it as-is.
export async function uploadProductImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" isn't an image file.`)
  }
  if (file.size > MAX_ORIGINAL_SIZE) {
    throw new Error(`"${file.name}" is too large (max 20MB). Try a smaller photo.`)
  }

  const compressed = await compressImage(file)
  if (compressed.size > MAX_UPLOAD_SIZE) {
    throw new Error(`"${file.name}" is still too large after compression. Try a different photo.`)
  }

  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeFilename(compressed.name)}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Uploads multiple files sequentially (simpler to reason about progress/
// errors than parallel uploads for a handful of phone photos) and returns
// the successful URLs plus any per-file errors, so a single bad photo
// doesn't block the others from uploading.
export async function uploadProductImages(files, onProgress) {
  const urls = []
  const errors = []
  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadProductImage(files[i])
      urls.push(url)
    } catch (err) {
      errors.push({ file: files[i].name, message: err.message })
    }
    onProgress?.(i + 1, files.length)
  }
  return { urls, errors }
}
