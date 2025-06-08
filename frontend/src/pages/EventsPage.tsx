import { EventCalendar } from '../components/calendar/EventCalendar'
import styles from './EventsPage.module.css'

export function EventsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Events Calendar</h1>
        <p className={styles.subtitle}>
          Discover upcoming IoT events, workshops, and networking opportunities
        </p>
      </header>

      <div className={styles.content}>
        <EventCalendar 
          view="grid" 
          showPastEvents={false}
        />
      </div>
    </div>
  )
}