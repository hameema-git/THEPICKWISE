import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SHOP_COLORS } from '../constants/shopColors'
import { getProductVideos } from '../utils/videoEmbed'
import { formatPrice } from '../utils/formatPrice'
import * as publicProductsService from '../services/publicProductsService'
import * as analyticsService from '../services/analyticsService'
import VideoModal from '../components/VideoModal'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'
import styles from './ProductDetail.module.css'

const BADGE_MAP = { deal:'🔥 Hot Deal', new:'✨ New Pick', fav:'❤️ My Favourite' }

function useLikes(id) {
  const key = `pw_likes_${id}`
  const [data, setData] = useState(() => { 
    try { 
      return JSON.parse(localStorage.getItem(key)) || { likes:0, dislikes:0, vote:null } 
    } catch { 
      return { likes:0, dislikes:0, vote:null } 
    } 
  })

  const vote = (type) => {
    setData(prev => {
      let next = { ...prev }
      if (prev.vote === type) { 
        next[type+'s']--
        next.vote = null 
      } else { 
        if (prev.vote) next[prev.vote+'s']--
        next[type+'s']++
        next.vote = type 
      }
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
  const [activeImage, setActiveImage] = useState(0)
  const { likes, dislikes, vote: userVote, vote } = useLikes(id)

  useEffect(() => {
    setLoading(true)
    setActiveImage(0)
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
  const videos = getProductVideos(product)
  const images = product.image_urls?.length ? product.image_urls : (product.image_url ? [product.image_url] : [])

  const handleBuyClick = () => {
    analyticsService.logClick(product.id).catch(() => {})
  }

  return (
    <>
      <Seo
        title={product.seo_title || product.name}
        description={product.seo_description || (product.review_summary || product.review)?.slice(0, 155)}
        keywords={product.seo_keywords}
        path={`/product/${product.id}`}
        image={product.image_url}
        product={product}
        rawTitle={Boolean(product.seo_title)}
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
          
          {/* LEFT COLUMN: Main image & thumbnail strip grouped together */}
          <div className={styles.mediaColumn}>
            <div className={styles.imageWrap}>
              <img src={images[activeImage] || product.image_url} alt={product.name} />
              <div className={styles.badges}>
                {(product.badges || []).map(b => BADGE_MAP[b] && <span key={b} className={`${styles.badge} ${styles[b]}`}>{BADGE_MAP[b]}</span>)}
              </div>
              {images.length > 1 && (
                <>
                  <button className={styles.galleryArrow + ' ' + styles.galleryArrowLeft}
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous photo">‹</button>
                  <button className={styles.galleryArrow + ' ' + styles.galleryArrowRight}
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    aria-label="Next photo">›</button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbRow}>
                {images.map((url, i) => (
                  <button key={url} className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(i)} aria-label={`View photo ${i + 1}`}>
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Information & Action buttons */}
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
              <span className={styles.priceNow}>{formatPrice(product.price)}</span>
              {product.original_price && <span className={styles.priceWas}>{formatPrice(product.original_price)}</span>}
              {product.savings && <span className={styles.priceSave}>{product.savings}</span>}
            </div>

            {product.review_summary && (
              <p className={styles.reviewSummary}>{product.review_summary}</p>
            )}

            {product.review && (
              <div className={styles.reviewBlock}>
                <div className={styles.reviewLabel}>✍️ My Experience</div>
                <p className={styles.reviewText}>{product.review}</p>
              </div>
            )}

            {(product.review_pros?.length > 0 || product.review_cons?.length > 0) && (
              <div className={styles.prosConsGrid}>
                {product.review_pros?.length > 0 && (
                  <div className={styles.prosBlock}>
                    <div className={styles.prosConsLabel}>Pros</div>
                    <ul>{product.review_pros.map((p, i) => <li key={i}>✓ {p}</li>)}</ul>
                  </div>
                )}
                {product.review_cons?.length > 0 && (
                  <div className={styles.consBlock}>
                    <div className={styles.prosConsLabel}>Cons</div>
                    <ul>{product.review_cons.map((c, i) => <li key={i}>✕ {c}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {product.review_verdict && (
              <div className={styles.verdictBlock}>
                <span className={styles.verdictLabel}>Final Verdict</span>
                <p>{product.review_verdict}</p>
              </div>
            )}

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

            {product.status === 'discontinued' ? (
              <div className={styles.discontinuedNotice}>
                <p className={styles.discontinuedTitle}>⚠️ This product has been discontinued</p>
                {product.replacement ? (
                  <a href={`/product/${product.replacement.id}`} className={styles.replacementLink}>
                    See {product.replacement.name} instead →
                  </a>
                ) : (
                  <p className={styles.discontinuedSub}>Check back later, or browse similar products below.</p>
                )}
              </div>
            ) : (
              <>
                {product.status === 'out_of_stock' && (
                  <p className={styles.outOfStockNotice}>⚠️ Currently out of stock at {product.shop} — link still works if it's back.</p>
                )}
                <div className={styles.ctas}>
                  <a href={product.affiliate_link} target="_blank" rel="nofollow noopener noreferrer"
                    className={styles.btnBuy} style={{ background:shop.bg }} onClick={handleBuyClick}>
                    Buy on {product.shop} →
                  </a>
                  {videos.map((v) => (
                    <button
                      key={v.platform}
                      className={styles.btnVideo}
                      onClick={() =>
                        setVideo({
                          url: v.embedUrl,
                          credit: product.video_credit,
                          platform: v.platform,
                        })
                      }
                    >
                      ▶ Watch on{" "}
                  {v.platform === "instagram"
                    ? "Instagram"
                    : v.platform === "youtube"
                    ? "YouTube"
                    : "Video"}
                </button>
              ))}
            </div>
              </>
            )}

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