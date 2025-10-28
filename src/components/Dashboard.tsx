import Card from '../components/Card'
import logo from '../assets/Logo.png'
import '../App.css'
import bill from '../assets/bill.png'
import customer from '../assets/customer.png'
import inventory from '../assets/inventory.png'

const Dashboard = () => {
  return (
    <>
      <header className='app-header'>
        <div className='name-logo-header'>
          <h2>Gurudatta app</h2>
        </div>
        <nav>
          <h2>Profile icon + User</h2>
        </nav>
      </header>

      <div>
        <img src={logo} className="logo react" alt="React logo" />
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
