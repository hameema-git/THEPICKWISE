import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const loc = useLocation()
  const active = (p) => loc.pathname === p ? styles.active : ''

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoWrap} onClick={() => setOpen(false)}>
          <Logo variant="dark" height={36} />
        </Link>
        <div className={styles.links}>
          <Link to="/"           className={`${styles.link} ${active('/')}`}>Products</Link>
          <Link to="/picks"      className={`${styles.link} ${active('/picks')}`}>⭐ Favourites</Link>
          <Link to="/disclosure" className={`${styles.link} ${active('/disclosure')}`}>About</Link>
          <a href="https://instagram.com/thepickwise" target="_blank" rel="noreferrer"
            className={styles.instaBtn}>📸 Instagram</a>
          {!installed && installPrompt && (
            <button onClick={handleInstall} className={styles.installBtn}>
              📲 Install App
            </button>
          )}
        </div>
        <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <div className={styles.mobileMenu}>
          <Link to="/"           onClick={() => setOpen(false)} className={styles.mobileLink}>🌟 All Products</Link>
          <Link to="/picks"      onClick={() => setOpen(false)} className={styles.mobileLink}>⭐ My Favourites</Link>
          <Link to="/disclosure" onClick={() => setOpen(false)} className={styles.mobileLink}>ℹ️ About</Link>
          <a href="https://instagram.com/thepickwise" target="_blank" rel="noreferrer"
            className={styles.mobileLink}>📸 @thepickwise</a>
          {!installed && (
            <button onClick={handleInstall || (() => {})} className={styles.mobileLinkInstall}>
              📲 Download App to Phone
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
