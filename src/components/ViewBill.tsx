import styles from '../css/Bill.module.css';
import type { BillProduct, Customer } from '../types/types';
import closeIcon from '../assets/closebtn.png'

type ViewBillProps = {
    foundCustomer: Customer | undefined;
    bill: BillProduct | undefined;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewBill: React.FC<ViewBillProps> = ({
    foundCustomer,
    bill,
    setShowModal,
}: ViewBillProps) => {

    const closeButtonHandler = () => {
        setShowModal(false);
    }

    return (
        <div className={styles.billcontainer}>
            {/* Customer Details Section */}
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
                        placeholder="Customer Name"
                        value={foundCustomer?.name}
                        readOnly
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={foundCustomer?.phone}
                        readOnly
                    />
                    <input
                        type="date"
                        name="date"
                        placeholder="Date"
                        value={bill?.date}
                        readOnly
                        className={styles.dateinput}
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={foundCustomer?.address}
                        readOnly
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={foundCustomer?.email}
                        readOnly
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
                        </tr>
                    </thead>
                </table>
                <div className={styles.tableBodyWrapper}>
                    <table className={styles.billtable}>
                        <tbody>
                            {bill?.productList?.map(product => (
                                <tr key={product.pid}>
                                    <td>
                                        <input
                                            type="text"
                                            value={product.name}
                                            placeholder="Enter Product"
                                            readOnly
                                            className={styles.nostyleinput}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={'₹ ' + product.price}
                                            placeholder="Enter Price"
                                            readOnly
                                            className={styles.nostyleinput}
                                            inputMode="numeric"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={product.quantity.toString()}
                                            placeholder="Qty"
                                            readOnly
                                            className={styles.nostyleinput}
                                            inputMode="numeric"
                                        />
                                    </td>
                                    <td>{'₹ ' + product.price * product.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bill Summary */}
            <div className={styles.billFooter}>
                <div className={styles.creatorleft1}>
                    <label htmlFor="createdBy">Created by:</label>
                    <div className={styles.dropdownwrapperr}>
                        <input
                            id="createdBy"
                            type="text"
                            value={bill?.billBy}
                            readOnly
                            placeholder="Select your name"
                            className={styles.nostyleinput}
                        />
                    </div>
                </div>
                <div className={styles.billsummary1}>
                    <p>Subtotal: ₹{bill?.subtotal}</p>
                    <p>Tax (10%): ₹{bill?.tax}</p>
                    <p><strong>Total: ₹{bill?.total}</strong></p>
                </div>
            </div>
        </div>
    );
};

export default ViewBill;
