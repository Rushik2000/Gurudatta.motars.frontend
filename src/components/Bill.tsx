import { useState, useEffect, useRef } from 'react';
import '../App.css'

interface Product {
    pid: string;
    name: string;
    price: number;
    quantity: number;
}

interface BillProduct {
    bpid: string;
    productList: Product[];
    subtotal: number;
    total: number;
    tax: number;
}

interface Customer {
    csid: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    date: string;
    billBy: string;
    billProductId: string;
}

interface Admin {
    aid: string;
    name: string;
}

const Bill: React.FC = () => {

    // Mock products and later must be fetched from DB
    const initialProducts: Product[] = [
        { pid: '1', name: 'Product A', price: 100, quantity: 1 },
        { pid: '2', name: 'Product B', price: 50, quantity: 2 },
        { pid: '3', name: 'Product C', price: 75, quantity: 1 },
    ];

    const [products, setProducts] = useState<Product[]>(initialProducts);

    const getTodayDate = (): string => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Customer details state
    const [customer, setCustomer] = useState<Customer>({
        csid: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        date: getTodayDate(),
        billBy: '',
        pid: ''
    });

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [createdBy, setCreatedBy] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [admins, setAdmins] = useState([]);
    const dropdownRef = useRef<HTMLUListElement | null>(null);


    // Remove products
    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.pid !== id));
    };

    // Calculate totals
    const subtotal = products.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Handle customer input changes
    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setSearchTerm(value);
        }
        setCustomer(prev => ({ ...prev, [name]: value }));
    };

    const addNewRow = () => {
        const newProduct: Product = {
            pid: Date.now().toString(), // unique id
            name: '',
            price: 0,
            quantity: 1,
        };
        setProducts(prev => [...prev, newProduct]);
    };

    // ✅ Prevent non-numeric input for price & quantity
    const handleNumericInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: string,
        field: keyof Product
    ) => {
        const value = e.target.value;
        const numericValue = value.replace(/₹\s?/g, '');

        // allow only digits or empty string
        if (/^\d*$/.test(numericValue)) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.pid === id ? { ...product, [field]: numericValue } : product
                )
            );
        }
    };

    // ✅ Handle product name separately (normal text)
    const handleNameChange = (id: string, value: string) => {
        setProducts((prev) =>
            prev.map((product) => (product.pid === id ? { ...product, name: value } : product))
        );
    };

    const handlePrint = () => {
        setShowModal(false);
        // Could also open a new window with bill content
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleCustomerAdd = async () => {
        try {
            const response = await fetch("http://localhost:8080/customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customer),
            });
            await response.json();
        } catch (error) {
            console.error("Error saving data: ", error);
        }
    };

    const fetchAdmins = async () => {
        try {
            if (admins.length === 0) {
                setLoading(true);
                const response = await fetch("http://localhost:8080/admins");
                const data = await response.json();
                setAdmins(data);
                setLoading(false);
            }
            setShowDropdown(true);
        } catch (error) {
            console.error("Error fetching admins:", error);
            setLoading(false);
        }
    };

    const handleSelectAdmin = (admin: Admin) => {
        setCreatedBy(admin.name);
        setShowDropdown(false);
    };

    // 🧱 Hide dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle click on suggestion
    const autoFillCustomerDetail = (cust: Customer) => {
        setSearchTerm(cust.name);
        const newCustomer: Customer = {
            csid: cust.csid,
            name: cust.name,
            phone: cust.phone,
            email: cust.email,
            address: cust.address,
            date: getTodayDate(), // <-- default to today's date
            billBy: cust.billBy,
            pid: cust.pid
        }
        setCustomer(newCustomer);
        setShowDropdown(false);
    };

    useEffect(() => {
    }, [setSearchTerm]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setCustomerResults([]);
            setShowDropdown(false);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetch(`http://localhost:8080/search?name=${searchTerm}`)
                .then((res) => res.json())
                .then((data) => {
                    setCustomerResults(data);
                    setShowDropdown(true);
                })
                .catch((err) => console.error("Search failed", err));
        }, 400); // Debounce 400ms

        return () => clearTimeout(delayDebounce); // Cancel on next keystroke
    }, [searchTerm]);

    const handleGenerateBill = async () => {
        try {
            setLoading(true);
            //Before adding user send all the table data first(BillProduct), for that products and the calculations
            // Once clicked generate bill button the data should be collected
            // save it to DB and the created bill product id will be used in the add user request to keep reference.

            // handleProductDataAdd();

            // before adding customer, check if that customer is already present
            // if user enters a name and backend returns the user back and
            // onclick of that dropdown user, frontend autofills all the user fields
            // and call backend to update if any changes 
            // if no value in dropdown, send data without id so that user will get added newly
            handleCustomerAdd();

            // 🔁 Step 1: First API Call
            //const firstResponse = await apiCall1(); // e.g., saveBill()

            // Check if response is valid
            // if (!firstResponse || !firstResponse.billId) {
            //   throw new Error("First API call failed or invalid response");
            // }

            //const billId = firstResponse.billId;

            // 🔁 Step 2: Second API Call using billId
            //const secondResponse = await apiCall2(billId); // e.g., getBillDetails(billId)

            // Optionally check the second response
            // if (!secondResponse.success) {
            //   throw new Error("Second API call failed");
            // }

            // ✅ Show success modal
            setShowModal(true);

        } catch (error) {
            console.error("Error generating bill:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bill-container">
            {/* Customer Details Section */}
            <div className="customer-details">
                <h5>Customer Bill</h5>
                <div className="customer-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Customer Name"
                        value={customer.name}
                        onChange={handleCustomerChange}
                        onFocus={() => {
                            if (customerResults.length > 0) setShowDropdown(true);
                        }}
                    />

                    {showDropdown && customerResults.length > 0 && (
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
                        onChange={handleCustomerChange}
                    />
                    <input
                        type="date"
                        name="date"
                        placeholder="Date"
                        value={customer.date}
                        onChange={handleCustomerChange}
                        className='date-input'
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={customer.address}
                        onChange={handleCustomerChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={customer.email}
                        onChange={handleCustomerChange}
                    />
                </div>
            </div>

            {/* Products Table */}
            <table className="bill-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.pid}>
                            {/* Product name should be a text box where i can search product name and 
                            all the data like price and all detail should be fetched from DB, If no product result then one popup should get display
                            to add the detail about that product and once click add that product should get added
                            in DB and available for future use   */}
                            <td>
                                <input
                                    type="text"
                                    value={product.name}
                                    placeholder="Enter Product"
                                    onChange={(e) => handleNameChange(product.pid, e.target.value)}
                                    className="no-style-input"
                                />
                            </td>
                            {/* Intial price will be fetched from DB but id user wants he can change a price
                            As soon as he change the price the price must be updated In DB for that product for future use
                            Better to use text box */}
                            <td>
                                <input
                                    type="text"
                                    value={'₹ ' + product.price}
                                    placeholder="Enter Price"
                                    onChange={(e) => handleNumericInput(e, product.pid, "price")}
                                    className="no-style-input "
                                    inputMode="numeric"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={product.quantity.toString()}
                                    placeholder="Qty"
                                    onChange={(e) => handleNumericInput(e, product.pid, "quantity")}
                                    className="no-style-input"
                                    inputMode="numeric"
                                />
                            </td>
                            <td>{'₹ ' + product.price * product.quantity}</td>
                            <td>
                                <button onClick={() => removeProduct(product.pid)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Add Row Button */}
            <div className="add-row">
                <button onClick={addNewRow}>+ Add Row</button>
            </div>

            {/* Bill Summary */}
            <div className="bill-summary">
                <p>Subtotal: ₹{subtotal}</p>
                <p>Tax (10%): ₹{tax}</p>
                <p><strong>Total: ₹{total}</strong></p>
            </div>

            <div className="bill-footer-wrapper">
                <div className="creator-left">
                    <label htmlFor="createdBy">Created by:</label>
                    <div className="dropdown-wrapperr">
                        <input
                            id="createdBy"
                            type="text"
                            value={createdBy}
                            readOnly
                            onClick={fetchAdmins} // clicking input shows dropdown
                            placeholder="Select your name"
                            className="no-style-input"
                        />
                        {showDropdown && (
                            <ul className="dropdownn">
                                {loading ? (
                                    <li>Loading...</li>
                                ) : admins.length > 0 ? (
                                    admins.map((admin: Admin) => (
                                        <li
                                            key={admin.aid}
                                            onMouseDown={() => handleSelectAdmin(admin)} // use onMouseDown to avoid blur issue
                                        >
                                            {admin.name}
                                        </li>
                                    ))
                                ) : (
                                    <li>No admins found</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="generate-center">
                    <button
                        onClick={handleGenerateBill}
                        disabled={loading || createdBy.trim() === ""}
                        className="generate-bill-btn"
                    >
                        {loading ? "Generating..." : "🧾 Generate Bill"}
                    </button>
                </div>
            </div>


            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>✅ Bill Generated Successfully</h2>
                        <div className="modal-actions">
                            <button onClick={handlePrint} className='print-btn'>🖨️ Print</button>
                            <button onClick={() => setShowModal(false)} className='close-btn'>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Bill;
