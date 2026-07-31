import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudioLayout from '../../components/studio/StudioLayout'
import PhotoUploader from '../../components/studio/PhotoUploader'
import { useCategories } from '../../hooks/useCategories'
import * as productsService from '../../services/productsService'
import * as categoriesService from '../../services/categoriesService'
import { validateProductForm } from '../../utils/productValidation'
import styles from './ProductForm.module.css'

const EMPTY = {
  name: '', category_id: '', price: '', original_price: '', savings: '',
  shop: 'Meesho', rating: 4.5, reviews_count: 100, affiliate_link: '',
  image_url: '', image_urls: [], review: '', review_summary: '', review_pros: [], review_cons: [], review_verdict: '',
  video_link: '', video_link_youtube: '', video_link_instagram: '', video_credit: '',
  badges: [], is_pick: false, is_published: true, status: 'active', replacement_product_id: '',
  seo_title: '', seo_description: '', seo_keywords: '',
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showSeo, setShowSeo] = useState(false)
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
        name: p.name || '', category_id: p.category_id || '', price: p.price ?? '',
        original_price: p.original_price ?? '', savings: p.savings || '', shop: p.shop || 'Meesho',
        rating: p.rating ?? 4.5, reviews_count: p.reviews_count ?? 0, affiliate_link: p.affiliate_link || '',
        image_url: p.image_url || '', image_urls: p.image_urls?.length ? p.image_urls : (p.image_url ? [p.image_url] : []),
        review: p.review || '', review_summary: p.review_summary || '',
        review_pros: p.review_pros || [], review_cons: p.review_cons || [], review_verdict: p.review_verdict || '',
        video_link: p.video_link || '',
        video_link_youtube: p.video_link_youtube || '', video_link_instagram: p.video_link_instagram || '',
        video_credit: p.video_credit || '', badges: p.badges || [], is_pick: p.is_pick || false,
        is_published: p.is_published ?? true, status: p.status || 'active',
        replacement_product_id: p.replacement_product_id || '',
        seo_title: p.seo_title || '', seo_description: p.seo_description || '', seo_keywords: p.seo_keywords || '',
      })
      setLoading(false)
    })
  }, [id, isEdit])

  const handlePhotosChange = (urls) => {
    setForm((f) => ({ ...f, image_urls: urls, image_url: urls[0] || '' }))
  }

  const handleFieldChange = (field, value) => {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    setFieldErrors((errors) => {
      if (field === 'price' || field === 'original_price') {
        const nextErrors = validateProductForm(nextForm)
        return {
          ...errors,
          price: nextErrors.price,
          original_price: nextErrors.original_price,
        }
      }
      if (!errors[field] && !(field === 'price' && errors.original_price)) return errors
      const nextErrors = validateProductForm(nextForm)
      return { ...errors, [field]: nextErrors[field] }
    })
  }

  const inputErrorProps = (field) => fieldErrors[field]
    ? { 'aria-invalid': true, 'aria-describedby': `${field}-error`, style: { borderColor: 'var(--red)' } }
    : {}

  const renderFieldError = (field) => fieldErrors[field] && (
    <small id={`${field}-error`} role="alert" style={{ color: 'var(--red-dark)' }}>{fieldErrors[field]}</small>
  )

  const toggleBadge = (badge) => {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(badge) ? f.badges.filter((b) => b !== badge) : [...f.badges, badge],
    }))
  }

  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')

  const addListItem = (field, value, clear) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setForm((f) => ({ ...f, [field]: [...f[field], trimmed] }))
    clear('')
  }
  const removeListItem = (field, index) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const cat = await categoriesService.create({ name: newCategoryName.trim() })
    await refreshCategories()
    setForm((f) => ({ ...f, category_id: cat.id }))
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const getMissingForPublish = (f) => {
    const missing = []
    if (!f.image_urls || f.image_urls.length === 0) missing.push('Product Photo')
    if (!f.affiliate_link) missing.push('Affiliate Link')
    if (!f.review && !f.review_summary) missing.push('Review (Summary or Experience)')
    if (!f.category_id) missing.push('Category')
    if (f.price === '' || f.price === null || f.price === undefined) missing.push('Price')
    return missing
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const validationErrors = validateProductForm(form)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }
    if (form.is_published) {
      const missing = getMissingForPublish(form)
      if (missing.length > 0) {
        setError(`Can't publish yet — missing: ${missing.join(', ')}. Fill these in, or uncheck "Published" to save as a draft.`)
        return
      }
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
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
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.field}>
          <span>Product Name *</span>
          <input value={form.name} onChange={(e) => handleFieldChange('name', e.target.value)} {...inputErrorProps('name')} />
          {renderFieldError('name')}
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
            <input value={form.price} onChange={(e) => handleFieldChange('price', e.target.value)} placeholder="₹999" {...inputErrorProps('price')} />
            {renderFieldError('price')}
          </label>
          <label className={styles.field}>
            <span>Original Price</span>
            <input value={form.original_price} onChange={(e) => handleFieldChange('original_price', e.target.value)} placeholder="₹1,999" {...inputErrorProps('original_price')} />
            {renderFieldError('original_price')}
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

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Rating (1–5)</span>
            <input type="number" min="0" max="5" step="0.1" value={form.rating}
              onChange={(e) => handleFieldChange('rating', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="4.5" {...inputErrorProps('rating')} />
            {renderFieldError('rating')}
          </label>
          <label className={styles.field}>
            <span>Review Count</span>
            <input type="number" min="0" step="1" value={form.reviews_count}
              onChange={(e) => handleFieldChange('reviews_count', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="100" {...inputErrorProps('reviews_count')} />
            {renderFieldError('reviews_count')}
          </label>
        </div>

        <label className={styles.field}>
          <span>Affiliate Link *</span>
          <input
            type="url"
            value={form.affiliate_link}
            onChange={(e) => handleFieldChange('affiliate_link', e.target.value)}
            placeholder="Paste your Amazon/Meesho/Flipkart affiliate link"
            {...inputErrorProps('affiliate_link')}
          />
          {renderFieldError('affiliate_link')}
        </label>

        <label className={styles.field}>
          <span>Product Photos *</span>
          <PhotoUploader images={form.image_urls} onChange={handlePhotosChange} />
        </label>

        <label className={styles.field}>
          <span>Quick Summary <small>(optional, one line)</small></span>
          <input value={form.review_summary} onChange={(e) => setForm((f) => ({ ...f, review_summary: e.target.value }))}
            placeholder="e.g. Genuinely the best budget earbuds I've tested this year" />
        </label>

        <label className={styles.field}>
          <span>My Experience</span>
          <textarea rows={3} value={form.review} onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))} />
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Pros</span>
            <div className={styles.listInputRow}>
              <input value={proInput} onChange={(e) => setProInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('review_pros', proInput, setProInput))}
                placeholder="Type a pro, press Enter" />
              <button type="button" onClick={() => addListItem('review_pros', proInput, setProInput)}>+</button>
            </div>
            <ul className={styles.bulletList}>
              {form.review_pros.map((item, i) => (
                <li key={i}>✓ {item} <button type="button" onClick={() => removeListItem('review_pros', i)}>✕</button></li>
              ))}
            </ul>
          </label>
          <label className={styles.field}>
            <span>Cons</span>
            <div className={styles.listInputRow}>
              <input value={conInput} onChange={(e) => setConInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('review_cons', conInput, setConInput))}
                placeholder="Type a con, press Enter" />
              <button type="button" onClick={() => addListItem('review_cons', conInput, setConInput)}>+</button>
            </div>
            <ul className={styles.bulletList}>
              {form.review_cons.map((item, i) => (
                <li key={i}>✕ {item} <button type="button" onClick={() => removeListItem('review_cons', i)}>✕</button></li>
              ))}
            </ul>
          </label>
        </div>

        <label className={styles.field}>
          <span>Final Verdict <small>(optional)</small></span>
          <input value={form.review_verdict} onChange={(e) => setForm((f) => ({ ...f, review_verdict: e.target.value }))}
            placeholder="e.g. Worth it if you want great sound under ₹1000" />
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>YouTube Video Link</span>
            <input type="url" value={form.video_link_youtube} onChange={(e) => handleFieldChange('video_link_youtube', e.target.value)} placeholder="youtube.com/watch?v=... (optional)" {...inputErrorProps('video_link_youtube')} />
            {renderFieldError('video_link_youtube')}
          </label>
          <label className={styles.field}>
            <span>Instagram Reel Link</span>
            <input type="url" value={form.video_link_instagram} onChange={(e) => handleFieldChange('video_link_instagram', e.target.value)} placeholder="instagram.com/reel/... (optional)" {...inputErrorProps('video_link_instagram')} />
            {renderFieldError('video_link_instagram')}
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

        <div className={styles.seoSection}>
          <button type="button" className={styles.seoToggle} onClick={() => setShowSeo((s) => !s)}>
            <span>{showSeo ? '▼' : '▶'} SEO Settings <small>(optional — auto-generated if left blank)</small></span>
          </button>
          {showSeo && (
            <div className={styles.seoFields}>
              <label className={styles.field}>
                <span>Meta Title</span>
                <input value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                  placeholder={form.name ? `${form.name} | thePickWise` : 'Auto-generated from product name'} />
              </label>
              <label className={styles.field}>
                <span>Meta Description</span>
                <textarea rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                  placeholder="Auto-generated from your Quick Summary or Experience text" />
              </label>
              <label className={styles.field}>
                <span>Keywords</span>
                <input value={form.seo_keywords} onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))}
                  placeholder="comma, separated, keywords (optional)" />
              </label>
            </div>
          )}
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
