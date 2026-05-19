<script setup>
defineProps({
  title:      { type: String,           required: true },
  value:      { type: [String, Number], default: '—'   },
  subtext:    { type: String,           default: ''    },
  change:     { type: Number,           default: null  }, // % change, null = hide
  loading:    { type: Boolean,          default: false },
})
</script>

<template>
  <div class="group bg-card-background border border-primary-border rounded-2xl p-5 transition-all duration-200 hover:border-primary/40 relative overflow-hidden">
    <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="animate-pulse space-y-3">
        <div class="h-2.5 w-24 bg-primary-border rounded-full" />
        <div class="h-8 w-28 bg-primary-border rounded-full" />
        <div class="h-2 w-16 bg-primary-border rounded-full" />
      </div>
    </template>

    <!-- Data -->
    <template v-else>
      <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text">{{ title }}</p>
      <p class="mt-2.5 text-2xl font-bold text-primary-text leading-none">{{ value }}</p>
      <div class="mt-2 flex items-center gap-2">
        <span
          v-if="change !== null"
          :class="[
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
            change > 0  ? 'bg-emerald-500/10 text-emerald-400' :
            change < 0  ? 'bg-rose-500/10 text-rose-400'       :
                          'bg-primary-border text-secondary-text',
          ]"
        >
          {{ change > 0 ? '↑' : change < 0 ? '↓' : '—' }} {{ Math.abs(change) }}%
        </span>
        <span v-if="subtext" class="text-[11px] text-secondary-text">{{ subtext }}</span>
      </div>
    </template>
  </div>
</template>