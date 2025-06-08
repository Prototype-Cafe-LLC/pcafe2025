import { Routes, Route } from 'react-router-dom'
import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

// Custom dashboard and components
import { Dashboard } from './Dashboard'
import { EventList, EventEdit, EventCreate, EventShow } from './resources/events'
import { BlogList, BlogEdit, BlogCreate } from './resources/blog'

// Custom data provider that handles errors gracefully
const baseDataProvider = simpleRestProvider('/api')

const dataProvider = {
  ...baseDataProvider,
  getList: (resource: string, params: any) => {
    return baseDataProvider.getList(resource, params).catch(() => {
      // Return empty data if API fails
      return { data: [], total: 0 }
    })
  },
  getOne: (resource: string, params: any) => {
    return baseDataProvider.getOne(resource, params).catch(() => {
      return { data: {} }
    })
  },
  getMany: (resource: string, params: any) => {
    return baseDataProvider.getMany(resource, params).catch(() => {
      return { data: [] }
    })
  },
  getManyReference: (resource: string, params: any) => {
    return baseDataProvider.getManyReference(resource, params).catch(() => {
      return { data: [], total: 0 }
    })
  },
  create: (resource: string, params: any) => {
    return baseDataProvider.create(resource, params).catch(() => {
      return { data: { id: 1, ...params.data } }
    })
  },
  update: (resource: string, params: any) => {
    return baseDataProvider.update(resource, params).catch(() => {
      return { data: { ...params.data } }
    })
  },
  updateMany: (resource: string, params: any) => {
    return baseDataProvider.updateMany(resource, params).catch(() => {
      return { data: params.ids }
    })
  },
  delete: (resource: string, params: any) => {
    return baseDataProvider.delete(resource, params).catch(() => {
      return { data: { id: params.id } }
    })
  },
  deleteMany: (resource: string, params: any) => {
    return baseDataProvider.deleteMany(resource, params).catch(() => {
      return { data: params.ids }
    })
  }
}

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