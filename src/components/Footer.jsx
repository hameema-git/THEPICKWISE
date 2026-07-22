import { Link } from 'react-router-dom'
import Logo from './Logo'
import styles from './Footer.module.css'
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Logo variant="dark" height={34} />
        <p className={styles.tagline}>CURATED · TRUSTED · LOVED</p>
        <nav className={styles.links}>
          <Link to="/">Products</Link>
          <Link to="/picks">My Favourites</Link>
          <Link to="/disclosure">About</Link>
          <Link to="/privacy">Privacy</Link>
          <a href="https://instagram.com/thepickwise" target="_blank" rel="noreferrer">Instagram</a>
          <a href="mailto:hello@thepickwise.in">Contact</a>
        </nav>
        <p className={styles.copy}>© {new Date().getFullYear()} thePickWise · thepickwise.in</p>
        <p className={styles.disclaim}>This site contains affiliate links. Clicking them and purchasing helps support this site at no extra cost to you.</p>
      </div>
    </footer>
  )
}
