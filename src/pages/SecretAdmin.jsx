import { useState, useMemo } from 'react'
import { products as defaultProducts, CATEGORIES, SHOP_COLORS } from '../data/products'
import styles from './SecretAdmin.module.css'

const STORAGE_KEY    = 'pickwise_extra_products'
const OVERRIDES_KEY  = 'pickwise_overrides'

const EMPTY = {
  id: null, category: 'kitchen', name: '', image: '', review: '',
  rating: 4.5, reviews_count: 100, price: '', original_price: '', savings: '',
  badges: [], shop: 'Meesho', affiliate_link: '', video_link: '', video_credit: '', is_pick: false,
}

function load(key) { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }
function loadObj(key) { try { return JSON.parse(localStorage.getItem(key)) || {} } catch { return {} } }

export default function SecretAdmin() {
  const [extra,     setExtra]     = useState(() => load(STORAGE_KEY))
  const [overrides, setOverrides] = useState(() => loadObj(OVERRIDES_KEY))
  const [form,      setForm]      = useState({ ...EMPTY })
  const [tab,       setTab]       = useState('list')
  const [mode,      setMode]      = useState('add')   // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [saved,     setSaved]     = useState('')
  const [search,    setSearch]    = useState('')

  // Merge defaults + overrides + extra
  const allProducts = useMemo(() => {
    const base = defaultProducts.map(p => overrides[p.id] ? { ...p, ...overrides[p.id] } : p)
    return [...base, ...extra]
  }, [extra, overrides])

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts
    const q = search.toLowerCase()
    return allProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q))
  }, [allProducts, search])

  const isExtra    = (id) => extra.find(p => p.id === id)
  const isBuiltIn  = (id) => defaultProducts.find(p => p.id === id)
  const isEdited   = (id) => !!overrides[id]

  // ── Save (add or update) ─────────────────────────────────────
  const save = () => {
    if (!form.name || !form.price || !form.affiliate_link) {
      alert('Name, Price and Affiliate Link are required!'); return
    }
    if (mode === 'edit' && isBuiltIn(editingId)) {
      // Save as override
      const newOverrides = { ...overrides, [editingId]: { ...form } }
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(newOverrides))
      setOverrides(newOverrides)
      setSaved('✅ Product updated!')
    } else if (mode === 'edit' && isExtra(editingId)) {
      // Update in extra list
      const updated = extra.map(p => p.id === editingId ? { ...form, id: editingId } : p)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setExtra(updated)
      setSaved('✅ Product updated!')
    } else {
      // New product
      const newProduct = { ...form, id: Date.now() }
      const updated = [...extra, newProduct]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setExtra(updated)
      setSaved('✅ Product added! Refresh home page to see it.')
    }
    resetForm()
    setTimeout(() => setSaved(''), 3000)
    setTab('list')
  }

  const resetForm = () => {
    setForm({ ...EMPTY })
    setMode('add')
    setEditingId(null)
  }

  // ── Edit ─────────────────────────────────────────────────────
  const startEdit = (product) => {
    setForm({ ...product })
    setMode('edit')
    setEditingId(product.id)
    setTab('form')
    window.scrollTo(0, 0)
  }

  // ── Delete ───────────────────────────────────────────────────
  const remove = (id) => {
    if (!confirm('Remove this product from the site?')) return
    if (isExtra(id)) {
      const updated = extra.filter(p => p.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setExtra(updated)
    }
    if (isEdited(id)) {
      const { [id]: _, ...rest } = overrides
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(rest))
      setOverrides(rest)
    }
    setSaved('🗑 Product removed.')
    setTimeout(() => setSaved(''), 2500)
  }

  // ── Reset override (restore built-in) ────────────────────────
  const resetOverride = (id) => {
    if (!confirm('Restore this product to its original details?')) return
    const { [id]: _, ...rest } = overrides
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(rest))
    setOverrides(rest)
    setSaved('↩️ Product restored to original.')
    setTimeout(() => setSaved(''), 2500)
  }

  const toggle = (badge) => {
    setForm(f => ({ ...f, badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge] }))
  }

  const formTitle = mode === 'edit' ? `✏️ Edit: ${form.name || 'Product'}` : '➕ Add New Product'

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>🛠 thePickWise Admin</h1>
          <p className={styles.sub}>Add, edit and manage products — changes appear instantly</p>
          <div className={styles.secretNote}>🔒 Secret URL: <strong>thepickwise.in/manage-pickwise-2025</strong> — do not share publicly</div>
        </div>
      </div>

      <div className={styles.container}>

        {/* Global save message */}
        {saved && <div className={styles.successBanner}>{saved}</div>}

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}><span className={styles.statN}>{allProducts.length}</span><span className={styles.statL}>Total products</span></div>
          <div className={styles.statBox}><span className={styles.statN}>{extra.length}</span><span className={styles.statL}>Added by you</span></div>
          <div className={styles.statBox}><span className={styles.statN}>{Object.keys(overrides).length}</span><span className={styles.statL}>Edited originals</span></div>
          <div className={styles.statBox}><span className={styles.statN}>{allProducts.filter(p=>p.is_pick).length}</span><span className={styles.statL}>Favourites</span></div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button onClick={() => { setTab('list'); resetForm() }} className={`${styles.tab} ${tab==='list'?styles.tabActive:''}`}>📋 All Products ({allProducts.length})</button>
          <button onClick={() => { setTab('form'); setMode('add'); setForm({...EMPTY}) }} className={`${styles.tab} ${tab==='form'?styles.tabActive:''}`}>➕ Add Product</button>
        </div>

        {/* ── PRODUCT LIST ── */}
        {tab === 'list' && (
          <div className={styles.listWrap}>
            <div className={styles.listToolbar}>
              <input type="text" placeholder="🔍 Search products..." value={search}
                onChange={e => setSearch(e.target.value)} className={styles.listSearch} />
              {search && <button onClick={() => setSearch('')} className={styles.clearSearch}>✕</button>}
              <span className={styles.listCount}>{filtered.length} products</span>
            </div>

            <div className={styles.productList}>
              {filtered.map(p => {
                const shopStyle = { background: SHOP_COLORS[p.shop]?.bg, color: SHOP_COLORS[p.shop]?.text }
                const canDelete = !!isExtra(p.id)
                const canReset  = !!isEdited(p.id) && !!isBuiltIn(p.id)
                return (
                  <div key={p.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      {p.image
                        ? <img src={p.image} alt={p.name} className={styles.thumb} onError={e => e.target.style.display='none'} />
                        : <div className={styles.thumbPlaceholder}>📦</div>
                      }
                      <div className={styles.productDetails}>
                        <div className={styles.productName}>
                          {p.name}
                          {isEdited(p.id) && <span className={styles.editedBadge}>✏️ edited</span>}
                          {isExtra(p.id)  && <span className={styles.addedBadge}>🆕 added by you</span>}
                        </div>
                        <div className={styles.productMeta}>
                          <span className={styles.catTag}>{p.category}</span>
                          <span className={styles.shopTag} style={shopStyle}>{p.shop}</span>
                          <span className={styles.priceTag}>{p.price}</span>
                          {p.is_pick && <span className={styles.favTag}>⭐ Fav</span>}
                          {p.video_link && <span className={styles.vidTag}>🎬 Video</span>}
                          {p.badges?.map(b => <span key={b} className={styles.badgeTag}>{b==='deal'?'🔥':b==='new'?'✨':'❤️'}</span>)}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actionBtns}>
                      <a href={`/product/${p.id}`} target="_blank" rel="noreferrer"
                        className={styles.viewBtn} title="View on site">
                        👁 View
                      </a>
                      <button className={styles.editBtn} onClick={() => startEdit(p)} title="Edit this product">
                        ✏️ Edit
                      </button>
                      {canDelete && (
                        <button className={styles.deleteBtn} onClick={() => remove(p.id)} title="Delete product">
                          🗑 Delete
                        </button>
                      )}
                      {canReset && (
                        <button className={styles.resetOverrideBtn} onClick={() => resetOverride(p.id)} title="Restore original">
                          ↩️ Restore
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ADD / EDIT FORM ── */}
        {tab === 'form' && (
          <div className={styles.form}>
            <h2 className={styles.formHeading}>{formTitle}</h2>
            {mode === 'edit' && isBuiltIn(editingId) && (
              <div className={styles.editNote}>
                📌 You are editing a built-in product. Your changes will be saved as an override — the original is safe and can be restored anytime.
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Prestige Induction Cooktop 1600W" />
              </div>

              <div className={styles.field}>
                <label>Category *</label>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label>Current Price * (with ₹)</label>
                <input type="text" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="₹999" />
              </div>

              <div className={styles.field}>
                <label>Original / MRP Price</label>
                <input type="text" value={form.original_price} onChange={e => setForm(f=>({...f,original_price:e.target.value}))} placeholder="₹1,999" />
              </div>

              <div className={styles.field}>
                <label>Savings / Discount</label>
                <input type="text" value={form.savings} onChange={e => setForm(f=>({...f,savings:e.target.value}))} placeholder="50% off" />
              </div>

              <div className={styles.field}>
                <label>Shop *</label>
                <select value={form.shop} onChange={e => setForm(f=>({...f,shop:e.target.value}))}>
                  {Object.keys(SHOP_COLORS).map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label>Star Rating (1.0 – 5.0)</label>
                <input type="number" min="1" max="5" step="0.1" value={form.rating}
                  onChange={e => setForm(f=>({...f,rating:parseFloat(e.target.value)}))} />
              </div>

              <div className={styles.field}>
                <label>Number of Customer Reviews</label>
                <input type="number" value={form.reviews_count}
                  onChange={e => setForm(f=>({...f,reviews_count:parseInt(e.target.value)}))} />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Affiliate Link * (Meesho "Share & Earn" / Amazon SiteStripe)</label>
                <input type="url" value={form.affiliate_link}
                  onChange={e => setForm(f=>({...f,affiliate_link:e.target.value}))}
                  placeholder="https://meesho.com/af_invite/..." />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Product Image URL (right-click product image → Copy image address)</label>
                <input type="url" value={form.image}
                  onChange={e => setForm(f=>({...f,image:e.target.value}))}
                  placeholder="https://images.unsplash.com/photo-..." />
                {form.image && (
                  <img src={form.image} alt="preview" className={styles.imgPreview}
                    onError={e => e.target.style.display='none'} />
                )}
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Your Review (2–3 honest sentences)</label>
                <textarea value={form.review}
                  onChange={e => setForm(f=>({...f,review:e.target.value}))}
                  rows={3} placeholder="Write your honest opinion about this product..." />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>YouTube Video Link (any YouTube watch URL)</label>
                <input type="url" value={form.video_link}
                  onChange={e => setForm(f=>({...f,video_link:e.target.value}))}
                  placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div className={styles.field}>
                <label>Video Creator / Channel Name</label>
                <input type="text" value={form.video_credit}
                  onChange={e => setForm(f=>({...f,video_credit:e.target.value}))}
                  placeholder="e.g. Tech Burner" />
              </div>

              <div className={styles.field}>
                <label>Badges (select all that apply)</label>
                <div className={styles.badgeRow}>
                  {['deal','new','fav'].map(b => (
                    <button key={b} type="button"
                      className={`${styles.badgeToggle} ${form.badges?.includes(b)?styles.badgeOn:''}`}
                      onClick={() => toggle(b)}>
                      {b==='deal'?'🔥 Hot Deal':b==='new'?'✨ New Pick':'❤️ My Fav'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label>Show in My Favourites section?</label>
                <button type="button"
                  className={`${styles.toggleBtn} ${form.is_pick?styles.toggleOn:''}`}
                  onClick={() => setForm(f=>({...f,is_pick:!f.is_pick}))}>
                  {form.is_pick ? '⭐ Yes — show in Favourites' : '— No — All Products only'}
                </button>
              </div>
            </div>

            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={save}>
                {mode === 'edit' ? '💾 Save Changes' : '✅ Add Product to Site'}
              </button>
              <button className={styles.resetBtn} onClick={() => { resetForm(); setTab('list') }}>
                ← Cancel
              </button>
            </div>

            <div className={styles.helpBox}>
              <strong>📲 Meesho affiliate link:</strong> Open Meesho app → Find product → Tap Share (📤) → "Share & Earn" → Copy link<br /><br />
              <strong>🛒 Amazon affiliate link:</strong> Login to affiliate-program.amazon.in → Browse Amazon in same browser → Find product → SiteStripe bar at top → Click "Text" → Copy short link
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
