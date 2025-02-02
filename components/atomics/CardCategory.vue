<script setup lang="ts">
const props = defineProps({
  image: String,
  name: String,
  id: String
})
const emit = defineEmits(['detail'])
const detailCategory = () => {
    emit('detail', props.id)
}
</script>
<template>
    <div class="rounded-md shadow-xl max-w-[189px] min-w-[189px] flex-shrink-0 flex flex-col justify-between" @click="detailCategory">
        <div class="w-full flex justify-center items-center px-[17px] py-[20px] rounded-t-md">
            <!-- <img src="/img/category-example.png" alt=""> -->
            <img :src="image" alt="" class="max-h-20">
        </div>
        <div class=" bg-primary font-semibold text-white text-sm text-center px-2 py-3 rounded-b-md shadow-md">
            {{ name }}
        </div>
    </div>
</template>