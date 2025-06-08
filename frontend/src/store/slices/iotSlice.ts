import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IoTDataPoint {
  timestamp: string
  deviceId: string
  sensorType: string
  value: number
  unit: string
}

interface IoTState {
  data: IoTDataPoint[]
  loading: boolean
  error: string | null
  dateRange: {
    start: string | null
    end: string | null
  }
  selectedDevices: string[]
  selectedSensorTypes: string[]
}

const initialState: IoTState = {
  data: [],
  loading: false,
  error: null,
  dateRange: {
    start: null,
    end: null,
  },
  selectedDevices: [],
  selectedSensorTypes: [],
}

const iotSlice = createSlice({
  name: 'iot',
  initialState,
  reducers: {
    fetchDataStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchDataSuccess: (state, action: PayloadAction<IoTDataPoint[]>) => {
      state.loading = false
      state.data = action.payload
      state.error = null
    },
    fetchDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.dateRange = action.payload
    },
    clearDateRange: (state) => {
      state.dateRange = { start: null, end: null }
    },
    setSelectedDevices: (state, action: PayloadAction<string[]>) => {
      state.selectedDevices = action.payload
    },
    setSelectedSensorTypes: (state, action: PayloadAction<string[]>) => {
      state.selectedSensorTypes = action.payload
    },
    clearFilters: (state) => {
      state.selectedDevices = []
      state.selectedSensorTypes = []
      state.dateRange = { start: null, end: null }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  setDateRange,
  clearDateRange,
  setSelectedDevices,
  setSelectedSensorTypes,
  clearFilters,
  clearError,
} = iotSlice.actions

export default iotSlice.reducer