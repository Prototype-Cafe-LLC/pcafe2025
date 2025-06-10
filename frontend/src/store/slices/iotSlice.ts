import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChartDataResponse, Device } from '../../services/iot'

interface IoTDataPoint {
  timestamp: string
  deviceId: string
  sensorType: string
  value: number
  unit: string
}

export interface FetchChartDataAction {
  range?: '3d' | '1w' | '1m'
  deviceId?: string
  sensorTypes?: string[]
}

interface IoTState {
  data: IoTDataPoint[]
  chartData: ChartDataResponse | null
  devices: Device[]
  loading: boolean
  error: string | null
  selectedRange: '3d' | '1w' | '1m'
  selectedDevices: string[]
  selectedSensorTypes: string[]
  autoRefresh: boolean
  lastUpdated: string | null
}

const initialState: IoTState = {
  data: [],
  chartData: null,
  devices: [],
  loading: false,
  error: null,
  selectedRange: '3d',
  selectedDevices: [],
  selectedSensorTypes: ['temperature', 'co2'],
  autoRefresh: false,
  lastUpdated: null,
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
    fetchChartDataStart: {
      reducer: (state) => {
        state.loading = true
        state.error = null
      },
      prepare: (params: FetchChartDataAction) => ({ payload: params })
    },
    fetchChartDataSuccess: (state, action: PayloadAction<ChartDataResponse>) => {
      state.loading = false
      state.chartData = action.payload
      state.lastUpdated = new Date().toISOString()
      state.error = null
    },
    fetchChartDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    fetchDevicesStart: (state) => {
      state.error = null
    },
    fetchDevicesSuccess: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload
      state.error = null
    },
    fetchDevicesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setSelectedRange: (state, action: PayloadAction<'3d' | '1w' | '1m'>) => {
      state.selectedRange = action.payload
    },
    setSelectedDevices: (state, action: PayloadAction<string[]>) => {
      state.selectedDevices = action.payload
    },
    setSelectedSensorTypes: (state, action: PayloadAction<string[]>) => {
      state.selectedSensorTypes = action.payload
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload
    },
    clearFilters: (state) => {
      state.selectedDevices = []
      state.selectedSensorTypes = ['temperature', 'co2']
      state.selectedRange = '3d'
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
  fetchChartDataStart,
  fetchChartDataSuccess,
  fetchChartDataFailure,
  fetchDevicesStart,
  fetchDevicesSuccess,
  fetchDevicesFailure,
  setSelectedRange,
  setSelectedDevices,
  setSelectedSensorTypes,
  setAutoRefresh,
  clearFilters,
  clearError,
} = iotSlice.actions

export default iotSlice.reducer