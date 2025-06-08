import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

// Custom dashboard and components
import { Dashboard } from './Dashboard'
import { EventList, EventEdit, EventCreate, EventShow } from './resources/events'
import { BlogList, BlogEdit, BlogCreate } from './resources/blog'

// Configure fetch to include credentials for session-based auth
const httpClient = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for session authentication
  })
  
  const text = await response.text()
  
  return {
    status: response.status,
    headers: response.headers,
    body: text,
    json: text ? JSON.parse(text) : {}
  }
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