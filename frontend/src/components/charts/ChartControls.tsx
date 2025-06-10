import styles from './ChartControls.module.css'

interface ChartControlsProps {
  selectedRange: string
  onRangeChange: (range: string) => void
  selectedDevices: string[]
  onDeviceChange: (devices: string[]) => void
  selectedSensorTypes: string[]
  onSensorTypeChange: (sensorTypes: string[]) => void
  availableDevices: string[]
  autoRefresh: boolean
  onAutoRefreshChange: (enabled: boolean) => void
  lastUpdated?: Date
}

const TIME_RANGES = [
  { value: '3d', label: '3 Days' },
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
]

const SENSOR_TYPES = [
  { value: 'temperature', label: 'Temperature' },
  { value: 'co2', label: 'CO₂' },
  { value: 'humidity', label: 'Humidity', disabled: true },
  { value: 'ambient', label: 'Ambient Light', disabled: true },
  { value: 'pressure', label: 'Pressure', disabled: true },
]

export function ChartControls({
  selectedRange,
  onRangeChange,
  selectedDevices,
  onDeviceChange,
  selectedSensorTypes,
  onSensorTypeChange,
  availableDevices,
  autoRefresh,
  onAutoRefreshChange,
  lastUpdated,
}: ChartControlsProps) {
  const handleDeviceToggle = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      onDeviceChange(selectedDevices.filter(id => id !== deviceId))
    } else {
      onDeviceChange([...selectedDevices, deviceId])
    }
  }

  const handleSensorTypeToggle = (sensorType: string) => {
    if (selectedSensorTypes.includes(sensorType)) {
      onSensorTypeChange(selectedSensorTypes.filter(type => type !== sensorType))
    } else {
      onSensorTypeChange([...selectedSensorTypes, sensorType])
    }
  }

  return (
    <div className={styles.container}>
      {/* Time Range Selection */}
      <div className={styles.section}>
        <label className={styles.label}>Time Range:</label>
        <div className={styles.buttonGroup}>
          {TIME_RANGES.map(range => (
            <button
              key={range.value}
              className={`${styles.button} ${selectedRange === range.value ? styles.active : ''}`}
              onClick={() => onRangeChange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Type Selection */}
      <div className={styles.section}>
        <label className={styles.label}>Sensor Types:</label>
        <div className={styles.checkboxGroup}>
          {SENSOR_TYPES.map(sensor => (
            <label key={sensor.value} className={`${styles.checkbox} ${sensor.disabled ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={selectedSensorTypes.includes(sensor.value)}
                onChange={() => handleSensorTypeToggle(sensor.value)}
                disabled={sensor.disabled}
              />
              <span className={styles.checkboxLabel}>{sensor.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Device Selection */}
      {availableDevices.length > 0 && (
        <div className={styles.section}>
          <label className={styles.label}>Devices:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedDevices.length === 0}
                onChange={() => onDeviceChange([])}
              />
              <span className={styles.checkboxLabel}>All Devices</span>
            </label>
            {availableDevices.map(deviceId => (
              <label key={deviceId} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(deviceId)}
                  onChange={() => handleDeviceToggle(deviceId)}
                />
                <span className={styles.checkboxLabel}>{deviceId}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Auto-refresh Control */}
      <div className={styles.section}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
          />
          <span className={styles.checkboxLabel}>Auto-refresh (1 min)</span>
        </label>
        {lastUpdated && (
          <div className={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}