import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products as defaultProducts, SHOP_COLORS } from '../data/products'
import VideoModal from '../components/VideoModal'
import ProductCard from '../components/ProductCard'
import styles from './ProductDetail.module.css'

const STORAGE_KEY   = 'pickwise_extra_products'
const OVERRIDES_KEY = 'pickwise_overrides'

function getAllProducts() {
  try {
    const overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}
    const extra     = JSON.parse(localStorage.getItem(STORAGE_KEY))   || []
    const base = defaultProducts.map(p =>
      overrides[p.id] ? { ...p, ...overrides[p.id] } : p
    )
    return [...base, ...extra]
  } catch { return [...defaultProducts] }
}

function getEmbed(url) {
  if (!url) return ''
  if (url.includes('/embed/')) return url.includes('?') ? url+'&autoplay=1' : url+'?autoplay=1'
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url
}

const BADGE_MAP = { deal:'🔥 Hot Deal', new:'✨ New Pick', fav:'❤️ My Favourite' }

function useLikes(id) {
  const key = `pw_likes_${id}`
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) || { likes:0, dislikes:0, vote:null } } catch { return { likes:0, dislikes:0, vote:null } } })
  const vote = (type) => {
    setData(prev => {
      let next = { ...prev }
      if (prev.vote === type) { next[type+'s']--; next.vote = null }
      else { if (prev.vote) next[prev.vote+'s']--; next[type+'s']++; next.vote = type }
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }
  return { ...data, vote }
}

export default function ProductDetail() {
  const { id } = useParams()
  const allProducts = useMemo(() => getAllProducts(), [])
  const product = allProducts.find(p => p.id === Number(id))
  const [video, setVideo] = useState(null)
  const { likes, dislikes, vote: userVote, vote } = useLikes(product?.id)

  if (!product) return (
    <div className={styles.notFound}>
      <div>😕</div>
      <h2>Product not found</h2>
      <Link to="/" className={styles.backBtn}>← Back to products</Link>
    </div>
  )

  const shop    = SHOP_COLORS[product.shop] || { bg:'#64748b', text:'#fff' }
  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0,4)

  return (
    <>
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/">Home</Link> <span>/</span>
          <span>{product.category}</span> <span>/</span>
          <span className={styles.currentPage}>{product.name}</span>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.detail}>
          {/* Image */}
          <div className={styles.imageWrap}>
            <img src={product.image} alt={product.name} />
            <div className={styles.badges}>
              {product.badges.map(b => BADGE_MAP[b] && <span key={b} className={`${styles.badge} ${styles[b]}`}>{BADGE_MAP[b]}</span>)}
            </div>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.topRow}>
              <span className={styles.cat}>{product.category}</span>
              <span className={styles.shop} style={{ background:shop.bg, color:shop.text }}>{product.shop}</span>
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i<=Math.floor(product.rating)?'#f4a261':i-0.5<=product.rating?'#f4a261':'#cbd5e1', opacity:i-0.5<=product.rating&&i>Math.floor(product.rating)?0.5:1, fontSize:'1.1rem' }}>★</span>
              ))}
              <span className={styles.ratingNum}>{product.rating}</span>
              <span className={styles.reviewsNum}>({product.reviews_count.toLocaleString()} reviews)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.priceNow}>{product.price}</span>
              <span className={styles.priceWas}>{product.original_price}</span>
              <span className={styles.priceSave}>{product.savings}</span>
            </div>

            <div className={styles.reviewBlock}>
              <div className={styles.reviewLabel}>✍️ My honest review</div>
              <p className={styles.reviewText}>{product.review}</p>
            </div>

            {/* Community votes */}
            <div className={styles.voteSection}>
              <div className={styles.voteLabel}>Was this product helpful to other buyers?</div>
              <div className={styles.voteRow}>
                <button className={`${styles.voteBtn} ${userVote==='like'?styles.votedLike:''}`} onClick={()=>vote('like')}>
                  👍 Helpful {likes > 0 && <span className={styles.voteCount}>{likes}</span>}
                </button>
                <button className={`${styles.voteBtn} ${userVote==='dislike'?styles.votedDislike:''}`} onClick={()=>vote('dislike')}>
                  👎 Not helpful {dislikes > 0 && <span className={styles.voteCount}>{dislikes}</span>}
                </button>
              </div>
            </div>

            <div className={styles.ctas}>
              <a href={product.affiliate_link} target="_blank" rel="nofollow noopener noreferrer"
                className={styles.btnBuy} style={{ background:shop.bg }}>
                Buy on {product.shop} →
              </a>
              {product.video_link && (
                <button className={styles.btnVideo} onClick={() => setVideo({ url:getEmbed(product.video_link), credit:product.video_credit })}>
                  ▶ Watch Video Review
                </button>
              )}
            </div>

            {product.video_credit && <p className={styles.credit}>📹 Video by <strong>{product.video_credit}</strong> (YouTube)</p>}

            <div className={styles.disclosureNote}>
              <strong>Note:</strong> This is an affiliate link. I earn a small commission if you buy — at no extra cost to you. I only recommend products I genuinely use.
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>More in {product.category}</h2>
            <div className={styles.relatedGrid}>
              {related.map(p => <ProductCard key={p.id} product={p} onVideoOpen={(u,c) => setVideo({url:getEmbed(u),credit:c})} />)}
            </div>
          </section>
        )}
      </div>

      {video && <VideoModal url={video.url} credit={video.credit} onClose={() => setVideo(null)} />}
    </>
  )
}
