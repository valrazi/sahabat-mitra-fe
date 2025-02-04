<script setup lang="ts">
import type { Cart, CartResponse } from '~/types/cart';
import type { Response } from '~/types/common';
import { type ProductVariantType, type DetailProductResponse, type ProductVariant } from '~/types/product';
import type { OFetchError } from '../../../types/common';

const route = useRoute()
const id = route.params.id
const apiBase = useRuntimeConfig().public.apiBase;

const { accessToken } = storeToRefs(useUserStore())
const cartStore = useCartStore()
const { cart } = storeToRefs(useCartStore())
const { data: productData, error: productError } = await useFetch<DetailProductResponse>(`${apiBase}/product/${id}`, {
    key: 'product-detail-data',
});

watchEffect(() => {
  if (productData.value) {
    useHead({
      title: `${productData.value.data.name} - Buy Now | Teknik Abadi`,
      meta: [
        { name: 'description', content: productData.value.data.description },
        { property: 'og:title', content: productData.value.data.name },
        { property: 'og:description', content: productData.value.data.description },
        { property: 'og:image', content: productData.value.data.thumbnail },
        { property: 'og:url', content: `https://teknikabadi.com/product/detail/${productData.value.data.id}` }
      ]
    });
  }
});

const price = ref(0)
const stock = ref<number>(0)
if (productData.value) {
    price.value = productData.value.data.price.webPriceIncPpn
    if (productData.value.data.stockSummaries && productData.value.data.stockSummaries.length) {
        stock.value = productData.value.data.stockSummaries[0].stock
    }
}

if (productError.value) {
    console.error('Error fetching product:', productError.value);
}


const payloadProduct = ref({
    cartId: cart.value ? cart.value.id : null,
    productId: id,
    productVariantId: '',
    productVariantTypeId: '',
    quantity: 1
})

const subtotal = computed(() => {
    return payloadProduct.value.quantity * price.value
})

const listProductVariantType = ref<ProductVariantType[]>([])
const changeVariant = (v: ProductVariant) => {
    payloadProduct.value.productVariantTypeId = ''
    price.value = productData.value!.data.price.webPriceIncPpn
    payloadProduct.value.quantity = 1
    if (v.id == payloadProduct.value.productVariantId) {
        payloadProduct.value.productVariantId = ''
        listProductVariantType.value = []
        if (productData.value!.data.stockSummaries && productData.value!.data.stockSummaries.length) {
            stock.value = productData.value!.data.stockSummaries[0].stock
        }
    } else {
        payloadProduct.value.productVariantId = v.id
        price.value = v.price.webPriceIncPpn
        listProductVariantType.value = v.productVariantType
        const stockSummaries = v.stockSummaries
        if (stockSummaries && stockSummaries.length) {
            stock.value = stockSummaries[0].stock
        }
    }
}

const changeType = (t: ProductVariantType) => {
    payloadProduct.value.quantity = 1
    if (t.id == payloadProduct.value.productVariantTypeId) {
        payloadProduct.value.productVariantTypeId = ''
        price.value = productData.value!.data.price.webPriceIncPpn
        if (productData.value!.data.stockSummaries && productData.value!.data.stockSummaries.length) {
            stock.value = productData.value!.data.stockSummaries[0].stock
        }
    } else {
        payloadProduct.value.productVariantTypeId = t.id
        price.value = t.price.webPriceIncPpn
        const stockSummaries = t.stockSummaries
        if (stockSummaries) {
            stock.value = stockSummaries.stock
        }
    }
}

const minusQuantity = () => {
    if (payloadProduct.value.quantity > 1) {
        payloadProduct.value.quantity -= 1
    }
}

const addQuantity = () => {
    if (payloadProduct.value.quantity < stock.value) {
        payloadProduct.value.quantity += 1
    }
}

const initCart = async () => {
    if(!accessToken.value) {
        useSwal()
        .fire({
            icon: 'warning',
            text: 'Please Login First',
            title: 'Warning'
        })
        return
    }
    const { data } = await useFetch<CartResponse>(`${apiBase}/cart`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    });
    if (data.value) {
        payloadProduct.value.cartId = data.value.data.id
        cartStore.setCart(data.value.data)
        await addCartItem()
    }
}

const addCartItem = async () => {
    try {
        const data = await $fetch<Response<Cart>>(`${apiBase}/cart/items`, {
            method: 'POST',
            body: payloadProduct.value,
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            }
        });

        // If data is present, update the cart
        if (data.data) {

            cartStore.setCart(data.data);
        }
        useSwal()
            .fire({
                icon: 'success',
                title: 'Success',
                text: `Successfully add to Cart`
            })
    } catch (error: any) {
        const err = error as OFetchError
        useSwal()
            .fire({
                icon: 'error',
                title: 'Error',
                text: `${err.data.error?.message}`
            })
    }
};

const gotoWhatsapp = () => {
    window.open('https://wa.me/081219750785', '_blank', 'focus')
}
</script>
<template>
    <div class="w-full py-[50px] px-[131px] flex flex-col" v-if="productData">
        <h1 class="text-xl font-bold mb-[35px]">PRODUCT DETAILS</h1>
        <div class="flex w-full">
            <div class="flex flex-col max-w-[300px] mr-[62px]">
                <img :src="productData.data.thumbnail" alt=""
                    class="w-[200px] flex-shrink-0 mb-[44px] shadow-lg border rounded-sm">
                <UAccordion color="primary" variant="ghost" size="sm"
                    :items="[{ label: 'Description', content: productData.data.description }]" />
            </div>
            <div class="flex flex-col min-w-[50%] max-w-[50%] flex-wrap mr-[50px]">
                <h1 class="text-xl font-bold">{{ productData.data.name ?? productData.data.partNumber }}</h1>
                <h2 class="text-2xl mb-[25px]">Rp. {{ price }}</h2>
                <div class="mb-[30px]" v-if="productData.data.productVariant.length">
                    <h1 class="mb-[14px] text-base font-bold">Variant Product</h1>
                    <div :class="{ 'bg-primary text-white': payloadProduct.productVariantId == v.id }"
                        class="w-[140px] py-1 px-3 text-center  border rounded-lg" @click="changeVariant(v)"
                        v-for="v in productData.data.productVariant">
                        <h1 class="text-sm">{{ v.name }}</h1>
                    </div>
                </div>

                <div class="" v-if="listProductVariantType.length">
                    <h1 class="mb-[14px] text-base font-bold">Type Product</h1>
                    <div :class="{ 'bg-primary text-white': payloadProduct.productVariantTypeId == t.id }"
                        class="w-[140px] py-1 px-3 text-center  border rounded-lg" @click="changeType(t)"
                        v-for="t in listProductVariantType">
                        <h1 class="text-sm">{{ t.partNumber }}</h1>
                    </div>
                </div>
            </div>
            <div class="flex flex-col">
                <div
                    class="w-[270px] h-[270px] border-2 rounded-lg px-5 py-[35px] relative flex flex-col justify-between">
                    <div>
                        <h1 class="font-bold text-base mb-3">Total</h1>
                        <h1 class="text-lg">Rp. {{ subtotal }}</h1>
                        <p class="mb-[15px]">Stock: {{ stock }}</p>
                        <div class="w-full flex gap-1">
                            <div class="flex gap-1">
                                <UButton color="gray" @click="minusQuantity" :disabled="payloadProduct.quantity <= 1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
                                        <path fill="none" stroke="#888888" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="1.5" d="M5 12h14" />
                                    </svg>
                                </UButton>
                                <UInput v-model="payloadProduct.quantity" type="number" />
                                <UButton color="gray" @click="addQuantity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
                                        <path fill="none" stroke="#888888" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </UButton>
                            </div>

                            <UButton color="gray" @click="gotoWhatsapp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="none" stroke="#888888" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M8.625 12a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0m0 0H8.25m4.125 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0m0 0H12m4.125 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0m0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.8 9.8 0 0 1-2.555-.337A5.97 5.97 0 0 1 5.41 20.97a6 6 0 0 1-.474-.065a4.5 4.5 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25" />
                                </svg>
                            </UButton>
                        </div>
                    </div>
                    <div class="flex gap-[10px]">
                        <UButton @click="initCart">
                            <span class="flex gap-1 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="1.5"
                                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.137a60 60 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0m12.75 0a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0" />
                                </svg>
                                <p>Add to Cart</p>
                            </span>
                        </UButton>
                        <!-- <UButton class="bg-secondary hover:bg-secondary">Add to Order</UButton> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}
</style>