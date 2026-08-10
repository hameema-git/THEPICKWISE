import { useEffect,useState } from 'react'
import { useParams } from 'react-router-dom'
import * as articlesService from '../services/articlesService'
import Seo from '../components/Seo'
import { formatPrice } from '../utils/formatPrice'
import styles from './Article.module.css'

export default function Article(){
  const {slug}=useParams(); const [a,setA]=useState(null)
  useEffect(()=>{articlesService.getBySlug(slug).then(setA).catch(()=>setA(false))},[slug])
  if(a===null)return <p>Loading…</p>; if(!a)return <p>Guide not found.</p>
  const products=(a.article_products||[]).sort((x,y)=>x.display_order-y.display_order).map(x=>x.products).filter(Boolean)
  return <><Seo title={a.seo_title||a.title} description={a.seo_description||a.excerpt} path={`/articles/${slug}`}/>
    <article className={styles.page}>
      <div className={styles.eyebrow}>PickWise Buying Guide</div>
      <div className={styles.content} dangerouslySetInnerHTML={{__html:a.content}}/>
      <section className={styles.picks}><h2>Our recommended picks</h2><p>See the products included in this guide, compare their essentials, and check the latest price.</p>
        <div className={styles.grid}>{products.map((p,index)=><article className={`${styles.card} ${index===0?styles.featured:''}`} key={p.id}>
          {index===0&&<span className={styles.badge}>Top pick</span>}
          <img src={p.image_url} alt={p.name} onError={e=>e.currentTarget.style.display='none'}/>
          <div className={styles.cardBody}><span className={styles.category}>{p.categories?.emoji||'✨'} {p.categories?.name||'PickWise choice'}</span><h3>{p.name}</h3>
          <div className={styles.metrics}><strong>{formatPrice(p.price)}</strong><span>★ {p.rating||'—'}</span></div>
          <p>{p.review_summary||p.review_verdict||'A PickWise recommendation.'}</p>
          <a href={p.affiliate_link} target="_blank" rel="nofollow noopener noreferrer">Check latest price →</a></div>
        </article>)}</div>
      </section>
    </article></>
}
