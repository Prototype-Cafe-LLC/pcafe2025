import { apiClient } from './api'

interface RawDataPoint {
  time: string
  value: number
}

interface AggregatedDataPoint {
  time: string
  high: number
  low: number
  avg: number
  count: number
}

interface ChartDataResponse {
  data: {
    [sensorType: string]: RawDataPoint[] | AggregatedDataPoint[]
  }
  meta: {
    range: string
    startTime: string
    endTime: string
    binSize: string
    dataType: 'raw' | 'aggregated'
    sensorTypes: string[]
    deviceId?: string
  }
}

interface Device {
  device_id: string
  device_name: string
  device_type: string
  location: string
  last_seen: string
  sensor_types: string[]
}

interface ChartDataParams {
  range?: '3d' | '1w' | '1m'
  device_id?: string
  sensor_types?: string[]
}

interface SampleDataResponse {
  message: string
  count?: number
  period?: string
  devices?: string[]
  deleted_count?: number
  previous_count?: number
}

export class IoTService {
  static async getChartData(params: ChartDataParams = {}): Promise<ChartDataResponse> {
    const queryParams: Record<string, string | number | boolean> = {}
    
    if (params.range) {
      queryParams.range = params.range
    }
    
    if (params.device_id) {
      queryParams.device_id = params.device_id
    }
    
    if (params.sensor_types && params.sensor_types.length > 0) {
      // Handle multiple sensor types as query array
      const url = new URL('/api/iot/chart-data', window.location.origin)
      if (params.range) url.searchParams.append('range', params.range)
      if (params.device_id) url.searchParams.append('device_id', params.device_id)
      params.sensor_types.forEach(type => url.searchParams.append('sensor_types', type))
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return response.json()
    }
    
    return apiClient.get<ChartDataResponse>('/api/iot/chart-data', queryParams)
  }

  static async getDevices(): Promise<Device[]> {
    return apiClient.get<Device[]>('/api/iot/devices')
  }

  static async getLatestData(deviceId: string, sensorType?: string): Promise<unknown> {
    const params: Record<string, string> = { device_id: deviceId }
    if (sensorType) {
      params.sensor_type = sensorType
    }
    return apiClient.get('/api/iot/latest', params)
  }

  // Admin functions
  static async populateSampleData(): Promise<SampleDataResponse> {
    return apiClient.post<SampleDataResponse>('/api/iot/sample-data')
  }

  static async clearSampleData(): Promise<SampleDataResponse> {
    return apiClient.delete<SampleDataResponse>('/api/iot/sample-data')
  }
}

export type { ChartDataResponse, Device, RawDataPoint, AggregatedDataPoint, SampleDataResponse }