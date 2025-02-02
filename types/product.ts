export interface DetailProductResponse {
    data: Product,
    meta: Meta
}
export interface ProductResponse {
    data: Data
    meta: Meta
}

export interface Data {
    data: Data2
    meta: IMeta
}

export interface Data2 {
    product: Product[]
}

export interface Product {
    name:string
    createdAt: string
    updatedAt: string
    id: string
    categoryId: string
    subcategoryId: string
    subonecategoryId: string
    brandId: string
    partNumber: string
    description: string
    sku: string
    thumbnail: string
    price: Price
    category: Category
    subcategory: Subcategory
    suboneCategory: SuboneCategory
    brand: Brand
    productVariant: ProductVariant[];
    stockSummaries: StockSummary[];
    wishlist: {id: string}[] 
}

export interface Price {
    wabDiscountPercentage: number
    createdAt: string
    updatedAt: string
    id: string
    basic: number
    discountPercentage: number
    discountValue: number
    discountPriceExcPpn: number
    ppnValue: number
    discountPriceIncPpn: number
    profitPercent: number
    profitValue: number
    webPriceIncPpn: number
    webPriceExcPpn: number
    basicWebPriceGapValue: number
    weight: number
    length: number
    width: number
    height: number
    productId: string
    productVariantId: string
    productVariantTypeId: string
}

export interface Category {
    createdAt: string
    updatedAt: string
    id: string
    name: string
    thumbnail: string
}

export interface Subcategory {
    createdAt: string
    updatedAt: string
    id: string
    thumbnail: string
    name: string
    categoryId: string
}

export interface SuboneCategory {
    createdAt: string
    updatedAt: string
    id: string
    thumbnail: string
    name: string
    subcategoryId: string
}

export interface Brand {
    createdAt: string
    updatedAt: string
    id: string
    name: string
    logo: string
}

export interface ProductVariant {
    name:string
    createdAt: string
    updatedAt: string
    id: string
    partNumber: string
    description: string
    sku: string
    productId: string
    productVariantType: ProductVariantType[]
    price: Price
    stockSummaries: StockSummary[]
}

export interface ProductVariantType {
    name:string
    createdAt: string
    updatedAt: string
    id: string
    partNumber: string
    description: string
    sku: string
    productVariantId: string
    price: Price
    stockSummaries: StockSummary
}


export interface IMeta {
    page: number
    limit: number
    total: number
    order: string
    orderBy: string
}

export interface Meta {
    version: string
}


export interface StockSummary {
    createdAt: string
    updatedAt: string
    id: string
    productId: string
    productVariantId: string
    productVariantTypeId: string
    stock: number
  }
  