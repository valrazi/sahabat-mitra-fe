export interface BrandResponse {
    data: Data[]
    meta: Meta
}

export interface Data {
    createdAt: string
    updatedAt: string
    id: string
    name: string
    logo: string
}

export interface Meta {
    version: string
}
