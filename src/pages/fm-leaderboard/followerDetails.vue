<template>
  <div class="space-y-6 py-2">
    <!-- Top Header Banner -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            <UserCheck class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h1 class="text-base font-bold text-primary-text truncate">
              {{ store.details?.user_name || 'Follower Details' }}
            </h1>
            <p v-if="store.details?.user_email" class="text-xs font-mono text-primary font-semibold select-all mt-0.5">
              {{ store.details.user_email }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <Tooltip text="Refresh Details">
            <button
              class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="store.fetchDetails(route.params.id)"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="space-y-6 animate-pulse">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-xl p-4 space-y-2">
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-6 w-24 bg-background rounded" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="h-32 bg-card-background border border-primary-border rounded-xl" />
          <div class="h-40 bg-card-background border border-primary-border rounded-xl" />
        </div>
        <div class="h-64 bg-card-background border border-primary-border rounded-xl" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.details" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-border bg-card-background/30 py-20 px-4 text-center">
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-3">
        <UserX class="w-6 h-6 text-secondary-text" />
      </div>
      <p class="text-sm font-bold text-primary-text mb-1">Follower details not found</p>
      <p class="text-xs text-secondary-text">This follower record could not be loaded or may be unavailable.</p>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs">
          <p class="text-[10px] uppercase font-bold tracking-wider text-secondary-text mb-1">Balance</p>
          <p class="text-2xl font-bold text-primary-text font-mono">${{ fmt(store.details.balance) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs">
          <p class="text-[10px] uppercase font-bold tracking-wider text-secondary-text mb-1">Performance Fee</p>
          <p class="text-2xl font-bold text-primary">{{ store.details.performance_fee ?? 0 }}%</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs">
          <p class="text-[10px] uppercase font-bold tracking-wider text-secondary-text mb-1">Management Fee</p>
          <p class="text-2xl font-bold text-primary-text">{{ store.details.management_fee ?? 0 }}%</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs">
          <p class="text-[10px] uppercase font-bold tracking-wider text-secondary-text mb-1">Registration Fee</p>
          <p class="text-2xl font-bold text-primary-text font-mono">${{ fmt(store.details.registration_fee) }}</p>
        </div>
      </div>

      <!-- Detail Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left: 2 Columns (Settings & Specs) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Subscription Settings -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-2xs">
            <p class="text-[10px] uppercase tracking-widest font-bold text-secondary-text mb-4">Subscription Settings</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Lot Type</p>
                <p class="text-sm font-bold text-primary-text capitalize">{{ store.details.lot_type ?? '—' }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Lot Value</p>
                <p class="text-sm font-bold text-primary-text font-mono">{{ store.details.lot_value ?? '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Offer Details -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-2xs">
            <p class="text-[10px] uppercase tracking-widest font-bold text-secondary-text mb-4">Offer Details</p>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Offer ID</p>
                <p class="text-sm font-bold text-primary-text font-mono">#{{ store.details.offer_id }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Settlement Type</p>
                <p class="text-sm font-bold text-primary-text capitalize">{{ store.details.settlement_type || '—' }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Performance Fee</p>
                <p class="text-sm font-bold text-primary-text">{{ store.details.performance_fee }}%</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Management Fee</p>
                <p class="text-sm font-bold text-primary-text">{{ store.details.management_fee }}%</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Registration Fee</p>
                <p class="text-sm font-bold text-primary-text font-mono">${{ fmt(store.details.registration_fee) }}</p>
              </div>
            </div>
          </div>

          <!-- Trading Account -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-2xs">
            <p class="text-[10px] uppercase tracking-widest font-bold text-secondary-text mb-4">Trading Account</p>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Trading Account ID</p>
                <p class="text-sm font-bold text-primary-text font-mono">#{{ store.details.trading_account_id }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Account Number</p>
                <p class="text-sm font-bold text-primary-text font-mono">{{ store.details.account_number }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Broker Label</p>
                <p class="text-sm font-bold text-primary-text">{{ store.details.broker_label ?? '—' }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Server</p>
                <p class="text-sm font-bold text-primary-text uppercase">{{ store.details.server || 'COPY_TRADING' }}</p>
              </div>
              <div>
                <p class="text-[11px] text-secondary-text mb-0.5">Account Balance</p>
                <p class="text-sm font-bold text-primary-text font-mono">${{ fmt(store.details.balance) }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: 1 Column (User & Status Overview) -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-2xs space-y-5 h-fit">
          <p class="text-[10px] uppercase tracking-widest font-bold text-secondary-text">Follower Overview</p>

          <div>
            <p class="text-[11px] text-secondary-text mb-1">Status</p>
            <span
              class="inline-flex text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border"
              :class="store.details.is_active
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
            >
              {{ store.details.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="pt-4 border-t border-primary-border">
            <p class="text-[11px] text-secondary-text mb-1">User Name</p>
            <p class="text-sm font-bold text-primary-text">{{ store.details.user_name || '—' }}</p>
          </div>

          <div class="pt-4 border-t border-primary-border">
            <p class="text-[11px] text-secondary-text mb-1">User Email</p>
            <p class="text-sm font-bold text-primary font-mono select-all">{{ store.details.user_email || '—' }}</p>
          </div>

          <div class="pt-4 border-t border-primary-border">
            <p class="text-[11px] text-secondary-text mb-1">Created Date</p>
            <p class="text-sm font-bold text-primary-text">{{ formatDate(store.details.created_at) }}</p>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { UserCheck, UserX, RotateCw } from 'lucide-vue-next'
import { useFollowersDetailsStore } from '@/stores/fmOffers/followersDetails'
import Tooltip from '@/components/common/Tooltip.vue'

const store  = useFollowersDetailsStore()
const route  = useRoute()

const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

onMounted(() => store.fetchDetails(route.params.id))
onUnmounted(() => store.reset())
</script>
