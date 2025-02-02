<script setup lang="ts">
import type { BrandResponse } from '~/types/brand';
import type { IMeta, Response } from '~/types/common';
import type { Brand } from '~/types/product';


const apiBase = useRuntimeConfig().public.apiBase;
const { data: brandsData, error: brandsError } = await useFetch<Response<{meta: IMeta; data: {brand: Brand[]}}>>(`${apiBase}/brand`, {
    key: 'brand-data',
});
</script>
<template>
    <div class="w-full py-[60px] px-[40px]" v-if="brandsData">
        <h1 class="text-[24px] text-primary font-bold text-center mb-[30px]"><span
                class="pb-[5px] border-b-4  border-b-secondary">ALL BRANDS</span> PRODUCT</h1>
        <div class="flex  gap-[20px] flex-wrap">
            <AtomicsCardBrand v-for="b in brandsData.data.data.brand" :id="b.id" :image="b.logo" />
        </div>
    </div>
</template>