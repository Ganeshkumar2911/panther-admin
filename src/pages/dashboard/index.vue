<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RefreshCw } from 'lucide-vue-next'

import { useDashboardStore } from '@/stores/dashboard/dashboard'

import OverviewSection      from '@/components/dashboard/OverviewSection.vue'
import RevenueIntelligence  from '@/components/dashboard/RevenueIntelligence.vue'
import FundManagerSection   from '@/components/dashboard/FundManagerSection.vue'
import IBNetworkSection     from '@/components/dashboard/IBNetworkSection.vue'
import WalletSection        from '@/components/dashboard/WalletSection.vue'
import SettlementSection    from '@/components/dashboard/SettlementSection.vue'
import RecentActivitySection from '@/components/dashboard/RecentActivitySection.vue'

// ─── Store ────────────────────────────────────────────────────────
const store = useDashboardStore()
const { dashboard, dashboardLoading, revenueLoading } = storeToRefs(store)

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
  store.fetchDashboard()
  store.fetchRevenueAnalytics()
})
</script>

<template>
  <div class="min-h-screen bg-background text-primary-text antialiased">
    <!-- ─── Main ─────────────────────────────────────────────── -->
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10">

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

      <!-- 6 · Settlement Analytics + table slot -->
      <SettlementSection
        :data="settlementSummary"
        :loading="dashboardLoading"
      >
        <!--
          Plug your existing settlement table component here:
          <template #settlement-table>
            <YourSettlementTable />
          </template>
        -->
      </SettlementSection>

      <!-- 7 · Recent Activity -->
      <RecentActivitySection
        :activities="recentActivity"
        :loading="dashboardLoading"
      />
    </main>

  </div>
</template>