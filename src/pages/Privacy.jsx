import styles from './Static.module.css'
export default function Privacy() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.sub}>How we handle your information</p>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <p className={styles.updated}>Last updated: January 2025</p>
          <h2>What we collect</h2>
          <p>thePickWise does not collect, store, or process any personal information. There are no user accounts, login systems, or forms that save your data to our servers.</p>
          <h2>Your likes and votes</h2>
          <p>When you click 👍 or 👎 on a product, this is saved only in your own browser's local storage. It stays on your device and is never sent to us or anyone else.</p>
          <h2>Third-party links</h2>
          <p>When you click a buy link, you are taken to Amazon, Meesho, or Flipkart. Their own privacy policies apply from that point. We recommend reading those policies on their respective websites.</p>
          <h2>YouTube videos</h2>
          <p>Product review videos are embedded from YouTube. Google may collect data when you play a video, subject to Google's privacy policy at policies.google.com/privacy.</p>
          <h2>Questions?</h2>
          <p>Contact us at <a href="mailto:hello@thepickwise.in" className={styles.emailLink}>hello@thepickwise.in</a></p>
        </div>
      </div>
    </div>
  )
}
