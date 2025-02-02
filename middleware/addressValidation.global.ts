import type { ResponseAddressList } from "~/types/address"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const uiStore = useUiStore()
    const apiBase = useRuntimeConfig().public.apiBase;
    const { accessToken } = storeToRefs(useUserStore())
    if (to.name === 'checkout') {
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
        uiStore.removeLoading()
        if (!data.data.length) {
            useSwal()
            .fire({
                icon: 'warning',
                title: 'Please Create Default Address'
            })
            return navigateTo('/account', {redirectCode: 301})
        }
    }
})
