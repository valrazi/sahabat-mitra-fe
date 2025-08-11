<script setup lang="ts">
import type { SubonecategoryDetailResponse } from '~/types/category'
import type { IMeta, Response } from '~/types/common'
import type { Product, ProductResponse } from '~/types/product'
import formatRupiah from '~/utils/strings/rupiahFormatter'

const {accessToken} = storeToRefs(useUserStore())


const route = useRoute()
const router = useRouter()
const { id } = route.query
// const id = '1c8c9092-80b4-4278-b360-26f03328e26c'
// if(!id) router.go(-1)
const apiBase = useRuntimeConfig().public.apiBase;
const { data: subonecategoryData, error: subonecategoryError } = await useFetch<SubonecategoryDetailResponse>(`${apiBase}/subonecategories/${id}`, {
    key: 'subonecategory-detail-data',
});

if (subonecategoryError.value) {
    console.error('Error fetching categories:', subonecategoryError.value);
}


const page = ref<number>(1)
const total = ref<number>(0)
const { data: productsData, error: productsError, execute } = await useFetch<Response<{meta: IMeta; data: {product: Product[]}}>>(`${apiBase}/product`, {
    key: 'products-data',
    query: {
        subonecategoryId: id,
        page: page.value
    },
    headers: {
        Authorization: `Bearer ${accessToken.value}`
    },
});
if(productsData.value) {
    total.value = productsData.value.data.meta.total
}
if (productsError.value) {
    console.error('Error fetching categories:', productsError.value);
}

const detailProduct = (id: string) => {
    router.push({
        path: '/product/detail/' + id,
    })
}

const addWishlist = async (id: string) => {
    const data = await $fetch<Response<any>>(`${apiBase}/wishlist`, {
        method: 'POST',
        headers: {
            Authorization : `Bearer ${accessToken.value}`
        },
        body: {
            productId: id
        }
    })
    if(!data.error) {
        useSwal()
        .fire({
            title: `Success`,
            icon: 'success'
        })
        .then(async () => {
           await execute()
        })
    }
}

const removeWishlist = async(id: string) => {
    useSwal()
    .fire({
        title: `Remove Wishlist?`,
        text: `Action can't be undone`,
        showCancelButton: true,
        icon: 'question'
    })
    .then(async (res) => {
        if(res.isConfirmed) {
            const data = await $fetch<Response<any>>(`${apiBase}/wishlist/${id}`, {
                method: 'delete',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                }
            })
            if(!data.error) {
                useSwal()
                .fire({
                    title: `Success`,
                    icon: 'success'
                })
                .then(async () => {
                    await execute()
                })
            }
        }
    })
}

watch(() => page.value, async () => {
    await execute()
})
</script>
<template>
    <div class="w-full px-[14px]" v-if="subonecategoryData">
        <AtomicsBannerSubcategory :image="subonecategoryData.data.thumbnail" :name="subonecategoryData.data.name" />
        <div class="px-[58px]">
            <div class="mb-[16px] flex flex-col w-full gap-3">
                <h1 class="text-[20px] font-bold">All Products</h1>
                <!-- <UBreadcrumb
                    :links="[
                        { label: 'Home', to: '/' }, 
                        { label: 'All Categories', to: '/' }, 
                        { label: subonecategoryData.data.subcategory.category.name, to: `/subcategory?id=${subonecategoryData.data.subcategory.categoryId}` },
                        { label: subonecategoryData.data.subcategory.name, to: `/subonecategory?id=${subonecategoryData.data.subcategoryId}` },
                        { label: subonecategoryData.data.name, to: `/subonecategory/product?id=${subonecategoryData.data.id}` }
                    ]" /> -->
            </div>
            <div class="flex  gap-x-[70px] gap-y-[30px] flex-wrap mb-[60px]" v-if="productsData">
                <div class="min-w-[200px] max-w-[200px] min-h-[290px] flex-shrink-0 p-[14px] bg-white shadow-md rounded-lg"
                    v-for="p in productsData.data.data.product">
                    <img :src="p.thumbnail" alt="" class="min-h-[118px] max-h-[118px] w-full">
                    <div class="flex gap-[6px] ">
                        <div class="max-w-[40px] max-h-[21px] flex-shrink-0 bg-primary p-[6px] rounded-md">
                            <img :src="p.brand.logo" alt="" class="w-[10px]">
                        </div>
                        <h1 class="text-left text-xs line-clamp-2">{{ p.name }}
                        </h1>
                    </div>
                    <div class="w-full flex flex-col gap-[7px] my-[8px]" v-if="p.price">
                        <div class="w-full flex gap-[11px] justify-center items-center">
                            <h1 v-if="p.brand.name == 'Schneider'" class="line-through text-sm text-primary">{{ formatRupiah(p.price.basic) }}</h1>
                            <UBadge color="primary" variant="soft">{{ Math.floor(p.price.wabDiscountPercentage) }}%</UBadge>
                        </div>
                    </div>
                    <div class="w-full flex justify-center items-center mb-[10px]">
                        <h1 class="text-base font-bold text-primary" v-if="p.price">{{ formatRupiah(p.price.webPriceIncPpn) }}</h1>
                    </div>
                    <div class="w-full flex flex-col gap-[7px]">
                        <UButton block @click="detailProduct(p.id)">Add to Cart</UButton>
                        <UButton block color="red" variant="outline" @click="removeWishlist(p.wishlist[0].id)" v-if="p.wishlist &&  p.wishlist.length > 0">Remove from Wishlist</UButton>
                        <UButton block color="primary" variant="outline" @click="addWishlist(p.id)" v-else>Add to Wishlist</UButton>
                    </div>
                </div>
            </div>
            <div class="w-full flex justify-center items-center">
                <UPagination v-model="page" :page-count="10" :total="total" />
            </div>
        </div>
    </div>
</template>