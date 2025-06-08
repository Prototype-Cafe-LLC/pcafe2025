import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { store } from './store'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { BlogPage } from './pages/BlogPage'
import { GraphsPage } from './pages/GraphsPage'
import { ContactPage } from './pages/ContactPage'
import { AdminApp } from './admin/AdminApp'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPage />} />
            <Route path="graphs" element={<GraphsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App