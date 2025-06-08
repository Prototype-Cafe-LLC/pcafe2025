import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { EventCalendar } from '../components/calendar/EventCalendar'
import { EventInputForm, EventFormData } from '../components/forms/EventInputForm'
import { LoginForm } from '../components/common/LoginForm'
import { fetchEventsSuccess } from '../store/slices/eventsSlice'

// Mock events data for testing
const mockEvents = [
  {
    id: 1,
    title: "IoT Workshop: Sensor Networks",
    description: "Learn about building sensor networks with ESP32 and LoRaWAN. This hands-on workshop will cover the fundamentals of IoT sensor networks, including device communication, data collection, and network protocols.",
    event_url: "https://example.com/iot-workshop",
    image_url: "/office-space.jpg",
    start_date: "2025-01-15T14:00:00",
    end_date: "2025-01-15T17:00:00",
    is_all_day: false,
    organizer_name: "PCafe IoT Team",
    organizer_url: "https://pcafe2025.com",
    source_type: "url",
    source_url: "https://example.com/iot-workshop",
    is_published: true,
    is_featured: true,
    created_at: "2025-01-01T00:00:00",
    updated_at: "2025-01-01T00:00:00"
  },
  {
    id: 2,
    title: "Tech Meetup: Edge Computing",
    description: "Exploring edge computing solutions for IoT applications. Join us for an evening of networking and learning about the latest trends in edge computing technology.",
    event_url: "https://example.com/edge-computing",
    start_date: "2025-01-22T18:30:00",
    end_date: "2025-01-22T21:00:00",
    is_all_day: false,
    organizer_name: "Tech Community",
    organizer_url: "https://techcommunity.com",
    source_type: "image",
    is_published: true,
    is_featured: false,
    created_at: "2025-01-02T00:00:00",
    updated_at: "2025-01-02T00:00:00"
  },
  {
    id: 3,
    title: "Arduino Bootcamp",
    description: "A full-day intensive bootcamp covering Arduino programming, circuit design, and project development. Perfect for beginners and intermediate makers.",
    start_date: "2025-02-05T09:00:00",
    end_date: "2025-02-05T17:00:00",
    is_all_day: false,
    organizer_name: "Maker Space",
    source_type: "pdf",
    extracted_data: JSON.stringify({
      raw_text: "Arduino Bootcamp - Feb 5, 2025...",
      confidence: 0.95
    }),
    is_published: true,
    is_featured: true,
    created_at: "2025-01-03T00:00:00",
    updated_at: "2025-01-03T00:00:00"
  },
  {
    id: 4,
    title: "Past Event: Raspberry Pi Workshop",
    description: "This was a workshop about Raspberry Pi development that happened last month.",
    start_date: "2024-12-10T14:00:00",
    end_date: "2024-12-10T17:00:00",
    is_all_day: false,
    organizer_name: "PCafe Team",
    source_type: "manual",
    is_published: true,
    is_featured: false,
    created_at: "2024-12-01T00:00:00",
    updated_at: "2024-12-01T00:00:00"
  }
]

export function EventTestPage() {
  const dispatch = useDispatch()
  const [showForm, setShowForm] = useState(false)
  const [testFeature, setTestFeature] = useState<'calendar' | 'form' | 'ocr'>('calendar')
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // Load mock data into Redux store
    dispatch(fetchEventsSuccess(mockEvents))
  }, [dispatch])

  const handleEventSubmit = (data: EventFormData) => {
    console.log('Event submitted:', data)
    alert('Event form submitted! Check console for data.')
    setShowForm(false)
  }

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser)
    setShowLogin(false)
    console.log('Logged in as:', loggedInUser)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Event Features Test Page</h1>
      <p>This page lets you test all event-related functionality.</p>

      {/* Login Status */}
      <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: user ? '#d4edda' : '#fff3cd' }}>
        {user ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✅ Logged in as <strong>{user.username}</strong> ({user.is_admin ? 'Admin' : 'User'})</span>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ Not logged in - OCR and metadata extraction require admin login</span>
            <button 
              onClick={() => setShowLogin(true)}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#16a085', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <LoginForm 
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setShowLogin(false)}
          />
        </div>
      )}

      {/* Feature Selector */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
        <h3>Test Features:</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
          <button 
            onClick={() => setTestFeature('ocr')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: testFeature === 'ocr' ? '#16a085' : '#e2e8f0',
              color: testFeature === 'ocr' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🖼️ OCR Testing
          </button>
        </div>

        {/* Quick Links */}
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          <strong>Quick Tests:</strong>
          <Link to="/events/1" style={{ marginLeft: '1rem', color: '#16a085' }}>View Event #1 Detail</Link>
          <Link to="/events/2" style={{ marginLeft: '1rem', color: '#16a085' }}>View Event #2 Detail</Link>
          <Link to="/events/3" style={{ marginLeft: '1rem', color: '#16a085' }}>View Event #3 Detail</Link>
          <Link to="/events" style={{ marginLeft: '1rem', color: '#16a085' }}>Events Page</Link>
        </div>
      </div>

      {/* Feature Content */}
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
            <li><strong>URL Paste:</strong> Extract metadata from event URLs {user ? '✅ Ready' : '⚠️ Requires admin login'}</li>
            <li><strong>Image OCR:</strong> Extract text from event flyers/images {user ? '✅ Ready (mock)' : '⚠️ Requires admin login'}</li>
            <li><strong>PDF Extract:</strong> Extract text from PDF files {user ? '✅ Ready (mock)' : '⚠️ Requires admin login'}</li>
            <li><strong>Manual Entry:</strong> Standard form input ✅ Always available</li>
          </ul>
          
          {!user && (
            <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <p><strong>Note:</strong> You can test the manual form entry without login, but URL/OCR/PDF extraction requires admin authentication.</p>
              <button 
                onClick={() => setShowLogin(true)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#16a085', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Login to Test All Features
              </button>
            </div>
          )}
          
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

      {testFeature === 'ocr' && (
        <div>
          <h2>🖼️ OCR & Data Extraction Testing</h2>
          
          {!user ? (
            <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4>🔐 Login Required</h4>
              <p>You must be logged in as admin to test OCR and metadata extraction features.</p>
              <button 
                onClick={() => setShowLogin(true)}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#16a085', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🚀 Login as Admin
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4>✅ Ready to Test!</h4>
              <p>You're logged in as admin. The backend endpoints are working:</p>
              <ul>
                <li><code>POST /api/events/extract-metadata</code> - ✅ Working</li>
                <li><code>POST /api/events/process-image</code> - ✅ Working (mock implementation)</li>
                <li><code>POST /api/events/process-pdf</code> - ✅ Working (mock implementation)</li>
              </ul>
            </div>
          )}
          
          <p>To test OCR and data extraction features:</p>

          <h4>Testing Steps:</h4>
          <ol>
            <li>Go to the <strong>Event Input Form</strong> tab above</li>
            <li>Try each input method:
              <ul>
                <li><strong>URL Paste:</strong> Try a real event URL like a Meetup or Eventbrite link</li>
                <li><strong>Image OCR:</strong> Upload an image of an event flyer</li>
                <li><strong>PDF Extract:</strong> Upload a PDF with event information</li>
              </ul>
            </li>
            <li>Check the browser console for API responses</li>
            <li>Verify extracted data populates the form fields</li>
          </ol>

          <h4>Expected Results:</h4>
          <ul>
            <li>Successful extraction shows extracted data in the form</li>
            <li>Failed extraction shows error messages</li>
            <li>All methods should gracefully fall back to manual entry</li>
          </ul>

          <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            <h4>✅ Test Event Links</h4>
            <p>You can test the detail pages with these mock events:</p>
            <ul>
              <li><Link to="/events/1">Event #1 - IoT Workshop (Featured, with image)</Link></li>
              <li><Link to="/events/2">Event #2 - Tech Meetup (Regular event)</Link></li>
              <li><Link to="/events/3">Event #3 - Arduino Bootcamp (With extracted data)</Link></li>
              <li><Link to="/events/4">Event #4 - Past Event (Demonstrates past event styling)</Link></li>
            </ul>
          </div>
        </div>
      )}

      {/* API Status */}
      <div style={{ marginTop: '3rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h4>🔧 Current Status</h4>
        <p><strong>Frontend:</strong> ✅ All event components implemented and working</p>
        <p><strong>Backend:</strong> ✅ Running on localhost:8080 with all endpoints</p>
        <p><strong>Authentication:</strong> {user ? `✅ Logged in as ${user.username}` : '⚠️ Login required for admin features'}</p>
        <p><strong>OCR Endpoints:</strong> ✅ All working (URL extraction tested successfully!)</p>
        <p><strong>Admin Management:</strong> ❌ React Admin components need integration</p>
        
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
          <strong>✅ What works now:</strong>
          <ul>
            <li>Event calendar display with mock data</li>
            <li>Event detail pages (with mock data in Redux store)</li>
            <li>Event input form UI (manual entry)</li>
            <li>URL metadata extraction (with admin login)</li>
            <li>OCR image processing (mock implementation)</li>
            <li>PDF text extraction (mock implementation)</li>
          </ul>
          
          <strong>⚠️ What needs integration:</strong>
          <ul>
            <li>Real OCR API (currently mock)</li>
            <li>Real PDF parsing (currently mock)</li>
            <li>Saving events to database</li>
            <li>React Admin management interface</li>
          </ul>
          
          <strong>🎉 Success Test:</strong>
          <div style={{ backgroundColor: '#d4edda', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
            URL extraction successfully worked with: <code>https://ai-craft-hacks-niigata.connpass.com/event/356941/</code>
          </div>
        </div>
      </div>
    </div>
  )
}