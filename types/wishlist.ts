import type { Product } from "./product"

export type Wishlist = {
    createdAt: string
    updatedAt: string
    id: string
    productId: string
    customerId: string
    product: Product
}