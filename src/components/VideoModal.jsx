import { useEffect } from 'react'
import styles from './VideoModal.module.css'

// Loads Instagram's official embed script once (reused across every video
// opened afterward) and asks it to process the blockquote below into a
// properly-sized embed — this is what makes it auto-fit the real content
// instead of the fixed-size letterboxing a raw /embed iframe produces.
function useInstagramEmbed(active) {
  useEffect(() => {
    if (!active) return

    function process() {
      if (window.instgrm) window.instgrm.Embeds.process()
    }

    if (window.instgrm) {
      process()
      return
    }

    const existing = document.getElementById('instagram-embed-script')
    if (existing) {
      existing.addEventListener('load', process)
      return () => existing.removeEventListener('load', process)
    }

    const script = document.createElement('script')
    script.id = 'instagram-embed-script'
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = process
    document.body.appendChild(script)
    // Intentionally not removing the script on unmount — it's meant to be
    // loaded once and reused for every Instagram video opened afterward.
  }, [active])
}

export default function VideoModal({ url, credit, platform = 'youtube', onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isInstagram = platform === 'instagram'
  useInstagramEmbed(isInstagram)

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.box} ${isInstagram ? styles.boxInstagram : ''}`}>
        <button className={`${styles.close} ${isInstagram ? styles.closeDark : ''}`} onClick={onClose} aria-label="Close video">✕</button>

        {isInstagram ? (
          <div className={styles.igWrap}>
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{ margin: 0, width: '100%', minWidth: 0 }}
            />
          </div>
        ) : (
          <div className={styles.iframeWrap}>
            <iframe src={url} allowFullScreen
              allow="autoplay; encrypted-media"
              title={credit ? `${credit} review` : 'Product review'} />
          </div>
        )}

        <div className={`${styles.footer} ${isInstagram ? styles.footerLight : ''}`}>
          {credit && <span className={styles.credit}>📹 Video by <strong>{credit}</strong></span>}
          <span className={styles.disclaimer}>Video credit belongs to original creator · Shared for review purposes</span>
        </div>
      </div>
    </div>
  )
}
