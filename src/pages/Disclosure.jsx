import styles from './Static.module.css'
export default function Disclosure() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>About thePickWise</h1>
        <p className={styles.sub}>What you get when you use this site</p>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <h2>What you get here</h2>
          <p>thePickWise is a curated product discovery site. Everything listed here has been personally researched and reviewed. You get honest opinions, real video reviews from trusted creators, and direct links to buy at the best price.</p>

          <h2>No extra cost to you</h2>
          <p>When you click a buy link and make a purchase, the retailer (Amazon, Meesho, or Flipkart) pays a small referral fee to this site. <strong>You pay exactly the same price</strong> as you would going directly to their website — not a rupee more.</p>

          <div className={styles.highlight}>
            💡 You get honest product guidance for free. The retailer handles the rest.
          </div>

          <h2>Community votes</h2>
          <p>The 👍 and 👎 buttons on each product reflect real visitor feedback. Use them to help others make better buying decisions.</p>

          <h2>Questions?</h2>
          <p>Reach out at <a href="mailto:codeleaf.tech@gmail.com" className={styles.emailLink}>codeleaf.tech@gmail.com</a></p>
        </div>
      </div>
    </div>
  )
}
