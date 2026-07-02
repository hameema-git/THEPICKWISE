import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SHOP_COLORS } from '../data/products'
import styles from './ProductCard.module.css'

const CAT_STYLE = {
  kitchen:{ bg:'#fff8f0', color:'#c05621' }, tech:{ bg:'#eff6ff', color:'#1d4ed8' },
  home:   { bg:'#f0fdf4', color:'#15803d' }, beauty:{ bg:'#fdf4ff', color:'#9333ea' },
  kids:   { bg:'#fff7ed', color:'#d97706' }, fitness:{ bg:'#f0fdfa', color:'#0f766e' },
}
const BADGE_MAP = {
  deal:{ label:'🔥 Deal', cls:'deal' }, new:{ label:'✨ New', cls:'new' }, fav:{ label:'❤️ Fav', cls:'fav' }
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
  const cat  = CAT_STYLE[product.category]  || { bg:'#f1f5f9', color:'#475569' }
  const shop = SHOP_COLORS[product.shop]    || { bg:'#64748b', text:'#fff' }

  return (
    <article className={styles.card}>
      <div className={styles.imgWrap}>
        {imgErr
          ? <div className={styles.imgFallback}>📦</div>
          : <img src={product.image} alt={product.name} loading="lazy" onError={() => setImgErr(true)} />
        }
        <div className={styles.badges}>
          {product.badges.slice(0,2).map(b => BADGE_MAP[b] && (
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
          <span className={styles.cat} style={{ background: cat.bg, color: cat.color }}>{product.category}</span>
          <span className={styles.shop} style={{ background: shop.bg, color: shop.text }}>{product.shop}</span>
        </div>

        <Link to={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>

        <p className={styles.review}>{product.review}</p>

        <div className={styles.metaRow}>
          <Stars rating={product.rating} />
          <span className={styles.reviewCount}>({product.reviews_count.toLocaleString()})</span>
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
          className={styles.btnBuy} style={{ background: shop.bg }}>
          Buy on {product.shop} →
        </a>

        {product.video_credit && (
          <p className={styles.credit}>📹 via {product.video_credit}</p>
        )}
      </div>
    </article>
  )
}
