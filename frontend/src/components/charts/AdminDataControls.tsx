import { useState } from 'react'
import styles from './AdminDataControls.module.css'

interface AdminDataControlsProps {
  onPopulateSampleData: () => Promise<void>
  onClearSampleData: () => Promise<void>
}

export function AdminDataControls({ onPopulateSampleData, onClearSampleData }: AdminDataControlsProps) {
  const [isPopulating, setIsPopulating] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [lastAction, setLastAction] = useState<{ type: 'populate' | 'clear'; message: string } | null>(null)

  const handlePopulateData = async () => {
    if (isPopulating || isClearing) return

    const confirmed = window.confirm(
      'This will generate 30 days of sample temperature and CO2 data. ' +
      'Any existing sample data will be replaced. Continue?'
    )
    
    if (!confirmed) return

    setIsPopulating(true)
    setLastAction(null)
    
    try {
      await onPopulateSampleData()
      setLastAction({ type: 'populate', message: 'Sample data populated successfully!' })
    } catch (error) {
      setLastAction({ type: 'populate', message: `Error: ${error instanceof Error ? error.message : 'Failed to populate data'}` })
    } finally {
      setIsPopulating(false)
    }
  }

  const handleClearData = async () => {
    if (isPopulating || isClearing) return

    const confirmed = window.confirm(
      'This will permanently delete all sample data. ' +
      'Real IoT data from actual devices will not be affected. Continue?'
    )
    
    if (!confirmed) return

    setIsClearing(true)
    setLastAction(null)
    
    try {
      await onClearSampleData()
      setLastAction({ type: 'clear', message: 'Sample data cleared successfully!' })
    } catch (error) {
      setLastAction({ type: 'clear', message: `Error: ${error instanceof Error ? error.message : 'Failed to clear data'}` })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Sample Data Management</h3>
        <p className={styles.description}>
          Manage sample IoT data for testing and demonstration purposes
        </p>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.populate}`}
          onClick={handlePopulateData}
          disabled={isPopulating || isClearing}
        >
          {isPopulating ? (
            <>
              <span className={styles.spinner}></span>
              Generating Data...
            </>
          ) : (
            'Populate Sample Data'
          )}
        </button>

        <button
          className={`${styles.button} ${styles.clear}`}
          onClick={handleClearData}
          disabled={isPopulating || isClearing}
        >
          {isClearing ? (
            <>
              <span className={styles.spinner}></span>
              Clearing Data...
            </>
          ) : (
            'Clear Sample Data'
          )}
        </button>
      </div>

      {lastAction && (
        <div className={`${styles.message} ${lastAction.message.includes('Error') ? styles.error : styles.success}`}>
          {lastAction.message}
        </div>
      )}

      <div className={styles.info}>
        <h4 className={styles.infoTitle}>Sample Data Details:</h4>
        <ul className={styles.infoList}>
          <li>📊 **30 days** of historical data</li>
          <li>🌡️ **Temperature**: 18-28°C with daily cycles</li>
          <li>💨 **CO2**: 400-1200 ppm with office hours pattern</li>
          <li>⏱️ **Frequency**: Data points every 10 minutes</li>
          <li>🏷️ **Devices**: sample-office-01 (temp) & sample-office-02 (CO2)</li>
        </ul>
      </div>
    </div>
  )
}