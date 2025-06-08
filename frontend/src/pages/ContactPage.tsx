import styles from './ContactPage.module.css'

export function ContactPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Get in touch with our IoT development team
        </p>
      </header>
      
      <section className={styles.content}>
        <div className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>Contact Form Coming Soon</h2>
          <p className={styles.placeholderText}>
            Our secure contact form will include:
          </p>
          <ul className={styles.featureList}>
            <li>Cloudflare Turnstile spam protection</li>
            <li>Direct messaging to our team</li>
            <li>Project inquiry and collaboration requests</li>
            <li>Technical support and questions</li>
            <li>Partnership and business inquiries</li>
          </ul>
          <div className={styles.tempContact}>
            <p className={styles.tempText}>
              In the meantime, you can reach us through our existing channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}