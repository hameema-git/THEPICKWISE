import { useEffect } from 'react'
import styles from './VideoModal.module.css'

export default function VideoModal({ url, credit, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <button className={styles.close} onClick={onClose} aria-label="Close video">✕</button>
        <div className={styles.iframeWrap}>
          <iframe src={url} allowFullScreen
            allow="autoplay; encrypted-media"
            title={credit ? `${credit} review` : 'Product review'} />
        </div>
        <div className={styles.footer}>
          {credit && <span className={styles.credit}>📹 Video by <strong>{credit}</strong> (YouTube)</span>}
          <span className={styles.disclaimer}>Video credit belongs to original creator · Shared for review purposes</span>
        </div>
      </div>
    </div>
  )
}
