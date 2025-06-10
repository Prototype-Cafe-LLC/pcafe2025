import { AuthProvider } from 'react-admin'

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      return Promise.resolve()
    }
    
    const error = await response.json()
    return Promise.reject(new Error(error.error || 'Login failed'))
  },

  logout: async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    return Promise.resolve()
  },

  checkError: ({ status }: { status: number }) => {
    if (status === 401 || status === 403) {
      return Promise.reject()
    }
    return Promise.resolve()
  },

  checkAuth: async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        return Promise.resolve()
      }
      return Promise.reject()
    } catch {
      return Promise.reject()
    }
  },

  getPermissions: () => {
    return Promise.resolve('admin')
  },

  getIdentity: async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const user = await response.json()
        return Promise.resolve({
          id: user.id,
          fullName: user.username || 'Admin',
          username: user.username,
          avatar: undefined,
        })
      }
      return Promise.reject()
    } catch {
      return Promise.reject()
    }
  },
}

export default authProvider