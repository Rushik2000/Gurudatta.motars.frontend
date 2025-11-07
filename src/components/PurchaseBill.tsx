import styles from '../css/Bill.module.css'
import closeIcon from '../assets/closebtn.png'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Supplier, Product, Admin, BillProduct } from '../types/types';
import { v4 as uuid } from 'uuid';

interface BillProps {
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

export const PurchaseBill: React.FC<BillProps> = ({ setRefreshKey }) => {

    const [supplier, setSupplier] = useState<Supplier>({
        sid: null,
        name: '',
        phone: '',
        email: '',
        address: '',
        billId: null
    });
    const initialProducts: Product[] = [
        { pid: null, name: '', price: 0, quantity: 1 }
    ];
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const navigate = useNavigate();
    const backendServer = 'http://localhost:8080/';
    const [searchTerm, setSearchTerm] = useState("");
    const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [date, setDate] = useState('');
    const [createdBy, setCreatedBy] = useState("");
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const subtotal = products.reduce((sum, i) => sum + i.price * i.quantity, 0);
    //const tax = subtotal * 0.1;
    const tax = 0;
    const total = subtotal + tax;

    useEffect(() => {
        const updateDate = () => {
            const today = new Date();
            setDate(today.toISOString().split('T')[0]);
        };
        updateDate();
    }, []);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSupplierResults([]);
            setShowSupplierDropdown(false);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetch(backendServer + `searchSupplier?name=${searchTerm}`)
                .then((res) => res.json())
                .then((data) => {
                    setSupplierResults(data);
                    setShowSupplierDropdown(true);
                })
                .catch((err) => console.error("Search failed", err));
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

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

    const addNewRow = () => {
        const newProduct: Product = {
            pid: uuid(),
            name: '',
            price: 0,
            quantity: 1,
        };
        setProducts(prev => [...prev, newProduct]);
    };

    const handleSupplierAdd = async (billId: string | null) => {
        try {
            const updatedSupplier = {
                ...supplier,
                sid: supplier.sid,
                billId: billId,
            };
            const response = await fetch(backendServer + "supplier", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedSupplier),
            });
            const supplierRes = await response.json();
            setSupplier(supplierRes);
        } catch (error) {
            console.error("Error saving data: ", error);
        }
    };

    const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setSearchTerm(value);
        }
        setSupplier(prev => ({ ...prev, [name]: value }));
    };

    const autoFillSupplierDetail = (s: Supplier) => {
        setSearchTerm(s.name);
        const newSupplier: Supplier = {
            sid: s.sid,
            name: s.name,
            phone: s.phone,
            email: s.email,
            address: s.address,
            billId: s.billId
        }
        setSupplier(newSupplier);
        setShowSupplierDropdown(false);
    };

    const handleNameChange = (id: string | null, value: string) => {
        setProducts((prev) =>
            prev.map((product) => (product.pid === id ? { ...product, name: value } : product))
        );
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

    const removeProduct = (id: string | null) => {
        setProducts(prev => prev.filter(p => p.pid !== id));
    };

    const handleProductDataAdd = async (): Promise<string | null> => {
        try {
            const bid = supplier.billId ? supplier.billId : '';
            const billProduct: BillProduct = {
                bpid: bid,
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
            const billId = await handleProductDataAdd();
            if (!billId) throw new Error("Failed to save bill product.");
            handleSupplierAdd(billId);
            setShowModal(true);
        } catch (error) {
            console.error("Error generating bill:", error);
            alert("Something went wrong while generating the bill.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        setShowModal(false);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const addNewBillBtnHandler = async () => {
        // Making current supplier billId as null so it can add new bill in the future with new id
        const supplierParam = {
            ...supplier,
            csid: supplier.sid,
            billId: null,
        };

        const response = await fetch(backendServer + "supplier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(supplierParam),
        });

        const supplierRes = await response.json();
        setSupplier(supplierRes);

        // popup model will disappear
        setShowModal(false)

        // ✅ Reset whole Bill component (new bill)
        setRefreshKey(prev => prev + 1);
    }

    const closeButtonHandler = () => {
        if (supplier.name && supplier.sid && total !== 0) {
            handleSupplierAdd(null);
        }
        navigate('/');
    }

    return (
        <div className={styles.billcontainer}>
            {/* Supplier Details Section */}
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
                        placeholder="👨‍🏭Supplier Name"
                        value={supplier.name}
                        onChange={handleSupplierChange}
                        onFocus={() => {
                            if (supplierResults.length > 0) setShowSupplierDropdown(true);
                        }}
                    />

                    {showSupplierDropdown && supplierResults.length > 0 && (
                        <ul className={styles.dropdown}>
                            {supplierResults.map((s) => (
                                <li key={s.sid} onMouseDown={() => {
                                    autoFillSupplierDetail(s)
                                }}>
                                    {s.name}
                                </li>
                            ))}
                        </ul>
                    )}

                    <input
                        type="text"
                        name="phone"
                        placeholder="📞Phone Number"
                        value={supplier.phone}
                        onChange={handleSupplierChange}
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
                        value={supplier.address}
                        onChange={handleSupplierChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="📧Email"
                        value={supplier.email}
                        onChange={handleSupplierChange}
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
                {/*<p>Subtotal: ₹{subtotal}</p>
                 <p>Tax (0%): ₹{tax}</p> */}
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
                            onFocus={() => {
                                if (admins.length > 0) setShowAdminDropdown(true);
                            }}
                            onBlur={(e) => {
                                if(e.target.contains(e.relatedTarget)) {
                                    setShowAdminDropdown(false);
                                }
                            }}
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
                        {loading ? "Generating..." : "🧾 Generate Purchase"}
                    </button>
                </div>
            </div>

            {showModal && (
                <div className={styles.modaloverlay}>
                    <div className={styles.modalcontent}>
                        <h2>✅ Purchase Bill Generated Successfully</h2>
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
}