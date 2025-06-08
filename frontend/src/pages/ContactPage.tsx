import { useState } from 'react'
import styles from './ContactPage.module.css'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // TODO: Implement contact form submission with Turnstile
      // For now, just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Get in touch with our IoT development team
        </p>
      </header>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>Visit Our Lab</h2>
            <p className={styles.infoText}>
              Experience our IoT prototype development space and see the latest innovations in action.
            </p>
          </div>
          
          <div className={styles.infoCard}>
            <h3 className={styles.infoSubtitle}>Location</h3>
            <p className={styles.infoText}>
              IoT Prototype Development Space<br />
              PCafe 2025
            </p>
          </div>
          
          <div className={styles.infoCard}>
            <h3 className={styles.infoSubtitle}>Interests</h3>
            <p className={styles.infoText}>
              IoT prototyping, sensor networks, data visualization, 
              hardware development, and collaborative innovation.
            </p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Send us a message</h2>
          
          {success && (
            <div className={styles.success}>
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Your name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="your.email@example.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="message" className={styles.label}>
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className={styles.textarea}
              placeholder="Tell us about your IoT project, questions, or how you'd like to collaborate..."
            />
          </div>

          <div className={styles.captchaPlaceholder}>
            <p className={styles.captchaText}>
              🔒 Cloudflare Turnstile CAPTCHA will be implemented here for spam protection
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}