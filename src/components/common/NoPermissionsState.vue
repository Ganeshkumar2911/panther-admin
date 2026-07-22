<script setup>
import { ShieldAlert, RefreshCw } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: 'Access Restricted',
  },
  description: {
    type: String,
    default: 'You do not have any assigned permissions. Please contact your system administrator to assign roles or permissions to your account.',
  },
})

const emit = defineEmits(['retry'])
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
    <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shadow-sm">
      <ShieldAlert class="w-8 h-8 text-amber-500" />
    </div>

    <h2 class="text-xl font-bold text-primary-text mb-2">
      {{ title }}
    </h2>

    <p class="text-sm text-secondary-text max-w-md mb-6 leading-relaxed">
      {{ description }}
    </p>

    <button
      @click="emit('retry')"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
    >
      <RefreshCw class="w-4 h-4" />
      <span>Refresh Permissions</span>
    </button>
  </div>
</template>
