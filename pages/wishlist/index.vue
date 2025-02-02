<script setup lang="ts">
import { useSwal } from '~/composables/useSwal';
import { type Response, type IMeta } from '~/types/common';
import { type Wishlist } from '~/types/wishlist';

const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())
const uiStore = useUiStore()
const router = useRouter()

const listData = ref<Wishlist[]>([])
const page = ref<number>(1)
const total = ref<number>(1)
const fetchData = async() => {
    uiStore.setLoading()
    const data = await $fetch<Response<{meta: IMeta, data: {wishlist: Wishlist[]}}>>(`${apiBase}/wishlist`, {
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
    })
    console.log(data.data.data)
    if(data.data.data) {
        listData.value = data.data.data.wishlist
        total.value = data.data.meta.total
    }
    uiStore.removeLoading()
}
const detailProduct = (id:string) => {
    router.push({
        path: '/product/detail',
        query: {
            id
        }
    })
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
                    await fetchData()
                })
            }
        }
    })
}
onMounted(() => {
    fetchData()
})
</script>
<template>
    <div class="w-full px-[70px] py-[61px]">
        <h1 class="font-semibold text-[27px] mb-[25px]">My Wishlist</h1>
        <div class="flex  gap-x-[70px] gap-y-[30px] flex-wrap mb-[60px]" v-if="listData">
            <div class="min-w-[200px] max-w-[200px] min-h-[290px] flex-shrink-0 p-[14px] bg-white shadow-md rounded-lg"
                v-for="p in listData">
                <img :src="p.product.thumbnail" alt="" class="min-h-[118px] max-h-[118px] w-full">
                <div class="flex gap-[6px] ">
                    <div class="max-w-[40px] max-h-[21px] flex-shrink-0 bg-primary p-[6px] rounded-md">
                        <img :src="p.product.brand.logo" alt="" class="w-[10px]">
                    </div>
                    <h1 class="text-left text-xs line-clamp-2">{{ p.product.partNumber }}
                    </h1>
                </div>
                <div class="w-full flex flex-col gap-[7px] my-[8px]" v-if="p.product.price">
                    <div class="w-full flex gap-[11px] justify-center items-center">
                        <h1 class="line-through text-sm text-primary">Rp. {{ p.product.price.basic }}</h1>
                        <UBadge color="primary" variant="soft">{{ p.product.price.wabDiscountPercentage }}%</UBadge>
                    </div>
                </div>
                <div class="w-full flex justify-center items-center mb-[10px]">
                    <h1 class="text-base font-bold text-primary">Rp. {{ p.product.price.webPriceIncPpn }}</h1>
                </div>
                <div class="w-full flex flex-col gap-[7px]">
                    <UButton block @click="detailProduct(p.product.id)">Add to Cart</UButton>
                    <UButton block color="red" variant="outline" @click="removeWishlist(p.id)">Remove from Wishlist</UButton>
                </div>
            </div>
        </div>
        <div class="w-full flex justify-end items-center" v-if="total > 0">
            <UPagination v-model="page" :page-count="10" :total="total" />
        </div>
    </div>
</template>