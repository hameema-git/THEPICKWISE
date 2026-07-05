import { useState } from 'react'
import { Link } from 'react-router-dom'
import StudioLayout from '../../components/studio/StudioLayout'
import { useStudioProducts } from '../../hooks/useStudioProducts'
import { useCategories } from '../../hooks/useCategories'
import * as productsService from '../../services/productsService'
import styles from './Products.module.css'

export default function Products() {
  const {
    products, loading, loadingMore, refresh, categoryId, setCategoryId,
    search, setSearch, published, setPublished, hasMore, loadMore, total,
  } = useStudioProducts()
  const { categories } = useCategories()
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleTogglePublish = async (p) => {
    await productsService.togglePublished(p.id, !p.is_published)
    refresh()
  }

  const handleDuplicate = async (p) => {
    await productsService.duplicate(p)
    refresh()
  }

  const handleDelete = async (id) => {
    await productsService.remove(id)
    setConfirmDelete(null)
    refresh()
  }

  return (
    <StudioLayout title="Products">
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/studio/products/new" className={styles.addBtn}>+ Add</Link>
      </div>

      <div className={styles.filterRow}>
        <button
          className={`${styles.pill} ${categoryId === 'all' ? styles.pillActive : ''}`}
          onClick={() => setCategoryId('all')}
        >
          🌟 All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.pill} ${categoryId === c.id ? styles.pillActive : ''}`}
            onClick={() => setCategoryId(c.id)}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className={styles.publishFilterRow}>
        {[['all', 'All'], ['published', 'Published'], ['draft', 'Draft']].map(([v, label]) => (
          <button
            key={v}
            className={`${styles.miniTab} ${published === v ? styles.miniTabActive : ''}`}
            onClick={() => setPublished(v)}
          >
            {label}
          </button>
        ))}
      </div>

      {!loading && (
        <p className={styles.countLine}>{total} product{total === 1 ? '' : 's'}</p>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <p className={styles.empty}>No products match. Try a different filter, or add your first product.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {products.map((p) => (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardImgWrap}>
                  {p.image_url && <img src={p.image_url} alt={p.name} onError={(e) => (e.target.style.visibility = 'hidden')} />}
                  {!p.is_published && <span className={styles.draftBadge}>Draft</span>}
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardName}>{p.name}</span>
                  <div className={styles.cardMeta}>
                    <span className={styles.catChip}>{p.categories?.emoji} {p.categories?.name || 'Uncategorized'}</span>
                    <span className={styles.shopChip}>{p.shop}</span>
                  </div>
                  <span className={styles.price}>{p.price}</span>
                </div>
                <div className={styles.actions}>
                  <Link to={`/studio/products/${p.id}/edit`} className={styles.actionBtn}>✏️ Edit</Link>
                  <button className={styles.actionBtn} onClick={() => handleDuplicate(p)}>📄 Duplicate</button>
                  <button className={styles.actionBtn} onClick={() => handleTogglePublish(p)}>
                    {p.is_published ? '👁️ Unpublish' : '✅ Publish'}
                  </button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => setConfirmDelete(p)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : `Load more (${total - products.length} remaining)`}
            </button>
          )}
        </>
      )}

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p>Delete <strong>{confirmDelete.name}</strong>? This can't be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </StudioLayout>
  )
}
