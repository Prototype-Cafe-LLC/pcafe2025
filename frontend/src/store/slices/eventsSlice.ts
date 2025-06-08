import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Event {
  id: number
  title: string
  description: string
  event_url?: string
  image_url?: string
  start_date: string
  end_date?: string
  is_all_day: boolean
  organizer_name: string
  organizer_url?: string
  source_url?: string
  source_type?: string
  extracted_data?: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface EventsState {
  events: Event[]
  selectedEvent: Event | null
  loading: boolean
  error: string | null
}

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchEventsSuccess: (state, action: PayloadAction<Event[]>) => {
      state.loading = false
      state.events = action.payload
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
      state.events.push(action.payload)
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
    },
    deleteEvent: (state, action: PayloadAction<number>) => {
      state.events = state.events.filter(event => event.id !== action.payload)
    },
    clearError: (state) => {
      state.error = null
    },
  },
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
  clearError,
} = eventsSlice.actions

export default eventsSlice.reducer