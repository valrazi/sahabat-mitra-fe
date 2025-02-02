<script setup lang="ts">
import dayjs from 'dayjs';
import { type Address, type ResponseAddressList } from '~/types/address';
import type { Quotation, ResponseQuotationDetail } from '~/types/quotation';
import { type ShippingRateList, type ResponseShippingRate, type ShippingPricing } from '~/types/shipping';
definePageMeta({
    profile: true
})
const route = useRoute()
const {id} = route.params
const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())
const uiStore = useUiStore()
const quotationData = ref<Quotation>()

const fetchQuotation = async () => {
    uiStore.setLoading()
    const { data, status } = await useAsyncData('quoteDetail', () => $fetch<ResponseQuotationDetail>(`${apiBase}/quotation/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }))
    if (status.value != 'pending') uiStore.removeLoading()
    if (data.value) quotationData.value = data.value.data
}
onMounted(async () => {
    if (id && accessToken.value) {
        await fetchQuotation()
        await fetchAddress()
        await fetchShipping()
    }
})

const addToOrder = ref<boolean>(false)
const toggleOrder = async () => {
    addToOrder.value = !addToOrder.value
    if (!addToOrder.value) {
        await fetchQuotation()
    }
}
const allItems = ref<boolean>(false)
watch(() => allItems.value, async () => {
    if (allItems.value) {
        quotationData.value?.cart.cartItem.forEach((i) => {
            i.proceedOrder = true
        })
    } else {
        await fetchQuotation()
    }
})

const selectedAddress = ref<Address>()
const adressList = ref<Address[]>([])
const fetchAddress = async () => {
    uiStore.setLoading()
    const { data, status } = await useAsyncData('quoteDetail', () => $fetch<ResponseAddressList>(`${apiBase}/address`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    }))
    if (status.value != 'pending') uiStore.removeLoading()
    if (data.value) adressList.value = data.value.data
    selectedAddress.value = adressList.value.find((a) => a.isDefault)
}

const selectedDelivery = ref<ShippingPricing>()
const deliveryList = ref<ShippingRateList[]>()
const fetchShipping = async () => {
    const { data } = await useAsyncData('quoteDetail', () => $fetch<ResponseShippingRate>(`${apiBase}/order/rates`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        body: {
            addressId: selectedAddress.value?.id,
            cartId: quotationData.value?.cart.id
        }
    }))
    if (data.value) {
        deliveryList.value = data.value.data
    }
}

const setSelectedDelivery = (data: ShippingPricing) => {
    if (selectedDelivery.value && selectedDelivery.value.company == data.company && selectedDelivery.value.type == data.type) {
        selectedDelivery.value = undefined
    } else {
        selectedDelivery.value = data
    }
}

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target?.files?.[0]) {
        selectedFile.value = target.files[0];
    }
};

const uploadImage = async () => {
    if (!selectedFile.value) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile.value);

    console.log(formData)
    try {
        const { data, error } = await useFetch<{ data: {url: string}, meta: {version:string} }>(`${apiBase}/media`, {
            method: 'POST',
            body: formData,
        });

        if (error?.value) {
            console.error('Upload failed:', error.value);
            alert('Upload failed');
            return;
        }
        return data.value?.data.url
    } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred');
    }
}
const checkoutQuotations = async () => {
    uploadImage().then(async (res) => {
        console.log({res})
        const data = await $fetch(`${apiBase}/quotation/order`, {
            method: 'post',
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            },
            body: {
                proceedCartItems: quotationData.value?.cart.cartItem.filter((i) => i.proceedOrder).map((i) => i.id),
                quotationId: quotationData.value?.id,
                addressId: selectedAddress.value?.id,
                courierCompany: selectedDelivery.value?.company,
                courierType: selectedDelivery.value?.type,
                orderNote: "",
                paymentProof: res
            }
        })
    })

}

</script>
<template>
    <div class="w-full  py-[61px]">
        <div class="w-[80%]">
            <div class="w-full flex justify-between">
                <h1 class="font-bold text-lg">Quote #{{ quotationData?.id }}</h1>
                <UButton variant="outline">
                    {{ quotationData?.quoteStatus }}
                </UButton>
            </div>
            <div class="w-full flex justify-between items-end my-[30px]">
                <div class="flex flex-col gap-3 text-sm">
                    <h1>{{ quotationData?.customer?.name ?? 'Customer' }}</h1>
                    <h1>Created Date: {{ dayjs(quotationData?.createdAt).format('DD MMM YYYY') }}</h1>
                    <h1>Expired Date: {{ dayjs(quotationData?.expiredAt).format('DD MMM YYYY') }}</h1>
                </div>
                <UButton class="bg-secondary hover:bg-secondary">
                    <ULink type="button" target="_blank" :to="`/quotation/print?id=${quotationData?.id}`">Print</ULink>
                </UButton>
            </div>
            <div class="w-full my-[30px] p-4 bg-gray-100 rounded-lg" v-if="quotationData?.quoteStatus == 'OPEN' && addToOrder">
                <h1>Alamat Pengiriman</h1>
                <div class="w-full bg-gray-200 flex justify-between rounded-lg">
                    <div class="flex px-1 p-3 gap-x-1">
                        <UIcon name="i-heroicons-map-pin" />
                        <div class="text-sm">
                            <h1>{{ selectedAddress?.contactName }}</h1>
                            <p>{{ selectedAddress?.streetAddress }}, {{ selectedAddress?.zipcode }}</p>
                        </div>
                    </div>
                    <div class="w-1/4 flex justify-end items-center px-1">
                        <UButton class="bg-secondary hover:bg-secondary">Change Address</UButton>
                    </div>
                </div>

                <h1 class="mt-3">Layanan Pengiriman</h1>
                <div class="max-h-[200px] overflow-y-scroll">
                    <div class="my-1 flex flex-col gap-1" v-for="d in deliveryList">
                        <h1>{{ d.company.toUpperCase() }}</h1>
                        <ul>
                            <li :class="{ 'bg-secondary text-white': selectedDelivery?.company == dp.company && selectedDelivery.type == dp.type }"
                                class="p-2 border-b hover:cursor-pointer" @click="setSelectedDelivery(dp)"
                                v-for="dp in d.pricing">
                                <span>{{ dp.courier_name }} - {{ dp.courier_service_name }} (Rp. {{ dp.price }})</span>
                                <p class="text-xs">{{ dp.duration }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div>
                <h1 class="text-xl border-b pb-3">Item Quotes</h1>
                <table class="w-full my-[30px] text-left">
                    <thead class="border-b-2 mb-3">
                        <tr>
                            <th scope="col" class="py-1" v-if="addToOrder">
                                <input type="checkbox" v-model="allItems">
                            </th>
                            <th scope="col" class="py-1">Product Name</th>
                            <th scope="col" class="py-1">SKU</th>
                            <th scope="col" class="py-1">Price</th>
                            <th scope="col" class="py-1">Qty</th>
                            <th scope="col" class="py-1">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="o in quotationData?.cart.cartItem" :key="o.id" class="text-sm">
                            <th scope="col" class="py-1" v-if="addToOrder">
                                <input type="checkbox" v-model="o.proceedOrder">
                            </th>
                            <td scope="row" class="py-4 border-b flex gap-x-1">
                                <span>{{ o.product.description }}</span>
                                <span v-if="o.productVariantId">{{ o.productVariant?.partNumber }}</span>
                                <span v-if="o.productVariantTypeId">{{ o.productVariantType?.partNumber }}</span>
                            </td>
                            <td class="py-4 border-b">{{ o.product.sku }}</td>
                            <td class="py-4 border-b font-bold">Rp. {{ o.price }}</td>
                            <td class="py-4 border-b">{{ o.quantity }}</td>
                            <td class="py-4 border-b font-bold">Rp. {{ o.subtotal }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="w-full p-5 flex flex-col justify-between min-h-[140px] border-2 rounded-lg">
                    <div class="w-full flex justify-between text-sm">
                        <h1>Quote Subtotal (Incl. Tax)</h1>
                        <h2>Rp. {{ quotationData?.subtotal }}</h2>

                    </div>
                    <div class="w-full flex justify-between text-sm" v-if="selectedDelivery">
                        <h1>Delivery Price </h1>
                        <h2>Rp. {{ selectedDelivery?.price }}</h2>
                    </div>

                    <div class="w-full flex justify-between font-bold text-sm">
                        <h1>Grand Total</h1>
                        <h2 v-if="quotationData && selectedDelivery">Rp. {{ quotationData?.subtotal +
                            selectedDelivery?.price }}</h2>
                        <h2 v-else>Rp. {{ quotationData?.subtotal }}</h2>

                    </div>
                </div>

                <div class="w-full my-4 flex flex-col" v-if="quotationData?.quoteStatus == 'OPEN' && addToOrder">
                    <label for="">Bukti Transfer</label>
                    <input type="file" ref="fileInput" @change="handleFileChange" />
                </div>
                <div class="w-full flex justify-end mt-[40px] gap-2">
                    <UButton variant="outline" @click="toggleOrder" v-if="addToOrder">Cancel</UButton>
                    <UButton class="bg-secondary hover:bg-secondary disabled:bg-secondary/50"
                        @click="() => addToOrder ? checkoutQuotations() : toggleOrder()"
                        v-if="quotationData?.quoteStatus == 'OPEN'"
                        :disabled="addToOrder && quotationData.cart.cartItem.filter((i) => i.proceedOrder == true).length < 1">
                        Add to Order
                    </UButton>

                </div>
            </div>
        </div>
    </div>
</template>
<style>
@media print {
    #print-btn {
        display: none;
    }
}
</style>