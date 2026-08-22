<template>
  <div class="px-4 pb-8 space-y-6">

    <!-- Header & Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          title="Back to Settlement Details"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div class="space-y-1">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-base font-bold text-primary-text">Client Settlement Breakdown</h1>

            <span
              v-if="store.data?.settlement_id"
              class="px-2 py-0.5 rounded-md text-xs font-bold bg-primary text-white"
            >
              Settlement #{{ store.data.settlement_id }}
            </span>

            <span
              v-if="store.data?.fm_name"
              class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-card-background text-secondary-text border border-primary-border"
            >
              FM: {{ store.data.fm_name }} (FM #{{ store.data.fm_id }})
            </span>

            <span
              v-if="store.data?.status"
              class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
              :class="statusClass(store.data.status)"
            >
              {{ store.data.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          :disabled="store.loading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer"
          @click="loadData"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Skeletons Loading State -->
    <div v-if="store.loading" class="space-y-6">
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-background" />
          <div class="space-y-2">
            <div class="h-4 w-40 bg-background rounded" />
            <div class="h-3 w-60 bg-background rounded" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-16 bg-background rounded" />
          <div class="h-6 w-24 bg-background rounded" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!store.data || !userData"
      class="flex flex-col items-center justify-center py-20 gap-4 bg-card-background border border-primary-border rounded-2xl"
    >
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center">
        <ReceiptText class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center max-w-sm px-4">
        <p class="text-sm font-semibold text-primary-text">No Settlement Data Found</p>
        <p class="text-xs text-secondary-text mt-1">
          Unable to find settlement details for this client in settlement #{{ route.params.id }}.
        </p>
        <button
          class="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
          @click="goBack"
        >
          Return to Settlement
        </button>
      </div>
    </div>

    <template v-else>

      <!-- Client Profile Hero Card -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 min-w-0">
            <div
              class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0"
            >
              {{ (userData.user?.name || userData.user_name || 'U')[0].toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-primary-text truncate">
                  {{ userData.user?.name || userData.user_name || 'Client Details' }}
                </h2>
                <span
                  class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border text-secondary-text bg-background border-primary-border"
                >
                  User ID: #{{ userData.user?.user_id || userData.user_id || route.params.userId }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-xs text-secondary-text mt-1.5 flex-wrap font-medium">
                <span
                  v-if="userData.user?.email || userData.user_email"
                  class="flex items-center gap-1 font-mono text-primary-text select-all"
                >
                  <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                  {{ userData.user?.email || userData.user_email }}
                </span>
                <span
                  v-if="userData.user?.phone_number || userData.phone_number"
                  class="flex items-center gap-1 text-secondary-text"
                >
                  <Phone class="w-3.5 h-3.5 text-secondary-text shrink-0" />
                  {{ userData.user?.phone_number || userData.phone_number }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats Count -->
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <div class="flex items-center gap-2 bg-background border border-primary-border rounded-xl px-3 py-2 text-xs">
              <Users class="w-3.5 h-3.5 text-primary" />
              <span class="text-secondary-text">Follower Sessions:</span>
              <span class="font-bold text-primary-text">{{ followerList.length }}</span>
            </div>
            <div class="flex items-center gap-2 bg-background border border-primary-border rounded-xl px-3 py-2 text-xs">
              <Activity class="w-3.5 h-3.5 text-primary" />
              <span class="text-secondary-text">Total Trades:</span>
              <span class="font-bold text-primary-text">{{ userSummary.trades_count ?? totalTradesCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Net PnL -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Net PnL</span>
            <TrendingUp v-if="userSummary.net_pnl >= 0" class="w-3.5 h-3.5 text-primary-green" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <div class="mt-2">
            <p
              class="text-xl font-bold tabular-nums"
              :class="userSummary.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
            >
              {{ userSummary.net_pnl > 0 ? '+' : '' }}${{ formatNum(userSummary.net_pnl) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">After deductions</p>
          </div>
        </div>

        <!-- Gross PnL -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Gross PnL</span>
            <TrendingUp v-if="userSummary.gross_pnl >= 0" class="w-3.5 h-3.5 text-primary-green" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <div class="mt-2">
            <p
              class="text-xl font-bold tabular-nums"
              :class="userSummary.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
            >
              {{ userSummary.gross_pnl > 0 ? '+' : '' }}${{ formatNum(userSummary.gross_pnl) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Raw Trading Profit</p>
          </div>
        </div>

        <!-- Total Fee -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Fee</span>
            <DollarSign class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">${{ formatNum(userSummary.total_fee) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Performance Fee</p>
          </div>
        </div>

        <!-- FM Net Fee -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">FM Net Fee</span>
            <PieChart class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">
              ${{ formatNum(userSummary.fm_net_after_agents ?? userSummary.fm_share ?? userSummary.fm_fee ?? 0) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">FM Share</p>
          </div>
        </div>

        <!-- Broker Net Fee -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Broker Net</span>
            <Building2 class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">
              ${{ formatNum(userSummary.broker_net ?? userSummary.broker_fee ?? 0) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Broker Net Share</p>
          </div>
        </div>

        <!-- IB Pool Distributed -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">IB Distributed</span>
            <GitBranch class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-green tabular-nums">
              ${{ formatNum(userSummary.ib_distributed ?? userSummary.ib_pool ?? 0) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Commission Pool</p>
          </div>
        </div>
      </div>

      <!-- Follower Sessions & Periods Breakdown -->
      <div class="space-y-6">

        <!-- Search Bar & Session Filter Pills -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-border pb-3">
          <!-- Follower Session Filter Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <span class="text-xs font-medium text-secondary-text shrink-0">Follower Session:</span>
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
              :class="
                selectedFollowerId === 'ALL'
                  ? 'bg-primary text-white'
                  : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
              "
              @click="selectedFollowerId = 'ALL'"
            >
              All ({{ followerList.length }})
            </button>
            <button
              v-for="follower in followerList"
              :key="follower.follower_id"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              :class="
                selectedFollowerId === String(follower.follower_id)
                  ? 'bg-primary text-white'
                  : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
              "
              @click="selectedFollowerId = String(follower.follower_id)"
            >
              <span class="font-mono font-semibold">#{{ follower.follower_id }}</span>
              <span class="text-[10px] opacity-80 font-mono">({{ follower.account_number }})</span>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <Search class="w-3.5 h-3.5 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search period, symbol, trade..."
              class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text placeholder:text-secondary-text outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <!-- Follower Session Cards -->
        <div
          v-for="follower in displayedFollowers"
          :key="follower.follower_id"
          class="border border-primary-border rounded-2xl overflow-hidden bg-card-background shadow-2xs space-y-4 p-4 sm:p-5"
        >
          <!-- Follower Session Header -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-primary-border pb-4">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-primary-text">
                  Follower Session #{{ follower.follower_id }}
                </span>
                <span class="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-background border border-primary-border text-primary-text">
                  Account: {{ follower.account_number }}
                </span>
                <span
                  v-if="follower.settlement_type"
                  class="text-[10px] uppercase font-bold px-2 py-0.5 rounded border text-secondary-text bg-background border-primary-border"
                >
                  Type: {{ follower.settlement_type }}
                </span>
              </div>
            </div>

            <!-- Follower Session Totals Bar -->
            <div class="flex items-center gap-3 bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs shrink-0 flex-wrap">
              <div>
                <span class="text-[9px] uppercase text-secondary-text block">Trades</span>
                <span class="font-bold text-primary-text font-mono">{{ getFollowerTradesCount(follower) }}</span>
              </div>
              <div class="h-6 w-px bg-primary-border" />
              <div>
                <span class="text-[9px] uppercase text-secondary-text block">Gross PnL</span>
                <span
                  class="font-bold font-mono"
                  :class="(follower.summary?.gross_pnl ?? 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ (follower.summary?.gross_pnl ?? 0) > 0 ? '+' : '' }}${{ formatNum(follower.summary?.gross_pnl ?? 0) }}
                </span>
              </div>
              <div class="h-6 w-px bg-primary-border" />
              <div>
                <span class="text-[9px] uppercase text-secondary-text block">Total Fee</span>
                <span class="font-bold text-primary-text font-mono">${{ formatNum(follower.summary?.total_fee ?? 0) }}</span>
              </div>
              <div class="h-6 w-px bg-primary-border" />
              <div>
                <span class="text-[9px] uppercase text-secondary-text block">Net PnL</span>
                <span
                  class="font-bold font-mono"
                  :class="getFollowerNetPnl(follower) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ getFollowerNetPnl(follower) > 0 ? '+' : '' }}${{ formatNum(getFollowerNetPnl(follower)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Periods Breakdown -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-primary-text uppercase tracking-wider">
                Settlement Periods ({{ follower.periods?.length ?? 0 }})
              </span>
            </div>

            <div
              v-for="period in getFilteredPeriods(follower.periods || [])"
              :key="period.period_key"
              class="border border-primary-border rounded-xl overflow-hidden bg-background/50"
            >
              <!-- Period Header Row (Accordion Clickable) -->
              <div
                class="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-background transition-colors"
                @click="togglePeriodExpand(follower.follower_id + '-' + period.period_key)"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    <Calendar class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-primary-text">
                        {{ formatPeriodDate(period.period_key) }}
                      </span>
                      <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text">
                        {{ period.period_key }}
                      </span>
                      <span
                        v-if="period.period_type"
                        class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text"
                      >
                        {{ period.period_type }}
                      </span>
                    </div>
                    <p class="text-[11px] text-secondary-text mt-0.5">
                      {{ period.trades_count ?? (period.trades ? period.trades.length : 0) }} Trades in this period
                    </p>
                  </div>
                </div>

                <!-- Period Summary Metrics -->
                <div class="flex items-center gap-4 text-xs shrink-0 flex-wrap justify-between md:justify-end">
                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block">Gross PnL</span>
                    <span
                      class="font-mono font-semibold"
                      :class="period.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                    >
                      {{ period.gross_pnl > 0 ? '+' : '' }}${{ formatNum(period.gross_pnl) }}
                    </span>
                  </div>

                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block">Fee</span>
                    <span class="font-mono font-semibold text-primary-text">${{ formatNum(period.fee) }}</span>
                  </div>

                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block">Net PnL</span>
                    <span
                      class="font-mono font-bold"
                      :class="period.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                    >
                      {{ period.net_pnl > 0 ? '+' : '' }}${{ formatNum(period.net_pnl) }}
                    </span>
                  </div>

                  <ChevronDown
                    class="w-4 h-4 text-secondary-text transition-transform duration-200"
                    :class="{
                      'rotate-180 text-primary':
                        expandedPeriodKey === (follower.follower_id + '-' + period.period_key),
                    }"
                  />
                </div>
              </div>

              <!-- Period Expanded Trades List -->
              <div
                v-if="expandedPeriodKey === (follower.follower_id + '-' + period.period_key)"
                class="p-4 border-t border-primary-border bg-card-background space-y-4"
              >
                <!-- Trades Table in this Period -->
                <div class="space-y-2">
                  <p class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                    Closed Trades ({{ period.trades ? period.trades.length : 0 }})
                  </p>
                  <div class="overflow-x-auto border border-primary-border rounded-xl">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="border-b border-primary-border bg-background/80 text-[10px] text-secondary-text uppercase">
                          <th class="text-left py-2 px-3 font-medium">Trade ID</th>
                          <th class="text-left py-2 px-3 font-medium">Symbol</th>
                          <th class="text-right py-2 px-3 font-medium">Fee</th>
                          <th class="text-right py-2 px-3 font-medium">Gross PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="t in (period.trades || [])"
                          :key="t.trade_id"
                          class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
                        >
                          <td class="py-2 px-3 font-mono font-semibold text-primary-text">#{{ t.trade_id }}</td>
                          <td class="py-2 px-3">
                            <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-background border border-primary-border text-primary-text">
                              {{ t.symbol }}
                            </span>
                          </td>
                          <td class="py-2 px-3 text-right font-mono text-primary-text">${{ formatNum(t.fee) }}</td>
                          <td
                            class="py-2 px-3 text-right font-mono font-semibold"
                            :class="t.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                          >
                            {{ t.gross_pnl > 0 ? '+' : '' }}${{ formatNum(t.gross_pnl) }}
                          </td>
                        </tr>

                        <tr v-if="!period.trades || period.trades.length === 0">
                          <td colspan="4" class="text-center py-4 text-xs text-secondary-text">
                            No trades recorded for this period.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="getFilteredPeriods(follower.periods || []).length === 0"
              class="text-center py-6 text-xs text-secondary-text"
            >
              No periods found matching search criteria.
            </div>
          </div>
        </div>

        <div
          v-if="displayedFollowers.length === 0"
          class="text-center py-12 text-xs text-secondary-text border border-primary-border rounded-2xl bg-card-background"
        >
          No follower sessions found matching filter.
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ReceiptText,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Building2,
  GitBranch,
  Activity,
  Calendar,
  ChevronDown,
  Search,
  RotateCw,
  Mail,
  Phone,
} from 'lucide-vue-next'
import { useSettlementUserStore } from '@/stores/settlements/settlementUser'

const route = useRoute()
const router = useRouter()
const store = useSettlementUserStore()

const searchQuery = ref('')
const selectedFollowerId = ref('ALL')
const expandedPeriodKey = ref(null)

const userData = computed(() => store.data?.user || null)

const userSummary = computed(() => {
  return userData.value?.summary || {}
})

const followerList = computed(() => {
  return userData.value?.followers || []
})

const displayedFollowers = computed(() => {
  if (selectedFollowerId.value === 'ALL') {
    return followerList.value
  }
  return followerList.value.filter(
    (f) => String(f.follower_id) === String(selectedFollowerId.value)
  )
})

const totalTradesCount = computed(() => {
  let count = 0
  followerList.value.forEach((f) => {
    count += f.summary?.trades_count ?? (f.trades ? f.trades.length : 0)
  })
  return count
})

const getFollowerTradesCount = (follower) => {
  if (follower.summary?.trades_count != null) return follower.summary.trades_count
  if (Array.isArray(follower.periods)) {
    return follower.periods.reduce((acc, p) => acc + (p.trades_count || 0), 0)
  }
  return follower.trades ? follower.trades.length : 0
}

const getFollowerNetPnl = (follower) => {
  return follower.summary?.net_pnl ?? follower.summary?.gross_pnl ?? 0
}

const getFilteredPeriods = (periods) => {
  if (!searchQuery.value.trim()) return periods
  const q = searchQuery.value.toLowerCase().trim()
  return periods.filter((p) => {
    const periodMatches =
      String(p.period_key || '').toLowerCase().includes(q) ||
      String(p.period_type || '').toLowerCase().includes(q)
    const tradeMatches = Array.isArray(p.trades)
      ? p.trades.some(
          (t) =>
            String(t.trade_id || '').includes(q) ||
            String(t.symbol || '').toLowerCase().includes(q)
        )
      : false
    return periodMatches || tradeMatches
  })
}

const togglePeriodExpand = (key) => {
  expandedPeriodKey.value = expandedPeriodKey.value === key ? null : key
}

const formatNum = (val) =>
  (Number(val) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatPeriodDate = (periodKey) => {
  if (!periodKey) return ''
  try {
    const d = new Date(periodKey)
    if (isNaN(d.getTime())) return periodKey
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (e) {
    return periodKey
  }
}

const statusClass = (s) =>
  ({
    completed: 'bg-primary-green/20 text-green-700 border-green-300 dark:bg-primary-green/10 dark:text-green-400 dark:border-green-500/20',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    failed: 'bg-primary-red/20 text-red-700 border-red-300 dark:bg-primary-red/10 dark:text-red-400 dark:border-red-500/20',
  }[String(s).toLowerCase()] ?? 'bg-background text-secondary-text border-primary-border')

const goBack = () => {
  router.push(`/settlement/details/${route.params.id}`)
}

const loadData = () => {
  store.fetchSettlementUser(route.params.id, route.params.userId)
}

onMounted(() => {
  loadData()
})
</script>
