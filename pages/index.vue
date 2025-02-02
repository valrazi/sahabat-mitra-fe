<script setup lang="ts">
import type { BrandResponse } from '~/types/brand';
import type { CategoryResponse } from '~/types/category';
import type { IMeta, Response } from '~/types/common';
import type { Brand, Category } from '~/types/product';

const router = useRouter()
const apiBase = useRuntimeConfig().public.apiBase;
const { data: categoriesData, error: categoriesError } = await useFetch<Response<{meta: IMeta; data: {category: Category[]}}>>(`${apiBase}/category`, {
  key: 'category-data', 
});
if (categoriesError.value) {
  console.error('Error fetching categories:', categoriesError.value);
}

const { data: brandsData, error: brandsError } = await useFetch<Response<{meta: IMeta; data: {brand: Brand[]}}>>(`${apiBase}/brand`, {
  key: 'brand-data', 
});
if (brandsError.value) {
  console.error('Error fetching brand:', brandsError.value);
}

const detailCategory = (id: string) => {
    router.push({
        name: 'subcategory',
        query: {
            id
        }
    })
}
</script>
<template>
    <div class="w-full min-h-dvh">
        <div class="relative w-full h-[527px] flex items-center justify-center" style="background-image: url('/img/hero.png');">
            <UButton size="xl" class="bg-secondary hover:bg-secondary translate-y-16">Belanja Sekarang</UButton>
        </div>
        <div class="mt-[70px] mb-[84px]">
            <h1 class="text-[24px] text-primary font-bold text-center mb-[50px]"><span class="pb-[5px] border-b-4  border-b-secondary">CATEGORY</span> PRODUCT</h1>
            <div class="w-full flex flex-wrap px-[78px] gap-[30px] mb-5" v-if="categoriesData">
                <AtomicsCardCategory v-for="c in categoriesData.data.data.category" :image="c.thumbnail" :name="c.name" :id="c.id" @detail="detailCategory"/>
            </div>
            <div class="w-full flex justify-end items-center px-[78px]">
                <ULink :to="'/category'">
                    <UButton size="xs" class="bg-secondary hover:bg-secondary ">More Info...</UButton>
                </ULink>
            </div>
        </div>

        <div class="mt-[70px] mb-[137px]">
            <h1 class="text-[24px] text-primary font-bold text-center mb-[50px]"><span class="pb-[5px] border-b-4  border-b-secondary">BRAND</span> PRODUCT</h1>
            <div class="w-full flex flex-wrap px-[78px] gap-[30px] mb-5" v-if="brandsData">
                <AtomicsCardBrand v-for="b in brandsData.data.data.brand" :id="b.id" :image="b.logo"/>
            </div>
            <div class="w-full flex justify-end items-center px-[78px]">
                <ULink :to="'/brand'">
                    <UButton size="xs" class="bg-secondary hover:bg-secondary ">More Info...</UButton>
                </ULink>
            </div>
        </div>
    </div>
</template>