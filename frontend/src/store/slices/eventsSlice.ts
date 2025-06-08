import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  organizer: string
  organizerUrl?: string
  eventUrl?: string
  slug: string
  createdAt: string
  updatedAt: string
}

interface EventsState {
  events: Event[]
  selectedEvent: Event | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchEventsSuccess: (state, action: PayloadAction<{
      events: Event[]
      pagination: { page: number; limit: number; total: number }
    }>) => {
      state.loading = false
      state.events = action.payload.events
      state.pagination = action.payload.pagination
      state.error = null
    },
    fetchEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    selectEvent: (state, action: PayloadAction<Event>) => {
      state.selectedEvent = action.payload
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload)
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload)
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  selectEvent,
  clearSelectedEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  clearError
} = eventsSlice.actions

export default eventsSlice.reducer