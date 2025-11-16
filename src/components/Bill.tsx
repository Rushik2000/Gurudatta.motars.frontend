import { useState, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Bill.module.css'
import type { Product, BillProduct, Customer, Admin } from '../types/types';
import closeIcon from '../assets/closebtn.png'

interface BillProps {
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

export const Bill: React.FC<BillProps> = ({ setRefreshKey }) => {

    const [customer, setCustomer] = useState<Customer>({
        csid: null,
        name: '',
        phone: '',
        email: '',
        address: '',
        billProductId: null
    });

    const initialProducts: Product[] = [
        { pid: null, name: '', price: 0, quantity: 1 }
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

    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [activeDropdownRow, setActiveDropdownRow] = useState<number | null>(null);
    const productDropdownRef = useRef<HTMLUListElement | null>(null);

    const removeProduct = (id: string | null) => {
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

    const checkPhoneExists = async (phone: string) => {
        try {
            const res = await fetch(backendServer + `customerByPhone?phone=${phone}`);
            const exists = await res.json();
            console.log("exists", exists)
            return exists;
        } catch (error) {
            console.error("Error checking phone", error);
            return false;
        }
    };

    const handleCustomerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let updatedValue = value;
        if (name === "phone") {
            const digit = value.replace(/\D/g, "");
            updatedValue = digit;

            if (digit.length === 10) {
                const exists = await checkPhoneExists(digit);
                if (exists) {
                    alert(`Customer with phone is already present.\nCustomer Name : ${exists.name} \nCustomer phone : ${exists.phone}
                        \nAdd new number to continue😊`);
                    setCustomer(prev => ({ ...prev, phone: "" }));
                    return;
                }
            }
        }
        if (name === 'name') {
            setSearchTerm(value);
        }
        setCustomer(prev => ({ ...prev, [name]: updatedValue }));
    };

    const addNewRow = () => {
        const newProduct: Product = {
            pid: uuid(),
            name: '',
            price: 0,
            quantity: 1,
        };
        setProducts(prev => [...prev, newProduct]);
        setActiveDropdownRow(null);
        setProductResults([]);
        setProductSearchTerm('');
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

    const handleNameChange = (rowIndex: number, value: string) => {
        setProducts((prev) =>
            prev.map((product, idx) => (idx === rowIndex ? { ...product, name: value } : product))
        );

        if (value.trim().length >= 2) {
            setProductSearchTerm(value);
            setActiveDropdownRow(rowIndex);
        } else {
            setProductSearchTerm('');
            setProductResults([]);
            setActiveDropdownRow(null);
        }
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
            if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
                setActiveDropdownRow(null);
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
            fetch(backendServer + `searchCustomer?name=${encodeURIComponent(searchTerm)}`)
                .then((res) => res.json())
                .then((data) => {
                    setCustomerResults(data);
                    setShowCustomerDropdown(true);
                })
                .catch((err) => console.error("Search failed", err));
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    useEffect(() => {
        if (!activeDropdownRow && activeDropdownRow !== 0) {
            setProductResults([]);
            return;
        }

        if (productSearchTerm.trim().length < 2) {
            setProductResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetch(backendServer + `searchProduct?name=${encodeURIComponent(productSearchTerm)}`)
                .then((res) => res.json())
                .then((data) => {
                    setProductResults(data);
                })
                .catch((err) => console.error("Search failed", err));
        }, 350);

        return () => clearTimeout(delayDebounce);
    }, [productSearchTerm, activeDropdownRow]);

    const autoFillProductDetail = (rowIndex: number, p: Product) => {
        if (p.quantity == 0) {
            alert(p.name + ' quantity is 0');
        }
        setProducts(prev =>
            prev.map((prod, idx) =>
                idx === rowIndex ? { ...prod, pid: p.pid, name: p.name, price: p.price ?? 0, quantity: p.quantity >= 1 ? 1 : 0 } : prod
            )
        );
        setProductSearchTerm('');
        setProductResults([]);
        setActiveDropdownRow(null);
    }

    const handleProductRemoveFromDB = async (): Promise<Product[] | null> => {
        try {
            const response = await fetch(backendServer + "product", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(products),
            });

            if (!response.ok) throw new Error("Failed to delete Product");

            const savedData = await response.json();
            return savedData;
        } catch (error) {
            console.error("Error saving bill product:", error);
            return null;
        }
    }

    const handleProductDataAdd = async (prodData: Product[]): Promise<string | null> => {
        try {
            const bpid = customer.billProductId ? customer.billProductId : '';
            const billProduct: BillProduct = {
                bpid: bpid,
                date: date,
                billBy: createdBy,
                productList: prodData,
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
            const prodData = await handleProductRemoveFromDB();
            if (!prodData) {
                throw new Error("No products returned!");
            }
            const billProductId = await handleProductDataAdd(prodData);
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
        setShowModal(false)
        setRefreshKey(prev => prev + 1);

    }

    return (
        <div className={styles.billcontainer}>
            <div className={styles.customerdetails}>
                <div className={styles.billheader}>
                    <h5>🕉️गुरुदत्त मोटर्स & स्पेअर्स🕉️</h5>
                    <div className={styles.closeimg}>
                        <button className={styles.closebutton} onClick={closeButtonHandler}>
                            <img src={closeIcon} alt="close" />
                        </button>
                    </div>
                </div>
                <div className={styles.customerform}>
                    <input
                        type="text"
                        name="name"
                        placeholder="👨‍🏭Customer Name"
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
                        maxLength={10}
                        placeholder="📞Phone Number"
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
                        placeholder="💼Address"
                        value={customer.address}
                        onChange={handleCustomerChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="📧Email"
                        value={customer.email}
                        onChange={handleCustomerChange}
                    />
                </div>
            </div>

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
                            {products.map((product, rowIndex) => (
                                <tr key={product.pid ?? rowIndex}>
                                    <td>
                                        <div className={styles.dropdownWrapper}>
                                            <input
                                                type="text"
                                                value={product.name}
                                                placeholder="Enter Product"
                                                onChange={(e) => { e.stopPropagation(); handleNameChange(rowIndex, e.target.value); }}
                                                className={styles.nostyleinput}
                                                onFocus={(e) => {
                                                    e.stopPropagation();
                                                    if (product.name.trim().length >= 2) {
                                                        setActiveDropdownRow(rowIndex);
                                                        setProductSearchTerm(product.name);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            {activeDropdownRow === rowIndex && productSearchTerm.trim().length >= 2 && productResults.length > 0 && (
                                                <ul className={styles.productDropdown1}
                                                    ref={productDropdownRef}
                                                    onClick={(e) => e.stopPropagation()}>
                                                    {productResults.map((p) => (
                                                        <li
                                                            key={p.pid}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                autoFillProductDetail(rowIndex, p);
                                                            }}
                                                        >
                                                            {p.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </td>

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

            <div className={styles.addrow}>
                <button onClick={addNewRow}>+ Add Row</button>
            </div>

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