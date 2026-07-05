import { useAuth } from '../../context/AuthContext'
import styles from './StudioHome.module.css'

export default function StudioHome() {
  const { session, signOut } = useAuth()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🎉 You're in the Studio</h1>
      <p className={styles.sub}>Logged in as {session?.user?.email}</p>
      <p className={styles.note}>
        This is a placeholder — the full Dashboard (stats, products, categories, settings) is built in Phase 2.
      </p>
      <button className={styles.logoutBtn} onClick={signOut}>Log Out</button>
    </div>
  )
}
