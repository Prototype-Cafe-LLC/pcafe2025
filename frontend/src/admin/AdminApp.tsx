import { Routes, Route } from 'react-router-dom'
import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

// Custom dashboard and components
import { Dashboard } from './Dashboard'
import { EventList, EventEdit, EventCreate, EventShow } from './resources/events'
import { BlogList, BlogEdit, BlogCreate } from './resources/blog'

// Custom data provider that handles errors gracefully
const dataProvider = simpleRestProvider('/api')

function ReactAdminApp() {
  return (
    <Admin 
      dataProvider={dataProvider}
      title="PCafe 2025 Admin"
      disableTelemetry
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

export function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/events/*" element={<ReactAdminApp />} />
      <Route path="/blog/*" element={<ReactAdminApp />} />
    </Routes>
  )
}