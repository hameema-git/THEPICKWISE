import { useState, useEffect } from 'react'
import * as publicProductsService from '../services/publicProductsService'
import ProductCard from '../components/ProductCard'
import VideoModal from '../components/VideoModal'
import Seo from '../components/Seo'
import styles from './Picks.module.css'

export default function Picks() {
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(true)
  const [video, setVideo] = useState(null)

  useEffect(() => {
    publicProductsService.getPicks()
      .then(setPicks)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Seo
        title="My Personal Favourites"
        description="Products I genuinely love and use every day — the highest quality, best-value picks."
        path="/picks"
      />
      <section className={styles.hero}>
        <div className={styles.inner}>
          <span className={styles.tag}>⭐ Editor's choice</span>
          <h1 className={styles.title}>My Personal Favourites</h1>
          <p className={styles.sub}>Products I genuinely love and use every single day — highest quality, absolute best value.</p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.count}>{loading ? 'Loading…' : `${picks.length} favourite products`}</p>
          <div className={styles.grid}>
            {picks.map(p => <ProductCard key={p.id} product={p} onVideoOpen={(u,c,plat) => setVideo({url:u,credit:c,platform:plat})} />)}
          </div>
        </div>
      </section>
      {video && <VideoModal url={video.url} credit={video.credit} platform={video.platform} onClose={() => setVideo(null)} />}
    </>
  )
}
