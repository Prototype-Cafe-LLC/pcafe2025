import { useMemo, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  zoomPlugin
)

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

interface ChartData {
  [sensorType: string]: RawDataPoint[] | AggregatedDataPoint[]
}

interface ChartMeta {
  range: string
  dataType: 'raw' | 'aggregated'
  binSize: string
  sensorTypes: string[]
}

interface TimeSeriesChartProps {
  data: ChartData
  meta: ChartMeta
  loading?: boolean
  error?: string | null
}

const SENSOR_COLORS = {
  temperature: '#ff6384',
  humidity: '#36a2eb',
  co2: '#ffce56',
  ambient: '#4bc0c0',
  pressure: '#9966ff',
  light: '#ff9f40',
}

const SENSOR_UNITS = {
  temperature: '°C',
  humidity: '%',
  co2: 'ppm',
  ambient: 'lux',
  pressure: 'hPa',
  light: 'lux',
}

function isAggregatedData(data: RawDataPoint[] | AggregatedDataPoint[]): data is AggregatedDataPoint[] {
  return data.length > 0 && 'high' in data[0]
}

export function TimeSeriesChart({ data, meta, loading, error }: TimeSeriesChartProps) {
  const chartRef = useRef<ChartJS<'line', Array<{x: number; y: number}>, unknown>>(null)
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return { datasets: [] }
    }

    interface ChartDataset {
      label: string
      data: Array<{ x: number; y: number }>
      borderColor: string
      backgroundColor: string
      borderWidth: number
      fill: boolean | string
      pointRadius: number
      pointHoverRadius: number
      tension: number
      yAxisID: string
      borderDash?: number[]
      type?: 'line' | 'bar'
      barThickness?: string | number
    }
    
    const datasets: ChartDataset[] = []

    for (const [sensorType, points] of Object.entries(data)) {
      // Skip null or empty data
      if (!points || points.length === 0) {
        continue
      }
      
      const color = SENSOR_COLORS[sensorType as keyof typeof SENSOR_COLORS] || '#999999'
      const unit = SENSOR_UNITS[sensorType as keyof typeof SENSOR_UNITS] || ''

      if (meta.dataType === 'aggregated' && isAggregatedData(points)) {
        // Aggregated data - show min/max range and average
        const sortedPoints = [...points].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

        // Max line (for filling between min and max)
        datasets.push({
          label: `${sensorType} max (${unit})`,
          data: sortedPoints.map(point => ({
            x: new Date(point.time).getTime(),
            y: point.high,
          })),
          borderColor: color + '60', // 60% opacity
          backgroundColor: color + '20', // 20% opacity for fill
          borderWidth: 1,
          borderDash: [5, 5],
          fill: '+1', // Fill to next dataset (min)
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.1,
          yAxisID: sensorType,
        })

        // Min line
        datasets.push({
          label: `${sensorType} min (${unit})`,
          data: sortedPoints.map(point => ({
            x: new Date(point.time).getTime(),
            y: point.low,
          })),
          borderColor: color + '60', // 60% opacity
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.1,
          yAxisID: sensorType,
        })

        // Average line (on top)
        datasets.push({
          label: `${sensorType} avg (${unit})`,
          data: sortedPoints.map(point => ({
            x: new Date(point.time).getTime(),
            y: point.avg,
          })),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 3,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 6,
          tension: 0.1,
          yAxisID: sensorType,
        })
      } else {
        // Raw data - simple line chart
        const rawPoints = points as RawDataPoint[]
        const sortedPoints = [...rawPoints].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

        datasets.push({
          label: `${sensorType} (${unit})`,
          data: sortedPoints.map(point => ({
            x: new Date(point.time).getTime(),
            y: point.value,
          })),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.1,
          yAxisID: sensorType,
        })
      }
    }

    return { datasets }
  }, [data, meta])

  const chartOptions = useMemo(() => {
    interface YAxisConfig {
      type: 'linear'
      display: boolean
      position: 'left' | 'right'
      title: { display: boolean; text: string }
      grid: { display: boolean }
      min?: number
      max?: number
    }
    
    const yAxes: Record<string, YAxisConfig> = {}
    
    // Create separate Y-axis for each sensor type to handle different units
    let axisIndex = 0
    const sensorOrder = ['temperature', 'co2'] // Define order to ensure temperature is left, co2 is right
    
    sensorOrder.forEach((sensorType) => {
      if (!data || !data[sensorType] || data[sensorType].length === 0) {
        return
      }
      
      const unit = SENSOR_UNITS[sensorType as keyof typeof SENSOR_UNITS] || ''
      const isFirst = axisIndex === 0
      
      yAxes[sensorType] = {
        type: 'linear' as const,
        display: true, // Show both axes
        position: isFirst ? 'left' as const : 'right' as const,
        title: {
          display: true,
          text: `${sensorType} (${unit})`,
        },
        grid: {
          display: isFirst,
        },
      }
      
      // Set min/max for specific sensor types
      if (sensorType === 'temperature') {
        yAxes[sensorType].min = 0
        yAxes[sensorType].max = 40
      } else if (sensorType === 'co2') {
        yAxes[sensorType].min = 0
        yAxes[sensorType].max = 3000
      }
      
      axisIndex++
    })
    
    // Add any other sensor types that aren't in the predefined order
    Object.keys(data || {}).forEach((sensorType) => {
      if (!sensorOrder.includes(sensorType) && data[sensorType] && data[sensorType].length > 0) {
        const unit = SENSOR_UNITS[sensorType as keyof typeof SENSOR_UNITS] || ''
        yAxes[sensorType] = {
          type: 'linear' as const,
          display: false, // Hide additional axes
          position: 'right' as const,
          title: {
            display: true,
            text: `${sensorType} (${unit})`,
          },
          grid: {
            display: false,
          },
        }
      }
    })

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `IoT Sensor Data - Last ${meta.range === '3d' ? '3 Days' : meta.range === '1w' ? 'Week' : 'Month'}`,
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: function(context: { dataset: { label?: string }; parsed: { y: number } }) {
              const dataset = context.dataset
              const value = context.parsed.y
              
              if (Array.isArray(value)) {
                // Range data
                return `${dataset.label}: ${value[0].toFixed(2)} - ${value[1].toFixed(2)}`
              } else {
                // Single value
                return `${dataset.label}: ${value.toFixed(2)}`
              }
            },
          },
        },
        legend: {
          position: 'top' as const,
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x' as const,
          },
          pan: {
            enabled: true,
            mode: 'x' as const,
          },
          limits: {
            x: { min: 'original' as const, max: 'original' as const },
            y: { min: 'original' as const, max: 'original' as const },
          },
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            displayFormats: {
              minute: 'HH:mm',
              hour: 'MMM dd HH:mm',
              day: 'MMM dd',
            },
          },
          title: {
            display: true,
            text: 'Time',
          },
        },
        ...yAxes,
      },
    }
  }, [data, meta])

  if (loading) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'red' }}>Error loading chart: {error}</div>
      </div>
    )
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>No data available for the selected time range</div>
      </div>
    )
  }

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom()
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <button 
          onClick={handleResetZoom}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Reset Zoom
        </button>
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}