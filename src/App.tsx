import { Routes, Route } from 'react-router-dom'
import BillWrapper from './components/helper/BillWrapper'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import Inventory from './components/Inventory'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path="/bill" element={<BillWrapper />} />
      <Route path='/customers' element={<Customers />} />
      <Route path='/inventory' element={<Inventory />} />
    </Routes>
  )
}

export default App
