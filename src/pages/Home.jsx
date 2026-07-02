import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'
import VideoModal from '../components/VideoModal'
import styles from './Home.module.css'

const FAQS = [
  { q: 'Are the reviews real?', a: 'Yes — every product listed is something I have personally bought and used. I write my honest experience, including any problems. If I do not like something, I do not list it.' },
  { q: 'Do I pay more by clicking your links?', a: 'No. You pay exactly the same price as going directly to Amazon, Meesho, or Flipkart. The commission comes from the retailer, not from you.' },
  { q: 'Can I trust the video reviews?', a: 'The videos are from trusted YouTube creators like Tech Burner, Trakin Tech, BeBeautiful and others. They are clearly credited. I select only genuine, well-researched review videos.' },
  { q: 'How do I know if a product is good for me?', a: 'Use the Like / Dislike buttons on each product — they show real community feedback. You can also watch the video review before buying to see the product in action.' },
  { q: 'Can I download this as an app on my phone?', a: 'Yes! On Android, open this site in Chrome and tap the "Install App" button in the menu. On iPhone, tap Share → Add to Home Screen. Works like a real app, completely free.' },
  { q: 'How often are new products added?', a: 'New products are added regularly — follow @thepickwise on Instagram to be the first to know about new picks and deals.' },
]

export default function Home() {
  const { filtered, picks, category, setCategory, search, setSearch } = useProducts()
  const [video, setVideo]   = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlobs}>
          <div className={`${styles.blob} ${styles.b1}`}/><div className={`${styles.blob} ${styles.b2}`}/><div className={`${styles.blob} ${styles.b3}`}/>
        </div>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Real products · Real videos · Real opinions</p>
          <h1 className={styles.heroTitle}>Your one-stop shop for<br /><span className={styles.red}>honest</span> product <span className={styles.amber}>reviews</span></h1>
          <p className={styles.heroSub}>Every product here is personally tested. Watch the real video review before you buy. No fake reviews, no paid promotions.</p>
          <div className={styles.heroPills}>
            {['✅ Personally tested','🎬 Real video reviews','💰 Best prices','👍 Community rated'].map(t=><span key={t} className={styles.pill}>{t}</span>)}
          </div>
          <div className={styles.heroCtas}>
            <a href="#products" className={styles.btnPrimary}>Browse Products →</a>
            <a href="#picks"    className={styles.btnGhost}>⭐ My Favourites</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className={styles.statsBar}>
        {[['11+','Products Tested'],['Real','Video Reviews'],['₹0','Extra Cost to You'],['100%','Honest Opinions']].map(([n,l])=>(
          <div key={l} className={styles.stat}><span className={styles.statN}>{n}</span><span className={styles.statL}>{l}</span></div>
        ))}
      </div>

      {/* PICKS */}
      <section className={styles.picksSection} id="picks">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={styles.tag}>⭐ Editor's choice</span>
            <h2 className={styles.sectionTitle}>My Personal Favourites</h2>
            <p className={styles.sectionSub}>Products I genuinely love and use every day.</p>
          </div>
          <div className={styles.grid}>
            {picks.map(p=><ProductCard key={p.id} product={p} onVideoOpen={(u,c)=>setVideo({url:u,credit:c})}/>)}
          </div>
        </div>
      </section>

      {/* CATEGORY NAV */}
      <div className={styles.catNav} id="products">
        <div className={styles.inner}>
          <div className={styles.catScroll}>
            {CATEGORIES.map(c=>(
              <button key={c.id}
                className={`${styles.catBtn} ${category===c.id?styles.catActive:''}`}
                onClick={()=>setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <span>🔍</span>
            <input type="text" placeholder="Search..." value={search}
              onChange={e=>setSearch(e.target.value)} className={styles.searchInput} />
            {search && <button onClick={()=>setSearch('')} className={styles.clearBtn}>✕</button>}
          </div>
        </div>
      </div>

      {/* ALL PRODUCTS */}
      <section className={styles.allSection}>
        <div className={styles.inner}>
          <div className={styles.allHead}>
            <h2 className={styles.allTitle}>{search?`"${search}"`:'All Products'}</h2>
            <span className={styles.countPill}>{filtered.length} products</span>
          </div>
          {filtered.length === 0
            ? <div className={styles.empty}>
                <p>🔍</p>
                <p className={styles.emptyTitle}>No products found</p>
                <button className={styles.btnPrimary} onClick={()=>{setSearch('');setCategory('all')}}>Clear filters</button>
              </div>
            : <div className={styles.grid}>
                {filtered.map(p=><ProductCard key={p.id} product={p} onVideoOpen={(u,c)=>setVideo({url:u,credit:c})}/>)}
              </div>
          }
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <div className={styles.inner}>
          <span className={styles.tag}>Simple process</span>
          <h2 className={styles.sectionTitle} style={{color:'#fff'}}>How thePickWise works</h2>
          <div className={styles.howGrid}>
            {[
              ['🔍','I test the product','Every product is personally bought and tested before it appears here.'],
              ['🎬','Watch the video','See the real product in action via YouTube review videos — before you buy.'],
              ['👍','Community votes','Like or dislike buttons show you what other buyers really think.'],
              ['🛒','You buy & save','Click Buy — same price as the store. You save, I earn a tiny commission.'],
            ].map(([icon,title,desc])=>(
              <div key={title} className={styles.howCard}>
                <div className={styles.howIcon}>{icon}</div>
                <div className={styles.howTitle}>{title}</div>
                {/* <p className={styles.howDesc}>{desc}</p> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <section className={styles.instaCta}>
        <svg width="56" height="56" viewBox="0 0 400 400" style={{borderRadius:14,marginBottom:'1rem'}}>
          <rect width="400" height="400" rx="80" fill="#1a1a2e"/>
          <rect x="60" y="60" width="280" height="280" rx="60" fill="#e63946"/>
          <text x="200" y="228" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="160" fill="#fff" fontWeight="900">P</text>
          <polygon points="200,255 240,195 280,255" fill="#f4a261"/>
        </svg>
        <h2 className={styles.instaTitle}>Get daily deals on Instagram</h2>
        <p className={styles.instaSub}>New product picks, exclusive finds, and honest reviews — every day.</p>
        <a href="https://instagram.com/thepickwise" target="_blank" rel="noreferrer" className={styles.instaBtn}>📸 Follow @thepickwise</a>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection} id="faq">
        <div className={styles.faqInner}>
          <span className={styles.tag}>Got questions?</span>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((f,i)=>(
              <div key={i} className={`${styles.faqItem} ${openFaq===i?styles.faqOpen:''}`}>
                <button className={styles.faqQ} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                  {f.q}
                  <span className={styles.faqArrow}>{openFaq===i?'▲':'▼'}</span>
                </button>
                {openFaq===i && <p className={styles.faqA}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {video && <VideoModal url={video.url} credit={video.credit} onClose={()=>setVideo(null)}/>}
    </>
  )
}
