import { Link } from 'react-router-dom'
import { Navigation } from './Navigation'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1 className={styles.logoText}>PCafe 2025</h1>
          <span className={styles.logoSubtext}>IoT Prototype Lab</span>
        </Link>
        <Navigation />
      </div>
    </header>
  )
}