<script setup lang="ts">
import type { CategoryDetailResponse, SubcategoryResponse } from '~/types/category';

const route = useRoute()
const router = useRouter()
const { id } = route.query
if(!id) router.go(-1)
const apiBase = useRuntimeConfig().public.apiBase;
console.log({id})
const { data: categoryData, error: categoryError } = await useFetch<CategoryDetailResponse>(`${apiBase}/category/${id}`, {
    key: 'category-detail-data',
});

if (categoryError.value) {
    console.error('Error fetching categories:', categoryError.value);
}

const { data: subcategoriesData, error: subcategoriesError } = await useFetch<SubcategoryResponse>(`${apiBase}/subcategory/category/${id}`, {
    key: 'category-data',
});
if (subcategoriesError.value) {
    console.error('Error fetching categories:', subcategoriesError.value);
}

const detailSubcategory = (id: string) => {
    router.push({
        name: 'subonecategory',
        query: {
            id
        }
    })
}
</script>
<template>
    <div class="w-full px-[14px]" v-if="categoryData">
        <AtomicsBannerSubcategory  :image="categoryData.data.thumbnail" :name="categoryData.data.name"/>
        <div class="px-[58px]">
            <div class="mb-[16px] flex flex-col w-full gap-3">
                <h1 class="text-[20px] font-bold">Sub Categories</h1>
                <UBreadcrumb
                    :links="[{ label: 'Home', to: '/' }, { label: 'All Categories', to: '/category' }, { label: categoryData.data.name, to: `/subcategory?id=${categoryData.data.id}` }]" />
            </div>
            <div class="flex  gap-[30px] flex-wrap" v-if="subcategoriesData">
                <AtomicsCardCategory v-for="sc in subcategoriesData.data" :image="sc.thumbnail" :name="sc.name" @detail="detailSubcategory" :id="sc.id" />
            </div>
        </div>
    </div>
</template>