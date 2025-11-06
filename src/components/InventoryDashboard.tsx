import { useState } from 'react';
import styles from '../css/InventoryDashboard.module.css';
import { PurchaseWrapper } from './helper/PurchaseWrapper';

export const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('purchaseBill');

    const renderContent = () => {
        switch (activeTab) {
            case 'purchaseBill':
                return <PurchaseWrapper />;
            

            case 'purchaseHistory':
                return <PurchaseHistory />;


            case 'viewProducts':
                return <ViewProducts />;


            case 'updateProduct':
                return <UpdateProduct />;


            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* LEFT MENU */}
            <div className={styles.menu}>
                <button
                    className={`${styles.menuBtn} ${activeTab === 'purchaseBill' ? styles.active : ''}`}
                    onClick={() => setActiveTab('purchaseBill')}
                >
                    Purchase Bill
                </button>


                <button
                    className={`${styles.menuBtn} ${activeTab === 'purchaseHistory' ? styles.active : ''}`}
                    onClick={() => setActiveTab('purchaseHistory')}
                >
                    Purchase History
                </button>


                <button
                    className={`${styles.menuBtn} ${activeTab === 'viewProducts' ? styles.active : ''}`}
                    onClick={() => setActiveTab('viewProducts')}
                >
                    View Products
                </button>


                <button
                    className={`${styles.menuBtn} ${activeTab === 'updateProduct' ? styles.active : ''}`}
                    onClick={() => setActiveTab('updateProduct')}
                >
                    Update Product Info
                </button>
            </div>


            {/* RIGHT SIDE CONTENT */}
            <div className={styles.content}>{renderContent()}</div>
        </div>
    );
};