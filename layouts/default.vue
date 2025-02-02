<script setup lang="ts">
const {loading} = storeToRefs(useUiStore())
const route = useRoute()
</script>
<template>
    <div class="w-full relative">
        <div v-if="loading" class="w-screen z-[999] h-full flex justify-center items-center fixed bg-white bg-opacity-50">
            <div class="loader"></div>
        </div>
        <Navbar />
        <div class="w-full flex gap-x-[50px]">
            <aside class="pl-[112px] w-[30%] py-[61px]" v-if="route.meta.profile">
                <div class="w- border-2 flex flex-col">
                    <RouterLink :to="'/account'" :active-class="'bg-secondary text-white'" class="w-full p-[25px] flex gap-x-[25px] text-base items-center">
                        <img src="/img/line-green.png" alt="">
                        <span>My Account</span>
                    </RouterLink>
                    <RouterLink :to="'/quotation'" :active-class="'bg-secondary text-white'" class="w-full p-[25px] flex gap-x-[25px] text-base items-center">
                        <img src="/img/line-green.png" alt="">
                        <span>My Quotation</span>
                    </RouterLink>
                    <RouterLink :to="'/order'" :active-class="'bg-secondary text-white'" class="w-full p-[25px] flex gap-x-[25px] text-base items-center">
                        <img src="/img/line-green.png" alt="">
                        <span>My Orders</span>
                    </RouterLink>
                </div>
            </aside>
            <slot />
        </div>
        <Footer />
    </div>
</template>
<style>
/* HTML: <div class="loader"></div> */
.loader {
    width: 50px;
    padding: 8px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #25b09b;
    --_m:
        conic-gradient(#0000 10%, #000),
        linear-gradient(#000 0 0) content-box;
    -webkit-mask: var(--_m);
    mask: var(--_m);
    -webkit-mask-composite: source-out;
    mask-composite: subtract;
    animation: l3 1s infinite linear;
}

@keyframes l3 {
    to {
        transform: rotate(1turn)
    }
}
</style>