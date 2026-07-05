import { useAuth } from '../../context/AuthContext'
import StudioNav from './StudioNav'
import styles from './StudioLayout.module.css'

export default function StudioLayout({ title, children }) {
  const { session, signOut } = useAuth()

  return (
    <div className={styles.wrap}>
      <StudioNav />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.userMenu}>
            <span className={styles.email}>{session?.user?.email}</span>
            <button className={styles.logout} onClick={signOut}>Log Out</button>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
