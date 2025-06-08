import { call, put, takeEvery } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import { 
  fetchEventsSuccess, 
  fetchEventsFailure 
} from '../slices/eventsSlice'

interface FetchEventsParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

// API call functions
async function fetchEventsApi(params: FetchEventsParams = {}) {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.startDate) searchParams.append('start_date', params.startDate)
  if (params.endDate) searchParams.append('end_date', params.endDate)
  
  const response = await fetch(`/api/events?${searchParams.toString()}`)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to fetch events')
  }
  
  return response.json()
}

async function fetchEventBySlugApi(slug: string) {
  const response = await fetch(`/api/events/${slug}`)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to fetch event')
  }
  
  return response.json()
}

// Saga workers
function* fetchEventsSaga(action: PayloadAction<FetchEventsParams>): Generator {
  try {
    const data = yield call(fetchEventsApi, action.payload)
    yield put(fetchEventsSuccess(data))
  } catch (error) {
    yield put(fetchEventsFailure(error instanceof Error ? error.message : 'Failed to fetch events'))
  }
}

function* fetchEventBySlugSaga(action: PayloadAction<string>): Generator {
  try {
    const event = yield call(fetchEventBySlugApi, action.payload)
    // We could add a specific action for this if needed
    yield put(fetchEventsSuccess({ events: [event], pagination: { page: 1, limit: 1, total: 1 } }))
  } catch (error) {
    yield put(fetchEventsFailure(error instanceof Error ? error.message : 'Failed to fetch event'))
  }
}

// Saga watchers
export function* watchEvents() {
  yield takeEvery('events/fetch', fetchEventsSaga)
  yield takeEvery('events/fetchBySlug', fetchEventBySlugSaga)
}