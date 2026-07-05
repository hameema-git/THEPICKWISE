import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './ProtectedRoute.module.css'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/studio/login" replace />
  }

  return children
}
