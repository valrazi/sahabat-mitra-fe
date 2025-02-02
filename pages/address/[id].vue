<script setup lang="ts">
definePageMeta({
  profile: true
})
const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.params.id != 'new')
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'
import type { Response, OFetchError } from '~/types/common'
import type { Address } from '~/types/address'
const uiStore = useUiStore()
const { accessToken } = storeToRefs(useUserStore())
const apiBase = useRuntimeConfig().public.apiBase;
const schema = z.object(
  {
    name: z.string(),
    contactName: z.string(),
    contactPhone: z.string(),
    streetAddress: z.string(),
    zipcode: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    note: z.string()
  }
)

type Schema = z.output<typeof schema>;
const state = reactive({
  name: '',
  contactName: '',
  contactPhone: '',
  streetAddress: '',
  zipcode: '',
  latitude: 0,
  longitude: 0,
  note: ''
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Required' })
  if (!state.contactName) errors.push({ path: 'contactName', message: 'Required' })
  if (!state.contactPhone) errors.push({ path: 'contactPhone', message: 'Required' })
  if (!state.streetAddress) errors.push({ path: 'streetAddress', message: 'Required' })
  if (!state.zipcode) errors.push({ path: 'zipcode', message: 'Required' })
  if (!state.latitude) errors.push({ path: 'latitude', message: 'Required' })
  if (!state.longitude) errors.push({ path: 'longitude', message: 'Required' })
  if (!state.note) errors.push({ path: 'note', message: 'Required' })
  return errors
}

const getLatLong = () => {
  navigator.geolocation.getCurrentPosition((data: GeolocationPosition) => {
    state.latitude = data.coords.latitude
    state.longitude = data.coords.longitude
  })
}

const addData = async () => {
  try {
    uiStore.setLoading()
    const data = await $fetch<Response<Address>>(`${apiBase}/address`, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: state
    })
    console.log(data)
    if (!data.error) {
      useSwal()
        .fire({
          icon: `success`,
          title: `Success`,
          text: `Success create address`
        })
        .then(() => router.push({
          path: '/account'
        }))
    }
  } catch (error) {
    const err = error as OFetchError
    useSwal()
      .fire({
        icon: `error`,
        title: `Error`,
        text: `${err.data.error?.message}`
      })
      .then(() => {
        window.location.reload()
      })
  } finally {
    uiStore.removeLoading()
  }
}

const updateData = async () => {
  try {
    uiStore.setLoading()
    const data = await $fetch<Response<Address>>(`${apiBase}/address/${route.params.id}`, {
      method: 'put',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: state
    })
    console.log(data)
    if (!data.error) {
      useSwal()
        .fire({
          icon: `success`,
          title: `Success`,
          text: `Success update address`
        })
        .then(() => router.push({
          path: '/account'
        }))
    }
  } catch (error) {
    const err = error as OFetchError
    useSwal()
      .fire({
        icon: `error`,
        title: `Error`,
        text: `${err.data.error?.message}`
      })
      .then(() => {
        window.location.reload()
      })
  } finally {
    uiStore.removeLoading()
  }
}

const onSubmit = () => {
  if(!isEdit.value) addData()
  else updateData()
}

const fetchData = async () => {
  const data = await $fetch<Response<Address>>(`${apiBase}/address/${route.params.id}`, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${accessToken.value}`
    }
  })
  if(!data.error) {
    const {contactName, contactPhone, latitude, longitude, name, note,streetAddress,zipcode} = data.data
    state.contactName = contactName
    state.contactPhone = contactPhone
    state.latitude = latitude
    state.longitude = longitude
    state.name = name
    state.note = note
    state.streetAddress = streetAddress
    state.zipcode = zipcode
  }
}

onMounted(() => {
  getLatLong()
  if(isEdit.value) {
    fetchData()
  }
})
</script>
<template>
  <div class="w-full py-[61px] pr-[100px]">
    <h1 class="font-bold text-xl mb-[40px]">Address Form</h1>

    <h1 class="font-bold text-lg pb-2 border-b mb-[40px]">{{ isEdit ? 'Edit' : 'Add' }} Address</h1>

    <div class="w-full">
      <UForm :validate="validate" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

        <UFormGroup label="Address Name" name="name">
          <UInput v-model="state.name" placeholder="ex: Office, Home" />
        </UFormGroup>

        <UFormGroup label="Contact Name" name="contactName">
          <UInput v-model="state.contactName" />
        </UFormGroup>

        <UFormGroup label="Contact Phone" name="contactPhone">
          <UInput v-model="state.contactPhone" />
        </UFormGroup>

        <UFormGroup label="Street Address" name="streetAddress">
          <UInput v-model="state.streetAddress" />
        </UFormGroup>

        <UFormGroup label="Zipcode" name="zipcode">
          <UInput v-model="state.zipcode" />
        </UFormGroup>

        <UFormGroup label="Note" name="note">
          <UInput v-model="state.note" placeholder="ex: Red House with White Gate" />
        </UFormGroup>

        <UButton type="submit">
          Submit
        </UButton>
      </UForm>
    </div>
  </div>
</template>