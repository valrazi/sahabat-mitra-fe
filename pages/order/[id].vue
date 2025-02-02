<script setup lang="ts">
import dayjs from 'dayjs';
import type { Order, ResponseOrderDetail } from '~/types/order';

definePageMeta({
    profile: true
})
const route = useRoute()
const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())
const uiStore = useUiStore()
const { id } = route.params

const orderData = ref<Order>()
const fetchData = async () => {
    uiStore.setLoading()
    const data = await $fetch<ResponseOrderDetail>(`${apiBase}/order/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    })
    if (data.data) {
        orderData.value = data.data
    }
    uiStore.removeLoading()
}

const activeTab = ref<'product' | 'shipping'>('product')
onMounted(() => {
    fetchData()
})
</script>
<template>
    <div class="w-full py-[61px] pr-[100px]" v-if="orderData">
        <div class="w-full flex justify-between mb-[30px]">
            <h1 class="font-bold text-2xl">Order: <span class="font-thin">{{ orderData.id }}</span></h1>
            <UButton variant="outline">
                {{ orderData.orderStatus.toUpperCase() }}
            </UButton>
        </div>

        <div class="w-full flex flex-col gap-3 mb-3">
            <h1 class="font-bold">{{ orderData.customer?.name ?? 'Customer' }}</h1>
            <h1 class="font-bold">Created: <span class="font-normal">
                    {{ dayjs(orderData.createdAt).format('DD MMM YYYY,HH:mm') }}</span></h1>
        </div>

        <div class="w-full flex justify-end mb-[30px]">
            <UButton class="bg-secondary hover:bg-secondary">
                <ULink type="button" target="_blank" :to="`/order/print?id=${orderData.id}`">Print Invoice</ULink>
            </UButton>
        </div>

        <div class="w-full pb-2 border-b-2 mb-5">
            <h1 class="text-2xl">Information Your Order</h1>
        </div>

        <div class="flex flex-col justify-center items-center gap-6 mb-[40px]">
            <div class="text-center text-lg">
                <h1>Paid At</h1>
                <h1 class="font-bold">{{ dayjs(orderData.paidAt).format(`DD MMM YYYY, HH:mm`) }}</h1>
            </div>
        </div>

        <div class="w-full pb-2 border-b-2 flex gap-[40px] mb-[50px]">
            <UButton @click="activeTab = 'product'" :class="{
                'bg-secondary hover:bg-secondary text-white': activeTab == 'product',
                'bg-white hover:bg-white text-black': activeTab != 'product'
            }">
                Product Order
            </UButton>

            <UButton @click="activeTab = 'shipping'" :class="{
                'bg-secondary hover:bg-secondary text-white': activeTab == 'shipping',
                'bg-white hover:bg-white text-black': activeTab != 'shipping'
            }">
                Shipping Info
            </UButton>
        </div>

        <div class="w-full" v-if="activeTab == 'product'">
            <table class="w-full text-left mb-[40px]">
                <thead>
                    <tr class="font-bold border-b-2">
                        <th class="pb-3">Product Name</th>
                        <th class="pb-3">SKU</th>
                        <th class="pb-3">Price</th>
                        <th class="pb-3">Qty</th>
                        <th class="pb-3">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="i in orderData.cart.cartItem">
                        <td class="text-sm">
                            <h1>{{ i.product.name }}</h1>
                            <div class="mt-1">
                                <p v-if="i.productVariant"><span class="font-bold">Variant</span> {{
                                    i.productVariant.partNumber }}</p>
                                <p v-if="i.productVariantType"><span class="font-bold">Type</span> {{
                                    i.productVariantType.partNumber }}</p>
                            </div>
                        </td>
                        <td>{{ i.product.sku }}</td>
                        <td>Rp. {{ i.price }}</td>
                        <td>{{ i.quantity }}</td>
                        <td>Rp.{{ i.subtotal }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="w-full p-5 border-2 rounded-lg flex flex-col gap-2">
                <div class="w-full flex justify-between">
                    <p>Payment Method</p>
                    <p>Bank Mandiri</p>
                </div>

                <div class="w-full flex justify-between">
                    <p>Subtotal Item</p>
                    <p>Rp. {{ orderData.cart.subtotal }}</p>
                </div>

                <div class="w-full flex justify-between">
                    <p>Shipping Fee</p>
                    <p>Rp. {{ orderData.deliveryPrice }}</p>
                </div>

                <div class="w-full flex justify-between font-bold mt-1">
                    <p>Grand Total</p>
                    <p>Rp. {{ orderData.grandTotal }}</p>
                </div>
            </div>
        </div>

        <div class="w-full" v-if="activeTab == 'shipping'">
            <h1 class="font-bold text-xl flex gap-12 mb-4">Courier:
                <span class="font-normal">{{ orderData.orderMethod?.courierCompany.toUpperCase() }} - {{ orderData.orderMethod?.courierType.toUpperCase() }}</span></h1>
            <h1 class="font-bold text-xl flex gap-10">Address: 
                <span class="font-normal flex flex-col gap-1">
                    <span>{{ orderData.address?.contactPhone }}</span>
                    <span>{{ orderData.address?.streetAddress }}</span>
                </span>
            </h1>
        </div>
    </div>
</template>
