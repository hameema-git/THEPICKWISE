import { useState } from 'react'
import { products, CATEGORIES, SHOP_COLORS } from '../data/products'
import styles from './Admin.module.css'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('list')
  const [copied, setCopied]       = useState(false)

  const BLANK_TEMPLATE = `  {
    id: ${Math.max(...products.map(p => p.id)) + 1},
    category: "kitchen",
    name: "Your Product Name",
    image: "https://images.unsplash.com/photo-XXXXXX?w=600&q=80",
    review: "Write your honest 2-3 sentence review here.",
    rating: 4.5,
    reviews_count: 1000,
    price: "₹999",
    original_price: "₹1,999",
    savings: "50% off",
    badges: ["deal"],
    shop: "Meesho",
    affiliate_link: "https://meesho.com/your-product-link",
    video_link: "https://www.youtube.com/watch?v=XXXXXXXXXX",
    video_credit: "Channel Name",
    is_pick: false,
  },`

  const handleCopy = () => {
    navigator.clipboard.writeText(BLANK_TEMPLATE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>🛠 Manage Products</h1>
          <p className={styles.sub}>View all products · Copy templates · Get step-by-step guidance</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {['list', 'add', 'guide'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}>
              {t === 'list' ? '📋 All Products' : t === 'add' ? '➕ Add Product' : '📖 How-To Guide'}
            </button>
          ))}
        </div>

        {/* Product List */}
        {activeTab === 'list' && (
          <div>
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{products.length}</div>
                <div className={styles.statLabel}>Total products</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{products.filter(p => p.is_pick).length}</div>
                <div className={styles.statLabel}>My Favourites</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{[...new Set(products.map(p => p.shop))].join(', ')}</div>
                <div className={styles.statLabel}>Shops linked</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{products.filter(p => p.video_link).length}</div>
                <div className={styles.statLabel}>With videos</div>
              </div>
            </div>

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>ID</span><span>Name</span><span>Category</span>
                <span>Shop</span><span>Price</span><span>Fav?</span><span>Video?</span>
              </div>
              {products.map(p => {
                const shopColor = SHOP_COLORS[p.shop] || { bg: '#64748b', text: '#fff' }
                return (
                  <div key={p.id} className={styles.tableRow}>
                    <span className={styles.idBadge}>#{p.id}</span>
                    <span className={styles.productName}>{p.name}</span>
                    <span className={styles.catChip}>{p.category}</span>
                    <span className={styles.shopChip}
                      style={{ background: shopColor.bg, color: shopColor.text }}>{p.shop}</span>
                    <span className={styles.price}>{p.price}</span>
                    <span>{p.is_pick ? '⭐' : '—'}</span>
                    <span>{p.video_link ? '🎬' : '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add Product */}
        {activeTab === 'add' && (
          <div className={styles.addSection}>
            <div className={styles.addBox}>
              <h2 className={styles.addTitle}>📋 Copy this template to add a new product</h2>
              <p className={styles.addSub}>
                Copy the code below → open <code>src/data/products.js</code> →
                paste it before the last <code>{']'}</code> in the products array → fill in your details.
              </p>
              <div className={styles.codeWrap}>
                <pre className={styles.code}>{BLANK_TEMPLATE}</pre>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
                  {copied ? '✅ Copied!' : '📋 Copy template'}
                </button>
              </div>
            </div>

            <div className={styles.fieldGuide}>
              <h3 className={styles.fieldGuideTitle}>Field Reference</h3>
              <div className={styles.fieldGrid}>
                {[
                  ['category', '"kitchen" / "tech" / "home" / "beauty" / "kids" / "fitness"'],
                  ['badges',   '"deal" (🔥) · "new" (✨) · "fav" (❤️) — use any combo: ["deal","fav"]'],
                  ['shop',     '"Amazon" / "Meesho" / "Flipkart"'],
                  ['is_pick',  'true → shows in My Favourites section · false → All Products only'],
                  ['video_link', 'Paste any YouTube watch URL — auto converts to embed'],
                  ['affiliate_link', 'Your Meesho "Share & Earn" link or Amazon SiteStripe link'],
                  ['rating',   '1.0 to 5.0 — one decimal place (copy from the product page)'],
                  ['savings',  'Calculate: ((original - current) / original × 100)% e.g. "46% off"'],
                ].map(([field, desc]) => (
                  <div key={field} className={styles.fieldRow}>
                    <code className={styles.fieldName}>{field}</code>
                    <span className={styles.fieldDesc}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.videoGuide}>
              <h3>🎬 How to get a YouTube video link</h3>
              <ol className={styles.steps}>
                <li>Search YouTube for: <em>"[product name] review"</em></li>
                <li>Open a video you like (e.g. from Tech Burner, Trakin Tech)</li>
                <li>Copy the URL from the browser bar: <code>https://youtube.com/watch?v=XXXXX</code></li>
                <li>Paste it as <code>video_link</code></li>
                <li>Add the channel name as <code>video_credit</code></li>
              </ol>
            </div>
          </div>
        )}

        {/* Guide */}
        {activeTab === 'guide' && (
          <div className={styles.guide}>
            {[
              {
                icon: '1️⃣', title: 'Open the products file',
                body: 'Open src/data/products.js in VS Code or Notepad. This is the only file you need to edit to add or change products.'
              },
              {
                icon: '2️⃣', title: 'Find the end of the products list',
                body: 'Scroll to the bottom of the file. You will see the last product ending with }, followed by ] — paste your new product before that ].'
              },
              {
                icon: '3️⃣', title: 'Copy the template from the "Add Product" tab',
                body: 'Go to the "➕ Add Product" tab above → click Copy template → paste it just before the closing ] in products.js.'
              },
              {
                icon: '4️⃣', title: 'Fill in the details',
                body: 'Replace each placeholder with your real data. Change the id to the next number. Add your affiliate link. Paste your YouTube video URL.'
              },
              {
                icon: '5️⃣', title: 'Get your affiliate link from Meesho',
                body: 'Open Meesho app → find your product → tap Share icon (📤) → tap "Share & Earn" → copy the special link that appears → paste as affiliate_link.'
              },
              {
                icon: '6️⃣', title: 'Get your affiliate link from Amazon',
                body: 'Log into affiliate-program.amazon.in → browse Amazon.in in the same browser → find your product → use the SiteStripe bar at the top → click "Text" → copy the short link.'
              },
              {
                icon: '7️⃣', title: 'Save and check',
                body: 'Save products.js → refresh your browser → your new product will appear instantly in the product grid. Search for it to confirm.'
              },
              {
                icon: '8️⃣', title: 'Deploy to Vercel',
                body: 'Push your changes to GitHub → Vercel auto-deploys in under 60 seconds → your live site at thepickwise.in is updated immediately.'
              },
            ].map(step => (
              <div key={step.title} className={styles.step}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
