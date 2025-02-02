<script setup lang="ts">
import IconEye from '~/components/icons/IconEye.vue'
import type { LoginResponse, UserDetailResponse } from '~/types/auth';
import type { OFetchError } from '~/types/common';
const passwordVisible = ref<boolean>(false)
const payload = ref({
    email: 'axa2@example.com',
    phoneNumber: '0812',
    password: 'test',
    company_name: '',
    company_type: ''
})

const router = useRouter()
const userStore = useUserStore();
const apiBase = useRuntimeConfig().public.apiBase;
const uiStore = useUiStore()
const register = async () => {
    try {
        uiStore.setLoading()
        // Call register endpoint
        await $fetch(`${apiBase}/customer/register`, {
            method: 'POST',
            body: payload.value,
        }).then(async () => {
            await $fetch<LoginResponse>(`${apiBase}/auth/login/user`, {
                method: 'POST',
                body: {
                    email: payload.value.email,
                    password: payload.value.password,
                },
            }).then(async (data) => {
                if (data) {
                    const { accessToken } = data.data;
                    userStore.setAccessToken(accessToken);
                }
                await getDetail()
            }).catch((err) => {
                const error = err as OFetchError
                useSwal()
                    .fire({
                        icon: 'error',
                        title: 'Error Login',
                        text: error.data.error?.message
                    })
            });
        }).catch((err) => {
            const error = err as OFetchError
            useSwal()
                .fire({
                    icon: 'error',
                    title: 'Error Login',
                    text: error.data.error?.message
                })
        });
    } catch (error) {
        console.error('Registration failed:', error);
    } finally {
        uiStore.removeLoading()
    }
}

const getDetail = async () => {
    try {
        const { data } = await useFetch<UserDetailResponse>(`${apiBase}/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${userStore.accessToken}`,
            },
        });
        if (data.value && data.value.data) {
            userStore.setUser(data.value!.data);
        }
        router.push('/');
    } catch (error) {
        console.log(error)
    }
}
</script>
<template>
    <div class="w-full px-[180px] py-[60px] flex flex-col">
        <h1 class="text-[32px] font-semibold">Create Company Account</h1>
        <h2 class="font-extralight text-base mb-5">Please enter your active mobile number!</h2>

        <div class="w-1/2 flex flex-col gap-[15px] mb-[25px]" v-i>
            <label for="" class="text-sm">Email <span class="text-red-500">*</span></label>
            <UInput size="md" class="border border-primary" v-model="payload.email" />
        </div>

        <div class="w-1/2 flex flex-col gap-[15px] mb-[25px]" v-i>
            <label for="" class="text-sm">Phone Number <span class="text-red-500">*</span></label>
            <UInput size="md" class="border border-primary" v-model="payload.phoneNumber" />
        </div>


        <div class="w-1/2 flex flex-col gap-[15px] mb-[25px]">
            <label for="" class="text-sm">Company Name <span class="text-red-500">*</span></label>
            <UInput size="md" class="border border-primary" v-model="payload.company_name"/>
        </div>

        <div class="w-1/2 flex flex-col gap-[15px] mb-[25px]">
            <label for="" class="text-sm">Roles <span class="text-red-500">*</span></label>
            <UInput size="md" class="border border-primary" v-model="payload.company_type"/>
        </div>

        <div class="w-1/2 flex flex-col gap-[15px] mb-[35px] relative">
            <label for="" class="text-sm">Password <span class="text-red-500">*</span></label>
            <UInput v-model="payload.password" :type="passwordVisible ? 'text' : 'password'" size="md"
                class="border border-primary" />
            <button class="absolute right-2 top-11" @click="passwordVisible = !passwordVisible">
                <IconEye />
            </button>
            <div class="flex justify-end items-end">
                <h1 class="text-sm font-thin border-b">Forgot Password</h1>
            </div>
        </div>

        <div class="w-20">
            <UButton @click="register" class="w-full bg-secondary hover:bg-secondary  flex-shrink-0">Next</UButton>
        </div>
    </div>
</template>