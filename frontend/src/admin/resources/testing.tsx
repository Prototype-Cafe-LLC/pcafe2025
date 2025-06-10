import { 
  List, 
  Datagrid, 
  TextField, 
  DateField, 
  BooleanField
} from 'react-admin'
import { useState } from 'react'
import { EventCalendar } from '../../components/calendar/EventCalendar'
import { EventInputForm, EventFormData } from '../../components/forms/EventInputForm'

// Testing Dashboard Component
export const TestingDashboard = () => {
  const [testFeature, setTestFeature] = useState<'overview' | 'calendar' | 'form'>('overview')
  const [showForm, setShowForm] = useState(false)

  const handleEventSubmit = (data: EventFormData) => {
    console.log('Event submitted:', data)
    alert('Event form submitted! Check console for data.')
    setShowForm(false)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Event Features Testing</h1>
      <p>Test all event-related functionality with admin authentication already handled.</p>

      {/* Feature Selector */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
        <h3>Test Features:</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => setTestFeature('overview')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: testFeature === 'overview' ? '#16a085' : '#e2e8f0',
              color: testFeature === 'overview' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📋 Overview
          </button>
          <button 
            onClick={() => setTestFeature('calendar')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: testFeature === 'calendar' ? '#16a085' : '#e2e8f0',
              color: testFeature === 'calendar' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📅 Event Calendar
          </button>
          <button 
            onClick={() => setTestFeature('form')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: testFeature === 'form' ? '#16a085' : '#e2e8f0',
              color: testFeature === 'form' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📝 Event Input Form
          </button>
        </div>
      </div>

      {/* Feature Content */}
      {testFeature === 'overview' && (
        <div>
          <h2>📋 Testing Overview</h2>
          <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4>✅ Ready to Test!</h4>
            <p>You're in the admin interface with authentication handled. All backend endpoints are available:</p>
            <ul>
              <li><code>POST /api/events/extract-metadata</code> - ✅ Working</li>
              <li><code>POST /api/events/process-image</code> - ✅ Working (mock implementation)</li>
              <li><code>POST /api/events/process-pdf</code> - ✅ Working (mock implementation)</li>
            </ul>
          </div>

          <h4>Available Test Features:</h4>
          <ul>
            <li><strong>📅 Event Calendar:</strong> Test the calendar component with mock data</li>
            <li><strong>📝 Event Input Form:</strong> Test URL extraction, OCR, and PDF processing</li>
            <li><strong>📊 Events Management:</strong> Use the Events resource in the sidebar for CRUD operations</li>
            <li><strong>📮 Contact Forms:</strong> View submitted contact forms</li>
            <li><strong>📝 Blog Management:</strong> Create and edit blog posts</li>
            <li><strong>📈 IoT Data:</strong> View time-series IoT sensor data</li>
          </ul>

          <h4>Quick Links:</h4>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => setTestFeature('calendar')}
              style={{ 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#16a085', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              📅 Test Calendar
            </button>
            <button 
              onClick={() => setTestFeature('form')}
              style={{ 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#3498db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              📝 Test Form
            </button>
          </div>
        </div>
      )}

      {testFeature === 'calendar' && (
        <div>
          <h2>📅 Event Calendar Component</h2>
          <p>This shows the EventCalendar component with mock data. You can:</p>
          <ul>
            <li>Switch between Grid and List views</li>
            <li>Toggle past events on/off</li>
            <li>See featured events highlighted</li>
            <li>Click event titles to go to detail pages (if they have URLs)</li>
          </ul>
          <EventCalendar view="grid" showPastEvents={false} />
        </div>
      )}

      {testFeature === 'form' && (
        <div>
          <h2>📝 Event Input Form Component</h2>
          <p>This shows the EventInputForm with all input methods:</p>
          <ul>
            <li><strong>URL Paste:</strong> Extract metadata from event URLs ✅ Ready</li>
            <li><strong>Image OCR:</strong> Extract text from event flyers/images ✅ Ready (mock)</li>
            <li><strong>PDF Extract:</strong> Extract text from PDF files ✅ Ready (mock)</li>
            <li><strong>Manual Entry:</strong> Standard form input ✅ Always available</li>
          </ul>
          
          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)}
              style={{ 
                padding: '1rem 2rem', 
                backgroundColor: '#16a085', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🚀 Open Event Input Form
            </button>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <EventInputForm 
                onSubmit={handleEventSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Use TestingDashboard as the list component
export const TestList = () => <TestingDashboard />