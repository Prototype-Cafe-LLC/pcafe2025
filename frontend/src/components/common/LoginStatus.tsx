import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import styles from './LoginStatus.module.css'

export function LoginStatus() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.container}>
        <div className={styles.status}>
          <span className={styles.indicator}></span>
          <span className={styles.text}>Not logged in</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.status}>
        <span className={`${styles.indicator} ${styles.loggedIn}`}></span>
        <span className={styles.text}>
          {user.username}
          {user.is_admin && <span className={styles.adminBadge}>Admin</span>}
        </span>
      </div>
    </div>
  )
}