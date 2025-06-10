import { useNavigate, Link } from 'react-router-dom'
import { useGetList } from 'react-admin'

export function Dashboard() {
  const navigate = useNavigate()
  
  // Fetch real statistics
  const { data: events } = useGetList('events', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' }
  })
  
  const { data: blogPosts } = useGetList('blog', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' }
  })
  
  const { data: contactSubmissions } = useGetList('contact', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'created_at', order: 'DESC' }
  })
  
  const { data: iotDevices } = useGetList('iot/devices', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'last_seen', order: 'DESC' }
  })
  
  // Calculate statistics
  const eventsCount = events?.length || 0
  const blogPostsCount = blogPosts?.length || 0
  const newContactsCount = contactSubmissions?.filter((contact: { status: string }) => contact.status === 'new').length || 0
  const activeDevicesCount = iotDevices?.length || 0
  
  const handleEventsClick = () => {
    navigate('/admin/events')
  }
  
  const handleBlogClick = () => {
    navigate('/admin/blog')
  }
  
  const handleContactClick = () => {
    navigate('/admin/contact')
  }
  
  const handleIoTClick = () => {
    navigate('/admin/iot')
  }
  
  const handleTestingClick = () => {
    navigate('/admin/testing')
  }
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome to the PCafe 2025 Administration Panel</p>
        </div>
        <a 
          href="/" 
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#16a085',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          ← Back to Main Site
        </a>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '2rem' }}>
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>Event Management</h3>
          <p>Manage events, workshops, and meetups</p>
          <button 
            onClick={handleEventsClick}
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#16a085',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Manage Events
          </button>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>Blog Management</h3>
          <p>Create and edit blog posts and articles</p>
          <button 
            onClick={handleBlogClick}
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#16a085',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Manage Blog
          </button>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>Contact Management</h3>
          <p>Manage contact form submissions</p>
          <div style={{ marginTop: '1rem', color: '#64748b' }}>
            <div>New Messages: {newContactsCount}</div>
            <div>Total Contacts: {contactSubmissions?.length || 0}</div>
          </div>
          <button 
            onClick={handleContactClick}
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#16a085',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Manage Contacts
          </button>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>IoT Data</h3>
          <p>Monitor sensor data and devices</p>
          <div style={{ marginTop: '1rem', color: '#64748b' }}>
            <div>Active Devices: {activeDevicesCount}</div>
            <div>Latest Data: {iotDevices?.[0]?.last_seen ? new Date(iotDevices[0].last_seen).toLocaleString() : 'No data'}</div>
          </div>
          <button 
            onClick={handleIoTClick}
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#16a085',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            View IoT Data
          </button>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>🧪 Testing Features</h3>
          <p>Test event forms, OCR, and calendar components</p>
          <div style={{ marginTop: '1rem', color: '#64748b' }}>
            <div>🔗 URL Extraction: ✅ Working</div>
            <div>🖼️ OCR Processing: ✅ Mock Ready</div>
            <div>📄 PDF Parsing: ✅ Mock Ready</div>
          </div>
          <button 
            onClick={handleTestingClick}
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🧪 Open Testing
          </button>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>System Overview</h3>
          <p>View analytics and system status</p>
          <div style={{ marginTop: '1rem', color: '#64748b' }}>
            <div>Events: {eventsCount} total</div>
            <div>Blog Posts: {blogPostsCount} published</div>
            <div>Last Update: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link 
          to="/" 
          style={{ 
            color: '#16a085',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          ← Back to Main Site
        </Link>
      </div>
    </div>
  )
}