import { Link, useLocation } from 'react-router-dom'
import styles from './Navigation.module.css'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/events', label: 'Events' },
  { path: '/blog', label: 'Blog' },
  { path: '/graphs', label: 'IoT Data' },
  { path: '/contact', label: 'Contact' },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.path} className={styles.navItem}>
            <Link
              to={item.path}
              className={`${styles.navLink} ${
                location.pathname === item.path ? styles.active : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}