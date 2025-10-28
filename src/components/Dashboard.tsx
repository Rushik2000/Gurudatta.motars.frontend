import Card from '../components/Card'
import logo from '../assets/Logo.png'
import '../App.css'
import bill from '../assets/bill.png'
import customer from '../assets/customer.png'
import inventory from '../assets/inventory.png'
import user_1 from '../assets/user_1.png'

const Dashboard = () => {
  return (
    <>
      <div className='header-grid'>
        <h2></h2>
        <img src={logo} className="logo react" alt="React logo" />
        <img src={user_1} className='profile-icon' />
      </div>

      <div className="card-grid">
        <Card title="Bill" imgPath={bill} />
        <Card title="Inventory" imgPath={inventory} />
        <Card title="Customers" imgPath={customer} />
      </div>
    </>
  )
}

export default Dashboard
