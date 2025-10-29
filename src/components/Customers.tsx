import React, { useState, useEffect } from "react";
import "../css/Customer.css";

interface Customer {
  csid?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  date?: string;
  billBy?: string;
  billProductId?: string;
}

interface BillProduct {
  bpid: string;
  subtotal: number;
  total: number;
  tax: number;
}

const Customer: React.FC = () => {
  const getTodayDate = (): string => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const backendServer = 'http://localhost:8080/';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [billHistory, setBillHistory] = useState<BillProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

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
      const res = await fetch(backendServer + 'customers', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      if (!res.ok) throw new Error("Failed to save customer");

      const savedCustomer = await res.json();
      setCustomers((prev) => [...prev, savedCustomer]);
      setCustomer({ name: "", phone: "", email: "", address: "" });
      alert("Customer added successfully!");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Error saving customer. Please try again.");
    }
  };

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

  const autoFillCustomerDetail = (cust: Customer) => {
    setSearchTerm(cust.name);
    const newCustomer: Customer = {
      csid: cust.csid,
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      date: getTodayDate(),
      billBy: cust.billBy,
      billProductId: cust.billProductId
    }
    setCustomer(newCustomer);
    setShowCustomerDropdown(false);
  };

  const handleViewBills = async (customerId: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/customer/${customerId}`
      );
      const data = await res.json();
      setBillHistory(data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching bill history:", error);
    }
  };

  return (
    <div className="customer-container">
      <div className="cust-form-section">
        <h2>Add / Edit Customer</h2>
        <div className="cust-form">
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
            <ul className="dropdown">
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
          <button className="add-btn" onClick={handleAddCustomer}>
            Save Customer
          </button>
        </div>
      </div>

      <div className="customer-list-section">
        <div className="customer-list-header">
          <h2>Customer History</h2>
          <input
            type="text"
            className="search-box"
            placeholder="Search customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="customer-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>View Bills</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((cust) => (
                  <tr key={cust.csid}>
                    <td>{cust.name}</td>
                    <td>{cust.phone}</td>
                    <td>{cust.email || "—"}</td>
                    <td>
                      <button
                        className="view-bills-btn"
                        onClick={() => cust.csid && handleViewBills(cust.csid)}
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

      {/* ========== BILL HISTORY MODAL ========== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Customer Bill History</h3>
            <table className="bill--table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {billHistory.map((bill) => (
                  <tr key={bill.bpid}>
                    <td>{bill.bpid}</td>
                    <td>₹{bill.subtotal}</td>
                    <td>₹{bill.tax}</td>
                    <td>₹{bill.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
