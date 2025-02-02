<script setup lang="ts">
import type { SubcategoryDetailResponse, SubonecategoryResponse } from '~/types/category';

const route = useRoute()
const router = useRouter()
const { id } = route.query
if(!id) router.go(-1)
const apiBase = useRuntimeConfig().public.apiBase;
console.log({id})
const { data: subcategoryData, error: subcategoryError } = await useFetch<SubcategoryDetailResponse>(`${apiBase}/subcategory/${id}`, {
    key: 'subcategory-detail-data',
});

if (subcategoryError.value) {
    console.error('Error fetching categories:', subcategoryError.value);
}

const { data: subonecategoriesData, error: subonecategoriesError } = await useFetch<SubonecategoryResponse>(`${apiBase}/subonecategories/subcategory/${id}`, {
    key: 'subonecategories-data',
});
if (subonecategoriesError.value) {
    console.error('Error fetching categories:', subonecategoriesError.value);
}

const detailSubonecategory = (id: string) => {
    router.push({
        path: 'subonecategory/product',
        query: {
            id
        }
    })
}
</script>
<template>
    <div class="w-full px-[14px]" v-if="subcategoryData">
        <AtomicsBannerSubcategory :image="subcategoryData.data.thumbnail" :name="subcategoryData.data.name" />
        <div class="px-[58px]">
            <div class="mb-[16px] flex flex-col w-full gap-3">
                <h1 class="text-[20px] font-bold">Sub - 1 Categories</h1>
                <UBreadcrumb
                :links="[
                    {label: 'Home', to: '/'}, {label: 'All Categories', to: '/'}, 
                    { label: subcategoryData.data.name, to: `/subcategory?id=${subcategoryData.data.categoryId}` },
                    {label: subcategoryData.data.name, to: `/subonecategory?id=${subcategoryData.data.id}`}
                    ]"
                />
            </div>
            <div class="flex  gap-[30px] flex-wrap" v-if="subonecategoriesData">
                <AtomicsCardCategory v-for="soc in subonecategoriesData.data" :id="soc.id" :image="soc.thumbnail" :name="soc.name" @detail="detailSubonecategory" />
            </div>
        </div>
    </div>
</template>