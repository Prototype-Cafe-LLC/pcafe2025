import { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../../store'
import { fetchEventsRequest } from '../../store/sagas/eventsSaga'
import styles from './EventCalendar.module.css'

interface Event {
  id: number
  title: string
  description: string
  event_url?: string
  image_url?: string
  start_date: string
  end_date?: string
  is_all_day: boolean
  organizer_name: string
  organizer_url?: string
  source_type?: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface CalendarEvent extends Event {
  isPast: boolean
  isToday: boolean
  isUpcoming: boolean
}

interface EventCalendarProps {
  view?: 'month' | 'list' | 'grid'
  showPastEvents?: boolean
  limit?: number
}

export function EventCalendar({ view = 'grid', showPastEvents = false, limit }: EventCalendarProps) {
  const dispatch = useDispatch()
  const { events, loading, error } = useSelector((state: RootState) => state.events)
  const [viewMode, setViewMode] = useState<'month' | 'list' | 'grid'>(view)

  useEffect(() => {
    // Fetch published events for main site
    dispatch(fetchEventsRequest({ published: true }))
  }, [dispatch])

  const processedEvents = useMemo((): CalendarEvent[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return events
      .filter(event => event.is_published)
      .map(event => {
        const startDate = new Date(event.start_date)
        const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        
        const isPast = eventDate < today
        const isToday = eventDate.getTime() === today.getTime()
        const isUpcoming = eventDate > today

        return {
          ...event,
          isPast,
          isToday,
          isUpcoming,
        }
      })
      .filter(event => showPastEvents || !event.isPast)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, limit || events.length)
  }, [events, showPastEvents, limit])

  const featuredEvents = useMemo(() => 
    processedEvents.filter(event => event.is_featured && !event.isPast),
    [processedEvents]
  )

  const upcomingEvents = useMemo(() => 
    processedEvents.filter(event => event.isUpcoming).slice(0, 5),
    [processedEvents]
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeIcon = (sourceType?: string) => {
    switch (sourceType) {
      case 'url': return '🔗'
      case 'image': return '🖼️'
      case 'pdf': return '📄'
      default: return '📅'
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error Loading Events</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Events Calendar</h2>
        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📊 Grid
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
          </div>
          <label className={styles.filterToggle}>
            <input
              type="checkbox"
              checked={showPastEvents}
              onChange={() => {}} // This would need to be managed at parent level
            />
            Show Past Events
          </label>
        </div>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className={styles.featuredSection}>
          <h3 className={styles.sectionTitle}>✨ Featured Events</h3>
          <div className={styles.featuredGrid}>
            {featuredEvents.map(event => (
              <div key={`featured-${event.id}`} className={styles.featuredEvent}>
                <div className={styles.featuredBadge}>Featured</div>
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className={styles.featuredImage} />
                )}
                <div className={styles.featuredContent}>
                  <h4 className={styles.featuredTitle}>
                    <Link to={`/events/${event.id}`}>
                      {event.title}
                    </Link>
                    {event.event_url && (
                      <a href={event.event_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', fontSize: '0.8em' }}>
                        🔗
                      </a>
                    )}
                  </h4>
                  <div className={styles.featuredMeta}>
                    <span className={styles.date}>{formatDate(event.start_date)}</span>
                    {!event.is_all_day && (
                      <span className={styles.time}>{formatTime(event.start_date)}</span>
                    )}
                  </div>
                  <p className={styles.featuredDescription}>{event.description}</p>
                  <div className={styles.featuredOrganizer}>
                    Organized by {event.organizer_url ? (
                      <a href={event.organizer_url} target="_blank" rel="noopener noreferrer">
                        {event.organizer_name}
                      </a>
                    ) : (
                      event.organizer_name
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Display */}
      <div className={styles.eventsSection}>
        <h3 className={styles.sectionTitle}>
          {showPastEvents ? 'All Events' : 'Upcoming Events'} 
          <span className={styles.eventCount}>({processedEvents.length})</span>
        </h3>

        {processedEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <h4>No Events Found</h4>
            <p>
              {showPastEvents 
                ? 'No events are currently scheduled.' 
                : 'No upcoming events. Check back later!'}
            </p>
          </div>
        ) : (
          <div className={`${styles.eventsGrid} ${styles[viewMode]}`}>
            {processedEvents.map(event => (
              <div 
                key={event.id} 
                className={`${styles.eventCard} ${event.isPast ? styles.pastEvent : ''} ${event.isToday ? styles.todayEvent : ''}`}
              >
                <div className={styles.eventHeader}>
                  <div className={styles.eventDate}>
                    <div className={styles.eventDay}>
                      {new Date(event.start_date).getDate()}
                    </div>
                    <div className={styles.eventMonth}>
                      {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className={styles.eventMeta}>
                    <span className={styles.eventType}>
                      {getEventTypeIcon(event.source_type)} {event.source_type || 'manual'}
                    </span>
                    {event.is_featured && <span className={styles.featuredTag}>⭐</span>}
                    {event.isPast && <span className={styles.pastTag}>Past</span>}
                    {event.isToday && <span className={styles.todayTag}>Today</span>}
                  </div>
                </div>

                <div className={styles.eventContent}>
                  <h4 className={styles.eventTitle}>
                    <Link to={`/events/${event.id}`}>
                      {event.title}
                    </Link>
                    {event.event_url && (
                      <a href={event.event_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', fontSize: '0.8em' }}>
                        🔗
                      </a>
                    )}
                  </h4>

                  <div className={styles.eventTime}>
                    {event.is_all_day ? (
                      <span>All Day</span>
                    ) : (
                      <>
                        <span>{formatTime(event.start_date)}</span>
                        {event.end_date && (
                          <span> - {formatTime(event.end_date)}</span>
                        )}
                      </>
                    )}
                  </div>

                  <p className={styles.eventDescription}>
                    {event.description.length > 150 
                      ? `${event.description.slice(0, 150)}...` 
                      : event.description}
                  </p>

                  <div className={styles.eventOrganizer}>
                    <span>Organized by </span>
                    {event.organizer_url ? (
                      <a href={event.organizer_url} target="_blank" rel="noopener noreferrer">
                        {event.organizer_name}
                      </a>
                    ) : (
                      event.organizer_name
                    )}
                  </div>
                </div>

                {event.image_url && (
                  <div className={styles.eventImage}>
                    <img src={event.image_url} alt={event.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Upcoming Events Sidebar */}
      {upcomingEvents.length > 0 && viewMode === 'grid' && (
        <div className={styles.upcomingSidebar}>
          <h4 className={styles.upcomingTitle}>Next 5 Events</h4>
          <div className={styles.upcomingList}>
            {upcomingEvents.map(event => (
              <div key={`upcoming-${event.id}`} className={styles.upcomingItem}>
                <div className={styles.upcomingDate}>
                  {new Date(event.start_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className={styles.upcomingInfo}>
                  <div className={styles.upcomingEventTitle}>
                    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {event.title}
                    </Link>
                  </div>
                  <div className={styles.upcomingTime}>
                    {event.is_all_day ? 'All Day' : formatTime(event.start_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}