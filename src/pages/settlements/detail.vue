<template>
  <div class="px-4 pb-8 space-y-6">

    <!-- Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <span
            v-if="settlement?.settlement_id"
            class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white"
          >
            Settlement #{{ settlement.settlement_id }}
          </span>

          <span
            v-if="settlement?.fm_name"
            class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border"
          >
            FM: <strong class="text-primary-text font-semibold">{{ settlement.fm_name }}</strong> (ID: #{{ settlement.fm_id }})
          </span>

          <span
            v-if="settlement?.status"
            class="text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize"
            :class="statusClass(settlement.status)"
          >
            {{ settlement.status }}
          </span>

          <span
            v-if="settlement?.settlement_type"
            class="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase bg-card-background text-secondary-text border border-primary-border"
          >
            {{ settlement.settlement_type }}
          </span>

          <span
            v-if="settlement?.executed_at"
            class="text-xs text-secondary-text flex items-center gap-1"
          >
            <Clock class="w-3.5 h-3.5" />
            {{ formatDate(settlement.executed_at) }}
          </span>
        </div>

        <p v-if="periodDateRange" class="text-xs text-secondary-text mt-1.5 flex items-center gap-1">
          <Calendar class="w-3.5 h-3.5" />
          Period: {{ periodDateRange }}
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          :disabled="store.loading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer"
          @click="loadData"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
          Refresh
        </button>

        <button
          v-if="hasPermission('settlement.trades')"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-primary-text transition-colors cursor-pointer"
          @click="goToTrades"
        >
          <BarChart2 class="w-3.5 h-3.5 text-primary" />
          Flat Trades
        </button>
      </div>
    </div>

    <!-- Skeletons Loading State -->
    <div v-if="store.loading" class="space-y-6">
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

      <div class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-3">
        <div class="h-4 w-48 bg-background rounded" />
        <div v-for="n in 4" :key="n" class="h-10 bg-background rounded" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!settlement"
      class="flex flex-col items-center justify-center py-20 gap-4 bg-card-background border border-primary-border rounded-2xl"
    >
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center">
        <ReceiptText class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center max-w-sm px-4">
        <p class="text-sm font-semibold text-primary-text">Settlement Record Not Found</p>
        <p class="text-xs text-secondary-text mt-1">
          Unable to find details for settlement #{{ route.params.id }}.
        </p>
        <button
          class="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
          @click="router.push('/settlements')"
        >
          Return to Settlements
        </button>
      </div>
    </div>

    <template v-else>

      <!-- Key Metrics Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Total PnL -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total PnL</span>
            <TrendingUp v-if="summaryData.total_pnl >= 0" class="w-3.5 h-3.5 text-primary-green" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <div class="mt-2">
            <p
              class="text-xl font-bold tabular-nums"
              :class="summaryData.total_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
            >
              {{ summaryData.total_pnl > 0 ? '+' : '' }}${{ formatNum(summaryData.total_pnl) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5 truncate">{{ settlement.fm_name }}</p>
          </div>
        </div>

        <!-- Total Fee -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Fee</span>
            <DollarSign class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">${{ formatNum(summaryData.total_fee) }}</p>
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
            <p class="text-xl font-bold text-primary-text tabular-nums">${{ formatNum(summaryData.total_fm_net_after_agents) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Gross: ${{ formatNum(summaryData.total_fm_fee) }}</p>
          </div>
        </div>

        <!-- Broker Net Fee -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Broker Net</span>
            <Building2 class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">${{ formatNum(summaryData.total_broker_net) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Gross: ${{ formatNum(summaryData.total_broker_fee) }}</p>
          </div>
        </div>

        <!-- IB Pool Distributed -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">IB Distributed</span>
            <GitBranch class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-green tabular-nums">${{ formatNum(summaryData.total_ib_distributed) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Partner Commissions</p>
          </div>
        </div>

        <!-- Volume Stats -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Volume</span>
            <Users class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">{{ summaryData.total_trades }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              {{ summaryData.unique_users }} Client{{ summaryData.unique_users === 1 ? '' : 's' }} · {{ summaryData.unique_followers }} Follower{{ summaryData.unique_followers === 1 ? '' : 's' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Clients Summary Section Header & Search -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-primary-border pb-3">
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-bold text-primary-text">Client Settlements Breakdown</h2>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background text-secondary-text border border-primary-border">
            {{ usersList.length }} Clients
          </span>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-72">
          <Search class="w-3.5 h-3.5 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search client by name, email, ID..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text placeholder:text-secondary-text outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block border border-primary-border rounded-2xl overflow-hidden bg-card-background shadow-2xs">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-primary-border bg-background/50">
                <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Client</th>
                <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Followers</th>
                <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Trades</th>
                <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Gross PnL</th>
                <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Total Fee</th>
                <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Net PnL</th>
                <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3 w-28">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="u in filteredUsers"
                :key="u.user_id"
                class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors cursor-pointer"
                @click="goToUserDetails(u)"
              >
                <!-- Client Info -->
                <td class="p-3">
                  <p class="text-xs font-semibold text-primary-text">{{ u.user_name || 'Client' }}</p>
                  <p class="text-[11px] text-secondary-text font-mono">{{ u.user_email }}</p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-[10px] text-secondary-text font-mono">User ID: #{{ u.user_id }}</span>
                    <span v-if="u.phone_number" class="text-[10px] text-secondary-text">· {{ u.phone_number }}</span>
                  </div>
                </td>

                <!-- Followers Count -->
                <td class="p-3 text-center">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium bg-background border border-primary-border text-primary-text">
                    {{ u.followers_count ?? 1 }}
                  </span>
                </td>

                <!-- Trades Count -->
                <td class="p-3 text-center">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-background border border-primary-border text-primary-text">
                    {{ u.trades_count ?? 0 }}
                  </span>
                </td>

                <!-- Gross PnL -->
                <td class="p-3">
                  <span
                    class="text-xs font-semibold tabular-nums"
                    :class="u.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                  >
                    {{ u.gross_pnl > 0 ? '+' : '' }}${{ formatNum(u.gross_pnl) }}
                  </span>
                </td>

                <!-- Total Fee -->
                <td class="p-3">
                  <span class="text-xs font-medium text-primary-text tabular-nums">
                    ${{ formatNum(u.total_fee) }}
                  </span>
                </td>

                <!-- Net PnL -->
                <td class="p-3 text-right">
                  <span
                    class="text-xs font-bold tabular-nums"
                    :class="u.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                  >
                    {{ u.net_pnl > 0 ? '+' : '' }}${{ formatNum(u.net_pnl) }}
                  </span>
                </td>

                <!-- Action Button -->
                <td class="p-3 text-center" @click.stop>
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-medium transition-colors cursor-pointer"
                    @click="goToUserDetails(u)"
                  >
                    <span>Details</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>

              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="text-center py-12 text-xs text-secondary-text">
                  No clients found matching your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Client Cards -->
      <div class="lg:hidden space-y-3">
        <div
          v-for="u in filteredUsers"
          :key="u.user_id"
          class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3 shadow-2xs cursor-pointer hover:border-primary transition-colors"
          @click="goToUserDetails(u)"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold text-primary-text">{{ u.user_name || 'Client' }}</p>
              <p class="text-[11px] text-secondary-text font-mono">{{ u.user_email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] text-secondary-text font-mono">User ID: #{{ u.user_id }}</span>
                <span class="text-[10px] text-secondary-text font-mono">· {{ u.trades_count ?? 0 }} trades</span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-[10px] text-secondary-text">Net PnL</p>
              <span
                class="text-sm font-bold tabular-nums"
                :class="u.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
              >
                {{ u.net_pnl > 0 ? '+' : '' }}${{ formatNum(u.net_pnl) }}
              </span>
            </div>
          </div>

          <!-- Card Metrics Grid -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-background rounded-xl p-2.5">
              <p class="text-[10px] text-secondary-text">Gross PnL</p>
              <p class="font-semibold tabular-nums mt-0.5" :class="u.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
                {{ u.gross_pnl > 0 ? '+' : '' }}${{ formatNum(u.gross_pnl) }}
              </p>
            </div>

            <div class="bg-background rounded-xl p-2.5">
              <p class="text-[10px] text-secondary-text">Total Fee</p>
              <p class="font-semibold text-primary-text tabular-nums mt-0.5">${{ formatNum(u.total_fee) }}</p>
            </div>
          </div>

          <!-- Action Details Button -->
          <button
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer"
            @click.stop="goToUserDetails(u)"
          >
            <span>View Client Hierarchy & Trades</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ReceiptText,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Building2,
  GitBranch,
  ChevronRight,
  Search,
  RotateCw,
  Clock,
  Calendar,
  BarChart2,
} from 'lucide-vue-next'
import { useSettlementDetailStore } from '@/stores/settlements/settlementDetail'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const route = useRoute()
const router = useRouter()
const store = useSettlementDetailStore()
const { hasPermission } = usePermissionCheck()

const searchQuery = ref('')

const settlement = computed(() => store.settlement)

const summaryData = computed(() => {
  const s = settlement.value?.summary || {}
  return {
    total_pnl: s.total_pnl ?? 0,
    total_fee: s.total_fee ?? 0,
    total_trades: s.total_trades ?? 0,
    unique_followers: s.unique_followers ?? 0,
    unique_users: s.unique_users ?? (usersList.value.length || 0),
    total_fm_fee: s.total_fm_fee ?? 0,
    total_fm_net_after_agents: s.total_fm_net_after_agents ?? s.total_fm_fee ?? 0,
    total_broker_fee: s.total_broker_fee ?? 0,
    total_broker_net: s.total_broker_net ?? s.total_broker_fee ?? 0,
    total_ib_distributed: s.total_ib_distributed ?? 0,
    total_agent_distributed: s.total_agent_distributed ?? 0,
  }
})

const usersList = computed(() => settlement.value?.users_summary || [])

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return usersList.value
  const q = searchQuery.value.toLowerCase().trim()
  return usersList.value.filter((u) => {
    return (
      String(u.user_name || '').toLowerCase().includes(q) ||
      String(u.user_email || '').toLowerCase().includes(q) ||
      String(u.user_id || '').includes(q) ||
      String(u.phone_number || '').includes(q)
    )
  })
})

const periodDateRange = computed(() => {
  const start = settlement.value?.settlement_period_start
  const end = settlement.value?.settlement_period_end
  if (!start && !end) return null
  return `${formatDate(start)} – ${formatDate(end)}`
})

const formatNum = (val) =>
  (Number(val) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatDate = (val) => {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (e) {
    return String(val)
  }
}

const statusClass = (s) =>
  ({
    completed: 'bg-primary-green/20 text-green-700 border-green-300 dark:bg-primary-green/10 dark:text-green-400 dark:border-green-500/20',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    failed: 'bg-primary-red/20 text-red-700 border-red-300 dark:bg-primary-red/10 dark:text-red-400 dark:border-red-500/20',
  }[String(s).toLowerCase()] ?? 'bg-background text-secondary-text border-primary-border')

const goToUserDetails = (user) => {
  if (!user?.user_id) return
  router.push({
    name: 'settlement-user-depth',
    params: { id: route.params.id, userId: user.user_id },
  })
}

const goToTrades = () => {
  router.push(`/settlement/trade/${route.params.id}`)
}

const loadData = () => {
  store.fetchSettlementDetail(route.params.id)
}

onMounted(() => {
  loadData()
})
</script>
