import { useState, useEffect, useRef } from 'react';
import '../App.css'
import {v4 as uuid} from 'uuid';

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
    //TODO: 
    // if user cliked generate button and the product list with BillProducts will be created
    // also user will be created.
    // There is a problem, if after genarate bill i do add another product and again generate bill
    // Then new user gets genareted and also new BillProducts
    // I want same user gets updated with that and also same list will be
    // updated with same BillProduct

    const getTodayDate = (): string => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [customer, setCustomer] = useState<Customer>({
        csid: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        date: getTodayDate(),
        billBy: '',
        billProductId: ''
    });


    // Mock products and later must be fetched from DB
    const initialProducts: Product[] = [
        { pid: uuid(), name: '', price: 0, quantity: 1 }
    ];

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [createdBy, setCreatedBy] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    const [admins, setAdmins] = useState([]);
    const dropdownRef = useRef<HTMLUListElement | null>(null);
    const [backendServer] = useState("http://localhost:8080/")

    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.pid !== id));
    };
    const subtotal = products.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setSearchTerm(value);
        }
        setCustomer(prev => ({ ...prev, [name]: value }));
    };

    const addNewRow = () => {
        const newProduct: Product = {
            pid: uuid(),
            name: '',
            price: 0,
            quantity: 1,
        };
        setProducts(prev => [...prev, newProduct]);
    };

    const handleNumericInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: string,
        field: keyof Product
    ) => {
        const rawValue = e.target.value.replace(/₹\s?/g, '');
        const numericValue = rawValue === '' ? 0 : Number(rawValue);

        if (!isNaN(numericValue)) {
            setProducts(prev =>
                prev.map(product =>
                    product.pid === id ? { ...product, [field]: numericValue } : product
                )
            );
        }
    };

    const handleNameChange = (id: string, value: string) => {
        setProducts((prev) =>
            prev.map((product) => (product.pid === id ? { ...product, name: value } : product))
        );
    };

    const handlePrint = () => {
        setShowModal(false);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleCustomerAdd = async (billProductId: string) => {
        try {
            const updatedCustomer = {
                ...customer,
                csid: customer.csid,
                billProductId,
                billBy: createdBy
            };
            const response = await fetch(backendServer + "customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedCustomer),
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
                const response = await fetch(backendServer + "admins");
                const data = await response.json();
                setAdmins(data);
                setLoading(false);
            }
            setShowAdminDropdown(true);
        } catch (error) {
            console.error("Error fetching admins:", error);
            setLoading(false);
        }
    };

    const handleSelectAdmin = (admin: Admin) => {
        setCreatedBy(admin.name);
        setShowAdminDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowAdminDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    useEffect(() => {
    }, [setSearchTerm]);

    useEffect(() => {
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
    }, [searchTerm]);

    const handleProductDataAdd = async (): Promise<string | null> => {
        try {
            const billProduct: BillProduct = {
                bpid: '',
                productList: products,
                subtotal: subtotal,
                total: total,
                tax: tax
            };

            const response = await fetch(backendServer + "billProduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(billProduct),
            });

            if (!response.ok) throw new Error("Failed to save BillProduct");

            const savedData = await response.json();
            return savedData.bpid;

        } catch (error) {
            console.error("Error saving bill product:", error);
            return null;
        }
    };


    const handleGenerateBill = async () => {
        try {
            setLoading(true);
            const billProductId = await handleProductDataAdd();
            if (!billProductId) throw new Error("Failed to save bill product.");
            handleCustomerAdd(billProductId);
            setShowModal(true);
        } catch (error) {
            console.error("Error generating bill:", error);
            alert("Something went wrong while generating the bill.");
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
                        {showAdminDropdown && (
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
