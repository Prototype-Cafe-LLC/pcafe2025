import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  ShowButton,
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  Create,
  UrlField,
  BooleanField,
  BooleanInput,
  Show,
  SimpleShowLayout,
  useNotify,
} from 'react-admin'
import { useState } from 'react'
import styles from './events.module.css'

export const EventList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="organizer_name" />
      <DateField source="start_date" />
      <TextField source="source_type" />
      <BooleanField source="is_published" />
      <BooleanField source="is_featured" />
      <UrlField source="event_url" />
      <ShowButton />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
)

export const EventEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" required />
      <TextInput source="description" multiline rows={4} />
      <DateTimeInput source="start_date" required />
      <DateTimeInput source="end_date" />
      <BooleanInput source="is_all_day" />
      <TextInput source="organizer_name" required />
      <TextInput source="organizer_url" />
      <TextInput source="event_url" />
      <TextInput source="image_url" />
      <TextInput source="source_url" />
      <TextInput source="source_type" />
      <BooleanInput source="is_published" />
      <BooleanInput source="is_featured" />
    </SimpleForm>
  </Edit>
)

// Enhanced Event Creation with File Upload and Metadata Extraction
export const EventCreate = () => {
  const [metadataMode, setMetadataMode] = useState<'manual' | 'url' | 'image' | 'pdf'>('manual')
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const notify = useNotify()

  const handleUrlExtraction = async (url: string) => {
    if (!url.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/events/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setExtractedData(result.event_data)
        notify('Metadata extracted successfully', { type: 'success' })
      } else {
        setError(result.error || 'Failed to extract metadata')
      }
    } catch (err) {
      setError('Network error during metadata extraction')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string
        
        const response = await fetch('/api/events/process-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ image_data: base64Data }),
        })
        
        const result = await response.json()
        
        if (result.success) {
          setExtractedData(result.event_data)
          notify('Image processed successfully', { type: 'success' })
        } else {
          setError(result.error || 'Failed to process image')
        }
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Error processing image')
      setLoading(false)
    }
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string
        
        const response = await fetch('/api/events/process-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ pdf_data: base64Data }),
        })
        
        const result = await response.json()
        
        if (result.success) {
          setExtractedData(result.event_data)
          notify('PDF processed successfully', { type: 'success' })
        } else {
          setError(result.error || 'Failed to process PDF')
        }
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Error processing PDF')
      setLoading(false)
    }
  }

  return (
    <Create>
      <div className={styles.container}>
        {/* Input Method Selection */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2 className={styles.title}>
              Event Creation Method
            </h2>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.button} ${metadataMode === 'manual' ? styles.contained : ''}`}
                onClick={() => setMetadataMode('manual')}
              >
                Manual Entry
              </button>
              <button
                className={`${styles.button} ${metadataMode === 'url' ? styles.contained : ''}`}
                onClick={() => setMetadataMode('url')}
              >
                Extract from URL
              </button>
              <button
                className={`${styles.button} ${metadataMode === 'image' ? styles.contained : ''}`}
                onClick={() => setMetadataMode('image')}
              >
                Process Image (OCR)
              </button>
              <button
                className={`${styles.button} ${metadataMode === 'pdf' ? styles.contained : ''}`}
                onClick={() => setMetadataMode('pdf')}
              >
                Process PDF
              </button>
            </div>
          </div>
        </div>

        {/* URL Extraction */}
        {metadataMode === 'url' && (
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h2 className={styles.title}>
                Extract Metadata from URL
              </h2>
              <div className={styles.inputContainer}>
                <input
                  className={styles.input}
                  placeholder="https://example.com/event"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlExtraction((e.target as HTMLInputElement).value)
                    }
                  }}
                />
                <button
                  className={`${styles.button} ${styles.contained}`}
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                    handleUrlExtraction(input.value)
                  }}
                  disabled={loading}
                >
                  Extract
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload */}
        {metadataMode === 'image' && (
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h2 className={styles.title}>
                Upload Image for OCR Processing
              </h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className={styles.fileInput}
              />
              <p className={styles.helpText}>
                Supported formats: JPEG, PNG, GIF, BMP, WebP, TIFF
              </p>
            </div>
          </div>
        )}

        {/* PDF Upload */}
        {metadataMode === 'pdf' && (
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h2 className={styles.title}>
                Upload PDF for Text Extraction
              </h2>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={loading}
                className={styles.fileInput}
              />
              <p className={styles.helpText}>
                PDF files will be processed to extract event information
              </p>
            </div>
          </div>
        )}

        {/* Loading and Error States */}
        {loading && (
          <div className={`${styles.alert} ${styles.info}`}>
            Processing... Please wait.
          </div>
        )}

        {error && (
          <div className={`${styles.alert} ${styles.error}`}>
            {error}
          </div>
        )}

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h2 className={styles.title}>
                Extracted Data Preview
              </h2>
              <pre className={styles.codeBlock}>
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Event Form */}
        <SimpleForm defaultValues={extractedData}>
          <TextInput source="title" required fullWidth />
          <TextInput source="description" multiline rows={4} fullWidth />
          <DateTimeInput source="start_date" required />
          <DateTimeInput source="end_date" />
          <BooleanInput source="is_all_day" />
          <TextInput source="organizer_name" required />
          <TextInput source="organizer_url" fullWidth />
          <TextInput source="event_url" fullWidth />
          <TextInput source="image_url" fullWidth />
          <TextInput source="source_url" fullWidth />
          <TextInput source="source_type" />
          <BooleanInput source="is_published" defaultValue={false} />
          <BooleanInput source="is_featured" defaultValue={false} />
        </SimpleForm>
      </div>
    </Create>
  )
}

export const EventShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="description" />
      <DateField source="start_date" />
      <DateField source="end_date" />
      <BooleanField source="is_all_day" />
      <TextField source="organizer_name" />
      <UrlField source="organizer_url" />
      <UrlField source="event_url" />
      <UrlField source="image_url" />
      <TextField source="source_url" />
      <TextField source="source_type" />
      <BooleanField source="is_published" />
      <BooleanField source="is_featured" />
      <TextField source="extracted_data" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
)