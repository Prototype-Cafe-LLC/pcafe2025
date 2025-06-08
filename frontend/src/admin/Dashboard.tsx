import { Link } from 'react-router-dom'

export function Dashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the PCafe 2025 Administration Panel</p>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '2rem' }}>
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>Event Management</h3>
          <p>Manage events, workshops, and meetups</p>
          <Link 
            to="/admin/events" 
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#16a085',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem'
            }}
          >
            Manage Events
          </Link>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>Blog Management</h3>
          <p>Create and edit blog posts and articles</p>
          <Link 
            to="/admin/blog" 
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#16a085',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '1rem'
            }}
          >
            Manage Blog
          </Link>
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
            <div>Events: 12 active</div>
            <div>Blog Posts: 8 published</div>
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