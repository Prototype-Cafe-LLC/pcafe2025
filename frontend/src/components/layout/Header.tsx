import { Link } from 'react-router-dom'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1 className={styles.logoText}>PCafe 2025</h1>
        </Link>
        
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link to="/" className={styles.navLink}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/events" className={styles.navLink}>
                Events
              </Link>
            </li>
            <li>
              <Link to="/blog" className={styles.navLink}>
                Blog
              </Link>
            </li>
            <li>
              <Link to="/graphs" className={styles.navLink}>
                IoT Data
              </Link>
            </li>
            <li>
              <Link to="/contact" className={styles.navLink}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}