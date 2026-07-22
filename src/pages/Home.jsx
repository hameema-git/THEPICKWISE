import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import * as settingsService from '../services/settingsService'
import ProductCard from '../components/ProductCard'
import VideoModal from '../components/VideoModal'
import Seo from '../components/Seo'
import styles from './Home.module.css'

const FAQS = [
  { q: "How do I know these are honest reviews?", a: "Every single product on this site has been personally purchased and tested by me. I don't accept payment to feature products, and I always disclose when a link is an affiliate link." },
  { q: "Do prices stay accurate?", a: "I update prices when I notice a change, but marketplaces change prices frequently. The price shown when you click through is always the real one — treat the price on my site as approximate." },
  { q: "How do you make money from this site?", a: "When you buy something through one of my links, I earn a small commission from the seller — at no extra cost to you. This is what lets me keep testing and reviewing products." },
  { q: "Can I suggest a product for you to review?", a: "Yes! Message me on Instagram with your suggestion — I read every message." },
]

export default function Home() {
  const { filtered, picks, category, setCategory, search, setSearch, loading } = useProducts()
  const { categories } = useCategories()
  const [video, setVideo]   = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => { settingsService.get().then(setSettings).catch(() => {}) }, [])

  return (
    <>
      <Seo
        title={settings?.seo_title}
        description={settings?.seo_description || 'Real product reviews with video. Tested by me. Trusted for you.'}
        path="/"
        rawTitle
      />
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlobs}>
          <div className={`${styles.blob} ${styles.b1}`}></div>
          <div className={`${styles.blob} ${styles.b2}`}></div>
          <div className={`${styles.blob} ${styles.b3}`}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroPills}>
            <span className={styles.pill}>✅ Personally Tested</span>
            <span className={styles.pill}>🎥 Real Videos</span>
            <span className={styles.pill}>💯 Honest Reviews</span>
          </div>
          <h1 className={styles.heroTitle}>
            Tested by Me.<br/><span className={styles.heroAccent}>Trusted for You.</span>
          </h1>
          <p className={styles.heroSub}>
            I buy, test, and review every product myself before recommending it — with real video proof, not paid promotions.
          </p>
          <div className={styles.heroCtas}>
            <a href="#products" className={styles.btnPrimary}>Browse Products</a>
            <a href="#picks" className={styles.btnGhost}>⭐ My Favourites</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsBar}>
        <div className={styles.stat}><span className={styles.statN}>{filtered.length}+</span><span className={styles.statL}>Products Reviewed</span></div>
        <div className={styles.stat}><span className={styles.statN}>100%</span><span className={styles.statL}>Personally Tested</span></div>
        <div className={styles.stat}><span className={styles.statN}>0</span><span className={styles.statL}>Paid Promotions</span></div>
      </section>

      {/* PICKS */}
      {picks.length > 0 && (
        <section className={styles.section} id="picks">
          <div className={styles.sectionHead}>
            <span className={styles.tag}>⭐ Editor's Choice</span>
            <h2 className={styles.sectionTitle}>My Personal Favourites</h2>
            <p className={styles.sectionSub}>The products I genuinely use every day — my highest recommendation.</p>
          </div>
          <div className={styles.grid}>
            {picks.slice(0,4).map(p=><ProductCard key={p.id} product={p} onVideoOpen={(u,c,plat)=>setVideo({url:u,credit:c,platform:plat})}/>)}
          </div>
        </section>
      )}

      {/* CATEGORY NAV + SEARCH */}
      <section className={styles.section} id="products">
        <div className={styles.catBar}>
          <div className={styles.catScroll}>
            <button
              className={`${styles.catBtn} ${category==='all'?styles.catActive:''}`}
              onClick={()=>setCategory('all')}>
              🌟 All
            </button>
            {categories.map(c=>(
              <button key={c.id}
                className={`${styles.catBtn} ${category===c.id?styles.catActive:''}`}
                onClick={()=>setCategory(c.id)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input type="text" placeholder="Search products..." value={search}
              onChange={e=>setSearch(e.target.value)} />
            {search && <button onClick={()=>setSearch('')} className={styles.clearSearch}>✕</button>}
          </div>
        </div>

        <p className={styles.resultCount}>
          {loading ? 'Loading…' : `${filtered.length} product${filtered.length===1?'':'s'}`}
        </p>

        {loading
          ? <p className={styles.empty}>Loading…</p>
          : filtered.length === 0
          ? <div className={styles.empty}>
              <p>🔍</p>
              <p className={styles.emptyTitle}>No products found</p>
              <button className={styles.btnPrimary} onClick={()=>{setSearch('');setCategory('all')}}>Clear filters</button>
            </div>
          : <div className={styles.grid}>
              {filtered.map(p=><ProductCard key={p.id} product={p} onVideoOpen={(u,c,plat)=>setVideo({url:u,credit:c,platform:plat})}/>)}
            </div>
        }
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle} style={{textAlign:'center'}}>How I Pick Products</h2>
        <div className={styles.howGrid}>
          <div className={styles.howCard}>
            <div className={styles.howIcon}>🛒</div>
            <h3 className={styles.howTitle}>I Buy It Myself</h3>
            <p className={styles.howDesc}>No free samples, no sponsorships. I purchase every product with my own money.</p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howIcon}>🧪</div>
            <h3 className={styles.howTitle}>I Actually Use It</h3>
            <p className={styles.howDesc}>Weeks of real, everyday use before I write a single word about it.</p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howIcon}>🎥</div>
            <h3 className={styles.howTitle}>I Film the Proof</h3>
            <p className={styles.howDesc}>Real video reviews so you can see exactly what you're getting.</p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howIcon}>💬</div>
            <h3 className={styles.howTitle}>I Write it Honestly</h3>
            <p className={styles.howDesc}>The good, the bad, and whether it's actually worth your money.</p>
          </div>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <section className={styles.instaCta}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{marginBottom:'1rem'}}>
          <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
        </svg>
        <h2 className={styles.instaTitle}>Follow for Daily Finds</h2>
        <p className={styles.instaSub}>New product reviews and honest recommendations, every week on Instagram.</p>
        {/* <a href="#" className={styles.instaBtn}>📸 Follow on Instagram</a> */}
        <a
  href="https://www.instagram.com/thepickwise.in/"
  target="_blank"
  rel="noopener noreferrer"
  className={styles.instaBtn}
>
  📸 Follow on Instagram
</a>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <h2 className={styles.sectionTitle} style={{textAlign:'center', marginBottom:'2rem'}}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((f,i)=>(
              <div key={i} className={`${styles.faqItem} ${openFaq===i?styles.faqOpen:''}`}>
                <button className={styles.faqQ} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                  {f.q}
                  <span className={styles.faqArrow}>{openFaq===i?'−':'+'}</span>
                </button>
                {openFaq===i && <p className={styles.faqA}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {video && <VideoModal url={video.url} credit={video.credit} platform={video.platform} onClose={()=>setVideo(null)}/>}
    </>
  )
}
