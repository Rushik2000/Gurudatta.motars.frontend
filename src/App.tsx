import { Routes, Route } from 'react-router-dom'
import Bill from './components/Bill'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import Inventory from './components/Inventory'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path="/bill" element={<Bill />} />
      <Route path='/customers' element={<Customers />} />
      <Route path='/inventory' element={<Inventory />} />
    </Routes>
  )
}

export default App
