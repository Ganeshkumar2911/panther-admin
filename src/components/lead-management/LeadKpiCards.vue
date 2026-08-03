<script setup>
import { computed } from 'vue'
import {
  Users,
  UserPlus,
  UserCheck,
  ShieldCheck,
  LineChart,
  TrendingUp,
  PhoneCall,
  Activity,
  UserCheck2,
} from 'lucide-vue-next'

const props = defineProps({
  metrics: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const ICON_MAP = {
  total_leads: { icon: Users, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  new_user: { icon: UserPlus, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  new_leads: { icon: UserPlus, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  assigned: { icon: UserCheck, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  contact: { icon: PhoneCall, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  contacted: { icon: PhoneCall, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  registered: { icon: UserCheck2, bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  kyc: { icon: ShieldCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  kyc_approved: { icon: ShieldCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  trading_account: { icon: LineChart, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  trading_accounts: { icon: LineChart, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  conversion_rate: { icon: TrendingUp, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
}

const FALLBACK_PALETTE = [
  { icon: Users, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { icon: UserPlus, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { icon: UserCheck, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { icon: PhoneCall, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { icon: ShieldCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { icon: LineChart, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { icon: TrendingUp, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { icon: Activity, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
]

function formatTitle(key) {
  if (!key) return ''
  if (key.toLowerCase() === 'kyc') return 'KYC'
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(key, val) {
  const num = Number(val ?? 0)
  if (key.includes('rate') || key.includes('percentage')) {
    return `${num}%`
  }
  return num.toLocaleString('en-US')
}

function getIconAndBg(key, index) {
  const normalizedKey = key.toLowerCase()
  if (ICON_MAP[normalizedKey]) {
    return ICON_MAP[normalizedKey]
  }
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
}

const kpiItems = computed(() => {
  const m = props.metrics
  if (!m || typeof m !== 'object') {
    return []
  }

  return Object.entries(m).map(([key, val], i) => {
    const title = formatTitle(key)
    const value = formatValue(key, val)
    const { icon, bg } = getIconAndBg(key, i)

    return {
      key,
      title,
      value,
      icon,
      iconBg: bg,
    }
  })
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
    <!-- Skeleton loader -->
    <template v-if="loading">
      <div
        v-for="n in (kpiItems.length || 8)"
        :key="n"
        class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="h-2.5 w-16 bg-primary-border/50 rounded" />
          <div class="w-7 h-7 rounded-lg bg-primary-border/40" />
        </div>
        <div class="h-6 w-12 bg-primary-border/60 rounded" />
      </div>
    </template>

    <template v-else>
      <div
        v-for="card in kpiItems"
        :key="card.key"
        class="group bg-card-background border border-primary-border rounded-xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
      >
        <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300" />
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text truncate" :title="card.title">
              {{ card.title }}
            </p>
            <div :class="['w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform', card.iconBg]">
              <component :is="card.icon" class="w-3.5 h-3.5" />
            </div>
          </div>
          
          <p class="text-2xl font-bold text-primary-text leading-none tracking-tight">
            {{ card.value }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
