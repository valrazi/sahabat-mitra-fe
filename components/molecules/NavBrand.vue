<template>
    <UPopover>
        <UButton variant="ghost" class="bg-white text-primary hover:bg-primary hover:text-white">Brands
        </UButton>
        <template #panel>
            <div
                class="py-[58px] px-[53px] w-[85vw] gap-x-4 gap-y-[30px] flex flex-row flex-wrap justify-center items-center">
                <div class="w-[202px] flex justify-center items-center py-[38px] px-[25px] rounded-lg shadow-md"
                    v-for="_ in 20">
                    <img src="/img/brand-example.png" alt="" class="w-[152px]">
                </div>
            </div>
        </template>
    </UPopover>
</template>