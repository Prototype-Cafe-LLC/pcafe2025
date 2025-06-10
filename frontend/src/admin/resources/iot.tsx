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
import { Card, CardContent, Typography, Grid } from '@mui/material'

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
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        IoT Data Overview
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Devices
              </Typography>
              {devices?.map((device: { device_id: string; device_name: string; device_type: string; location: string; last_seen: string; sensor_types?: string[] }) => (
                <div key={device.device_id} style={{ marginBottom: '10px' }}>
                  <Typography variant="subtitle2">
                    {device.device_name} ({device.device_id})
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Location: {device.location} | Type: {device.device_type}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last seen: {new Date(device.last_seen).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sensors: {device.sensor_types?.join(', ')}
                  </Typography>
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Statistics
              </Typography>
              {stats?.map((stat: { device_id: string; sensor_type: string; count: number; min_value?: number; max_value?: number; avg_value?: number }) => (
                <div key={`${stat.device_id}-${stat.sensor_type}`} style={{ marginBottom: '10px' }}>
                  <Typography variant="subtitle2">
                    {stat.device_id} - {stat.sensor_type}
                  </Typography>
                  <Typography variant="body2">
                    Records: {stat.count} | 
                    Min: {stat.min_value?.toFixed(2)} | 
                    Max: {stat.max_value?.toFixed(2)} | 
                    Avg: {stat.avg_value?.toFixed(2)}
                  </Typography>
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}