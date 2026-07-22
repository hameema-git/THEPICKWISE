import { useRef, useState } from 'react'
import { uploadProductImages } from '../../services/storageService'
import styles from './PhotoUploader.module.css'

// images: array of already-uploaded public URLs (first = cover photo)
// onChange: (urls) => void — called with the full updated array
export default function PhotoUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (files.length === 0) return
    setError('')
    setUploading(true)
    setProgress({ done: 0, total: files.length })

    const { urls, errors } = await uploadProductImages(files, (done, total) => setProgress({ done, total }))

    if (urls.length > 0) onChange([...images, ...urls])
    if (errors.length > 0) setError(errors.map((e) => `${e.file}: ${e.message}`).join(' · '))

    setUploading(false)
    setProgress(null)
  }

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const makeCover = (index) => {
    if (index === 0) return
    const reordered = [images[index], ...images.filter((_, i) => i !== index)]
    onChange(reordered)
  }

  return (
    <div className={styles.wrap}>
      {images.length > 0 && (
        <div className={styles.grid}>
          {images.map((url, i) => (
            <div key={url} className={styles.thumbWrap}>
              <img src={url} alt={`Product photo ${i + 1}`} className={styles.thumb} />
              {i === 0 && <span className={styles.coverBadge}>Cover</span>}
              <div className={styles.thumbActions}>
                {i !== 0 && (
                  <button type="button" className={styles.thumbBtn} onClick={() => makeCover(i)} title="Make cover photo">
                    ⭐
                  </button>
                )}
                <button type="button" className={styles.thumbBtn} onClick={() => removeAt(i)} title="Remove">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.buttonRow}>
        <button type="button" className={styles.uploadBtn} onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
          📷 Take Photo
        </button>
        <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          🖼️ Upload Photos
        </button>
      </div>

      {/* capture="environment" opens the rear camera directly on mobile —
          on desktop, browsers without a camera just fall back to the file picker. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {uploading && (
        <p className={styles.status}>Optimizing & uploading {progress.done}/{progress.total}…</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {images.length === 0 && !uploading && (
        <p className={styles.hint}>Add at least one photo. The first photo becomes the cover image shown on the site.</p>
      )}
    </div>
  )
}
