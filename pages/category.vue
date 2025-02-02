<script setup lang="ts">
import type { CategoryResponse } from '~/types/category';
import type { IMeta, Response } from '~/types/common';
import type { Category } from '~/types/product';

const router = useRouter()
const apiBase = useRuntimeConfig().public.apiBase;
const { data: categoriesData, error: categoriesError } = await useFetch<Response<{meta: IMeta; data: {category: Category[]}}>>(`${apiBase}/category`, {
  key: 'category-data', 
});
if (categoriesError.value) {
  console.error('Error fetching categories:', categoriesError.value);
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
    <div class="w-full py-[60px] px-[40px]">
        <h1 class="text-[24px] text-primary font-bold text-center mb-[30px]"><span
                class="pb-[5px] border-b-4  border-b-secondary">ALL CATEGORIES</span> PRODUCT</h1>
        <div class="flex  gap-[20px] flex-wrap" v-if="categoriesData">
            <AtomicsCardCategory 
            @detail="detailCategory"
            :id="c.id"
            :image="c.thumbnail"
            :name="c.name"
            v-for="c in categoriesData.data.data.category" />
        </div>
    </div>
</template>