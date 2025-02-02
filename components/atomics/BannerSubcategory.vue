<script setup lang="ts">
const props = defineProps({
    image: String,
    name: String
})
</script>
<template>
    <div class="w-full bg-primary h-[200px] relative flex flex-col justify-center items-center my-[40px] rounded-xl">
        <div class="w-[150px] h-[150px] bg-white flex justify-center items-center">
            <img class="flex-shrink-0" :src="image" alt="">
        </div>
        <div
            class="w-[260px] p-[15px] absolute bottom-0 translate-y-8 rounded-xl bg-secondary text-white text-[15px] font-semibold text-center">
            <h1>{{ name }}</h1>
        </div>
    </div>
</template>