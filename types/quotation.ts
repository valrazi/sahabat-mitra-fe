import type { Cart } from "./cart"
import type { Order } from "./order"

export interface ResponseQuotationList {
  data: Data
  meta: {
    version: string
  }
}

export interface ResponseQuotationDetail {
  data: Quotation,
  meta: {
    version: string
  }
}
export interface Data {
  meta: IMeta
  data: QuotationList
}

export interface IMeta {
  page: number
  limit: number
  total: number
  order: string
  orderBy: string
}

export interface QuotationList {
  quotation: Quotation[]
}

export interface Quotation {
  createdAt: string
  updatedAt: string
  id: string
  customerId: string
  orderId: any
  quoteStatus: string
  expiredAt: string
  subtotal: number;
  customer?: Customer;
  order?: Order;
  cart: Cart
  quotationNumber: string
}

