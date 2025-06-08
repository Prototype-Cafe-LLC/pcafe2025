import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>PCafe 2025</h3>
            <p className={styles.description}>
              IoT Prototype Development Space for innovation and collaboration
            </p>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><a href="/events" className={styles.link}>Events</a></li>
              <li><a href="/blog" className={styles.link}>Blog</a></li>
              <li><a href="/graphs" className={styles.link}>IoT Data</a></li>
              <li><a href="/contact" className={styles.link}>Contact</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li><a href="/privacy" className={styles.link}>Privacy Policy</a></li>
              <li><a href="/terms" className={styles.link}>Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2025 PCafe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}