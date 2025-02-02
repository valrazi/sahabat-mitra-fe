<script setup lang="ts">
import { useUiStore } from '#build/imports';
import type { Order, ResponseOrderList } from '~/types/order';
import dayjs from 'dayjs';
import type { Query } from '~/types/common';
definePageMeta({
    profile: true
})
const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())
const uiStore = useUiStore()
const items = [
    [
        {
            label: 'All',
            click: () => {
                orderQuery.value.orderStatus = undefined
                fetchOrder()
            }
        },
        {
            label: 'Pending',
            click: () => changeStatus('pending')
        },
        {
            label: 'Processed',
            click: () => changeStatus('processed')
        },
        {
            label: 'Delivered',
            click: () => changeStatus('delivered')
        },
        {
            label: 'Completed',
            click: () => changeStatus('completed')
        },
        {
            label: 'Rejected',
            click: () => changeStatus('rejected')
        }
    ]
]

const orderData = ref<Order[]>([])
const orderQuery = ref<Query &{orderStatus?: string; invoiceNumber?:string}>({
    limit: 10,
    page:1,
    order: 'desc',
    orderBy: 'createdAt'
})
const fetchOrder = async () => {
    uiStore.setLoading()
    const data = await $fetch<ResponseOrderList>(`${apiBase}/order/customer`, {
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        query: orderQuery.value
    })
    if(data.data) {
        orderData.value = data.data.data.order
    }
    uiStore.removeLoading()
}

const changeStatus = (status: string) => {
    if(orderQuery.value.orderStatus == status) orderQuery.value.orderStatus = undefined
    else orderQuery.value.orderStatus = status
    fetchOrder()
}
onMounted(async () => {
    fetchOrder()
})
</script>
<template>
    <div class="w-full py-[61px]">
        <h1 class="font-semibold text-[27px] mb-[25px]">My Orders</h1>
        <div class="w-full flex justify-between pr-[70px] mb-[45px]">
            <UButtonGroup class="w-full shadow-none" size="md" orientation="horizontal">
                <UInput class="w-1/2" placeholder="search" v-model="orderQuery.invoiceNumber"/>
                <UButton icon="i-heroicons-magnifying-glass" class="bg-secondary hover:bg-secondary" @click="fetchOrder" />
            </UButtonGroup>


            <UDropdown :items="items" mode="hover" :popper="{ placement: 'bottom-start' }">
                <UButton color="gray" :label="orderQuery.orderStatus ? orderQuery.orderStatus.toUpperCase() : 'Filter'" leading-icon="i-heroicons-funnel"
                    trailing-icon="i-heroicons-chevron-down-20-solid" />
            </UDropdown>
        </div>

        <h1 class="font-medium text-2xl pb-2 border-b-2 w-[90%] mb-[25px]">All Orders</h1>

        <table class="w-[90%] text-left">
            <thead class="border-b-2 mb-3">
                <tr>
                    <th scope="col" class="py-1">Code</th>
                    <th scope="col" class="py-1">Date</th>
                    <th scope="col" class="py-1">Total</th>
                    <th scope="col" class="py-1">Status</th>
                    <th scope="col" class="py-1">#</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="o in orderData" :key="o.id" class="text-sm">
                    <td scope="row" class="py-4 border-b-2">{{ o.invoiceNumber }}</td>
                    <td class="py-4 border-b-2">{{ dayjs(o.createdAt).format('DD MMM YYYY, HH:mm') }}</td>
                    <td class="py-4 border-b-2">Rp. {{ o.grandTotal }}</td>
                    <td class="py-4 border-b-2">{{ o.orderStatus.toUpperCase() }}</td>
                    <td class="py-4 border-b-2">
                        <ULink :to="`order/${o.id}`" active-class="text-primary" inactive-class="text-primary">
                            View Order
                        </ULink>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>