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
import { Card, CardContent, Typography, Box, TextField as MuiTextField, Alert, Button as MuiButton } from '@mui/material'

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
      <Box>
        {/* Input Method Selection */}
        <Card style={{ marginBottom: '1rem' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Event Creation Method
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <MuiButton
                variant={metadataMode === 'manual' ? 'contained' : 'outlined'}
                onClick={() => setMetadataMode('manual')}
              >
                Manual Entry
              </MuiButton>
              <MuiButton
                variant={metadataMode === 'url' ? 'contained' : 'outlined'}
                onClick={() => setMetadataMode('url')}
              >
                Extract from URL
              </MuiButton>
              <MuiButton
                variant={metadataMode === 'image' ? 'contained' : 'outlined'}
                onClick={() => setMetadataMode('image')}
              >
                Process Image (OCR)
              </MuiButton>
              <MuiButton
                variant={metadataMode === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => setMetadataMode('pdf')}
              >
                Process PDF
              </MuiButton>
            </Box>
          </CardContent>
        </Card>

        {/* URL Extraction */}
        {metadataMode === 'url' && (
          <Card style={{ marginBottom: '1rem' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Extract Metadata from URL
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <MuiTextField
                  label="Event URL"
                  placeholder="https://example.com/event"
                  variant="outlined"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlExtraction((e.target as HTMLInputElement).value)
                    }
                  }}
                />
                <MuiButton
                  variant="contained"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                    handleUrlExtraction(input.value)
                  }}
                  disabled={loading}
                >
                  Extract
                </MuiButton>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Image Upload */}
        {metadataMode === 'image' && (
          <Card style={{ marginBottom: '1rem' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Image for OCR Processing
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <Typography variant="body2" color="textSecondary" style={{ marginTop: '0.5rem' }}>
                Supported formats: JPEG, PNG, GIF, BMP, WebP, TIFF
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* PDF Upload */}
        {metadataMode === 'pdf' && (
          <Card style={{ marginBottom: '1rem' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload PDF for Text Extraction
              </Typography>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={loading}
              />
              <Typography variant="body2" color="textSecondary" style={{ marginTop: '0.5rem' }}>
                PDF files will be processed to extract event information
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Loading and Error States */}
        {loading && (
          <Alert severity="info" style={{ marginBottom: '1rem' }}>
            Processing... Please wait.
          </Alert>
        )}

        {error && (
          <Alert severity="error" style={{ marginBottom: '1rem' }}>
            {error}
          </Alert>
        )}

        {/* Extracted Data Preview */}
        {extractedData && (
          <Card style={{ marginBottom: '1rem' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Extracted Data Preview
              </Typography>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </CardContent>
          </Card>
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
      </Box>
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