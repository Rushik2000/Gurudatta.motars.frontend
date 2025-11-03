import { useState, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Bill.module.css'
import type { Product, BillProduct, Customer, Admin } from '../types/types';

interface BillProps {
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

const Bill: React.FC<BillProps> = ({ setRefreshKey }) => {

    const [customer, setCustomer] = useState<Customer>({
        csid: null,
        name: '',
        phone: '',
        email: '',
        address: '',
        billProductId: null
    });

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
    const [date, setDate] = useState('');
    const [admins, setAdmins] = useState([]);
    const dropdownRef = useRef<HTMLUListElement | null>(null);
    const backendServer = 'http://localhost:8080/'
    const navigate = useNavigate();

    const removeProduct = (id: string |null) => {
        setProducts(prev => prev.filter(p => p.pid !== id));
    };
    const subtotal = products.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    useEffect(() => {
        const updateDate = () => {
            const today = new Date();
            setDate(today.toISOString().split('T')[0]);
        };

        updateDate();
    }, []);

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
        id: string | null,
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

    const handleNameChange = (id: string | null, value: string) => {
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

    const handleCustomerAdd = async (billProductId: string | null) => {
        try {
            const updatedCustomer = {
                ...customer,
                csid: customer.csid,
                billProductId: billProductId,
            };
            const response = await fetch(backendServer + "customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedCustomer),
            });
            const customerRes = await response.json();
            setCustomer(customerRes);
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
            const bpid = customer.billProductId ? customer.billProductId : '';
            const billProduct: BillProduct = {
                bpid: bpid,
                date: date,
                billBy: createdBy,
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

    const closeButtonHandler = () => {
        if (customer.name && customer.csid && total !== 0) {
            handleCustomerAdd(null);
        }
        navigate('/');

    }

    const addNewBillBtnHandler = async () => {
        // Making current customer billProductId as null so it can add new bill in the future with new id
        const customerParam = {
            ...customer,
            csid: customer.csid,
            billProductId: null,
        };

        const response = await fetch(backendServer + "customer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(customerParam),
        });

        const customerRes = await response.json();
        setCustomer(customerRes);

        // popup model will disappear
        setShowModal(false)

        // ✅ Reset whole Bill component (new bill)
        setRefreshKey(prev => prev + 1);

    }

    return (
        <div className={styles.billcontainer}>
            {/* Customer Details Section */}
            <div className={styles.customerdetails}>
                <div className={styles.billheader}>
                    <h5>🕉️गुरुदत्त मोटर्स & स्पेअर्स🕉️</h5>
                    <button
                        className={styles.closebutton}
                        onClick={closeButtonHandler}>Close X</button>
                </div>
                <div className={styles.customerform}>
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
                        onChange={handleCustomerChange}
                    />
                    <input
                        type="date"
                        name="date"
                        placeholder="Date"
                        value={date}
                        onChange={() => { }}
                        className={styles.dateinput}
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
            <div className={styles.tableContainer}>
                <table className={styles.billtable}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                </table>
                <div className={styles.tableBodyWrapper}>
                    <table className={styles.billtable}>
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
                                            className={styles.nostyleinput}
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
                                            className={styles.nostyleinput}
                                            inputMode="numeric"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={product.quantity.toString()}
                                            placeholder="Qty"
                                            onChange={(e) => handleNumericInput(e, product.pid, "quantity")}
                                            className={styles.nostyleinput}
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
                </div>
            </div>

            {/* ✅ Add Row Button */}
            <div className={styles.addrow}>
                <button onClick={addNewRow}>+ Add Row</button>
            </div>

            {/* Bill Summary */}
            <div className={styles.billsummary}>
                <p>Subtotal: ₹{subtotal}</p>
                <p>Tax (10%): ₹{tax}</p>
                <p><strong>Total: ₹{total}</strong></p>
            </div>

            <div className={styles.billfooterwrapper}>
                <div className={styles.creatorleft}>
                    <label htmlFor="createdBy">Created by:</label>
                    <div className={styles.dropdownwrapperr}>
                        <input
                            id="createdBy"
                            type="text"
                            value={createdBy}
                            readOnly
                            onClick={fetchAdmins}
                            placeholder="Select your name"
                            className={styles.nostyleinput}
                        />
                        {showAdminDropdown && (
                            <ul className={styles.dropdownn}>
                                {loading ? (
                                    <li>Loading...</li>
                                ) : admins.length > 0 ? (
                                    admins.map((admin: Admin) => (
                                        <li
                                            key={admin.aid}
                                            onMouseDown={() => handleSelectAdmin(admin)}
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

                <div className={styles.generatecenter}>
                    <button
                        onClick={handleGenerateBill}
                        disabled={loading || createdBy.trim() === "" || total === 0}
                        className={styles.generatebillbtn}
                    >
                        {loading ? "Generating..." : "🧾 Generate Bill"}
                    </button>
                </div>
            </div>

            {showModal && (
                <div className={styles.modaloverlay}>
                    <div className={styles.modalcontent}>
                        <h2>✅ Bill Generated Successfully</h2>
                        <div className={styles.modalactions}>
                            <button onClick={() => setShowModal(false)} className={styles.continuebtn}>Continue🔙</button>
                            <button onClick={handlePrint} className={styles.printbtn}>🖨️ Print</button>
                            {/* Write new logic for new bill */}
                            <button onClick={addNewBillBtnHandler} className={styles.newBillbtn}>
                                New Bill +
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Bill;
