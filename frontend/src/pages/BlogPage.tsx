import styles from './BlogPage.module.css'

export function BlogPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Latest insights, tutorials, and developments in IoT technology
        </p>
      </header>
      
      <section className={styles.content}>
        <div className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>Blog System Coming Soon</h2>
          <p className={styles.placeholderText}>
            Our blog will feature in-depth content including:
          </p>
          <ul className={styles.featureList}>
            <li>IoT development tutorials and guides</li>
            <li>Project case studies and technical insights</li>
            <li>Industry trends and emerging technologies</li>
            <li>Community-contributed articles and tips</li>
            <li>Hardware reviews and comparisons</li>
          </ul>
        </div>
      </section>
    </div>
  )
}