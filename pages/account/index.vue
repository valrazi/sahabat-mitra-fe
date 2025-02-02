<script setup lang="ts">
definePageMeta({
    profile: true
})
const router = useRouter()
const activeTab = ref<'information' | 'address' | 'password'>('address')
const { user } = storeToRefs(useUserStore())
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'
import type { Address, ResponseAddressList } from '~/types/address'
import type { Response, OFetchError } from '~/types/common'
const uiStore = useUiStore()

const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().length(8, 'Password Length Minimal 8')
})

type Schema = z.output<typeof schema>;
const state = reactive({
    currentPassword: '',
    newPassword: ''
})

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.currentPassword) errors.push({ path: 'currentPassword', message: 'Required' })
    if (!state.newPassword) errors.push({ path: 'newPassword', message: 'Required' })
    return errors
}

async function submitPassword(event: FormSubmitEvent<Schema>) {
    console.log(event.data)
}

const passwordVisibility = ref({
    current: false,
    new: false
})

const apiBase = useRuntimeConfig().public.apiBase;
const { accessToken } = storeToRefs(useUserStore())

const addressData = ref<Address[]>([])
const fetchAddress = async () => {
    uiStore.setLoading()
    const data = await $fetch<ResponseAddressList>(`${apiBase}/address`, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`
        },
        query: {
            orderBy: 'createdAt',
            order: 'DESC'
        }
    })
    if (data) addressData.value = data.data
    uiStore.removeLoading()
}

const deleteAddress = (address: Address) => {
    useSwal()
        .fire({
            icon: `question`,
            title: `Delete Address`,
            text: `This action can't be undone`,
            showCancelButton: true
        })
        .then(async (res) => {
            if (res.isConfirmed) {
                try {
                    uiStore.setLoading()
                    const data = await $fetch<Response<Address>>(`${apiBase}/address/${address.id}`, {
                        method: 'delete',
                        headers: {
                            Authorization: `Bearer ${accessToken.value}`
                        }
                    })
                    if (!data.error) {
                        useSwal()
                            .fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Delete Address Success'
                            })
                            .then(() => fetchAddress())
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

const promptState = ref<boolean>(false)
const deniedState = ref<boolean>(false)
const checkLocation = (address?: Address) => {
    promptState.value = false
    deniedState.value = false
    navigator.permissions.query({ name: 'geolocation' })
        .then((res) => {
            console.log(res.state)
            if (res.state != 'granted') {
                navigator.geolocation.getCurrentPosition(() => { });
                locationModal.value = true
                if (res.state == 'prompt') promptState.value = true
                if (res.state == 'denied') deniedState.value = true
            } else {
                if (!address?.id) {
                    router.push({
                        path: `/address/new`,
                    })
                } else {
                    router.push({
                        path: `/address/${address.id}`,
                    })
                }
            }
        })
}

const locationModal = ref<boolean>(false)

const setAddressDefault = async (address: Address) => {
    useSwal()
        .fire({
            icon: 'question',
            title: `Set Default Address?`,
            showCancelButton: true
        })
        .then(async (res) => {
            if (res.isConfirmed) {
                try {
                    uiStore.setLoading()
                    const data = await $fetch<Response<Address>>(`${apiBase}/address/default/${address.id}`, {
                        method: 'put',
                        headers: {
                            Authorization: `Bearer ${accessToken.value}`
                        }
                    })
                    if (!data.error) {
                        useSwal()
                            .fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Set Default Address Success'
                            })
                            .then(() => fetchAddress())
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
onMounted(() => {
    fetchAddress()
})
</script>
<template>
    <UModal v-model="locationModal">
        <div class="p-4">
            <h1 class="text-sm mb-4 font-bold">Allow Location Permission </h1>
            <div class="w-full" v-if="promptState">
                <h1 class="text-sm mb-3">Click Allow While Visiting the Site on This Prompt (Located Left Top)</h1>
                <img src="/img/prompt-permission.png" alt="" class="w-1/2">
            </div>

            <div class="w-full" v-if="deniedState">
                <img src="/img/promp-denied.png" alt="" class="w-full">
            </div>
        </div>
    </UModal>
    <div class="w-full py-[61px] pr-[100px]">
        <div class="w-full border-2 py-[25px] px-[60px]">
            <div class="w-full pb-2 border-b-2 flex gap-[40px] mb-[50px]">
                <UButton @click="activeTab = 'information'" :class="{
                    'bg-secondary hover:bg-secondary text-white': activeTab == 'information',
                    'bg-white hover:bg-white text-black': activeTab != 'information'
                }">
                    Account Information
                </UButton>

                <UButton @click="activeTab = 'address'" :class="{
                    'bg-secondary hover:bg-secondary text-white': activeTab == 'address',
                    'bg-white hover:bg-white text-black': activeTab != 'address'
                }">
                    Address Book
                </UButton>

                <UButton @click="activeTab = 'password'" :class="{
                    'bg-secondary hover:bg-secondary text-white': activeTab == 'password',
                    'bg-white hover:bg-white text-black': activeTab != 'password'
                }">
                    Change Pasword
                </UButton>
            </div>

            <div class="w-full" v-if="activeTab == 'information'">
                <h1 class="pb-2 border-b text-xl font-semibold mb-[40px]">Account Information</h1>

                <div class="w-full flex flex-col gap-4 mb-[40px]">
                    <div class="w-full flex">
                        <h1 class="font-semibold w-1/5">Account Name:</h1>
                        <h1 class="font-thin">{{ user?.customer.name ?? 'No Name' }}</h1>
                    </div>

                    <div class="w-full flex">
                        <h1 class="font-semibold w-1/5">Phone Number:</h1>
                        <h1 class="font-thin">{{ user?.customer.phoneNumber ?? 'No Phone Number' }}</h1>
                    </div>

                    <div class="w-full flex">
                        <h1 class="font-semibold w-1/5">Email:</h1>
                        <h1 class="font-thin">{{ user?.email ?? 'No Email' }}</h1>
                    </div>

                    <div class="w-full flex">
                        <h1 class="font-semibold w-1/5">NPWP:</h1>
                        <h1 class="font-thin">{{ user?.customer.npwp ?? 'No NPWP' }}</h1>
                    </div>
                </div>

                <div class="w-full flex justify-end">
                    <div class="w-1/5">
                        <ULink :to="'/account/information'">
                            <UButton block class="bg-secondary hover:bg-secondary">
                                Edit
                            </UButton>
                        </ULink>
                    </div>
                </div>
            </div>

            <div class="w-full" v-if="activeTab == 'address'">
                <h1 class="pb-2 border-b text-xl font-semibold mb-[40px]">My Address</h1>

                <div class="w-full p-7 border-2 flex flex-col mb-[40px]" v-for="a in addressData">
                    <div class="w-full flex justify-between mb-2">
                        <div>
                            <h1 class="text-xs">{{ a.name }}</h1>
                            <h1 class="font-bold">{{ a.contactName }}</h1>
                            <h2 class="text-sm">{{ a.contactPhone }}</h2>
                            <UBadge v-if="a.isDefault">Default Address</UBadge>
                        </div>

                        <div class="flex gap-2">
                            <UButton @click="checkLocation(a)" variant="ghost" class="hover:bg-transparent" icon="i-heroicons-pencil" />

                            <UButton @click="deleteAddress(a)" variant="ghost" class="hover:bg-transparent"
                                icon="i-heroicons-trash" color="red" />
                        </div>
                    </div>

                    <div class="w-full flex justify-between">
                        <h1>{{ a.streetAddress }}, {{ a.zipcode }}</h1>
                        <UButton size="xs" @click="setAddressDefault(a)"
                            class="bg-secondary text-white hover:bg-secondary" v-if="!a.isDefault">Set As Default
                        </UButton>
                    </div>
                </div>

                <div class="w-full flex justify-end">
                    <div class="w-1/5">
                        <ULink class="w-full">
                            <UButton block class="bg-secondary text-white hover:bg-secondary" @click="checkLocation">Add
                                Address</UButton>
                        </ULink>
                    </div>
                </div>
            </div>

            <div class="w-full" v-if="activeTab == 'password'">
                <h1 class="pb-2 border-b text-xl font-semibold mb-[40px]">Input Password</h1>

                <UForm :validate="validate" :schema="schema" :state="state" class="space-y-4" @submit="submitPassword">

                    <UFormGroup label="Current Password" name="currentPassword">
                        <UInput v-model="state.currentPassword" :type="passwordVisibility.current ? 'text' : 'password'"
                            :ui="{ icon: { trailing: { pointer: '' } } }">
                            <template #trailing>
                                <UButton variant="ghost" class="hover:bg-transparent"
                                    :icon="passwordVisibility.current ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                                    @click="passwordVisibility.current = !passwordVisibility.current" />
                            </template>

                        </UInput>
                    </UFormGroup>

                    <UFormGroup label="New Password" name="newPassword">
                        <UInput v-model="state.newPassword" :type="passwordVisibility.new ? 'text' : 'password'"
                            :ui="{ icon: { trailing: { pointer: '' } } }">
                            <template #trailing>
                                <UButton variant="ghost" class="hover:bg-transparent"
                                    :icon="passwordVisibility.new ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                                    @click="passwordVisibility.new = !passwordVisibility.new" />
                            </template>
                        </UInput>
                    </UFormGroup>
                    <UButton type="submit">
                        Submit
                    </UButton>
                </UForm>
            </div>
        </div>
    </div>
</template>