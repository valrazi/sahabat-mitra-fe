<script setup lang="ts">
import { useUiStore } from '#build/imports';
import type { Order, ResponseOrderList } from '~/types/order';
import dayjs from 'dayjs';
import type { Quotation, ResponseQuotationList } from '~/types/quotation';
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
                quotationQuery.value.quoteStatus = undefined
                fetchQuotation()
            }
        },
        {
            label: 'Open',
            click: () => changeStatus('open')
        },
        {
            label: 'Closed',
            click: () => changeStatus('closed')
        },
        {
            label: 'Expired',
            click: () => changeStatus('expired')
        },
    ]
]

const quotationData = ref<Quotation[]>([])
const quotationQuery = ref<Query & {quotationNumber?: string; quoteStatus?:string}>({
    limit: 10,
    page: 1,
    order: 'desc',
    orderBy: 'createdAt'
})
const fetchQuotation = async () => {
    uiStore.setLoading()
    const data = await $fetch<ResponseQuotationList>(`${apiBase}/quotation/customer`, {
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        query: quotationQuery.value
    })
    if(data.data) {
        quotationData.value = data.data.data.quotation
    }
    uiStore.removeLoading()
}

const changeStatus = (status: string) => {
    if(quotationQuery.value.quoteStatus == status) quotationQuery.value.quoteStatus = undefined
    else quotationQuery.value.quoteStatus = status
    fetchQuotation()
}
onMounted(() => {
    fetchQuotation()
})
</script>
<template>
    <div class="w-full py-[61px]">
        <h1 class="font-semibold text-[27px] mb-[25px]">My Quotations</h1>
        <div class="w-full flex justify-between pr-[70px] mb-[45px]">
            <UButtonGroup class="w-full shadow-none" size="md" orientation="horizontal">
                <UInput class="w-1/2" placeholder="search" v-model="quotationQuery.quotationNumber" />
                <UButton icon="i-heroicons-magnifying-glass" class="bg-secondary hover:bg-secondary" @click="fetchQuotation" />
            </UButtonGroup>


            <UDropdown :items="items" mode="hover" :popper="{ placement: 'bottom-start' }">
                <UButton color="gray" label="Filter" leading-icon="i-heroicons-funnel"
                    trailing-icon="i-heroicons-chevron-down-20-solid" />
            </UDropdown>
        </div>

        <h1 class="font-medium text-2xl pb-2 border-b-2 w-[90%] mb-[25px]">All Quotations</h1>

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
                <tr v-for="o in quotationData" :key="o.id" class="text-sm">
                    <td scope="row" class="py-4 border-b">{{ o.quotationNumber }}</td>
                    <td class="py-4 border-b">{{ dayjs(o.createdAt).format('DD MMM YYYY, HH:mm') }}</td>
                    <td class="py-4 border-b">Rp. {{ o.subtotal }}</td>
                    <td class="py-4 border-b">{{ o.quoteStatus.toUpperCase() }}</td>
                    <td class="py-4 border-b">
                        <ULink :to="`quotation/${o.id}`" active-class="text-primary" inactive-class="text-primary">
                            View Order
                        </ULink>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>