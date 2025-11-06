import { Routes, Route } from 'react-router-dom'
import { BillWrapper } from './components/helper/BillWrapper'
import { Dashboard } from './components/Dashboard'
import { Customers } from './components/Customers'
import { InventoryDashboard } from './components/InventoryDashboard'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/bill" element={<BillWrapper />} />
      <Route path='/customers' element={<Customers />} />
      <Route path='/inventory' element={<InventoryDashboard />} />
    </Routes>
  )
}

export default App
