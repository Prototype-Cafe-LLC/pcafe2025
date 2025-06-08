import styles from './Footer.module.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.info}>
            <h3 className={styles.title}>PCafe 2025</h3>
            <p className={styles.description}>
              IoT Prototype Development Space - Innovating the future of connected devices
            </p>
          </div>
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Explore</h4>
              <ul className={styles.linkList}>
                <li><a href="/events" className={styles.link}>Events</a></li>
                <li><a href="/blog" className={styles.link}>Blog</a></li>
                <li><a href="/graphs" className={styles.link}>IoT Data</a></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Connect</h4>
              <ul className={styles.linkList}>
                <li><a href="/contact" className={styles.link}>Contact Us</a></li>
                <li><a href="#" className={styles.link}>Privacy Policy</a></li>
                <li><a href="#" className={styles.link}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} PCafe 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}