<script setup lang="ts">
definePageMeta({
    profile: true
})
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'

const schema = z.object({
    fullName: z.string(),
    email: z.string().email('Invalid Email'),
    phoneNumber: z.string(),
    npwp: z.string()
})
type Schema = z.output<typeof schema>
const { user } = storeToRefs(useUserStore())
const state = reactive({
    email: user.value?.email,
    fullName: user.value?.customer.name ?? '',
    phoneNumber: user.value?.customer.phoneNumber,
    npwp: user.value?.customer.npwp ?? ''
})
const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Required' })
  if (!state.fullName) errors.push({ path: 'fullName', message: 'Required' })
  if (!state.phoneNumber) errors.push({ path: 'phoneNumber', message: 'Required' })
  if (!state.npwp) errors.push({ path: 'npwp', message: 'Required' })
  return errors
}
async function onSubmit(event: FormSubmitEvent<Schema>) {
    
}
</script>

<template>
    <div class="w-full py-[61px] pr-[100px]">
        <h1 class="font-bold text-xl mb-[40px]">My Account</h1>

        <h1 class="font-bold text-lg pb-2 border-b mb-[40px]">Edit Information</h1>

        <div class="w-full">
            <UForm :validate="validate" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                
                <UFormGroup label="Full Name" name="fullName">
                    <UInput v-model="state.fullName" />
                </UFormGroup>
                
                <UFormGroup label="Email" name="email">
                    <UInput v-model="state.email" />
                </UFormGroup>

                <UFormGroup label="Phone Number" name="phoneNumber">
                    <UInput v-model="state.phoneNumber" />
                </UFormGroup>

                <UFormGroup label="NPWP" name="npwp">
                    <UInput v-model="state.npwp" />
                </UFormGroup>

                <UButton type="submit">
                    Submit
                </UButton>
            </UForm>
        </div>
    </div>
</template>