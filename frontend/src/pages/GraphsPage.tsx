import styles from './GraphsPage.module.css'

export function GraphsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>IoT Data Visualization</h1>
        <p className={styles.subtitle}>
          Real-time sensor data and analytics from our IoT devices
        </p>
      </header>
      
      <section className={styles.content}>
        <div className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>Interactive Charts Coming Soon</h2>
          <p className={styles.placeholderText}>
            Our data visualization platform will provide:
          </p>
          <ul className={styles.featureList}>
            <li>Real-time sensor data streaming</li>
            <li>Interactive charts with zoom and pan capabilities</li>
            <li>Historical data analysis and trends</li>
            <li>Custom dashboard configurations</li>
            <li>Data export and sharing features</li>
            <li>Multi-device comparison views</li>
          </ul>
        </div>
      </section>
    </div>
  )
}