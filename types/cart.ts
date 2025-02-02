import type { Customer } from "~/stores/user"
import type { Product, ProductVariant, ProductVariantType } from "./product"

export interface Cart {
    createdAt: string
    updatedAt: string
    id: string
    customerId: string
    orderId: any
    quotationId: any
    subtotal: number
    customer: Customer
    cartItem: CartItem[]
}

export interface CartItem {
    createdAt: string
    updatedAt: string
    id: string
    cartId: string
    productId: string
    productVariantId: string
    productVariantTypeId: string
    quantity: number
    price: number
    proceedOrder: boolean
    isOutOfStock: boolean
    subtotal: number
    product: Product,
    productVariant?: ProductVariant;
    productVariantType?: ProductVariantType;
    tempQty: number
}

export interface CartResponse {
    data: Cart,
    meta: {
        version: string
    }
}