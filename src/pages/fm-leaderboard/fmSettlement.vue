<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-base font-semibold text-primary-text">Settlement Preview</h1>
        <p class="text-xs text-secondary-text mt-0.5">Review trades before running settlement</p>
      </div>
      <button
        v-if="!hasMessage"
        :disabled="store.runLoading || store.loading"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        @click="confirmOpen = true"
      >
        <Loader2 v-if="store.runLoading" class="w-3.5 h-3.5 animate-spin" />
        <PlayCircle v-else class="w-3.5 h-3.5" />
        Run Settlement
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!store.loading && hasMessage" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center">
        <ReceiptText class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-primary-text">No trades to settle</p>
        <p class="text-xs text-secondary-text mt-1">There are currently no pending trades available for settlement</p>
      </div>
    </div>

    <template v-else>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <template v-if="store.loading">
          <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
            <div class="h-3 w-20 bg-background rounded" />
            <div class="h-6 w-24 bg-background rounded" />
          </div>
        </template>
        <template v-else>
          <div class="bg-card-background border border-primary-border rounded-2xl p-4">
            <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total PnL</p>
            <p class="text-xl font-bold text-primary-green">${{ fmt(store.settlement?.total_pnl) }}</p>
          </div>
          <div class="bg-card-background border border-primary-border rounded-2xl p-4">
            <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Fee</p>
            <p class="text-xl font-bold text-primary-text">${{ fmt(store.settlement?.total_fee) }}</p>
          </div>
          <div class="bg-card-background border border-primary-border rounded-2xl p-4">
            <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Trades</p>
            <p class="text-xl font-bold text-primary-text">{{ store.settlement?.total_trades ?? 0 }}</p>
          </div>
          <div class="bg-card-background border border-primary-border rounded-2xl p-4">
            <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Fund Manager</p>
            <p class="text-sm font-bold text-primary-text truncate">{{ store.settlement?.fm_name ?? '—' }}</p>
          </div>
        </template>
      </div>

      <!-- ── Followers Table (desktop) ── -->
      <div class="hidden md:block border border-primary-border rounded-2xl overflow-hidden mb-5">
        <div class="flex items-center gap-2 px-5 py-3.5 border-b border-primary-border bg-card-background">
          <Users class="w-3.5 h-3.5 text-secondary-text" />
          <span class="text-xs font-semibold text-primary-text">Follower Trades</span>
          <span class="text-[11px] text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-full ml-1">
            {{ store.settlement?.followers?.length ?? 0 }}
          </span>
        </div>
        <table class="w-full border-collapse bg-card-background">
          <thead>
            <tr class="border-b border-primary-border">
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">User</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Symbol</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Gross PnL</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Fee</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">FM Fee</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Broker Fee</th>
              <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Net PnL</th>
            </tr>
          </thead>

          <tbody v-if="store.loading">
            <tr v-for="n in 3" :key="n" class="border-b border-primary-border animate-pulse">
              <td class="p-3"><div class="h-3 w-28 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-16 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-16 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3 flex justify-end"><div class="h-3 w-16 bg-background rounded" /></td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr
              v-for="f in store.settlement?.followers"
              :key="f.follower_id"
              class="border-b border-primary-border last:border-none hover:bg-background transition-colors"
            >
              <td class="p-3">
                <p class="text-xs font-medium text-primary-text">{{ f.user_name }}</p>
                <p class="text-[11px] text-secondary-text">ID {{ f.user_id }}</p>
              </td>
              <td class="p-3 text-xs font-medium text-primary-text">{{ f.symbol }}</td>
              <td class="p-3 text-xs text-primary-green tabular-nums">${{ fmt(f.gross_pnl) }}</td>
              <td class="p-3 text-xs text-primary-text tabular-nums">${{ fmt(f.fee) }}</td>
              <td class="p-3 text-xs text-primary-text tabular-nums">${{ fmt(f.fm_fee) }}</td>
              <td class="p-3 text-xs text-primary-text tabular-nums">${{ fmt(f.broker_fee) }}</td>
              <td class="p-3 text-right">
                <span class="text-xs font-semibold tabular-nums" :class="f.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
                  {{ f.net_pnl >= 0 ? '+' : '' }}${{ fmt(f.net_pnl) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── IB Distribution Table (desktop) ── -->
      <div class="hidden md:block border border-primary-border rounded-2xl overflow-hidden">
        <div class="flex items-center gap-2 px-5 py-3.5 border-b border-primary-border bg-card-background">
          <GitBranch class="w-3.5 h-3.5 text-secondary-text" />
          <span class="text-xs font-semibold text-primary-text">IB Distribution</span>
          <span class="text-[11px] text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-full ml-1">
            {{ store.settlement?.ib_distribution?.length ?? 0 }}
          </span>
        </div>
        <table class="w-full border-collapse bg-card-background">
          <thead>
            <tr class="border-b border-primary-border">
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB User ID</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB Name</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB email</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Trade ID</th>
              <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Commission</th>
            </tr>
          </thead>

          <tbody v-if="store.loading">
            <tr v-for="n in 3" :key="n" class="border-b border-primary-border animate-pulse">
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3 flex justify-end"><div class="h-3 w-16 bg-background rounded" /></td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr
              v-for="(ib, i) in store.settlement?.ib_distribution"
              :key="i"
              class="border-b border-primary-border last:border-none hover:bg-background transition-colors"
            >
              <td class="p-3 text-xs font-medium text-primary-text">#{{ ib.ib_user_id }}</td>
              <td class="p-3 text-xs font-medium text-primary-text">{{ ib.ib_name }}</td>
              <td class="p-3 text-xs font-medium text-primary-text">{{ ib.ib_email }}</td>
              <td class="p-3 text-xs text-secondary-text">#{{ ib.trade_id }}</td>
              <td class="p-3 text-right text-xs font-semibold text-primary-green tabular-nums">${{ fmt(ib.commission) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Mobile Cards ── -->
      <div class="md:hidden space-y-4">

        <!-- Follower Cards -->
        <div>
          <p class="text-xs font-semibold text-primary-text mb-2 flex items-center gap-2">
            <Users class="w-3.5 h-3.5 text-secondary-text" /> Follower Trades
          </p>

          <div v-if="store.loading" class="space-y-3 animate-pulse">
            <div v-for="n in 2" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3">
              <div class="h-3 w-32 bg-background rounded" />
              <div class="grid grid-cols-2 gap-2">
                <div v-for="m in 4" :key="m" class="h-10 bg-background rounded-xl" />
              </div>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="f in store.settlement?.followers"
              :key="f.follower_id"
              class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-primary-text">{{ f.user_name }}</p>
                  <p class="text-[11px] text-secondary-text">{{ f.symbol }} · Trade #{{ f.trade_id }}</p>
                </div>
                <span class="text-sm font-bold" :class="f.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
                  {{ f.net_pnl >= 0 ? '+' : '' }}${{ fmt(f.net_pnl) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-background rounded-xl px-3 py-2">
                  <p class="text-[10px] text-secondary-text mb-0.5">Gross PnL</p>
                  <p class="text-xs font-semibold text-primary-green">${{ fmt(f.gross_pnl) }}</p>
                </div>
                <div class="bg-background rounded-xl px-3 py-2">
                  <p class="text-[10px] text-secondary-text mb-0.5">Total Fee</p>
                  <p class="text-xs font-semibold text-primary-text">${{ fmt(f.fee) }}</p>
                </div>
                <div class="bg-background rounded-xl px-3 py-2">
                  <p class="text-[10px] text-secondary-text mb-0.5">FM Fee</p>
                  <p class="text-xs font-semibold text-primary-text">${{ fmt(f.fm_fee) }}</p>
                </div>
                <div class="bg-background rounded-xl px-3 py-2">
                  <p class="text-[10px] text-secondary-text mb-0.5">Broker Fee</p>
                  <p class="text-xs font-semibold text-primary-text">${{ fmt(f.broker_fee) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- IB Distribution Cards -->
        <div>
          <p class="text-xs font-semibold text-primary-text mb-2 flex items-center gap-2">
            <GitBranch class="w-3.5 h-3.5 text-secondary-text" /> IB Distribution
          </p>
          <div class="space-y-2">
            <div
              v-for="(ib, i) in store.settlement?.ib_distribution"
              :key="i"
              class="bg-card-background border border-primary-border rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p class="text-xs font-medium text-primary-text">IB #{{ ib.ib_user_id }}</p>
                <p class="text-[11px] text-secondary-text">Trade #{{ ib.trade_id }}</p>
              </div>
              <span class="text-xs font-bold text-primary-green">${{ fmt(ib.commission) }}</span>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- Confirm Dialog -->
    <RunSettlementConfirm
      :open="confirmOpen"
      :settlement="store.settlement"
      :run-loading="store.runLoading"
      @close="confirmOpen = false"
      @confirm="handleRun"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { PlayCircle, ReceiptText, Users, GitBranch, Loader2 } from 'lucide-vue-next'
import { useRunSettlementStore } from '@/stores/fmLeaderboard/runSettlement'
import RunSettlementConfirm from '@/components/fundManager/RunSettlementConfirm.vue'

const store = useRunSettlementStore()
const confirmOpen = ref(false)

const hasMessage = computed(() => !!store.settlement?.message)

const handleRun = async () => {
  await store.runSettlement()
  confirmOpen.value = false
}

const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(() => store.fetchSettlement())
</script>