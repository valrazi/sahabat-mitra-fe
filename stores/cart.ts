import type { Cart } from "~/types/cart";

export const useCartStore = defineStore('cart', {
    state: () => ({
        cart: null as Cart | null
    }),
    actions: {
        setCart(cart: Cart) {
            this.cart = cart
        },
        removeCart() {
            this.cart = null
        },
    },
    persist: {
        key: 'cart-storage',
        storage: piniaPluginPersistedstate.localStorage()
    }
})