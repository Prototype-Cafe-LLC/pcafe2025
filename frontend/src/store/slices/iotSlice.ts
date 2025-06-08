import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IoTDataPoint {
  timestamp: string
  value: number
  unit: string
  deviceId: string
  metric: string
}

interface IoTDevice {
  id: string
  name: string
  location: string
  isActive: boolean
  lastSeen: string
}

interface IoTState {
  data: IoTDataPoint[]
  devices: IoTDevice[]
  selectedDevice: IoTDevice | null
  loading: boolean
  error: string | null
  filters: {
    deviceId?: string
    metric?: string
    startDate?: string
    endDate?: string
  }
  aggregation: 'raw' | 'hourly' | 'daily' | 'weekly'
}

const initialState: IoTState = {
  data: [],
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,
  filters: {},
  aggregation: 'hourly'
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
    fetchDevicesStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchDevicesSuccess: (state, action: PayloadAction<IoTDevice[]>) => {
      state.loading = false
      state.devices = action.payload
      state.error = null
    },
    fetchDevicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    selectDevice: (state, action: PayloadAction<IoTDevice>) => {
      state.selectedDevice = action.payload
    },
    clearSelectedDevice: (state) => {
      state.selectedDevice = null
    },
    setFilters: (state, action: PayloadAction<{
      deviceId?: string
      metric?: string
      startDate?: string
      endDate?: string
    }>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setAggregation: (state, action: PayloadAction<'raw' | 'hourly' | 'daily' | 'weekly'>) => {
      state.aggregation = action.payload
    },
    addDataPoint: (state, action: PayloadAction<IoTDataPoint>) => {
      state.data.push(action.payload)
      // Keep data sorted by timestamp
      state.data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  fetchDevicesStart,
  fetchDevicesSuccess,
  fetchDevicesFailure,
  selectDevice,
  clearSelectedDevice,
  setFilters,
  clearFilters,
  setAggregation,
  addDataPoint,
  clearError
} = iotSlice.actions

export default iotSlice.reducer