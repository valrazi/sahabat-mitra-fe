<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import IconCaret from '../icons/IconCaret.vue';
const firstCategory = ref<HTMLElement | null>()
const secondCategoryStyle = computed(() => {
    if (firstCategory.value) {
        console.log(firstCategory.value)
        const position = firstCategory.value.getBoundingClientRect()
        return {
            top: `${position.top}px`,
            left: `120%`,
        }
    }
})
</script>
<template>
    <Popover class="relative">
        <PopoverButton>
            <UButton variant="ghost" class="bg-white text-primary hover:bg-primary hover:text-white">
                Category
            </UButton>
        </PopoverButton>
        <PopoverPanel :unmount="false" class="absolute  z-10">
            <div ref="firstCategory"
                class=" w-full items-center py-4 px-6 bg-white flex flex-col gap-4 rounded-lg shadow-md shadow-primary border-r-3 border-b-3 border-primary">
                <div v-for="_ in 5" :key="_" class="flex-shrink-0">
                    <Popover class="relative w-full">
                        <PopoverButton class="w-full">
                            <UButton color="white" variant="ghost"
                                class="w-full flex gap-4 px-6 items-center text-sm hover:text-primary flex-shrink-0">
                                <IconLine class="text-primary" />
                                <h1>Lampu</h1>
                                <IconCaret />
                            </UButton>
                        </PopoverButton>
                        <PopoverPanel :unmount="false"
                            class="absolute  min-w-[175px] items-center py-2 bg-white flex flex-col rounded-lg shadow-md shadow-primary border-r-3 border-b-3 border-primary"
                            :style="secondCategoryStyle">
                            <div class="border-b-2 w-full text-center pb-1 ">
                                <h1>Lampu</h1>
                            </div>
                            <Popover class="relative">
                                <PopoverButton>
                                    <UButton color="white" variant="ghost"
                                        class="w-full flex justify-between px-6 items-center text-sm hover:text-primary flex-shrink-0">
                                        <IconLine class="text-primary" />
                                        <h1>Lampu x</h1>
                                        <IconCaret />
                                    </UButton>
                                </PopoverButton>
                                <PopoverPanel :unmount="false"
                                    class="absolute  min-w-[175px] items-center py-2 bg-white flex flex-col rounded-lg shadow-md shadow-primary border-r-3 border-b-3 border-primary"
                                    :style="secondCategoryStyle">
                                    <div class="border-b-2 w-full text-center pb-1 ">
                                        <h1>Lampu Y</h1>
                                    </div>
                                    <UButton color="white" variant="ghost"
                                        class="w-full flex justify-between px-6 items-center text-sm hover:text-primary flex-shrink-0">
                                        <IconLine class="text-primary" />
                                        <h1>Lampu x</h1>
                                        <IconCaret />
                                    </UButton>
                                </PopoverPanel>
                            </Popover>

                        </PopoverPanel>
                    </Popover>
                </div>
            </div>
        </PopoverPanel>
    </Popover>
</template>