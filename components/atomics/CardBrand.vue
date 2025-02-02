<script setup lang="ts">

const props = defineProps({
    image: String,
    id: String
})
</script>
<template>
    <ULink :to="'/brand/product/' + id" class="bg-white rounded-[5px] shadow-md flex-shrink-0 flex justify-center items-center px-[36px] py-[33px] min-w-[298px] max-w-[298px] ">
        <img :src="image" alt="" class="max-h-[95px]">
    </ULink>
</template>