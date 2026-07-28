<script setup>
import { computed } from 'vue'
import {
  Users,
  UserPlus,
  HeartHandshake,
  UserCheck,
  ShieldCheck,
  LineChart,
  TrendingUp,
} from 'lucide-vue-next'

const props = defineProps({
  totalLeads: { type: Number, default: 245 },
  newLeads: { type: Number, default: 32 },
  interested: { type: Number, default: 81 },
  registered: { type: Number, default: 63 },
  kycApproved: { type: Number, default: 39 },
  tradingAccounts: { type: Number, default: 27 },
  conversionRate: { type: Number, default: 41 },
})

const kpiItems = computed(() => [
  {
    title: 'Total Leads',
    value: props.totalLeads,
    subtext: '+12% vs last month',
    change: 12.4,
    icon: Users,
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    title: 'New Leads',
    value: props.newLeads,
    subtext: '32 received this week',
    change: 8.5,
    icon: UserPlus,
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    title: 'Interested',
    value: props.interested,
    subtext: 'Active nurture stage',
    change: 5.2,
    icon: HeartHandshake,
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    title: 'Registered',
    value: props.registered,
    subtext: 'Portal accounts created',
    change: 14.1,
    icon: UserCheck,
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    title: 'KYC Approved',
    value: props.kycApproved,
    subtext: 'Verified identity docs',
    change: 9.8,
    icon: ShieldCheck,
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    title: 'Trading Accounts',
    value: props.tradingAccounts,
    subtext: 'Active MT5 live traders',
    change: 18.3,
    icon: LineChart,
    iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  {
    title: 'Conversion Rate',
    value: `${props.conversionRate}%`,
    subtext: 'Lead to Live Trader',
    change: 3.4,
    icon: TrendingUp,
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
])
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
    <div
      v-for="(card, i) in kpiItems"
      :key="i"
      class="group bg-card-background border border-primary-border rounded-xl p-4 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between hover:shadow-primary/5"
    >
      <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div>
        <div class="flex items-center justify-between mb-2">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text truncate">
            {{ card.title }}
          </p>
          <div :class="['w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110', card.iconBg]">
            <component :is="card.icon" class="w-3.5 h-3.5" />
          </div>
        </div>
        
        <p class="text-2xl font-bold text-primary-text leading-none tracking-tight">
          {{ card.value }}
        </p>
      </div>

      <div class="mt-3 flex items-center gap-1.5 pt-2 border-t border-primary-border/40">
        <span
          :class="[
            'text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0',
            card.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          ]"
        >
          {{ card.change > 0 ? '↑' : '↓' }} {{ card.change }}%
        </span>
        <span class="text-[10px] text-secondary-text truncate">{{ card.subtext }}</span>
      </div>
    </div>
  </div>
</template>
