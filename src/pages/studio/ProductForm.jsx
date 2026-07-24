import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudioLayout from '../../components/studio/StudioLayout'
import PhotoUploader from '../../components/studio/PhotoUploader'
import { useCategories } from '../../hooks/useCategories'
import * as productsService from '../../services/productsService'
import * as categoriesService from '../../services/categoriesService'
import styles from './ProductForm.module.css'

const EMPTY = {
  name: '', category_id: '', price: '', original_price: '', savings: '',
  shop: 'Meesho', rating: 4.5, reviews_count: 100, affiliate_link: '',
  image_url: '', image_urls: [], review: '', video_link: '', video_link_youtube: '', video_link_instagram: '', video_credit: '',
  badges: [], is_pick: false, is_published: true, status: 'active', replacement_product_id: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { categories, refresh: refreshCategories } = useCategories()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [otherProducts, setOtherProducts] = useState([])

  useEffect(() => {
    productsService.getAll({ published: 'published' }).then((res) => {
      setOtherProducts(res.data.filter((p) => p.id !== id))
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!isEdit) return
    productsService.getById(id).then((p) => {
      setForm({
        name: p.name || '', category_id: p.category_id || '', price: p.price || '',
        original_price: p.original_price || '', savings: p.savings || '', shop: p.shop || 'Meesho',
        rating: p.rating || 4.5, reviews_count: p.reviews_count || 0, affiliate_link: p.affiliate_link || '',
        image_url: p.image_url || '', image_urls: p.image_urls?.length ? p.image_urls : (p.image_url ? [p.image_url] : []),
        review: p.review || '', video_link: p.video_link || '',
        video_link_youtube: p.video_link_youtube || '', video_link_instagram: p.video_link_instagram || '',
        video_credit: p.video_credit || '', badges: p.badges || [], is_pick: p.is_pick || false,
        is_published: p.is_published ?? true, status: p.status || 'active',
        replacement_product_id: p.replacement_product_id || '',
      })
      setLoading(false)
    })
  }, [id, isEdit])

  const handlePhotosChange = (urls) => {
    setForm((f) => ({ ...f, image_urls: urls, image_url: urls[0] || '' }))
  }

  const toggleBadge = (badge) => {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(badge) ? f.badges.filter((b) => b !== badge) : [...f.badges, badge],
    }))
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const cat = await categoriesService.create({ name: newCategoryName.trim() })
    await refreshCategories()
    setForm((f) => ({ ...f, category_id: cat.id }))
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.price || !form.affiliate_link) {
      setError('Name, Price, and Affiliate Link are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        replacement_product_id: form.status === 'discontinued' && form.replacement_product_id ? form.replacement_product_id : null,
      }
      if (isEdit) {
        await productsService.update(id, payload)
      } else {
        await productsService.create(payload)
      }
      navigate('/studio/products')
    } catch (err) {
      setError(err.message || 'Something went wrong saving this product.')
      setSaving(false)
    }
  }

  if (loading) return <StudioLayout title="Edit Product"><p>Loading…</p></StudioLayout>

  return (
    <StudioLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.field}>
          <span>Product Name *</span>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </label>

        <label className={styles.field}>
          <span>Category</span>
          <div className={styles.categoryRow}>
            <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
            <button type="button" className={styles.newCatBtn} onClick={() => setShowNewCategory((s) => !s)}>
              + New
            </button>
          </div>
          {showNewCategory && (
            <div className={styles.newCatRow}>
              <input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button type="button" className={styles.newCatConfirm} onClick={handleCreateCategory}>Create</button>
            </div>
          )}
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Price *</span>
            <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="₹999" required />
          </label>
          <label className={styles.field}>
            <span>Original Price</span>
            <input value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))} placeholder="₹1,999" />
          </label>
        </div>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Savings</span>
            <input value={form.savings} onChange={(e) => setForm((f) => ({ ...f, savings: e.target.value }))} placeholder="50% off" />
          </label>
          <label className={styles.field}>
            <span>Shop *</span>
            <select value={form.shop} onChange={(e) => setForm((f) => ({ ...f, shop: e.target.value }))}>
              <option>Amazon</option>
              <option>Meesho</option>
              <option>Flipkart</option>
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span>Affiliate Link *</span>
          <input
            type="url"
            value={form.affiliate_link}
            onChange={(e) => setForm((f) => ({ ...f, affiliate_link: e.target.value }))}
            placeholder="Paste your Amazon/Meesho/Flipkart affiliate link"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Product Photos *</span>
          <PhotoUploader images={form.image_urls} onChange={handlePhotosChange} />
        </label>

        <label className={styles.field}>
          <span>Your Review</span>
          <textarea rows={3} value={form.review} onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))} />
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>YouTube Video Link</span>
            <input type="url" value={form.video_link_youtube} onChange={(e) => setForm((f) => ({ ...f, video_link_youtube: e.target.value }))} placeholder="youtube.com/watch?v=... (optional)" />
          </label>
          <label className={styles.field}>
            <span>Instagram Reel Link</span>
            <input type="url" value={form.video_link_instagram} onChange={(e) => setForm((f) => ({ ...f, video_link_instagram: e.target.value }))} placeholder="instagram.com/reel/... (optional)" />
          </label>
        </div>
        <small className={styles.hint}>Add either one, or both — visitors will see a button for each video you add.</small>

        <label className={styles.field}>
          <span>Video Credit</span>
          <input value={form.video_credit} onChange={(e) => setForm((f) => ({ ...f, video_credit: e.target.value }))} placeholder="Channel name" />
        </label>

        <div className={styles.field}>
          <span>Badges</span>
          <div className={styles.badgeRow}>
            {['deal', 'new', 'fav'].map((b) => (
              <button
                type="button"
                key={b}
                className={`${styles.badgeToggle} ${form.badges.includes(b) ? styles.badgeOn : ''}`}
                onClick={() => toggleBadge(b)}
              >
                {b === 'deal' ? '🔥 Deal' : b === 'new' ? '✨ New' : '❤️ Fav'}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.field}>
          <span>Status</span>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">✅ Active</option>
            <option value="out_of_stock">⚠️ Out of Stock</option>
            <option value="discontinued">🚫 Discontinued</option>
          </select>
        </label>

        {form.status === 'discontinued' && (
          <label className={styles.field}>
            <span>Replacement Product (optional)</span>
            <select value={form.replacement_product_id} onChange={(e) => setForm((f) => ({ ...f, replacement_product_id: e.target.value }))}>
              <option value="">No replacement — just show a discontinued notice</option>
              {otherProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <small className={styles.hint}>Visitors on this product's page will be pointed to the replacement instead of a broken buy link.</small>
          </label>
        )}

        <div className={styles.toggleGrid}>
          <label className={styles.switchRow}>
            <input type="checkbox" checked={form.is_pick} onChange={(e) => setForm((f) => ({ ...f, is_pick: e.target.checked }))} />
            <span>⭐ Show in Favourites</span>
          </label>
          <label className={styles.switchRow}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
            <span>✅ Published (visible on site)</span>
          </label>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
      </form>
    </StudioLayout>
  )
}
