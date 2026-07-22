import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SHOP_COLORS } from '../constants/shopColors'
import { getProductVideos } from '../utils/videoEmbed'
import { formatPrice } from '../utils/formatPrice'
import * as analyticsService from '../services/analyticsService'
import styles from './ProductCard.module.css'

const BADGE_MAP = {
  deal:{ label:'🔥 Deal', cls:'deal' }, new:{ label:'✨ New', cls:'new' }, fav:{ label:'❤️ Fav', cls:'fav' }
}

// Derives a soft chip background from the category's stored hex color,
// so new categories created in Studio automatically get a matching chip
// with no code change needed.
function categoryChipStyle(color) {
  const hex = color || '#64748b'
  return { background: `${hex}1A`, color: hex }
}

function Stars({ rating }) {
  return (
    <span className={styles.stars} aria-label={`${rating} stars`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.floor(rating) ? '#f4a261' : i - 0.5 <= rating ? '#f4a261' : '#cbd5e1', opacity: i - 0.5 <= rating && i > Math.floor(rating) ? 0.5 : 1 }}>★</span>
      ))}
      <span className={styles.ratingNum}>{rating}</span>
    </span>
  )
}

// Cycles through a product's photos automatically while the card is
// visible, only when there's more than one photo — a single photo just
// sits still as before, no behavior change for existing products.
function useAutoCarousel(images, intervalMs = 2800) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs)
    return () => clearInterval(timer)
  }, [images.length, intervalMs])
  return index
}

function useLikes(id) {
  const key = `pw_likes_${id}`
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || { likes: 0, dislikes: 0, vote: null } }
    catch { return { likes: 0, dislikes: 0, vote: null } }
  })
  const vote = (type) => {
    setData(prev => {
      let next = { ...prev }
      if (prev.vote === type) {
        next[type + 's']--; next.vote = null
      } else {
        if (prev.vote) next[prev.vote + 's']--
        next[type + 's']++; next.vote = type
      }
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }
  return { ...data, vote }
}

export default function ProductCard({ product, onVideoOpen }) {
  const [imgErr, setImgErr] = useState(false)
  const { likes, dislikes, vote: userVote, vote } = useLikes(product.id)
  const cat  = categoryChipStyle(product.categories?.color)
  const shop = SHOP_COLORS[product.shop] || { bg:'#64748b', text:'#fff' }
  const navigate = useNavigate()

  const images = product.image_urls?.length ? product.image_urls : (product.image_url ? [product.image_url] : [])
  const carouselIndex = useAutoCarousel(images)
  const displayImage = images[carouselIndex]
  const videos = getProductVideos(product)

  const handleBuyClick = (e) => {
    // Don't also trigger the card's own navigate-to-detail-page click.
    e.stopPropagation()
    // Fire-and-forget — don't block the redirect on the click log.
    analyticsService.logClick(product.id).catch(() => {})
  }

  const goToProduct = () => navigate(`/product/${product.id}`)

  return (
    <article className={styles.card} onClick={goToProduct} role="link" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && goToProduct()} aria-label={`View ${product.name}`}>
      <div className={styles.imgWrap}>
        {imgErr || !displayImage
          ? <div className={styles.imgFallback}>📦</div>
          : <img src={displayImage} alt={product.name} loading="lazy" onError={() => setImgErr(true)} />
        }
        {images.length > 1 && (
          <div className={styles.carouselDots}>
            {images.map((_, i) => (
              <span key={i} className={`${styles.carouselDot} ${i === carouselIndex ? styles.carouselDotActive : ''}`} />
            ))}
          </div>
        )}
        <div className={styles.badges}>
          {(product.badges || []).slice(0,2).map(b => BADGE_MAP[b] && (
            <span key={b} className={`${styles.badge} ${styles[BADGE_MAP[b].cls]}`}>{BADGE_MAP[b].label}</span>
          ))}
        </div>
        {videos.length > 0 && (
          <div className={styles.videoBtnRow}>
            {videos.map((v) => (
              <button key={v.platform} className={styles.videoBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onVideoOpen(v.embedUrl, product.video_credit, v.platform)
                }}
                aria-label={`Watch on ${v.platform === 'instagram' ? 'Instagram' : 'YouTube'}`}>
                ▶ {v.platform === 'instagram' ? 'Insta' : v.platform === 'youtube' ? 'YouTube' : 'Watch'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.cat} style={{ background: cat.background, color: cat.color }}>
            {product.categories?.emoji} {product.categories?.name || 'Uncategorized'}
          </span>
          <span className={styles.shop} style={{ background: shop.bg, color: shop.text }}>{product.shop}</span>
        </div>

        <h3 className={styles.title}>{product.name}</h3>

        <p className={styles.review}>{product.review}</p>

        <div className={styles.metaRow}>
          <Stars rating={product.rating} />
          <span className={styles.reviewCount}>({(product.reviews_count || 0).toLocaleString()})</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.priceNow}>{formatPrice(product.price)}</span>
          <span className={styles.priceWas}>{formatPrice(product.original_price)}</span>
          <span className={styles.priceSave}>{product.savings}</span>
        </div>

        {/* Like / Dislike */}
        <div className={styles.voteRow}>
          <button
            className={`${styles.voteBtn} ${userVote === 'like' ? styles.votedLike : ''}`}
            onClick={(e) => { e.stopPropagation(); vote('like') }} aria-label="Helpful">
            👍 {likes > 0 ? likes : ''} Helpful
          </button>
          <button
            className={`${styles.voteBtn} ${userVote === 'dislike' ? styles.votedDislike : ''}`}
            onClick={(e) => { e.stopPropagation(); vote('dislike') }} aria-label="Not helpful">
            👎 {dislikes > 0 ? dislikes : ''} Not helpful
          </button>
        </div>

        <a href={product.affiliate_link} target="_blank" rel="nofollow noopener noreferrer"
          className={styles.btnBuy} style={{ background: shop.bg }} onClick={handleBuyClick}>
          Buy on {product.shop} →
        </a>

        {product.video_credit && (
          <p className={styles.credit}>📹 via {product.video_credit}</p>
        )}
      </div>
    </article>
  )
}