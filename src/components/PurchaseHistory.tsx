import styles from '../css/Customer.module.css'
import { useState, useEffect } from 'react';
import type { Supplier, BillProduct } from '../types/types'
import { ViewBill } from './ViewBill';
import closeIcon from '../assets/closebtn.png'
import { useNavigate } from 'react-router-dom';

export const PurchaseHistory: React.FC = () => {

    const backendServer = 'http://localhost:8080/';
    const [historySearchTerm, setHistorySearchTerm] = useState("");
    const [searchSupplierResults, setSearchSupplierResults] = useState<Supplier[]>([]);
    const [showSupplierSeachDropdown, setShowSupplierSearchDropdown] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [foundSupplier, setFoundSupplier] = useState<Supplier>();
    const [searchedSupplierBills, setSearchedSupplierBills] = useState<BillProduct[]>([]);
    const [selectedBill, setSelectedBill] = useState<BillProduct>();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const getSupplierInfo = async (s: Supplier) => {
        setFoundSupplier(s)
        const billsData = await fetch(
            backendServer + `supplierBills/${s.sid}`
        );
        const data = await billsData.json();
        setSearchedSupplierBills(data);
    }

    const handleViewBills = async (bill: BillProduct) => {
        setSelectedBill(bill);
        setShowModal(true);
    };

    useEffect(() => {
        const fetchSuppliers = async () => {
            if (isSelecting) {
                setIsSelecting(false);
                return;
            }

            if (historySearchTerm.length < 2) {
                setSearchSupplierResults([]);
                setShowSupplierSearchDropdown(false);
                return;
            }

            const delayDebounce = setTimeout(() => {
                fetch(backendServer + `searchSupplier?name=${historySearchTerm}`)
                    .then((res) => res.json())
                    .then((data) => {
                        setSearchSupplierResults(data);
                        setShowSupplierSearchDropdown(true);
                    })
                    .catch((err) => console.error("Search failed", err));
            }, 100);

            return () => clearTimeout(delayDebounce);
        };

        fetchSuppliers();
    }, [historySearchTerm]);

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
            <div className={styles.customerlistsection}>
                <div className={styles.customerlistheader}>
                    <h2>Supplier History</h2>
                    <input
                        type="text"
                        name="name"
                        className={styles.searchbox}
                        placeholder="Search Supplier..."
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        onFocus={() => {
                            if (searchSupplierResults.length > 0) setShowSupplierSearchDropdown(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowSupplierSearchDropdown(false), 100);
                        }}
                    />
                    {showSupplierSeachDropdown && searchSupplierResults.length > 0 && (
                        <ul className={styles.searchdropdown}>
                            {searchSupplierResults.map((s) => (
                                <li key={s.sid} onMouseDown={() => {
                                    setIsSelecting(true);
                                    setHistorySearchTerm(s.name);
                                    setShowSupplierSearchDropdown(false);
                                    if (s.sid) getSupplierInfo(s);
                                }}>
                                    {s.name}
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
                                {foundSupplier && searchedSupplierBills.length > 0 ? (
                                    searchedSupplierBills.map((bill) => (
                                        <tr key={bill.bpid}>
                                            <td>{foundSupplier.name}</td>
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
                                            No Suppliers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.billView}>
                    {showModal && (
                        <ViewBill
                            found={foundSupplier}
                            bill={selectedBill}
                            setShowModal={setShowModal}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}