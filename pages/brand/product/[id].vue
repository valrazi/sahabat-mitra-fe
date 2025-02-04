<script setup lang="ts">
import type { Query, IMeta, Response } from '~/types/common';
import type { Brand, Product } from '~/types/product';

const route = useRoute()
const router = useRouter()
const { id } = route.params
const { accessToken } = storeToRefs(useUserStore())


const totalData = ref<number>(10)
const apiBase = useRuntimeConfig().public.apiBase;
const { data: brandsData, error: brandsError } = await useFetch<Response<Brand>>(`${apiBase}/brand/${id}`, {
    key: 'brand-data',
});


const query = ref<Query & { brandId: string }>({
    limit: 10,
    order: 'desc',
    orderBy: 'createdAt',
    page: 1,
    brandId: id.toString()
})

const { data: productsData, error: productsError, execute } = await useFetch<Response<{ meta: IMeta; data: { product: Product[] } }>>(`${apiBase}/product`, {
    key: 'products-data',
    query: query.value,
    headers: {
        Authorization: `Bearer ${accessToken.value}`
    },
});

const detailProduct = (id: string) => {
    router.push({
        path: '/product/detail/' + id,
    })
}

const addWishlist = async (id: string) => {
    if (!accessToken.value) {
        useSwal()
            .fire({
                icon: 'warning',
                title: 'Please Login First'
            })
    }
    const data = await $fetch<Response<any>>(`${apiBase}/wishlist`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        body: {
            productId: id
        }
    })
    if (!data.error) {
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

const removeWishlist = async (id: string) => {
    useSwal()
        .fire({
            title: `Remove Wishlist?`,
            text: `Action can't be undone`,
            showCancelButton: true,
            icon: 'question'
        })
        .then(async (res) => {
            if (res.isConfirmed) {
                const data = await $fetch<Response<any>>(`${apiBase}/wishlist/${id}`, {
                    method: 'delete',
                    headers: {
                        Authorization: `Bearer ${accessToken.value}`
                    }
                })
                if (!data.error) {
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

watch(() => productsData.value, () => {
    if (productsData.value) {
        totalData.value = productsData.value.data.meta.total
    }
})


</script>
<template>
    <div class="w-full px-[14px]">
        <div class="w-full px-[111px] border-b-2 mb-[45px]">
            <h1 class="text-xl mb-[40px] font-bold mt-[28px]">Brand Products</h1>
            <div v-if="brandsData"
                class="w-full bg-primary h-[140px] relative flex  my-[40px] rounded-xl bg-[url('/img/brand-background.png')]">
                <div class="w-full flex gap-5 items-center justify-start">
                    <img :src="brandsData.data.logo" class="w-[125px]  ml-[140px]" alt="">
                    <h1 class="font-bold text-base">{{ brandsData.data.name }}</h1>
                </div>
            </div>
        </div>
        <div class="px-[100px] flex gap-[35px]">
            <!-- <div class="w-[250px] h-[360px] max-h-[360px] overflow-y-scroll pt-[28px] border rounded-md">
                <h1 class="pl-3 font-bold text-base mb-[25px]">Etalase Toko (000)</h1>
                <ul class="w-full max-h-full">
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                    <li class="w-full h-[48px] py-4 pl-6 text-sm">Semua Produk</li>
                </ul>
            </div> -->
            <div class="w-full">
                <div class="mb-[16px] flex flex-col w-full gap-3">
                    <h1 class="text-[20px] font-bold">All Products</h1>
                </div>
                <div class="flex  gap-x-[15px] gap-y-[10px] flex-wrap mb-[60px]" v-if="productsData">
                    <div class="min-w-[200px] max-w-[200px] min-h-[290px] flex-shrink-0 p-[14px] bg-white shadow-md rounded-lg"
                        v-for="p in productsData.data.data.product">
                        <img :src="p.thumbnail" alt="" class="min-h-[118px] max-h-[118px] w-full">
                        <div class="flex gap-[6px] ">
                            <div class="max-w-[40px] max-h-[21px] flex-shrink-0 bg-primary p-[6px] rounded-md">
                                <img :src="p.brand.logo" alt="" class="w-[10px] bg-white">
                            </div>
                            <h1 class="text-left text-xs line-clamp-2">{{ p.name }}
                            </h1>
                        </div>
                        <div class="w-full flex flex-col gap-[7px] my-[8px]" v-if="p.price">
                            <div class="w-full flex gap-[11px] justify-center items-center">
                                <h1 class="line-through text-sm text-primary">Rp. {{ p.price.basic }}</h1>
                                <UBadge color="primary" variant="soft">{{ Math.floor(p.price.wabDiscountPercentage) }}%
                                </UBadge>
                            </div>
                        </div>
                        <div class="w-full flex justify-center items-center mb-[10px]">
                            <h1 class="text-base font-bold text-primary" v-if="p.price">Rp. {{ p.price.webPriceIncPpn }}
                            </h1>
                        </div>
                        <div class="w-full flex flex-col gap-[7px]">
                            <UButton block @click="detailProduct(p.id)">Add to Cart</UButton>
                            <UButton block color="red" variant="outline" @click="removeWishlist(p.wishlist[0].id)"
                                v-if="p.wishlist && p.wishlist.length > 0">Remove from Wishlist</UButton>
                            <UButton block color="primary" variant="outline" @click="addWishlist(p.id)" v-else>Add to
                                Wishlist</UButton>
                        </div>
                    </div>
                </div>
                <div class="w-full flex justify-end items-center">
                    <UPagination v-model="query.page" :page-count="query.limit" :total="totalData" />
                </div>
            </div>
        </div>
    </div>
</template>