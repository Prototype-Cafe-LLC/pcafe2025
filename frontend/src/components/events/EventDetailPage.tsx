import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './EventDetailPage.module.css'

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
  source_url?: string
  source_type?: string
  extracted_data?: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Event ID not provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/events/${id}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const eventData = await response.json()
        setEvent(eventData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      time: date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getEventTypeIcon = (sourceType?: string) => {
    switch (sourceType) {
      case 'url': return '🔗'
      case 'image': return '🖼️'
      case 'pdf': return '📄'
      default: return '📅'
    }
  }

  const isPastEvent = event ? new Date(event.start_date) < new Date() : false
  const isToday = event ? 
    new Date(event.start_date).toDateString() === new Date().toDateString() : false

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Event Not Found</h2>
          <p>{error || 'The requested event could not be found.'}</p>
          <button onClick={() => navigate('/events')} className={styles.backButton}>
            ← Back to Events
          </button>
        </div>
      </div>
    )
  }

  const startDateTime = formatDateTime(event.start_date)
  const endDateTime = event.end_date ? formatDateTime(event.end_date) : null

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate('/events')} className={styles.backButton}>
          ← Back to Events
        </button>
        
        <div className={styles.headerContent}>
          <div className={styles.metaTags}>
            <span className={`${styles.sourceTag} ${styles[event.source_type || 'manual']}`}>
              {getEventTypeIcon(event.source_type)} {event.source_type || 'manual'}
            </span>
            {event.is_featured && <span className={styles.featuredTag}>⭐ Featured</span>}
            {isPastEvent && <span className={styles.pastTag}>Past Event</span>}
            {isToday && <span className={styles.todayTag}>Today</span>}
          </div>

          <h1 className={styles.title}>{event.title}</h1>
          
          {event.organizer_name && (
            <div className={styles.organizer}>
              <span>Organized by </span>
              {event.organizer_url ? (
                <a href={event.organizer_url} target="_blank" rel="noopener noreferrer" className={styles.organizerLink}>
                  {event.organizer_name}
                </a>
              ) : (
                <span className={styles.organizerName}>{event.organizer_name}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Event Image */}
        {event.image_url && (
          <div className={styles.imageSection}>
            <img src={event.image_url} alt={event.title} className={styles.eventImage} />
          </div>
        )}

        {/* Event Details */}
        <div className={styles.detailsSection}>
          <div className={styles.dateTimeCard}>
            <h3 className={styles.cardTitle}>📅 Date & Time</h3>
            <div className={styles.dateTime}>
              <div className={styles.startDate}>
                <strong>{startDateTime.date}</strong>
                {!event.is_all_day && (
                  <span className={styles.time}>{startDateTime.time}</span>
                )}
              </div>
              {endDateTime && (
                <div className={styles.endDate}>
                  <span>to</span>
                  <strong>{endDateTime.date}</strong>
                  {!event.is_all_day && (
                    <span className={styles.time}>{endDateTime.time}</span>
                  )}
                </div>
              )}
              {event.is_all_day && (
                <div className={styles.allDay}>All Day Event</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className={styles.descriptionCard}>
            <h3 className={styles.cardTitle}>📝 About This Event</h3>
            <div className={styles.description}>
              {event.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className={styles.linksCard}>
            <h3 className={styles.cardTitle}>🔗 Links</h3>
            <div className={styles.links}>
              {event.event_url && (
                <a 
                  href={event.event_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.eventLink}
                >
                  🎟️ Event Page
                </a>
              )}
              {event.organizer_url && (
                <a 
                  href={event.organizer_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.organizerLinkButton}
                >
                  👥 Organizer Website
                </a>
              )}
            </div>
          </div>

          {/* Source Information */}
          {event.source_url && (
            <div className={styles.sourceCard}>
              <h3 className={styles.cardTitle}>ℹ️ Source</h3>
              <div className={styles.sourceInfo}>
                <p>This event was imported from:</p>
                <a 
                  href={event.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.sourceLink}
                >
                  {event.source_url}
                </a>
                <span className={styles.sourceMethod}>
                  via {event.source_type || 'manual'} extraction
                </span>
              </div>
            </div>
          )}

          {/* Extracted Data (for debugging, admin view) */}
          {event.extracted_data && (
            <div className={styles.extractedDataCard}>
              <h3 className={styles.cardTitle}>🔍 Extracted Information</h3>
              <details className={styles.extractedDetails}>
                <summary>View raw extracted data</summary>
                <pre className={styles.extractedPre}>
                  {JSON.stringify(JSON.parse(event.extracted_data), null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        {event.event_url && (
          <a 
            href={event.event_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.primaryButton}
          >
            🎟️ View Event Details
          </a>
        )}
        <button 
          onClick={() => navigator.share?.({ 
            title: event.title, 
            text: event.description, 
            url: window.location.href 
          })} 
          className={styles.shareButton}
        >
          📤 Share Event
        </button>
      </div>
    </div>
  )
}