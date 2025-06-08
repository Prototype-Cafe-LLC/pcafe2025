import styles from './EventsPage.module.css'

export function EventsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Events Calendar</h1>
        <p className={styles.subtitle}>
          Discover upcoming IoT events, workshops, and community gatherings
        </p>
      </header>
      
      <section className={styles.content}>
        <div className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>Event Calendar Coming Soon</h2>
          <p className={styles.placeholderText}>
            We're building an interactive event calendar that will showcase:
          </p>
          <ul className={styles.featureList}>
            <li>Upcoming IoT workshops and seminars</li>
            <li>Community tech meetups</li>
            <li>Project showcase events</li>
            <li>Collaborative development sessions</li>
          </ul>
        </div>
      </section>
    </div>
  )
}