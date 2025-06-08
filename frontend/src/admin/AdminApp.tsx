import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

// Custom dashboard and components
import { Dashboard } from './Dashboard'
import { EventList, EventEdit, EventCreate, EventShow } from './resources/events'
import { BlogList, BlogEdit, BlogCreate } from './resources/blog'

// Configure fetch to include credentials for session-based auth
const httpClient = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for session authentication
  })
}

// Create data provider with custom httpClient
const dataProvider = simpleRestProvider('/api', httpClient)

export function AdminApp() {
  return (
    <Admin 
      dataProvider={dataProvider}
      title="PCafe 2025 Admin"
      disableTelemetry
      basename="/admin"
      dashboard={Dashboard}
    >
      <Resource 
        name="events" 
        list={EventList} 
        edit={EventEdit} 
        create={EventCreate}
        show={EventShow}
      />
      <Resource 
        name="blog" 
        list={BlogList} 
        edit={BlogEdit} 
        create={BlogCreate} 
      />
    </Admin>
  )
}