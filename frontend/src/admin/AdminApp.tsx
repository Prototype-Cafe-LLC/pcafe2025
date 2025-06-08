import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

// Placeholder components for admin resources
import { EventList, EventEdit, EventCreate } from './resources/events'
import { BlogList, BlogEdit, BlogCreate } from './resources/blog'

const dataProvider = simpleRestProvider('/api')

export function AdminApp() {
  return (
    <Admin 
      dataProvider={dataProvider}
      title="PCafe 2025 Admin"
    >
      <Resource 
        name="events" 
        list={EventList} 
        edit={EventEdit} 
        create={EventCreate} 
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