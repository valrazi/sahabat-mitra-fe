<script setup lang="ts">
import IconLine from '~/components/icons/IconLine.vue'
import IconTrolley from '~/components/icons/IconTrolley.vue'
import IconPaper from '~/components/icons/IconPaper.vue'
import IconCross from './icons/IconCross.vue'
import IconEye from './icons/IconEye.vue'
import type { CartItem, CartResponse } from '~/types/cart'
import type { LoginResponse, UserDetailResponse } from '~/types/auth'
import type { Response, OFetchError, Query, IMeta } from '~/types/common'
import type { Product } from '~/types/product'
const uiStore = useUiStore()
const { loginModal } = storeToRefs(uiStore)
const loginState = ref<'personal' | 'company'>('personal')
const passwordVisible = ref<boolean>(false)
const passwordValue = ref<string>('')
const { user, accessToken } = storeToRefs(useUserStore())
const items = [
    [
        {
            label: user.value?.email ?? '',
            avatar: {
                src: 'https://avatars.githubusercontent.com/u/739984?v=4'
            },
            click: () => {
                router.push('/account')
            }
        },
        {
            label: 'Keluar',
            icon: 'i-heroicons-arrow-right-circle-20-solid',
            click: () => {
                userStore.clearUser()
                cartStore.removeCart()
            }
        }
    ]
]

const { cart } = storeToRefs(useCartStore())
const cartStore = useCartStore()
const apiBase = useRuntimeConfig().public.apiBase;

const loadCart = async () => {
    uiStore.setLoading()
    const { data, status } = await useFetch<CartResponse>(`${apiBase}/cart`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    })
    if (data.value) {
        cartStore.setCart(data.value.data)
        cart.value!.cartItem = data.value.data.cartItem.map((i) => {
            i.tempQty = i.quantity
            return i
        })
    }
    if (status.value != 'pending') uiStore.removeLoading()
}

const changeQuantity = async (item: CartItem, type: 'min' | 'plus') => {
    if (type == 'min' && item.quantity > 1) {
        item.quantity -= 1
    } else if (type == 'plus') {
        item.quantity += 1
    }
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
}

const deleteCartItem = async (item: CartItem) => {
    uiStore.setLoading()
    const { data, status } = await useFetch<CartResponse>(`${apiBase}/cart/${cart.value!.id}/items/${item.id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        }
    });
    if (data.value) {
        cartStore.setCart(data.value.data)
    }

    if (status.value != 'pending') uiStore.removeLoading()
}

const payloadLogin = ref({
    email: '',
    password: ''
})
const userStore = useUserStore();
const router = useRouter()
const route = useRoute()
const getDetail = async () => {
    try {
        uiStore.setLoading()
        const { data, status } = await useFetch<UserDetailResponse>(`${apiBase}/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${userStore.accessToken}`,
            },
        });
        if (data.value && data.value.data) {
            userStore.setUser(data.value!.data);
        }
        loginModal.value = false
        await loadCart()
        if (status.value != 'pending') uiStore.removeLoading()

    } catch (error) {
        console.log(error)
    }
}

const loginUser = async () => {
    if (!payloadLogin.value.email || !payloadLogin.value.password) {
        useSwal()
            .fire({
                icon: 'warning',
                title: 'Please Fill Email and Password'
            })
        return
    }
    uiStore.setLoading()
    const { data, status, error } = await useFetch<LoginResponse>(`${apiBase}/auth/login/user`, {
        method: 'POST',
        body: {
            email: payloadLogin.value.email,
            password: payloadLogin.value.password,
        },
    });
    if (error.value) {
        useSwal()
            .fire({
                icon: 'error',
                title: 'Invalid Email / Password'
            })
        uiStore.removeLoading()
        return
    }
    if (data.value && data.value.data) {
        const { accessToken } = data.value.data;
        userStore.setAccessToken(accessToken);
    }
    loginModal.value = false
    await getDetail()
    if (status.value != 'pending') uiStore.removeLoading()
}


const initQuotation = async () => {
    useSwal()
        .fire({
            icon: 'question',
            text: `Add to Quotation?`,
            showCancelButton: true
        })
        .then(async (res) => {
            if (res.isConfirmed) {
                try {
                    const data = await $fetch<Response<any>>(`${apiBase}/quotation`, {
                        method: 'post',
                        headers: {
                            Authorization: `Bearer ${accessToken.value}`
                        },
                        body: {
                            cartId: cart.value!.id
                        }
                    })
                    if (!data.error) {
                        useSwal()
                            .fire({
                                icon: 'success',
                                title: `Success`,
                                text: `Quotation Succesfully Created`
                            })
                            .then(async () => await loadCart())
                    }
                } catch (error: any) {
                    const err = error as OFetchError
                    useSwal()
                        .fire({
                            icon: 'error',
                            title: 'Error',
                            text: err.data.error?.message
                        })
                }
            }
        })
}

const query = ref<Query & { name?: string }>({
    limit: 10,
    order: 'desc',
    orderBy: 'createdAt',
    page: 1,
    name: ''
})
const productData = ref<Product[]>([])
const fetchProduct = async () => {
    if (query.value.name?.length) {
        const data = await $fetch<Response<{ meta: IMeta; data: { product: Product[] } }>>(`${apiBase}/product`, {
            query: query.value,
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            },
        });
        if (data.data.data.product) {
            productData.value = data.data.data.product
        }
    }else {
        productData.value = []
    }
}

const detailProduct = (id: string) => {
    router.push('/product/detail/' + id)
    productData.value = []
}
const dropdownRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    productData.value = []; // Close dropdown when clicking outside
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(() => loginModal.value, () => {
    payloadLogin.value.email = ''
    payloadLogin.value.password = ''
})
</script>
<template>
    <UModal v-model="loginModal">
        <div class="max-w-[552px] max-h-[894px] py-[38px] px-[64px] flex flex-col ">
            <div class=" flex justify-end items-end mb-[11px]">
                <IconCross class="w-[20px] h-[20px]" @click="loginModal = false" />
            </div>
            <div class="w-full mb-[20px]">
                <h1 class="text-[36px] font-bold">Login</h1>
                <p class="mt-[10px] text-xs font-extralight">Please enter your registered phone number and password
                    correctly.</p>
            </div>
            <div class="w-full flex justify-center items-center gap-x-[58px] mb-[30px]">
                <!-- <UButton size="xl"
                    :class="{ 'bg-secondary hover:bg-secondary text-white': loginState == 'company', 'text-black  hover:bg-transparent': loginState != 'company' }"
                    :variant="loginState == 'company' ? 'solid' : 'ghost'" @click="loginState = 'company'">
                    Company
                </UButton> -->
                <!-- <IconLine />
                <UButton size="xl"
                    :class="{ 'bg-secondary hover:bg-secondary text-white': loginState == 'personal', 'text-black hover:bg-transparent': loginState != 'personal' }"
                    :variant="loginState == 'personal' ? 'solid' : 'ghost'" @click="loginState = 'personal'">
                    Personal
                </UButton> -->


            </div>
            <div class="w-full flex flex-col gap-[15px] mb-[25px]">
                <label for="" class="text-sm">Email <span class="text-red-500">*</span></label>
                <UInput size="md" class="border border-primary" v-model="payloadLogin.email" />
            </div>

            <div class="w-full flex flex-col gap-[15px] mb-[35px] relative">
                <label for="" class="text-sm">Password <span class="text-red-500">*</span></label>
                <UInput v-model="payloadLogin.password" :type="passwordVisible ? 'text' : 'password'" size="md"
                    class="border border-primary" />
                <button class="absolute right-2 top-12" @click="passwordVisible = !passwordVisible">
                    <IconEye />
                </button>
                <div class="flex justify-end items-end">
                    <h1 class="text-sm font-thin border-b">Forgot Password</h1>
                </div>
            </div>

            <div class="w-full flex flex-col gap-[10px] mb-[38px]">
                <UButton class="bg-secondary hover:bg-secondary text-white" :block="true" size="lg" @click="loginUser">
                    Sign In</UButton>
                <ULink :to="'/register/company'">
                    <UButton class="border border-primary" :block="true" variant="ghost" size="lg">Register (Company)
                    </UButton>
                </ULink>
                <ULink :to="'/register/personal'">
                    <UButton class="border border-primary" :block="true" variant="ghost" size="lg">Register (Personal)
                    </UButton>
                </ULink>
            </div>
        </div>
    </UModal>
    <div class="w-full border-b shadow-md">
        <div class="bg-primary w-full flex justify-between px-16 py-3">
            <div class="flex gap-x-8 items-center">
                <div class="flex gap-x-2 items-center text-white">
                    <img src="/img/id.png" alt="">
                    <p class="text-base">IND</p>
                    <!-- <img src="/img/caret-down.png" alt=""> -->
                </div>
                <!-- <div class="h-[17px] w-[2px] bg-white"></div>
                <div class="flex gap-x-2 items-center text-white">
                    <img src="/img/email.png" alt="">
                    <p class="text-base">atasidigital@gmail.com</p>
                </div> -->
                <div class="h-[17px] w-[2px] bg-white"></div>
                <div class="flex gap-x-2 items-center text-white">
                    <img src="/img/phone.png" alt="">
                    <p class="text-base">+62 81219750785</p>
                </div>
            </div>
            <div class="flex gap-x-2" v-if="!user">
                <UButton class="bg-secondary hover:bg-secondary" @click="uiStore.toggleLogin">Login</UButton>
                <UPopover>
                    <UButton class="bg-secondary hover:bg-secondary" label="Register" />
                    <template #panel>
                        <div class="p-4 flex flex-col gap-y-4">
                            <h1 class="text-[10px]">Select the purpose of your account list?</h1>
                            <div class="w-full flex items-center justify-center gap-x-2">
                                <UButton to="/register/personal" size="xs" class="bg-white border border-primary  flex gap-x-2 items-center hover:bg-secondary
                                text-secondary hover:text-primary">
                                    <IconLine class="" />
                                    <span class="hover:text-white text-black">Personal</span>
                                </UButton>
                                <UButton to="/register/company" size="xs" class="bg-white border border-primary  flex gap-x-2 items-center hover:bg-secondary
                                text-secondary hover:text-primary">
                                    <IconLine class="" />
                                    <span class="hover:text-white text-black">Company</span>
                                </UButton>
                            </div>

                        </div>
                    </template>
                </UPopover>
            </div>
            <div v-else>
                <UDropdown :items="items" mode="hover" :popper="{ placement: 'bottom-start' }">
                    <UButton class="bg-secondary hover:bg-secondary" :label="user.email"
                        trailing-icon="i-heroicons-chevron-down-20-solid" />
                </UDropdown>
            </div>
        </div>
        <div class="w-full px-16 pb-4 flex flex-col bg-white" v-if="!route.meta.hideSearchbar">
            <div class="flex w-full items-center justify-center">
                <img src="/img/company-logo.png" class="w-[20%] my-4 mr-12">
                <div class="w-1/2 relative">
                    <div class="w-full relative">
                        <UInput placeholder="Search Product" v-model="query.name" class="w-full" size="lg">
                        </UInput>
                        <UButton class="bg-secondary hover:bg-secondary absolute right-2 top-1" @click="fetchProduct">
                            Search
                        </UButton>
                    </div>
                    <div ref="dropdownRef" v-if="productData.length"
                        class="w-full mt-2 max-h-[200px] bg-white border absolute z-[999] flex flex-col gap-1 overflow-y-scroll">
                        <button class="p-2 border-b text-start " v-for="p in productData"
                            @click="detailProduct(p.id)">{{ p.name
                            }}</button>
                    </div>
                </div>

                <div class="flex gap-5 mx-5">
                    <UPopover :popper="{ placement: 'bottom', offsetDistance: 10 }">
                        <UButton class="bg-primary hover:bg-primary relative">
                            <IconTrolley class="w-[18px] h-[18px]" />
                            <UBadge :ui="{ rounded: 'rounded-full' }" size="xs"
                                class="bg-accent absolute -top-2 -right-2">
                                {{ cart ? cart.cartItem.length : 0 }}
                            </UBadge>
                        </UButton>
                        <template #panel>
                            <div class="min-w-[328px] min-h-[391px] bg-[#EFEBEB]" v-if="!cart || !cart.cartItem.length">
                                <div class="w-full h-[11px] bg-primary mb-[34px]"></div>
                                <h1 class="text-xl pl-[35px]">Your Shopping Cart is Empty</h1>
                                <h1 class="text-sm translate-x-1 mt-[10px] pl-[35px]">You have not entered any orders.
                                </h1>
                                <div class="flex flex-col w-full justify-center items-center">
                                    <img src="/img/cart-empty.png" class="w-[60%] mb-[34px]" alt="">
                                    <ULink class="px-4 w-full" :to="'/'">
                                        <UButton :block="true" class="bg-secondary hover:bg-secondary">Continue Shopping
                                        </UButton>
                                    </ULink>
                                </div>
                            </div>

                            <div class="min-w-[328px] min-h-[391px] bg-[#EFEBEB] relative" v-else>
                                <div class="w-full h-[11px] bg-primary mb-[12px]"></div>
                                <div class="max-h-[200px] flex flex-col overflow-y-scroll w-full">
                                    <div class="w-full p-[15px] flex gap-1 justify-between" v-for="i in cart.cartItem"
                                        :key="i.id">
                                        <div class="flex items-start gap-2">
                                            <img :src="i.product.thumbnail" class="w-[78px]" alt="">
                                            <div>
                                                <p class="text-xs font-semibold flex flex-col">
                                                    {{ i.product.name }}
                                                    <span v-if="i.productVariantId" class="font-thin">Variant: {{
                                                        i.productVariant?.partNumber }}</span>
                                                    <span v-if="i.productVariantTypeId" class="font-thin">Type: {{
                                                        i.productVariantType?.partNumber }}</span>
                                                </p>
                                                <p class="text-xs">Rp.{{ i.price }}/pack</p>
                                                <div class="w-1/2 flex" v-if="!i.isOutOfStock">
                                                    <UButton @click="changeQuantity(i, 'min')" color="gray" size="xs"
                                                        :disabled="i.quantity <= 1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                                            viewBox="0 0 24 24">
                                                            <path fill="none" stroke="#888888" stroke-linecap="round"
                                                                stroke-linejoin="round" stroke-width="1.5"
                                                                d="M5 12h14" />
                                                        </svg>
                                                    </UButton>
                                                    <UInput v-model="i.quantity" size="xs" type="number"
                                                        class="bg-[#EFEBEB] w-1/2" />
                                                    <UButton @click="changeQuantity(i, 'plus')" color="gray" size="xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                                            viewBox="0 0 24 24">
                                                            <path fill="none" stroke="#888888" stroke-linecap="round"
                                                                stroke-linejoin="round" stroke-width="1.5"
                                                                d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                    </UButton>
                                                </div>
                                                <p class="text-xs text-red-500" v-else>Out of Stock</p>
                                                <p class="text-sm text-secondary">Rp. {{ i.subtotal }}</p>
                                            </div>
                                        </div>
                                        <button @click="deleteCartItem(i)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                viewBox="0 0 24 24">
                                                <path fill="none" stroke="#888888" stroke-linecap="round"
                                                    stroke-linejoin="round" stroke-width="1.5"
                                                    d="m14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21q.512.078 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48 48 0 0 0-3.478-.397m-12 .562q.51-.088 1.022-.165m0 0a48 48 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a52 52 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a49 49 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="p-[15px] w-full border-2">
                                    <div class="w-full flex justify-between text-xs text-[#898383]">
                                        <p>Subtotal</p>
                                        <p>Rp. {{ cart.subtotal }}</p>
                                    </div>
                                </div>
                                <div class="w-full flex justify-between text-sm p-[15px] font-bold text-[#898383]">
                                    <p>TOTAL</p>
                                    <p class="text-secondary">Rp. {{ cart.subtotal }}</p>
                                </div>
                                <div class="flex flex-col w-full justify-center items-center absolute bottom-0 mb-2">
                                    <div class="px-4 w-full flex flex-col gap-1">
                                        <ULink :to='"/checkout"'>
                                            <UButton :block="true" class="bg-primary hover:bg-primary">Add to Order
                                            </UButton>
                                        </ULink>
                                        <UButton @click="initQuotation" :block="true"
                                            class="bg-secondary hover:bg-secondary">Add to Quote
                                        </UButton>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UPopover>
                    <UButton class="bg-secondary hover:bg-secondary relative" :to="`/wishlist`" :disabled="!user">
                        <IconPaper class="w-[18px] h-[18px]" />
                        <!-- <UBadge :ui="{ rounded: 'rounded-full' }" size="xs" class="bg-accent absolute -top-2 -right-2">0
                        </UBadge> -->
                    </UButton>
                </div>
            </div>
            <div class="w-full flex justify-center items-center gap-x-12">
                <UButton @click="router.push('/')" variant="ghost"
                    class="bg-white text-primary hover:bg-primary hover:text-white">Home</UButton>
                <!-- <MoleculesNavCategory /> -->
                <UButton @click="router.push('/category')" variant="ghost"
                class="bg-white text-primary hover:bg-primary hover:text-white">Category</UButton>
                <!-- <MoleculesNavBrand /> -->
                <UButton @click="router.push('/brand')" variant="ghost"
                class="bg-white text-primary hover:bg-primary hover:text-white">Brand</UButton>
                <UButton variant="ghost" class="bg-white text-primary hover:bg-primary hover:text-white">Promo</UButton>
                <UButton variant="ghost" class="bg-white text-primary hover:bg-primary hover:text-white">About Us
                </UButton>
            </div>
        </div>
    </div>
</template>