<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  presenterImage: {
    type: String,
  },
})
</script>

<template>
      <div class="flex items-center">
      <figure class="">
        <img
          :src="presenterImage"
          class="
            relative  
            rounded-full
            object-cover
            h-80
            w-80
            border border-8 border-secondary-400 z-10
          "
        />
      </figure>
      <div class="w-1/2">
        <slot />
      </div>
    </div>
</template>
