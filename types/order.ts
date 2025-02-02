import type { Address } from "./address"
import type { Cart } from "./cart"

export interface ResponseOrderList {
    data: Data
    meta: {
        version: string
    }
}
export interface ResponseOrderDetail {
    data: Order,
    meta: {
        version: string
    }
}
export interface Data {
    meta: IMeta
    data: OrderList
}

export interface IMeta {
    page: number
    limit: number
    total: number
    order: string
    orderBy: string
}

export interface OrderList {
    order: Order[]
}

export interface Order {
    invoiceNumber: string;
    createdAt: string
    updatedAt: string
    id: string
    customerId: string
    addressId: string
    subtotal: number
    grandTotal: number
    deliveryPrice: number
    orderStatus: string
    paidAt: string
    paymentProof: string
    acceptAt: any
    rejectAt: any
    deliveryAt: any
    completedAt: any,
    address?: Address,
    customer?: Customer,
    orderMethod?: OrderMethod,
    cart: Cart
}

export interface OrderMethod {
    createdAt: string
    updatedAt: string
    id: string
    orderId: string
    method: string
    courierCompany: string
    courierType: string
    orderNote: string
  }
  

