import { useEffect, useState } from 'react'
import styles from './HomePage.module.css'

interface Event {
  id: number
  title: string
  date: string
  description: string
}

interface BlogPost {
  id: number
  title: string
  excerpt: string
  publishedAt: string
}

interface IoTData {
  temperature: number
  humidity: number
  lastUpdated: string
}

export function HomePage() {
  const [latestEvents, setLatestEvents] = useState<Event[]>([])
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [iotData, setIoTData] = useState<IoTData | null>(null)

  useEffect(() => {
    // TODO: Replace with actual API calls
    // Mock data for now
    setLatestEvents([
      {
        id: 1,
        title: "IoT Workshop: Sensor Networks",
        date: "2025-01-15",
        description: "Learn about building sensor networks with ESP32 and LoRaWAN"
      },
      {
        id: 2,
        title: "Tech Meetup: Edge Computing",
        date: "2025-01-22", 
        description: "Exploring edge computing solutions for IoT applications"
      }
    ])

    setRecentPosts([
      {
        id: 1,
        title: "Getting Started with MQTT",
        excerpt: "A comprehensive guide to MQTT protocol for IoT communication...",
        publishedAt: "2025-01-05"
      },
      {
        id: 2,
        title: "Building Smart Home Automation",
        excerpt: "Learn how to create your own smart home system using Arduino...",
        publishedAt: "2025-01-03"
      }
    ])

    setIoTData({
      temperature: 23.5,
      humidity: 65.2,
      lastUpdated: new Date().toLocaleString()
    })
  }, [])

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Prototype Cafe
          </h1>
          <p className={styles.heroSubtitle}>
            makes your idea into reality
          </p>
          <p className={styles.heroDescription}>
            Connecting ideas, building the future of IoT technology through innovation and collaboration
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton}>
              Explore Events
            </button>
            <button className={styles.secondaryButton}>
              View Projects
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>About Our Innovation Lab</h2>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p className={styles.aboutDescription}>
                Welcome to our IoT Innovation Lab, where creativity meets technology. 
                We're passionate about prototyping, experimenting, and building the next generation 
                of connected devices and smart solutions.
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>Rapid Prototyping</h3>
                  <p className={styles.featureDescription}>From concept to working prototype in record time</p>
                </div>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>Collaborative Space</h3>
                  <p className={styles.featureDescription}>Connect with like-minded innovators and makers</p>
                </div>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>Cutting-edge Tech</h3>
                  <p className={styles.featureDescription}>Access to latest IoT platforms and development tools</p>
                </div>
              </div>
            </div>
            <div className={styles.aboutImage}>
              <img 
                src="/office-space.jpg" 
                alt="PCafe Innovation Lab workspace with development tables, chairs, and IoT equipment" 
                className={styles.labPhoto}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className={styles.events}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <div className={styles.eventsGrid}>
            {latestEvents.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                <button className={styles.eventButton}>Learn More</button>
              </div>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <button className={styles.viewAllButton}>View All Events</button>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts Section */}
      <section className={styles.blog}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Latest Insights</h2>
          <div className={styles.blogGrid}>
            {recentPosts.map(post => (
              <article key={post.id} className={styles.blogCard}>
                <div className={styles.blogMeta}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <button className={styles.readMoreButton}>Read More</button>
              </article>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <button className={styles.viewAllButton}>View All Posts</button>
          </div>
        </div>
      </section>

      {/* IoT Highlights Section */}
      <section className={styles.iot}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Live IoT Data</h2>
          <div className={styles.iotContent}>
            {iotData && (
              <div className={styles.iotGrid}>
                <div className={styles.iotCard}>
                  <div className={styles.iotIcon}>🌡️</div>
                  <div className={styles.iotValue}>{iotData.temperature}°C</div>
                  <div className={styles.iotLabel}>Temperature</div>
                </div>
                <div className={styles.iotCard}>
                  <div className={styles.iotIcon}>💧</div>
                  <div className={styles.iotValue}>{iotData.humidity}%</div>
                  <div className={styles.iotLabel}>Humidity</div>
                </div>
                <div className={styles.iotCard}>
                  <div className={styles.iotIcon}>📊</div>
                  <div className={styles.iotValue}>Real-time</div>
                  <div className={styles.iotLabel}>Data Stream</div>
                </div>
              </div>
            )}
            <p className={styles.iotUpdate}>
              Last updated: {iotData?.lastUpdated}
            </p>
            <div className={styles.sectionFooter}>
              <button className={styles.viewAllButton}>View Detailed Analytics</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}