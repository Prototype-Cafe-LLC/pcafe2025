import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

const dataProvider = simpleRestProvider('/api')

export function AdminApp() {
  return (
    <Admin dataProvider={dataProvider} title="PCafe 2025 Admin">
      <Resource name="events" />
      <Resource name="blog" />
      <Resource name="contacts" />
    </Admin>
  )
}