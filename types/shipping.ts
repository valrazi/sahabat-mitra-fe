export interface ResponseShippingRate {
    data: ShippingRateList[]
    meta: Meta
  }
  
  export interface ShippingRateList {
    company: string
    pricing: ShippingPricing[]
  }
  
  export interface ShippingPricing {
    available_collection_method: string[]
    available_for_cash_on_delivery: boolean
    available_for_proof_of_delivery: boolean
    available_for_instant_waybill_id: boolean
    available_for_insurance: boolean
    company: string
    courier_name: string
    courier_code: string
    courier_service_name: string
    courier_service_code: string
    description: string
    duration: string
    shipment_duration_range: string
    shipment_duration_unit: string
    service_type: string
    shipping_type: string
    price: number
    type: string
  }
  
  export interface Meta {
    version: string
  }
  