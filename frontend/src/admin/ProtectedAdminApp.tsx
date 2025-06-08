import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { loginSuccess, logout } from '../store/slices/authSlice'
import { LoginForm } from '../components/common/LoginForm'
import { AdminApp } from './AdminApp'

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
}

export function ProtectedAdminApp() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const userData = await response.json()
          if (userData.is_admin) {
            dispatch(loginSuccess(userData))
          }
        }
      } catch (error) {
        console.log('No existing session')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [dispatch])

  const handleLoginSuccess = (userData: User) => {
    dispatch(loginSuccess(userData))
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(logout())
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Show login form if not authenticated or not admin
  if (!isAuthenticated || !user?.is_admin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '2rem'
      }}>
        <h1 style={{ marginBottom: '2rem', color: '#374151' }}>
          PCafe 2025 Admin Panel
        </h1>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  // Show admin interface for authenticated admin users
  return (
    <div>
      {/* Admin header with logout */}
      <div style={{
        backgroundColor: '#16a085',
        color: 'white',
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Admin Panel</strong> - Welcome, {user.username}
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      <AdminApp />
    </div>
  )
}