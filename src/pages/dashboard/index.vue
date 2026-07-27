<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { RefreshCw, CalendarDays, X } from 'lucide-vue-next'

import { useDashboardStore } from '@/stores/dashboard/dashboard'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

import OverviewSection      from '@/components/dashboard/OverviewSection.vue'
import RevenueIntelligence  from '@/components/dashboard/RevenueIntelligence.vue'
import FundManagerSection   from '@/components/dashboard/FundManagerSection.vue'
import IBNetworkSection     from '@/components/dashboard/IBNetworkSection.vue'
import WalletSection        from '@/components/dashboard/WalletSection.vue'
import SettlementSection    from '@/components/dashboard/SettlementSection.vue'
import RecentActivitySection from '@/components/dashboard/RecentActivitySection.vue'

// ─── Store & Permissions ──────────────────────────────────────────
const router = useRouter()
const store = useDashboardStore()
const { dashboard, dashboardLoading, revenueLoading, dashboardFilters } = storeToRefs(store)
const { hasPermission, isFetched, firstAllowedPath } = usePermissionCheck()

watchEffect(() => {
  if (isFetched.value && !hasPermission('analytics.view')) {
    router.replace(firstAllowedPath.value)
  }
})

// ─── Date filter local refs ──────────────────────────────────────
const startDate = ref('')
const endDate = ref('')

const hasDateFilter = computed(() => dashboardFilters.value.start_date && dashboardFilters.value.end_date)

function applyDateFilter() {
  if (!startDate.value || !endDate.value) return
  store.setDashboardFilters({ start_date: startDate.value, end_date: endDate.value })
  store.applyDashboardFilters()
}

function clearDateFilter() {
  startDate.value = ''
  endDate.value = ''
  store.resetDashboardFilters()
}

// ─── Dashboard data slices (from dashboard.value) ─────────────────
const overview            = computed(() => dashboard.value?.overview ?? {})
const fundManagerInsights = computed(() => dashboard.value?.fund_manager_insights ?? {})
const ibNetworkInsights   = computed(() => dashboard.value?.ib_network_insights ?? {})
const walletSummary       = computed(() => dashboard.value?.wallet_summary ?? {})
const walletBreakdown     = computed(() => dashboard.value?.wallet_breakdown ?? {})
const settlementSummary   = computed(() => dashboard.value?.settlement_summary ?? {})
const recentActivity      = computed(() => dashboard.value?.recent_activity ?? [])

// ─── Refresh all ─────────────────────────────────────────────────
function refreshAll() {
  store.fetchDashboard()
  store.fetchRevenueAnalytics()
}

// ─── Lifecycle ───────────────────────────────────────────────────
onMounted(() => {
  if (hasPermission('analytics.view')) {
    store.fetchDashboard()
    store.fetchRevenueAnalytics()
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-primary-text antialiased">
    <!-- ─── Main ─────────────────────────────────────────────── -->
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10">

      <!-- Date Range Filter -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 bg-card-background border border-primary-border rounded-lg px-3 py-2">
            <CalendarDays class="h-3.5 w-3.5 text-secondary-text shrink-0" />
            <input
              type="date"
              v-model="startDate"
              class="bg-transparent text-xs text-primary-text outline-none w-[120px] appearance-none"
              placeholder="Start date"
            />
          </div>
          <span class="text-xs text-secondary-text">to</span>
          <div class="flex items-center gap-1.5 bg-card-background border border-primary-border rounded-lg px-3 py-2">
            <CalendarDays class="h-3.5 w-3.5 text-secondary-text shrink-0" />
            <input
              type="date"
              v-model="endDate"
              :min="startDate"
              class="bg-transparent text-xs text-primary-text outline-none w-[120px] appearance-none"
              placeholder="End date"
            />
          </div>
          <button
            @click="applyDateFilter"
            :disabled="!startDate || !endDate"
            class="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-opacity"
            :class="startDate && endDate ? 'bg-primary text-black hover:opacity-90' : 'bg-card-background text-secondary-text border border-primary-border cursor-not-allowed opacity-50'"
          >
            Apply
          </button>
          <button
            v-if="hasDateFilter"
            @click="clearDateFilter"
            class="inline-flex items-center gap-1 text-xs font-medium text-secondary-text hover:text-primary-text px-3 py-2 rounded-lg border border-primary-border bg-card-background transition-colors"
          >
            <X class="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>

      <!-- 1 · Overview -->
      <OverviewSection
        :data="overview"
        :loading="dashboardLoading"
      />

      <!-- 2 · Revenue Intelligence (owns its own loading via store) -->
      <RevenueIntelligence />

      <!-- 3 · Fund Manager Intelligence -->
      <FundManagerSection
        :data="fundManagerInsights"
        :loading="dashboardLoading"
      />

      <!-- 4 · IB Network Intelligence -->
      <IBNetworkSection
        :data="ibNetworkInsights"
        :loading="dashboardLoading"
      />

      <!-- 5 · Wallet & Capital Flow -->
      <WalletSection
        :summary="walletSummary"
        :breakdown="walletBreakdown"
        :loading="dashboardLoading"
      />

     <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <!-- Recent Activity — 2/3 -->
        <div class="xl:col-span-2">
          <RecentActivitySection
            :activities="recentActivity"
            :loading="dashboardLoading"
          />
        </div>

        <!-- Settlement — 1/3 -->
        <div class="xl:col-span-1 flex flex-col">
          <SettlementSection
            title="Settlement Analytics"
            :completed="settlementSummary.completed ?? 0"
            :pending="settlementSummary.pending ?? 0"
            :failed="settlementSummary.failed ?? 0"
            :value="`$${(settlementSummary.total_fees ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
            :loading="dashboardLoading"
          />
        </div>
      </div>

    </main>

  </div>
</template>
