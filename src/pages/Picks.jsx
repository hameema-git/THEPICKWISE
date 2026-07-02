import { useState, useMemo } from 'react'
import { products as defaultProducts } from '../data/products'
import ProductCard from '../components/ProductCard'
import VideoModal from '../components/VideoModal'
import styles from './Picks.module.css'

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

export default function Picks() {
  const picks = useMemo(() => getAllProducts().filter(p => p.is_pick), [])
  const [video, setVideo] = useState(null)

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <span className={styles.tag}>⭐ Editor's choice</span>
          <h1 className={styles.title}>My Personal Favourites</h1>
          <p className={styles.sub}>Products I genuinely love and use every single day — highest quality, absolute best value.</p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.count}>{picks.length} favourite products</p>
          <div className={styles.grid}>
            {picks.map(p => <ProductCard key={p.id} product={p} onVideoOpen={(u,c) => setVideo({url:u,credit:c})} />)}
          </div>
        </div>
      </section>
      {video && <VideoModal url={video.url} credit={video.credit} onClose={() => setVideo(null)} />}
    </>
  )
}
