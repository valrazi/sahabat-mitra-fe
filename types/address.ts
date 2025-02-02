export interface Address {
  createdAt: string
  updatedAt: string
  id: string
  name: string
  contactName: string
  contactPhone: string
  streetAddress: string
  country: string
  note: string
  zipcode: string
  latitude: number
  longitude: number
  isDefault: boolean
  customerId: string
}

export interface ResponseAddressList {
  data: Address[];
  meta: {
    version: string
  }
}
