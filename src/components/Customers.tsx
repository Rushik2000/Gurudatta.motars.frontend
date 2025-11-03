import React, { useState, useEffect } from "react";
import styles from '../css/Customer.module.css'
import ViewBill from "./ViewBill";
import type { BillProduct, Customer } from "../types/types";
import closeIcon from '../assets/closebtn.png'
import { useNavigate } from 'react-router-dom';

const Customer: React.FC = () => {
  const [customer, setCustomer] = useState<Customer>({
    csid: null,
    name: '',
    phone: '',
    email: '',
    address: '',
    billProductId: ''
  });

  const backendServer = 'http://localhost:8080/';
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [showCustomerSeachDropdown, setShowCustomerSearchDropdown] = useState(false);
  const [searchCustomerResults, setSearchCustomerResults] = useState<Customer[]>([]);
  const [foundCustomer, setFoundCustomer] = useState<Customer>();
  const [searchedCustomerBills, setSearchedCustomerBills] = useState<BillProduct[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillProduct>();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setSearchTerm(value);
    }
    setCustomer({ ...customer, [name]: value });
  };

  const handleAddCustomer = async () => {
    if (!customer.name || !customer.phone) {
      alert("Please enter customer name and phone number.");
      return;
    }

    try {
      const res = await fetch(backendServer + 'customer', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      if (!res.ok) throw new Error("Failed to save customer");
      setCustomer({ csid: null, name: "", phone: "", email: "", address: "", billProductId: null });
      alert("Customer added successfully!");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Error saving customer. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      if (isSelecting) {
        setIsSelecting(false);
        return;
      }

      if (historySearchTerm.length < 2) {
        setSearchCustomerResults([]);
        setShowCustomerSearchDropdown(false);
        return;
      }

      const delayDebounce = setTimeout(() => {
        fetch(backendServer + `search?name=${historySearchTerm}`)
          .then((res) => res.json())
          .then((data) => {
            setSearchCustomerResults(data);
            setShowCustomerSearchDropdown(true);
          })
          .catch((err) => console.error("Search failed", err));
      }, 100);

      return () => clearTimeout(delayDebounce);
    };

    fetchCustomers();
  }, [historySearchTerm]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (searchTerm.length < 2) {
        setCustomerResults([]);
        setShowCustomerDropdown(false);
        return;
      }

      const delayDebounce = setTimeout(() => {
        fetch(backendServer + `search?name=${searchTerm}`)
          .then((res) => res.json())
          .then((data) => {
            setCustomerResults(data);
            setShowCustomerDropdown(true);
          })
          .catch((err) => console.error("Search failed", err));
      }, 400);

      return () => clearTimeout(delayDebounce);
    };

    fetchCustomers();
  }, [searchTerm]);

  useEffect(() => {
    setSearchedCustomerBills([]);
  }, [historySearchTerm]);

  const autoFillCustomerDetail = (cust: Customer) => {
    setSearchTerm(cust.name);
    const newCustomer: Customer = {
      csid: cust.csid,
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      billProductId: cust.billProductId
    }
    setCustomer(newCustomer);
    setShowCustomerDropdown(false);
  };

  const handleViewBills = async (bill: BillProduct) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const getCustomerInfo = async (cust: Customer) => {
    setFoundCustomer(cust)
    const billsData = await fetch(
      backendServer + `bills/${cust.csid}`
    );
    const data = await billsData.json();
    setSearchedCustomerBills(data);
  }

  return (
    <div className={styles.main}>
      <div className={styles.backWrapper}>
        <h2>🕉️गुरुदत्त मोटर्स & स्पेअर्स🕉️</h2>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/')}
        >
          <img src={closeIcon} alt="back" />
        </button>
      </div>

      <div className={styles.customercontainer}>
        <div className={styles.custformsection}>
          <h2>Add / Edit Customer</h2>
          <div className={styles.custform}>
            <input
              type="text"
              name="name"
              placeholder="Customer Name"
              value={customer.name}
              onChange={handleChange}
              onFocus={() => {
                if (customerResults.length > 0) setShowCustomerDropdown(true);
              }}
            />
            {showCustomerDropdown && customerResults.length > 0 && (
              <ul className={styles.dropdown}>
                {customerResults.map((cust) => (
                  <li key={cust.csid} onMouseDown={() => {
                    autoFillCustomerDetail(cust)
                  }}>
                    {cust.name}
                  </li>
                ))}
              </ul>
            )}
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email (optional)"
              value={customer.email}
              onChange={handleChange}
            />
            <textarea
              name="address"
              placeholder="Address (optional)"
              value={customer.address}
              onChange={handleChange}
            ></textarea>
            <button className={styles.addbtn} onClick={handleAddCustomer}>
              Save Customer
            </button>
          </div>
        </div>

        <div className={styles.customerlistsection}>
          <div className={styles.customerlistheader}>
            <h2>Customer History</h2>
            <input
              type="text"
              name="name"
              className={styles.searchbox}
              placeholder="Search customer..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              onFocus={() => {
                if (searchCustomerResults.length > 0) setShowCustomerSearchDropdown(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowCustomerSearchDropdown(false), 100);
              }}
            />
            {showCustomerSeachDropdown && searchCustomerResults.length > 0 && (
              <ul className={styles.searchdropdown}>
                {searchCustomerResults.map((cust) => (
                  <li key={cust.csid} onMouseDown={() => {
                    setIsSelecting(true);
                    setHistorySearchTerm(cust.name);
                    setShowCustomerSearchDropdown(false);
                    if (cust.csid) getCustomerInfo(cust);
                  }}>
                    {cust.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.customertable}>
            <div className={styles.tableContainer}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Bill By</th>
                    <th>View Bills</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <tbody>
                  {foundCustomer && searchedCustomerBills.length > 0 ? (
                    searchedCustomerBills.map((bill) => (
                      <tr key={bill.bpid}>
                        <td>{foundCustomer.name}</td>
                        <td>{'₹ ' + bill?.total}</td>
                        <td>{bill?.date}</td>
                        <td>{bill?.billBy}</td>
                        <td>
                          <button
                            className={styles.viewbillsbtn}
                            onClick={() => bill && handleViewBills(bill)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div >
      <div className={styles.billView}>
        {showModal && (
          <ViewBill
            foundCustomer={foundCustomer}
            bill={selectedBill}
            setShowModal={setShowModal}
          />
        )}
      </div>
    </div>
  );
};

export default Customer;
