import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import { eventService, EventListParams, Event } from '../../services/events'
import {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  selectEvent,
} from '../slices/eventsSlice'

// Action creators for saga triggers
export const fetchEventsRequest = createAction<EventListParams | undefined>('events/fetchEventsRequest')
export const fetchEventRequest = createAction<string | number>('events/fetchEventRequest')

// Saga workers
function* fetchEventsSaga(action: ReturnType<typeof fetchEventsRequest>) {
  try {
    yield put(fetchEventsStart())
    const events: Event[] = yield call(eventService.fetchEvents, action.payload || {})
    yield put(fetchEventsSuccess(events))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events'
    yield put(fetchEventsFailure(errorMessage))
  }
}

function* fetchEventSaga(action: ReturnType<typeof fetchEventRequest>) {
  try {
    const event: Event = yield call(eventService.fetchEvent, action.payload)
    yield put(selectEvent(event))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event'
    yield put(fetchEventsFailure(errorMessage))
  }
}

// Root events saga
export function* eventsSaga() {
  yield takeLatest(fetchEventsRequest.type, fetchEventsSaga)
  yield takeEvery(fetchEventRequest.type, fetchEventSaga)
}