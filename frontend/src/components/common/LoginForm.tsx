import { useState } from 'react'

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
}

interface LoginFormProps {
  onLoginSuccess: (user: User) => void
  onCancel?: () => void
}

export function LoginForm({ onLoginSuccess, onCancel }: LoginFormProps) {
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin123' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`)
      }

      const result = await response.json()
      onLoginSuccess(result.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '2rem', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      backgroundColor: '#f8fafc',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h3>🔐 Admin Login Required</h3>
      <p>To test OCR and metadata extraction features, please log in as admin:</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Username:
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '4px',
                marginTop: '0.25rem'
              }}
              required
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password:
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '4px',
                marginTop: '0.25rem'
              }}
              required
            />
          </label>
        </div>

        {error && (
          <div style={{ 
            padding: '0.5rem', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              flex: 1,
              padding: '0.75rem', 
              backgroundColor: loading ? '#9ca3af' : '#16a085', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Logging in...' : '🚀 Login'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#374151', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        backgroundColor: '#dbeafe', 
        borderRadius: '4px', 
        fontSize: '0.85rem',
        color: '#1e40af'
      }}>
        <strong>Demo Credentials:</strong><br />
        Username: admin<br />
        Password: admin123
      </div>
    </div>
  )
}