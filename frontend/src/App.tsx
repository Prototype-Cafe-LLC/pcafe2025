import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { store } from './store'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './components/events/EventDetailPage'
import { EventTestPage } from './pages/EventTestPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostDetail } from './components/blog/BlogPostDetail'
import { GraphsPage } from './pages/GraphsPage'
import { ContactPage } from './pages/ContactPage'
import { ProtectedAdminApp } from './admin/ProtectedAdminApp'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/*" element={<ProtectedAdminApp />} />
          
          {/* Public routes with layout */}
          <Route path="/" element={
            <Layout>
              <HomePage />
            </Layout>
          } />
          <Route path="/events" element={
            <Layout>
              <EventsPage />
            </Layout>
          } />
          <Route path="/events/:id" element={
            <Layout>
              <EventDetailPage />
            </Layout>
          } />
          <Route path="/test-events" element={
            <Layout>
              <EventTestPage />
            </Layout>
          } />
          <Route path="/blog" element={
            <Layout>
              <BlogPage />
            </Layout>
          } />
          <Route path="/blog/:slug" element={
            <Layout>
              <BlogPostDetail />
            </Layout>
          } />
          <Route path="/graphs" element={
            <Layout>
              <GraphsPage />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <ContactPage />
            </Layout>
          } />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App