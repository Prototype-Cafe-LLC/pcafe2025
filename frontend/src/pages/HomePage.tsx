import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          PCafe 2025
        </h1>
        <p className={styles.subtitle}>
          IoT Prototype Development Space
        </p>
      </header>
      
      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Welcome to our IoT Innovation Lab
          </h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Events</h3>
              <p className={styles.cardDescription}>Discover upcoming IoT events and workshops</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Data Visualization</h3>
              <p className={styles.cardDescription}>Real-time IoT sensor data and analytics</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Blog</h3>
              <p className={styles.cardDescription}>Latest insights and IoT developments</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}