import styles from '../css/Customer.module.css';
import { useEffect, useState } from 'react';
import type { Product } from '../types/types'
import closeIcon from '../assets/closebtn.png'
import { useNavigate } from 'react-router-dom';

export const ViewProducts = () => {

    const backendServer = 'http://localhost:8080/';
    const [foundProduct, setFoundProduct] = useState<Product[]>();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch(backendServer + "products");
                const data = await response.json();
                data.sort((a: Product, b: Product) => (a.name ?? "").localeCompare(b.name ?? ""));
                setFoundProduct(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        fetchAllProducts();
    }, [])

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
                    <h2>Product History</h2>
                    {/* Consider search feature later 
                    <input
                        type="text"
                        name="name"
                        className={styles.searchbox}
                        placeholder="Search Product..."
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        onFocus={() => {
                            if (searchProductResults.length > 0) setShowProductSearchDropdown(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowProductSearchDropdown(false), 100);
                        }}
                    />
                    {showProductSeachDropdown && searchProductResults.length > 0 && (
                        <ul className={styles.searchdropdown}>
                            {searchProductResults.map((p) => (
                                <li key={p.pid} onMouseDown={() => {
                                    setIsSelecting(true);
                                    setHistorySearchTerm(s.name);
                                    setShowProductSearchDropdown(false);
                                    if (p.pid) getProductInfo(p);
                                }}>
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    )}
                        */}
                </div>

                <div className={styles.customertable}>
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table>
                            <tbody>
                                {foundProduct ? (
                                    foundProduct.map((product) => (
                                        <tr key={product.pid}>
                                            <td>{product.name}</td>
                                            <td>{'₹ ' + product.price}</td>
                                            <td>{product.quantity}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                                            No Products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}