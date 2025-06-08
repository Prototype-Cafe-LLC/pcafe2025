import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { fetchDataStart } from '../store/slices/iotSlice'
import styles from './GraphsPage.module.css'

export function GraphsPage() {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector((state: RootState) => state.iot)

  useEffect(() => {
    dispatch(fetchDataStart())
  }, [dispatch])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading IoT data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>IoT Data Visualization</h1>
        <p className={styles.subtitle}>
          Real-time sensor data, analytics, and insights from our IoT devices
        </p>
      </header>

      <div className={styles.content}>
        {data.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>No Data Available</h2>
            <p className={styles.emptyText}>
              IoT sensor data will be displayed here once devices start reporting.
            </p>
          </div>
        ) : (
          <div className={styles.dashboard}>
            <div className={styles.metrics}>
              <div className={styles.metricCard}>
                <h3 className={styles.metricTitle}>Total Data Points</h3>
                <div className={styles.metricValue}>{data.length.toLocaleString()}</div>
              </div>
              
              <div className={styles.metricCard}>
                <h3 className={styles.metricTitle}>Active Devices</h3>
                <div className={styles.metricValue}>
                  {new Set(data.map(d => d.deviceId)).size}
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <h3 className={styles.metricTitle}>Sensor Types</h3>
                <div className={styles.metricValue}>
                  {new Set(data.map(d => d.sensorType)).size}
                </div>
              </div>
            </div>

            <div className={styles.chartPlaceholder}>
              <div className={styles.chartTitle}>Time Series Chart</div>
              <div className={styles.chartDescription}>
                Interactive charts with D3.js and Chart.js will be implemented here
                to visualize temperature, humidity, and other sensor data over time.
              </div>
              <div className={styles.features}>
                <h4 className={styles.featuresTitle}>Planned Features:</h4>
                <ul className={styles.featuresList}>
                  <li>Zoom and pan functionality</li>
                  <li>Interactive tooltips</li>
                  <li>Device filtering</li>
                  <li>Date range selection</li>
                  <li>Real-time updates</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}