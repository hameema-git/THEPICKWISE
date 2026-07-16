import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SHOP_COLORS } from '../constants/shopColors'
import { getEmbed, getEmbedPlatform } from '../utils/videoEmbed'
import * as publicProductsService from '../services/publicProductsService'
import * as analyticsService from '../services/analyticsService'
import VideoModal from '../components/VideoModal'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'
import styles from './ProductDetail.module.css'

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
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [video, setVideo] = useState(null)
  const { likes, dislikes, vote: userVote, vote } = useLikes(id)

  useEffect(() => {
    setLoading(true)
    publicProductsService.getById(id).then(async (p) => {
      setProduct(p)
      if (p?.category_id) {
        const relatedProducts = await publicProductsService.getRelated(p.category_id, p.id, 4)
        setRelated(relatedProducts)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className={styles.notFound}><p>Loading…</p></div>
  }

  if (!product) return (
    <div className={styles.notFound}>
      <div>😕</div>
      <h2>Product not found</h2>
      <Link to="/" className={styles.backBtn}>← Back to products</Link>
    </div>
  )

  const shop = SHOP_COLORS[product.shop] || { bg:'#64748b', text:'#fff' }
  const categoryName = product.categories?.name || 'Uncategorized'

  const handleBuyClick = () => {
    analyticsService.logClick(product.id).catch(() => {})
  }

  return (
    <>
      <Seo
        title={product.name}
        description={product.review?.slice(0, 155)}
        path={`/product/${product.id}`}
        image={product.image_url}
        product={product}
      />
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/">Home</Link> <span>/</span>
          <span>{categoryName}</span> <span>/</span>
          <span className={styles.currentPage}>{product.name}</span>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.detail}>
          {/* Image */}
          <div className={styles.imageWrap}>
            <img src={product.image_url} alt={product.name} />
            <div className={styles.badges}>
              {(product.badges || []).map(b => BADGE_MAP[b] && <span key={b} className={`${styles.badge} ${styles[b]}`}>{BADGE_MAP[b]}</span>)}
            </div>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.topRow}>
              <span className={styles.cat}>{product.categories?.emoji} {categoryName}</span>
              <span className={styles.shop} style={{ background:shop.bg, color:shop.text }}>{product.shop}</span>
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i<=Math.floor(product.rating)?'#f4a261':i-0.5<=product.rating?'#f4a261':'#cbd5e1', opacity:i-0.5<=product.rating&&i>Math.floor(product.rating)?0.5:1, fontSize:'1.1rem' }}>★</span>
              ))}
              <span className={styles.ratingNum}>{product.rating}</span>
              <span className={styles.reviewsNum}>({(product.reviews_count || 0).toLocaleString()} reviews)</span>
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
                className={styles.btnBuy} style={{ background:shop.bg }} onClick={handleBuyClick}>
                Buy on {product.shop} →
              </a>
              {product.video_link && (
                <button className={styles.btnVideo} onClick={() => setVideo({ url:getEmbed(product.video_link), credit:product.video_credit, platform:getEmbedPlatform(product.video_link) })}>
                  ▶ Watch Video Review
                </button>
              )}
            </div>

            {product.video_credit && <p className={styles.credit}>📹 Video by <strong>{product.video_credit}</strong></p>}

            <div className={styles.disclosureNote}>
              <strong>Note:</strong> This is an affiliate link. I earn a small commission if you buy — at no extra cost to you. I only recommend products I genuinely use.
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>More in {categoryName}</h2>
            <div className={styles.relatedGrid}>
              {related.map(p => <ProductCard key={p.id} product={p} onVideoOpen={(u,c,plat) => setVideo({url:u,credit:c,platform:plat})} />)}
            </div>
          </section>
        )}
      </div>

      {video && <VideoModal url={video.url} credit={video.credit} platform={video.platform} onClose={() => setVideo(null)} />}
    </>
  )
}