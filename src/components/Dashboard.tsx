import Card from '../components/Card'
import logo from '../assets/Logo.png'
import bill from '../assets/bill.png'
import customer from '../assets/customer.png'
import inventory from '../assets/inventory.png'
import user_1 from '../assets/user_1.png'
import styles from '../css/Dashboard.module.css'

const Dashboard = () => {
  return (
    <>
      <div className={styles.headergrid}>
        <h2></h2>
        <img src={logo} className={styles.logo} alt="React logo" />
        <img src={user_1} className={styles.profileicon} />
      </div>
      <div className={styles.cardgrid}>
        <Card title="Bill" imgPath={bill} />
        <Card title="Inventory" imgPath={inventory} />
        <Card title="Customers" imgPath={customer} />
      </div>
    </>
  )
}

export default Dashboard
