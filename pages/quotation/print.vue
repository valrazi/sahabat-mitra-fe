<script setup lang="ts">
import dayjs from 'dayjs';
import type { Order, ResponseOrderDetail } from '~/types/order';
import type { Quotation, ResponseQuotationDetail } from '~/types/quotation';
definePageMeta({
    layout: 'printable'
})
const route = useRoute()
const { query } = route
const id = query.id
const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())
const quotationData = ref<Quotation>()


onMounted(async () => {
    if (id && accessToken.value) {
        const data = await $fetch<ResponseQuotationDetail>(`${apiBase}/quotation/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            }
        })
        if (data) quotationData.value = data.data
    }
}
)
const printPage = () => {
    window.print()
}
</script>
<template>
    <div class="w-full  flex flex-col items-center ">
        <div class="w-full flex justify-end p-3" id="print-btn">
            <UButton @click="printPage">Print</UButton>
        </div>
        <div class="max-w-[512px] h-[700px]  relative">
            <div class="w-full flex justify-between">
                <img src="/img/company-logo.png" alt="" class="w-1/2">
                <img src="/img/invoice-graphic.png" alt="" class="w-1/2">
            </div>
            <h1 class="font-bold text-[30px]">Quotation</h1>
            <h2>Generated {{ dayjs(quotationData?.createdAt).format('DD/MM/YYYY') }}</h2>
            <div class="w-full flex justify-between mt-1">
                <div class="text-sm">
                    <h1 class="font-bold">Bill To</h1>
                    <p>{{ quotationData?.customer?.name ?? 'Customer' }}</p>
                </div>
            </div>
            <table class="mt-4 w-full text-left border-y-2 border-black text-sm">
                <thead>
                    <tr>
                        <th class="pt-3 mb-2">Description</th>
                        <th class="pt-3 mb-2">Qty</th>
                        <th class="pt-3 mb-2">Unit Price</th>
                        <th class="pt-3 mb-2">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="bg-gray-200" v-for="i in quotationData?.cart.cartItem">
                        <td class="pb-3">
                            <p class="font-bold">{{ i.product.description }}</p>
                            <p>Brand: {{ i.product.brand.name }}</p>
                            <p>SKU: {{ i.product.sku }}</p>
                            <p v-if="i.productVariantId">Variant: {{ i.productVariant?.partNumber }}</p>
                            <p v-if="i.productVariantTypeId">Type: {{ i.productVariantType?.partNumber }}</p>
                        </td>
                        <td class="pb-3">
                            <p>{{ i.quantity }}</p>
                        </td>
                        <td class="pb-3">
                            <p>{{ i.price }}</p>
                        </td>
                        <td class="pb-3">
                            <p>{{ i.subtotal }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="w-full flex flex-col items-end my-3 gap-2 text-sm">
                <h1 class="w-1/3 flex justify-between">Subtotal <span class="font-bold">Rp.{{ quotationData?.subtotal
                        }}</span></h1>
                <h1 class="w-1/3 flex justify-between">Grand Total (incl tax) <span class="font-bold text-primary">Rp.{{
                    quotationData?.subtotal }}</span></h1>
            </div>
            <div class="w-full absolute bottom-0">
                <img src="/img/invoice-graphic.png" alt="" class="w-1/2 rotate-180">
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