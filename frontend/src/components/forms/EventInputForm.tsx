import { useState, useRef } from 'react'
import styles from './EventInputForm.module.css'

export interface EventFormData {
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
  source_type?: 'url' | 'image' | 'pdf' | 'manual'
  is_published: boolean
  is_featured: boolean
}

interface ExtractedData {
  success: boolean
  event_data: Partial<EventFormData>
  suggestions?: Record<string, string>
  raw_metadata?: Record<string, unknown>
  ocr_result?: Record<string, unknown>
  pdf_result?: Record<string, unknown>
}

interface EventInputFormProps {
  initialData?: Partial<EventFormData>
  onSubmit: (data: EventFormData) => void
  onCancel?: () => void
  loading?: boolean
}

export function EventInputForm({ initialData, onSubmit, onCancel, loading }: EventInputFormProps) {
  const [inputMethod, setInputMethod] = useState<'url' | 'image' | 'pdf' | 'manual'>('manual')
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    is_all_day: false,
    organizer_name: '',
    is_published: false,
    is_featured: false,
    source_type: 'manual',
    ...initialData,
  })
  const [extracting, setExtracting] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ExtractedData | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFormChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleURLExtraction = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a URL')
      return
    }

    setExtracting(true)
    try {
      const response = await fetch('/api/events/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url: urlInput }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ExtractedData = await response.json()
      
      if (result.success && result.event_data) {
        setExtractionResult(result)
        // Auto-fill form with extracted data
        setFormData(prev => ({
          ...prev,
          ...result.event_data,
          source_type: 'url',
          source_url: urlInput,
        }))
      }
    } catch (error) {
      console.error('Failed to extract metadata:', error)
      alert('Failed to extract metadata from URL. Please try again or enter details manually.')
    } finally {
      setExtracting(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setExtracting(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string
        
        try {
          const response = await fetch('/api/events/process-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ image_data: base64Data }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result: ExtractedData = await response.json()
          
          if (result.success && result.event_data) {
            setExtractionResult(result)
            // Auto-fill form with extracted data
            setFormData(prev => ({
              ...prev,
              ...result.event_data,
              source_type: 'image',
            }))
          }
        } catch (error) {
          console.error('Failed to process image:', error)
          alert('Failed to extract text from image. Please try again or enter details manually.')
        } finally {
          setExtracting(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to read file:', error)
      alert('Failed to read image file')
      setExtracting(false)
    }
  }

  const handlePDFUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    setExtracting(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string
        
        try {
          const response = await fetch('/api/events/process-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ pdf_data: base64Data }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result: ExtractedData = await response.json()
          
          if (result.success && result.event_data) {
            setExtractionResult(result)
            // Auto-fill form with extracted data
            setFormData(prev => ({
              ...prev,
              ...result.event_data,
              source_type: 'pdf',
            }))
          }
        } catch (error) {
          console.error('Failed to process PDF:', error)
          alert('Failed to extract text from PDF. Please try again or enter details manually.')
        } finally {
          setExtracting(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to read file:', error)
      alert('Failed to read PDF file')
      setExtracting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (inputMethod === 'image') {
      handleImageUpload(file)
    } else if (inputMethod === 'pdf') {
      handlePDFUpload(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please enter an event title')
      return
    }
    if (!formData.start_date) {
      alert('Please enter a start date')
      return
    }
    if (!formData.organizer_name.trim()) {
      alert('Please enter an organizer name')
      return
    }

    onSubmit(formData)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Add New Event</h2>

        {/* Input Method Selection */}
        <div className={styles.inputMethodSection}>
          <h3 className={styles.sectionTitle}>Input Method</h3>
          <div className={styles.methodButtons}>
            <button
              type="button"
              className={`${styles.methodButton} ${inputMethod === 'url' ? styles.active : ''}`}
              onClick={() => setInputMethod('url')}
            >
              📄 URL Paste
            </button>
            <button
              type="button"
              className={`${styles.methodButton} ${inputMethod === 'image' ? styles.active : ''}`}
              onClick={() => setInputMethod('image')}
            >
              🖼️ Image OCR
            </button>
            <button
              type="button"
              className={`${styles.methodButton} ${inputMethod === 'pdf' ? styles.active : ''}`}
              onClick={() => setInputMethod('pdf')}
            >
              📄 PDF Extract
            </button>
            <button
              type="button"
              className={`${styles.methodButton} ${inputMethod === 'manual' ? styles.active : ''}`}
              onClick={() => setInputMethod('manual')}
            >
              ✏️ Manual Entry
            </button>
          </div>
        </div>

        {/* Dynamic Input Section */}
        {inputMethod === 'url' && (
          <div className={styles.extractionSection}>
            <label className={styles.label}>
              Event URL:
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className={styles.input}
                placeholder="https://example.com/event"
              />
            </label>
            <button
              type="button"
              onClick={handleURLExtraction}
              disabled={extracting}
              className={styles.extractButton}
            >
              {extracting ? 'Extracting...' : 'Extract Metadata'}
            </button>
          </div>
        )}

        {(inputMethod === 'image' || inputMethod === 'pdf') && (
          <div className={styles.extractionSection}>
            <label className={styles.label}>
              Upload {inputMethod === 'image' ? 'Image' : 'PDF'} File:
              <input
                ref={fileInputRef}
                type="file"
                accept={inputMethod === 'image' ? 'image/*' : '.pdf'}
                onChange={handleFileUpload}
                className={styles.fileInput}
              />
            </label>
            {extracting && (
              <div className={styles.extracting}>
                Processing {inputMethod}...
              </div>
            )}
          </div>
        )}

        {/* Extraction Results */}
        {extractionResult && (
          <div className={styles.extractionResults}>
            <h4 className={styles.resultsTitle}>Extracted Information</h4>
            <div className={styles.resultsContent}>
              {extractionResult.suggestions && Object.entries(extractionResult.suggestions).map(([key, value]) => (
                <div key={key} className={styles.suggestion}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Form Fields */}
        <div className={styles.formFields}>
          <h3 className={styles.sectionTitle}>Event Details</h3>
          
          <label className={styles.label}>
            Title *
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Description
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </label>

          <div className={styles.dateSection}>
            <label className={styles.label}>
              Start Date *
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleFormChange('start_date', e.target.value)}
                className={styles.input}
                required
              />
            </label>

            <label className={styles.label}>
              End Date
              <input
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => handleFormChange('end_date', e.target.value)}
                className={styles.input}
              />
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_all_day}
                onChange={(e) => handleFormChange('is_all_day', e.target.checked)}
              />
              All Day Event
            </label>
          </div>

          <label className={styles.label}>
            Organizer Name *
            <input
              type="text"
              value={formData.organizer_name}
              onChange={(e) => handleFormChange('organizer_name', e.target.value)}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Organizer URL
            <input
              type="url"
              value={formData.organizer_url || ''}
              onChange={(e) => handleFormChange('organizer_url', e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Event URL
            <input
              type="url"
              value={formData.event_url || ''}
              onChange={(e) => handleFormChange('event_url', e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Image URL
            <input
              type="url"
              value={formData.image_url || ''}
              onChange={(e) => handleFormChange('image_url', e.target.value)}
              className={styles.input}
            />
          </label>

          <div className={styles.checkboxSection}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => handleFormChange('is_published', e.target.checked)}
              />
              Published (visible to public)
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleFormChange('is_featured', e.target.checked)}
              />
              Featured Event
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.actions}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  )
}