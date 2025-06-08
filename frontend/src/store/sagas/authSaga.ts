import { call, put, takeEvery } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import { loginSuccess, loginFailure } from '../slices/authSlice'

interface LoginCredentials {
  email: string
  password: string
}

// API call functions
async function loginApi(credentials: LoginCredentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include', // Include cookies for session management
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Login failed')
  }
  
  return response.json()
}

async function logoutApi() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error('Logout failed')
  }
}

async function checkAuthApi() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error('Not authenticated')
  }
  
  return response.json()
}

// Saga workers
function* loginSaga(action: PayloadAction<LoginCredentials>): Generator {
  try {
    const user = yield call(loginApi, action.payload)
    yield put(loginSuccess(user))
  } catch (error) {
    yield put(loginFailure(error instanceof Error ? error.message : 'Login failed'))
  }
}

function* logoutSaga(): Generator {
  try {
    yield call(logoutApi)
  } catch (error) {
    // Even if logout API fails, clear local state
    console.error('Logout API failed:', error)
  }
}

function* checkAuthSaga(): Generator {
  try {
    const user = yield call(checkAuthApi)
    yield put(loginSuccess(user))
  } catch (error) {
    // User is not authenticated, do nothing
  }
}

// Saga watchers
export function* watchAuth() {
  yield takeEvery('auth/login', loginSaga)
  yield takeEvery('auth/logout', logoutSaga)
  yield takeEvery('auth/checkAuth', checkAuthSaga)
}