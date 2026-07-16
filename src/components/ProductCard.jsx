import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SHOP_COLORS } from '../constants/shopColors'
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

function getEmbed(url) {
  if (!url) return ''
  if (url.includes('/embed/')) return url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1'
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url
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

  const handleBuyClick = () => {
    // Fire-and-forget — don't block the redirect on the click log.
    analyticsService.logClick(product.id).catch(() => {})
  }

  return (
    <article className={styles.card}>
      <div className={styles.imgWrap}>
        {imgErr || !product.image_url
          ? <div className={styles.imgFallback}>📦</div>
          : <img src={product.image_url} alt={product.name} loading="lazy" onError={() => setImgErr(true)} />
        }
        <div className={styles.badges}>
          {(product.badges || []).slice(0,2).map(b => BADGE_MAP[b] && (
            <span key={b} className={`${styles.badge} ${styles[BADGE_MAP[b].cls]}`}>{BADGE_MAP[b].label}</span>
          ))}
        </div>
        {product.video_link && (
          <button className={styles.videoBtn}
            onClick={() => onVideoOpen(getEmbed(product.video_link), product.video_credit)}
            aria-label="Watch video review">
            ▶ Watch Review
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.cat} style={{ background: cat.background, color: cat.color }}>
            {product.categories?.emoji} {product.categories?.name || 'Uncategorized'}
          </span>
          <span className={styles.shop} style={{ background: shop.bg, color: shop.text }}>{product.shop}</span>
        </div>

        <Link to={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>

        <p className={styles.review}>{product.review}</p>

        <div className={styles.metaRow}>
          <Stars rating={product.rating} />
          <span className={styles.reviewCount}>({(product.reviews_count || 0).toLocaleString()})</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.priceNow}>{product.price}</span>
          <span className={styles.priceWas}>{product.original_price}</span>
          <span className={styles.priceSave}>{product.savings}</span>
        </div>

        {/* Like / Dislike */}
        <div className={styles.voteRow}>
          <button
            className={`${styles.voteBtn} ${userVote === 'like' ? styles.votedLike : ''}`}
            onClick={() => vote('like')} aria-label="Helpful">
            👍 {likes > 0 ? likes : ''} Helpful
          </button>
          <button
            className={`${styles.voteBtn} ${userVote === 'dislike' ? styles.votedDislike : ''}`}
            onClick={() => vote('dislike')} aria-label="Not helpful">
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