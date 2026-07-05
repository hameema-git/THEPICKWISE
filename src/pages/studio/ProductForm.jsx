import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudioLayout from '../../components/studio/StudioLayout'
import { useCategories } from '../../hooks/useCategories'
import * as productsService from '../../services/productsService'
import * as categoriesService from '../../services/categoriesService'
import styles from './ProductForm.module.css'

const EMPTY = {
  name: '', category_id: '', price: '', original_price: '', savings: '',
  shop: 'Meesho', rating: 4.5, reviews_count: 100, affiliate_link: '',
  image_url: '', review: '', video_link: '', video_credit: '',
  badges: [], is_pick: false, is_published: true,
}

// Best-effort platform detection from a pasted URL — prefills the shop field
// so there's one less manual dropdown click. Not a scraper; see Phase 2 notes
// on why live auto-fill of name/image/price isn't reliable long-term.
function detectShop(url) {
  if (/amazon\./i.test(url)) return 'Amazon'
  if (/meesho\./i.test(url)) return 'Meesho'
  if (/flipkart\./i.test(url)) return 'Flipkart'
  return null
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
  const [linkPaste, setLinkPaste] = useState('')

  useEffect(() => {
    if (!isEdit) return
    productsService.getById(id).then((p) => {
      setForm({
        name: p.name || '', category_id: p.category_id || '', price: p.price || '',
        original_price: p.original_price || '', savings: p.savings || '', shop: p.shop || 'Meesho',
        rating: p.rating || 4.5, reviews_count: p.reviews_count || 0, affiliate_link: p.affiliate_link || '',
        image_url: p.image_url || '', review: p.review || '', video_link: p.video_link || '',
        video_credit: p.video_credit || '', badges: p.badges || [], is_pick: p.is_pick || false,
        is_published: p.is_published ?? true,
      })
      setLoading(false)
    })
  }, [id, isEdit])

  const handleLinkPaste = (value) => {
    setLinkPaste(value)
    const shop = detectShop(value)
    setForm((f) => ({
      ...f,
      affiliate_link: value,
      shop: shop || f.shop,
    }))
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
      const payload = { ...form, category_id: form.category_id || null }
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
          <span>Paste Product Link</span>
          <input
            type="url"
            value={linkPaste}
            onChange={(e) => handleLinkPaste(e.target.value)}
            placeholder="https://meesho.com/... or amazon.in/..."
          />
          <small>We'll detect the shop automatically and fill the affiliate link below.</small>
        </label>

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
            required
          />
        </label>

        <label className={styles.field}>
          <span>Product Image URL</span>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            placeholder="https://images.unsplash.com/photo-..."
          />
          {form.image_url && (
            <img src={form.image_url} alt="preview" className={styles.imgPreview} onError={(e) => (e.target.style.display = 'none')} />
          )}
        </label>

        <label className={styles.field}>
          <span>Your Review</span>
          <textarea rows={3} value={form.review} onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))} />
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Video Link</span>
            <input type="url" value={form.video_link} onChange={(e) => setForm((f) => ({ ...f, video_link: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span>Video Credit</span>
            <input value={form.video_credit} onChange={(e) => setForm((f) => ({ ...f, video_credit: e.target.value }))} placeholder="Channel name" />
          </label>
        </div>

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
