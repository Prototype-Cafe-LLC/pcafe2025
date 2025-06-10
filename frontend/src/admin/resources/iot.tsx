import { 
  List, 
  Datagrid, 
  TextField, 
  NumberField, 
  DateField, 
  Show, 
  SimpleShowLayout, 
  Filter, 
  TextInput, 
  DateInput, 
  SelectInput,
  useGetList,
  Loading,
  Error
} from 'react-admin'
import styles from './iot.module.css'

// Filter component for IoT data
const IoTDataFilter = (props: Record<string, unknown>) => (
  <Filter {...props}>
    <TextInput label="Device ID" source="device_id" />
    <SelectInput 
      label="Sensor Type" 
      source="sensor_type" 
      choices={[
        { id: 'temperature', name: 'Temperature' },
        { id: 'co2', name: 'CO2' },
        { id: 'humidity', name: 'Humidity' },
        { id: 'light', name: 'Light' },
        { id: 'noise', name: 'Noise' }
      ]}
    />
    <TextInput label="Location" source="location" />
    <DateInput label="Start Time" source="start_time" />
    <DateInput label="End Time" source="end_time" />
  </Filter>
)

// IoT Data List component
export const IoTDataList = (props: Record<string, unknown>) => (
  <List 
    {...props} 
    filters={<IoTDataFilter />}
    sort={{ field: 'time', order: 'DESC' }}
    perPage={25}
    title="IoT Sensor Data"
  >
    <Datagrid>
      <DateField source="time" showTime />
      <TextField source="device_id" />
      <TextField source="device_name" />
      <TextField source="sensor_type" />
      <NumberField source="value" />
      <TextField source="unit" />
      <TextField source="location" />
      <TextField source="quality" />
    </Datagrid>
  </List>
)

// IoT Data Show component
export const IoTDataShow = (props: Record<string, unknown>) => (
  <Show {...props} title="IoT Data Details">
    <SimpleShowLayout>
      <DateField source="time" showTime />
      <TextField source="device_id" />
      <TextField source="device_name" />
      <TextField source="device_type" />
      <TextField source="sensor_type" />
      <NumberField source="value" />
      <TextField source="unit" />
      <TextField source="location" />
      <TextField source="quality" />
      <NumberField source="accuracy" />
      <TextField source="raw_data" />
    </SimpleShowLayout>
  </Show>
)

// IoT Statistics Dashboard Component
export const IoTStatsDashboard = () => {
  const { data: stats, isLoading, error } = useGetList('iot/stats', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'device_id', order: 'ASC' }
  })

  const { data: devices, isLoading: devicesLoading } = useGetList('iot/devices', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'last_seen', order: 'DESC' }
  })

  if (isLoading || devicesLoading) return <Loading />
  if (error) return <Error error={error} resetErrorBoundary={() => {}} />

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>
        IoT Data Overview
      </h1>
      
      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>
              Active Devices
            </h2>
            {devices?.map((device: { device_id: string; device_name: string; device_type: string; location: string; last_seen: string; sensor_types?: string[] }) => (
              <div key={device.device_id} className={styles.deviceItem}>
                <h3 className={styles.deviceName}>
                  {device.device_name} ({device.device_id})
                </h3>
                <p className={styles.deviceInfo}>
                  Location: {device.location} | Type: {device.device_type}
                </p>
                <p className={styles.deviceInfo}>
                  Last seen: {new Date(device.last_seen).toLocaleString()}
                </p>
                <p className={styles.deviceInfo}>
                  Sensors: {device.sensor_types?.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>
              Data Statistics
            </h2>
            {stats?.map((stat: { device_id: string; sensor_type: string; count: number; min_value?: number; max_value?: number; avg_value?: number }) => (
              <div key={`${stat.device_id}-${stat.sensor_type}`} className={styles.statItem}>
                <h3 className={styles.statName}>
                  {stat.device_id} - {stat.sensor_type}
                </h3>
                <p className={styles.statValues}>
                  Records: {stat.count} | 
                  Min: {stat.min_value?.toFixed(2)} | 
                  Max: {stat.max_value?.toFixed(2)} | 
                  Avg: {stat.avg_value?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}