import { useEffect, useRef, useState } from 'react'
import { getInstagramEmbedFallback } from '../utils/videoEmbed'
import styles from './VideoModal.module.css'

function loadInstagramScript(onReady, onError) {
  if (window.instgrm) { onReady(); return }
  const existing = document.getElementById('instagram-embed-script')
  if (existing) {
    existing.addEventListener('load', onReady)
    existing.addEventListener('error', onError)
    return
  }
  const script = document.createElement('script')
  script.id = 'instagram-embed-script'
  script.src = 'https://www.instagram.com/embed.js'
  script.async = true
  script.onload = onReady
  script.onerror = onError
  document.body.appendChild(script)
}

export default function VideoModal({ url, credit, platform = 'youtube', onClose }) {
  const isInstagram = platform === 'instagram'
  // 'pending' while we try the real auto-sized embed, 'official' once it
  // succeeds, 'fallback' if it doesn't load in time (e.g. blocked by an
  // ad-blocker) — fallback uses the simpler /embed iframe instead.
  const [igStatus, setIgStatus] = useState(isInstagram ? 'pending' : 'n/a')
  const igContainerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (!isInstagram) return
    let cancelled = false
    let timeoutId

    const fallback = () => { if (!cancelled) setIgStatus('fallback') }

    loadInstagramScript(
      () => {
        window.instgrm?.Embeds.process()
        // Give Instagram's script a couple seconds to actually render an
        // iframe into our container before deciding it failed.
        timeoutId = setTimeout(() => {
          const hasIframe = igContainerRef.current?.querySelector('iframe')
          if (cancelled) return
          setIgStatus(hasIframe ? 'official' : 'fallback')
        }, 2500)
      },
      fallback
    )

    return () => { cancelled = true; clearTimeout(timeoutId) }
  }, [isInstagram, url])

  const showOfficial = isInstagram && (igStatus === 'pending' || igStatus === 'official')
  const showFallback = isInstagram && igStatus === 'fallback'
  const showLoading = isInstagram && igStatus === 'pending'

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.box} ${showOfficial ? styles.boxInstagram : ''} ${showFallback ? styles.boxVertical : ''}`}>
        <button className={`${styles.close} ${showOfficial ? styles.closeDark : ''}`} onClick={onClose} aria-label="Close video">✕</button>

        {!isInstagram && (
          <div className={styles.iframeWrap}>
            <iframe src={url} allowFullScreen
              allow="autoplay; encrypted-media"
              title={credit ? `${credit} review` : 'Product review'} />
          </div>
        )}

        {showOfficial && (
          <div className={styles.igWrap} ref={igContainerRef}>
            {showLoading && <div className={styles.igLoading}>Loading…</div>}
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{ margin: 0, width: '100%', minWidth: 0 }}
            />
          </div>
        )}

        {showFallback && (
          <div className={`${styles.iframeWrap} ${styles.iframeVertical}`}>
            <iframe src={getInstagramEmbedFallback(url)} allowFullScreen
              allow="autoplay; encrypted-media"
              title={credit ? `${credit} review` : 'Product review'} />
          </div>
        )}

        <div className={`${styles.footer} ${showOfficial ? styles.footerLight : ''}`}>
          {credit && <span className={styles.credit}>📹 Video by <strong>{credit}</strong></span>}
          <span className={styles.disclaimer}>Video credit belongs to original creator · Shared for review purposes</span>
        </div>
      </div>
    </div>
  )
}