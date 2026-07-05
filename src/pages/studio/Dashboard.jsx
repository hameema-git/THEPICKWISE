import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import StudioLayout from '../../components/studio/StudioLayout'
import * as productsService from '../../services/productsService'
import * as analyticsService from '../../services/analyticsService'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [latest, setLatest] = useState([])
  const [clicks, setClicks] = useState(0)
  const [topClicked, setTopClicked] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [statsData, latestData, clickCount, topClickedData, topCategoriesData] = await Promise.all([
      productsService.getStats(),
      productsService.getLatest(5),
      analyticsService.getTotalClicks(),
      analyticsService.getMostClickedProducts(5),
      analyticsService.getTopCategories(5),
    ])
    setStats(statsData)
    setLatest(latestData)
    setClicks(clickCount)
    setTopClicked(topClickedData)
    setTopCategories(topCategoriesData)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <StudioLayout title="Dashboard"><p>Loading…</p></StudioLayout>

  return (
    <StudioLayout title="Dashboard">
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total Products</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.featured}</span>
          <span className={styles.statLabel}>Featured Products</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{clicks}</span>
          <span className={styles.statLabel}>Affiliate Clicks</span>
        </div>
        <div className={`${styles.statCard} ${stats.priceStale > 0 ? styles.warnCard : ''}`}>
          <span className={styles.statNum}>{stats.priceStale}</span>
          <span className={styles.statLabel}>Need Price Update</span>
        </div>
      </div>

      <Link to="/studio/products/new" className={styles.addBtn}>+ Add Product</Link>

      <h2 className={styles.sectionTitle}>Latest Products</h2>
      {latest.length === 0 ? (
        <p className={styles.empty}>No products yet — add your first one above.</p>
      ) : (
        <div className={styles.latestList}>
          {latest.map((p) => (
            <Link key={p.id} to={`/studio/products/${p.id}/edit`} className={styles.latestRow}>
              {p.image_url && <img src={p.image_url} alt="" className={styles.thumb} onError={(e) => (e.target.style.visibility = 'hidden')} />}
              <div className={styles.latestInfo}>
                <span className={styles.latestName}>{p.name}</span>
                <span className={styles.latestMeta}>
                  {p.categories?.emoji} {p.categories?.name || 'Uncategorized'} · {p.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {topClicked.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Most Clicked Products</h2>
          <div className={styles.latestList}>
            {topClicked.map((p) => (
              <div key={p.id} className={styles.latestRow}>
                {p.image_url && <img src={p.image_url} alt="" className={styles.thumb} onError={(e) => (e.target.style.visibility = 'hidden')} />}
                <div className={styles.latestInfo}>
                  <span className={styles.latestName}>{p.name}</span>
                  <span className={styles.latestMeta}>{p.clicks} click{p.clicks === 1 ? '' : 's'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {topCategories.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Top Categories</h2>
          <div className={styles.catChipRow}>
            {topCategories.map((c) => (
              <span key={c.name} className={styles.catStatChip}>
                {c.emoji} {c.name} <strong>{c.count}</strong>
              </span>
            ))}
          </div>
        </>
      )}
    </StudioLayout>
  )
}
