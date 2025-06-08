import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { fetchEventsStart } from '../store/slices/eventsSlice'
import styles from './EventsPage.module.css'

export function EventsPage() {
  const dispatch = useDispatch()
  const { events, loading, error } = useSelector((state: RootState) => state.events)

  useEffect(() => {
    dispatch(fetchEventsStart())
  }, [dispatch])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading events...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Events Calendar</h1>
        <p className={styles.subtitle}>
          Discover upcoming IoT events, workshops, and networking opportunities
        </p>
      </header>

      <div className={styles.content}>
        {events.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>No Events Scheduled</h2>
            <p className={styles.emptyText}>
              Check back later for upcoming IoT events and workshops.
            </p>
          </div>
        ) : (
          <div className={styles.eventGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventDate}>
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
                <h3 className={styles.eventTitle}>
                  {event.url ? (
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className={styles.eventLink}>
                      {event.title}
                    </a>
                  ) : (
                    event.title
                  )}
                </h3>
                <p className={styles.eventOrganizer}>
                  {event.organizerUrl ? (
                    <a href={event.organizerUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerLink}>
                      {event.organizer}
                    </a>
                  ) : (
                    event.organizer
                  )}
                </p>
                <p className={styles.eventDescription}>{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}