<script setup>
import defaultImage from "../../assets/empty-state.png";

defineProps({
  title: {
    type: String,
    default: "Nothing here yet",
  },
  subtitle: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: defaultImage,
  },
  imageAlt: {
    type: String,
    default: "Empty state illustration",
  },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-full px-4 py-8 text-center"
  >
    <img
      v-if="image"
      :src="image"
      :alt="imageAlt"
      class="w-24 sm:w-28 md:w-36 lg:w-44 h-auto object-contain"
    />

    <div
      v-else
      class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-border flex items-center justify-center opacity-60"
    >
      <slot name="icon" />
    </div>

    <h3 class="text-base sm:text-lg font-semibold text-primary-text">
      {{ title }}
    </h3>

    <p
      v-if="subtitle"
      class="mt-2 max-w-xs sm:max-w-sm text-xs sm:text-sm text-secondary-text leading-5"
    >
      {{ subtitle }}
    </p>

    <slot />
  </div>
</template>