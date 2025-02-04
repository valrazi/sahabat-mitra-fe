<script setup lang="ts">
import type { Address, ResponseAddressList } from '~/types/address';
import type { CartItem, CartResponse } from '~/types/cart';
import type { OFetchError, Response } from '~/types/common';
import type { ResponseShippingRate, ShippingPricing, ShippingRateList } from '~/types/shipping';

definePageMeta({
    hideSearchbar: true
})

const router = useRouter()
const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())
const uiStore = useUiStore()
const { cart } = storeToRefs(useCartStore())
const selectedAddress = ref<Address>()
const adressList = ref<Address[]>([])
const fetchAddress = async () => {
    uiStore.setLoading()
    const data = await $fetch<ResponseAddressList>(`${apiBase}/address`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    })
    if (data) adressList.value = data.data
    selectedAddress.value = adressList.value.find((a) => a.isDefault)
    uiStore.removeLoading()
}

const selectedDelivery = ref<ShippingPricing>()
const deliveryList = ref<ShippingRateList[]>()
const fetchShipping = async () => {
    uiStore.setLoading()
    const data = await $fetch<ResponseShippingRate>(`${apiBase}/order/rates`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        body: {
            addressId: selectedAddress.value?.id,
            cartId: cart.value?.id
        }
    })
    if (data) {
        deliveryList.value = data.data
    }
    uiStore.removeLoading()
}

const setSelectedDelivery = (data: ShippingPricing) => {
    if (selectedDelivery.value && selectedDelivery.value.company == data.company && selectedDelivery.value.type == data.type) {
        selectedDelivery.value = undefined
    } else {
        selectedDelivery.value = data
    }
}
const cartStore = useCartStore()
const changeQuantity = async (item: CartItem, type: 'min' | 'plus') => {
    const oldQty = item.quantity
    if (type == 'min' && item.quantity > 1) {
        item.quantity -= 1
    } else if (type == 'plus') {
        item.quantity += 1
    }
    try {
        const data = await $fetch<CartResponse>(`${apiBase}/cart/${cart.value!.id}/items/${item.id}`, {
            method: 'PUT',
            body: {
                cartId: cart.value!.id,
                "productId": item.productId,
                "productVariantId": item.productVariantId,
                "productVariantTypeId": item.productVariantTypeId,
                "quantity": item.quantity,
                "cartItemId": item.id
            },
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            }
        })
        cartStore.setCart(data.data)
        cart.value!.cartItem = data.data.cartItem.map((i) => {
            i.tempQty = i.quantity
            return i
        })
    } catch (error) {
        const err = error as OFetchError
        item.quantity = oldQty
        useSwal()
            .fire({
                icon: 'error',
                title: `Error`,
                text: `${err.data.error?.message}`
            })
    }
}

const deleteCartItem = async (item: CartItem) => {
    useSwal()
        .fire({
            icon: 'question',
            title: `Remove Item`,
            text: `This action can't be undonde`,
            showCancelButton: true
        })
        .then(async (res) => {
            if (res.isConfirmed) {
                try {
                    uiStore.setLoading()
                    const data = await $fetch<CartResponse>(`${apiBase}/cart/${cart.value!.id}/items/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${accessToken.value}`
                        }
                    });
                    if (data) {
                        cartStore.setCart(data.data)
                        useSwal()
                            .fire({
                                icon: 'success',
                                title: 'Success Remove Item'
                            })
                            .then(() => {
                                if (!cart.value?.cartItem.length) {
                                    router.push({
                                        path: '/'
                                    })
                                }
                            })
                    }
                } catch (error) {
                    const err = error as OFetchError
                    useSwal()
                        .fire({
                            icon: 'error',
                            title: 'Error',
                            text: err.data.error?.message
                        })
                } finally {
                    uiStore.removeLoading()
                }
            }
        })
}

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target?.files?.[0]) {
        selectedFile.value = target.files[0];
    }
};

const orderPrice = computed(() => {
    if (selectedDelivery.value) return cart.value!.subtotal + selectedDelivery.value.price
    else return cart.value!.subtotal
})

const orderNote = ref<string>('')
const orderMethpd = ref<'delivery'|'pickup'|'internalCourier'>('delivery')// TODO
const checkout = async () => {
    if (!selectedAddress.value || !selectedDelivery.value || !selectedFile.value) {
        useSwal()
            .fire({
                icon: 'warning',
                text: 'Please Select Address, Delivery and Upload Bukti Transfer',
                title: 'Complete Data'
            })
    } else {
        try {
            uiStore.setLoading()
            const formData = new FormData();
            formData.append('file', selectedFile.value);
            const imageData = await $fetch<Response<{url: string}>>(`${apiBase}/media`, {
                method: 'post',
                body: formData
            })
            const data = await $fetch<Response<any>>(`${apiBase}/order`, {
                method: 'post',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                body: {
                    addressId: selectedAddress.value.id,
                    cartId: cart.value!.id,
                    courierCompany: selectedDelivery.value.company ?? null,
                    courierType: selectedDelivery.value.type ?? null,
                    orderNote: orderNote.value,
                    paymentProof: imageData.data.url,
                    orderMethod: orderMethpd.value
                }
            })
            if(data.data) {
                cartStore.removeCart()
                useSwal()
                .fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Order Sucessfully Created'
                })
                .then(() => {
                    router.push('/order')
                })
            }
        } catch (error: any) {
            const err = error as OFetchError
            useSwal()
                .fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.data.error?.message
                })
        } finally {
            uiStore.removeLoading()
        }
    }
}
onMounted(async () => {
    await fetchAddress()
    await fetchShipping()
})
</script>
<template>
    <div class="w-full py-[30px] px-[100px] flex gap-4">
        <div class="w-[70%]">
            <h1 class="text-2xl font-bold mb-[15px]">Checkout</h1>
            <div class="w-full my-[30px] p-4 bg-gray-100 rounded-lg">
                <h1>Alamat Pengiriman</h1>
                <div class="w-full bg-gray-200 flex justify-between rounded-lg">
                    <div class="flex px-1 p-3 gap-x-1">
                        <UIcon name="i-heroicons-map-pin" />
                        <div class="text-sm">
                            <h1>{{ selectedAddress?.contactName }}</h1>
                            <p>{{ selectedAddress?.streetAddress }}, {{ selectedAddress?.zipcode }}</p>
                        </div>
                    </div>
                    <div class="w-1/4 flex justify-end items-center px-1">
                        <UButton class="bg-secondary hover:bg-secondary">Change Address</UButton>
                    </div>
                </div>

                <h1 class="mt-3">Layanan Pengiriman</h1>
                <div class="max-h-[200px] overflow-y-scroll">
                    <div class="my-1 flex flex-col gap-1" v-for="d in deliveryList">
                        <h1>{{ d.company.toUpperCase() }}</h1>
                        <ul>
                            <li :class="{ 'bg-secondary text-white': selectedDelivery?.company == dp.company && selectedDelivery.type == dp.type }"
                                class="p-2 border-b hover:cursor-pointer" @click="setSelectedDelivery(dp)"
                                v-for="dp in d.pricing">
                                <span>{{ dp.courier_name }} - {{ dp.courier_service_name }} (Rp. {{ dp.price
                                    }})</span>
                                <p class="text-xs">{{ dp.duration }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <table class="bg-gray-100 w-full rounded-lg">
                <thead>
                    <tr>
                        <th class="p-1">Item</th>
                        <th class="p-1">Unit Price</th>
                        <th class="p-1">Qty</th>
                        <th class="p-1">Subtotal</th>
                        <th class="p-1">#</th>
                    </tr>
                </thead>
                <tbody class="p-4">
                    <tr v-for="i in cart?.cartItem">
                        <td class="p-1">
                            <div class="flex gap-2  justify-center">
                                <img :src="i.product.thumbnail" alt="" class="max-w-[70px] max-h-[70px]">
                                <div>
                                    <h1 class="text-sm font-bold">{{ i.product.name }}</h1>

                                    <div class="my-2 flex flex-col gap-1 text-xs">
                                        <p>SKU: {{ i.product.sku }}</p>
                                        <p v-if="i.productVariantId">Variant: {{ i.productVariant?.partNumber }}</p>
                                        <p v-if="i.productVariantTypeId">Variant: {{ i.productVariantType?.partNumber }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="p-1 text-center">
                            <h1>Rp. {{ i.price }}</h1>
                        </td>
                        <td class="p-1 text-center">
                            <div class="flex gap-1 justify-center">
                                <UButton @click="changeQuantity(i, 'min')" color="gray" size="xs"
                                    :disabled="i.quantity <= 1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
                                        <path fill="none" stroke="#888888" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="1.5" d="M5 12h14" />
                                    </svg>
                                </UButton>
                                <UInput v-model="i.quantity" size="xs" type="number" class="bg-[#EFEBEB] w-14"
                                    disabled />
                                <UButton @click="changeQuantity(i, 'plus')" color="gray" size="xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
                                        <path fill="none" stroke="#888888" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </UButton>
                            </div>
                        </td>
                        <td class="p-1 text-center">
                            <h1>Rp.{{ i.subtotal }}</h1>
                        </td>
                        <td class="p-1 text-center">
                            <button @click="deleteCartItem(i)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="none" stroke="#888888" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="m14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21q.512.078 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48 48 0 0 0-3.478-.397m-12 .562q.51-.088 1.022-.165m0 0a48 48 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a52 52 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a49 49 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex-1 h-full bg-gray-100 p-4 rounded-lg relative">
            <h1 class="font-bold mb-4">Summary</h1>

            <div class="flex flex-col gap-2 pb-3 border-b mb-4">
                <h1 class="font-bold">Calculate Shipping and Tax</h1>
                <h1 class="text-xs font-thin">Enter your destination to get a shipping estimate.</h1>
            </div>

            <div class="flex flex-col gap-2 pb-2 border-b mb-4">
                <h1 class="font-bold">Payment Method</h1>
                <div class="flex flex-col gap-1">
                    <div class="flex gap-1">
                        <img class="w-32"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/2560px-Bank_Mandiri_logo_2016.svg.png"
                            alt="">
                        <h1 class="font-bold">Mandiri</h1>
                    </div>
                    <p class="text-sm">Nomor Rekening: <span class="font-bold">879102910</span></p>
                    <p class="text-sm">Atas Nama: <span class="font-bold">Ferdy</span></p>

                    <div class="flex flex-col gap-1 text-sm my-1">
                        <label for="bukti-transfer" class="font-bold">Bukti Transfer</label>
                        <input id="bukti-transfer" type="file" ref="fileInput" @change="handleFileChange" />
                    </div>

                    <div class="flex flex-col gap-1 text-sm my-1">
                        <label for="bukti-transfer" class="font-bold">Catatan Order</label>
                        <UInput placeholder="ex: jangan dibanting" v-model="orderNote"/>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-2 pb-2 border-b mb-4">
                <div class="w-full flex justify-between text-sm font-bold">
                    <h1>Subtotal</h1>
                    <p>Rp. {{ cart?.subtotal }}</p>
                </div>

                <div class="w-full flex justify-between text-sm font-bold" v-if="selectedDelivery">
                    <h1>Shipping</h1>
                    <p>Rp. {{ selectedDelivery.price }}</p>
                </div>
            </div>

            <div class="flex flex-col gap-2 pb-2 border-b mb-4">
                <div class="w-full flex justify-between text-sm font-bold">
                    <h1>Order Total</h1>
                    <p>Rp. {{ orderPrice }}</p>
                </div>

            </div>
            <UButton class="" block @click="checkout">Checkout</UButton>
        </div>
    </div>
</template>