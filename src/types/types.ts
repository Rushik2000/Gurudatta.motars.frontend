export interface Product {
    pid: string | null;
    name: string;
    price: number;
    quantity: number;
}

export interface BillProduct {
    bpid: string | null;
    date?: string;
    billBy?: string;
    productList: Product[];
    subtotal: number;
    total: number;
    tax: number;
}

export interface Customer {
    csid: string | null;
    name: string;
    phone: string;
    email: string;
    address: string;
    billProductId: string | null;
}

export interface Admin {
    aid: string | null;
    name: string;
}

export interface Supplier {
    sid: string | null;
    name: string,
    phone: string,
    email: string,
    address: string,
    billId: string | null;
}