import { useState, useEffect } from 'react'
import { SHOP_COLORS } from '../constants/shopColors'
import { formatPrice } from '../utils/formatPrice'
import styles from './QuickViewModal.module.css'

const BADGE_MAP = { deal: '🔥 Deal', new: '✨ New', fav: '❤️ Favourite' }

function Stars({ rating }) {
  if (!rating) return null
  return (
    <span className={styles.stars} aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{
          color: i <= Math.floor(rating) ? '#f4a261' : i - 0.5 <= rating ? '#f4a261' : '#e2e8f0',
          opacity: i - 0.5 <= rating && i > Math.floor(rating) ? 0.5 : 1,
        }}>★</span>
      ))}
    </span>
  )
}

export default function QuickViewModal({ product, videos = [], onWatchVideo, onBuyClick, onClose }) {
  const images = product.image_urls?.length ? product.image_urls : (product.image_url ? [product.image_url] : [])
  const [index, setIndex] = useState(0)
  const shop = SHOP_COLORS[product.shop] || { bg: '#64748b', text: '#fff' }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const next = () => setIndex((i) => (i + 1) % images.length)
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.scrollArea}>
          <div className={styles.gallery}>
            {images.length > 0 ? (
              <img src={images[index]} alt={product.name} className={styles.galleryImg} />
            ) : (
              <div className={styles.galleryFallback}>📦</div>
            )}

            {product.badges?.length > 0 && (
              <div className={styles.badgeRow}>
                {product.badges.slice(0, 2).map((b) => BADGE_MAP[b] && (
                  <span key={b} className={styles.badge}>{BADGE_MAP[b]}</span>
                ))}
              </div>
            )}

            {images.length > 1 && (
              <>
                <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous photo">‹</button>
                <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next photo">›</button>
                <div className={styles.dots}>
                  {images.map((_, i) => (
                    <button key={i} className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                      onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.topRow}>
              {product.categories?.name && (
                <span className={styles.catChip}>{product.categories.emoji} {product.categories.name}</span>
              )}
              <span className={styles.shopChip} style={{ background: shop.bg, color: shop.text }}>{product.shop}</span>
            </div>

            <h3 className={styles.name}>{product.name}</h3>

            {product.rating > 0 && (
              <div className={styles.ratingRow}>
                <Stars rating={product.rating} />
                <span className={styles.ratingNum}>{product.rating}</span>
                {product.reviews_count > 0 && (
                  <span className={styles.reviewsCount}>({product.reviews_count.toLocaleString('en-IN')} reviews)</span>
                )}
              </div>
            )}

            <div className={styles.priceRow}>
              <span className={styles.priceNow}>{formatPrice(product.price)}</span>
              {product.original_price && <span className={styles.priceWas}>{formatPrice(product.original_price)}</span>}
              {product.savings && <span className={styles.priceSave}>{product.savings}</span>}
            </div>

            {product.review && (
              <div className={styles.reviewBlock}>
                <div className={styles.reviewLabel}>My honest take</div>
                <p className={styles.reviewText}>{product.review}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionBar}>
          {videos.length > 0 && (
            <div className={`${styles.videoRow} ${videos.length === 1 ? styles.videoRowSingle : ''}`}>
              {videos.map((v) => (
                <button key={v.platform} className={styles.btnVideo} onClick={() => onWatchVideo(v)}>
                  ▶ {v.platform === 'instagram' ? 'Instagram' : v.platform === 'youtube' ? 'YouTube' : 'Video'}
                </button>
              ))}
            </div>
          )}
          <a href={product.affiliate_link} target="_blank" rel="nofollow noopener noreferrer"
            className={styles.btnBuy} style={{ background: shop.bg }} onClick={onBuyClick}>
            Buy on {product.shop} →
          </a>
        </div>
      </div>
    </div>
  )
}
