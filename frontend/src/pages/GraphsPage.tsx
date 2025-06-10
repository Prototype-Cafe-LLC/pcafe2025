import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import {
  fetchChartDataStart,
  fetchDevicesStart,
  setSelectedRange,
  setSelectedDevices,
  setSelectedSensorTypes,
  setAutoRefresh,
} from '../store/slices/iotSlice'
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart'
import { ChartControls } from '../components/charts/ChartControls'
import { AdminDataControls } from '../components/charts/AdminDataControls'
import { LoginStatus } from '../components/common/LoginStatus'
import { IoTService } from '../services/iot'
import styles from './GraphsPage.module.css'

export function GraphsPage() {
  const dispatch = useDispatch()
  const {
    chartData,
    devices,
    loading,
    error,
    selectedRange,
    selectedDevices,
    selectedSensorTypes,
    autoRefresh,
    lastUpdated,
  } = useSelector((state: RootState) => state.iot)
  
  const { user } = useSelector((state: RootState) => state.auth)
  const isAdmin = user?.is_admin || false

  const refreshData = useCallback(() => {
    dispatch(fetchChartDataStart({
      range: selectedRange,
      deviceId: selectedDevices.length === 1 ? selectedDevices[0] : undefined,
      sensorTypes: selectedSensorTypes,
    }))
  }, [dispatch, selectedRange, selectedDevices, selectedSensorTypes])

  useEffect(() => {
    // Initial data load
    dispatch(fetchDevicesStart())
    refreshData()
  }, [dispatch, refreshData])

  // Refresh data when filters change
  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleRangeChange = useCallback((range: string) => {
    dispatch(setSelectedRange(range as '3d' | '1w' | '1m'))
  }, [dispatch])

  const handleDeviceChange = useCallback((devices: string[]) => {
    dispatch(setSelectedDevices(devices))
  }, [dispatch])

  const handleSensorTypeChange = useCallback((sensorTypes: string[]) => {
    dispatch(setSelectedSensorTypes(sensorTypes))
  }, [dispatch])

  const handleAutoRefreshChange = useCallback((enabled: boolean) => {
    dispatch(setAutoRefresh(enabled))
  }, [dispatch])

  const handlePopulateSampleData = useCallback(async () => {
    await IoTService.populateSampleData()
    // Refresh the devices list and chart data
    dispatch(fetchDevicesStart())
    refreshData()
  }, [dispatch, refreshData])

  const handleClearSampleData = useCallback(async () => {
    await IoTService.clearSampleData()
    // Refresh the devices list and chart data
    dispatch(fetchDevicesStart())
    refreshData()
  }, [dispatch, refreshData])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>IoT Data Visualization</h1>
            <p className={styles.subtitle}>
              Real-time sensor data, analytics, and insights from our IoT devices
            </p>
            <p className={styles.instructions}>
              <strong>Tip:</strong> Use mouse wheel to zoom, drag to pan. Click "Reset Zoom" to restore original view.
            </p>
          </div>
          <div className={styles.statusSection}>
            <LoginStatus />
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {isAdmin && (
          <AdminDataControls
            onPopulateSampleData={handlePopulateSampleData}
            onClearSampleData={handleClearSampleData}
          />
        )}

        <ChartControls
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          selectedDevices={selectedDevices}
          onDeviceChange={handleDeviceChange}
          selectedSensorTypes={selectedSensorTypes}
          onSensorTypeChange={handleSensorTypeChange}
          availableDevices={devices.map(d => d.device_id)}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={handleAutoRefreshChange}
          lastUpdated={lastUpdated ? new Date(lastUpdated) : undefined}
        />

        <div className={styles.chartContainer}>
          <TimeSeriesChart
            data={chartData?.data || {}}
            meta={chartData?.meta || { range: selectedRange, dataType: 'raw', binSize: '', sensorTypes: [] }}
            loading={loading}
            error={error}
          />
        </div>

        {chartData && (
          <div className={styles.metrics}>
            <div className={styles.metricCard}>
              <h3 className={styles.metricTitle}>Data Points</h3>
              <div className={styles.metricValue}>
                {Object.values(chartData.data).reduce((total, points) => total + (points?.length || 0), 0).toLocaleString()}
              </div>
            </div>
            
            <div className={styles.metricCard}>
              <h3 className={styles.metricTitle}>Active Devices</h3>
              <div className={styles.metricValue}>
                {devices.length}
              </div>
            </div>
            
            <div className={styles.metricCard}>
              <h3 className={styles.metricTitle}>Sensor Types</h3>
              <div className={styles.metricValue}>
                {selectedSensorTypes.length}
              </div>
            </div>

            <div className={styles.metricCard}>
              <h3 className={styles.metricTitle}>Time Range</h3>
              <div className={styles.metricValue}>
                {selectedRange === '3d' ? '3 Days' : selectedRange === '1w' ? '1 Week' : '1 Month'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}