import { Provider } from 'react-redux'
import { store } from './store'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <HomePage />
      </div>
    </Provider>
  )
}

export default App