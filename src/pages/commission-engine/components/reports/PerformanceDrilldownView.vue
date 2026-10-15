<template>
  <div class="space-y-6">
    <!-- ================================================================= -->
    <!-- 1. HEADER & NAVIGATION BAR                                        -->
    <!-- ================================================================= -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Period Badge -->
          <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white font-mono">
            {{ activePeriodLabel }}
          </span>

          <!-- Frequency Badge -->
          <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase bg-card-background text-secondary-text border border-primary-border">
            {{ (frequency || "daily").toUpperCase() }}
          </span>

          <!-- Selected IB Badge (When in ib_summary or client_trades) -->
          <span
            v-if="selectedIb"
            class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border"
          >
            IB: <strong class="text-primary-text font-semibold">{{ selectedIb.ib_name || `IB #${selectedIb.ib_id}` }}</strong> (ID: #{{ selectedIb.ib_id }})
          </span>

          <!-- Selected Client Badge (When in client_trades) -->
          <span
            v-if="selectedClient"
            class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border"
          >
            Client: <strong class="text-primary-text font-semibold">{{ selectedClient.name || `Client #${selectedClient.user_id}` }}</strong>
          </span>

          <!-- Wallet Target Badge -->
          <span
            v-if="effectiveWalletTarget && effectiveWalletTarget !== 'all'"
            class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono"
            :class="
              effectiveWalletTarget === 'demo'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            "
          >
            {{ effectiveWalletTarget === 'demo' ? 'Demo Wallet' : 'Main Wallet' }}
          </span>
        </div>

        <p class="text-xs text-secondary-text flex items-center gap-1.5">
          <Calendar :size="13" />
          <span v-if="currentLevel === 'ibs_list'">
            Main IB partner breakdown for this period. Click 'View' on any IB to inspect direct clients, sub-IB network, and trade line items.
          </span>
          <span v-else-if="currentLevel === 'ib_summary'">
            Drill-down breakdown into direct clients, sub-IB network, and trade line items for this partner.
          </span>
          <span v-else>
            Individual closed trades and deal attribution for this client.
          </span>
        </p>
      </div>

      <!-- Action & Sub-view Toggles -->
      <!-- LEVEL 1 (ibs_list): Refresh only -->
      <div v-if="currentLevel === 'ibs_list'" class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          :disabled="store.performanceEntriesLoading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer h-9"
          @click="loadDrilldownData(true)"
        >
          <RefreshCw :size="13" :class="{ 'animate-spin': store.performanceEntriesLoading }" />
          <span>Refresh</span>
        </button>
      </div>

      <!-- LEVEL 2 (ib_summary): Toggles (Direct Clients vs Sub-IBs vs Trades) -->
      <div v-else-if="currentLevel === 'ib_summary'" class="flex items-center gap-2.5 flex-wrap">
        <div class="flex items-center rounded-xl border border-primary-border bg-card-background overflow-hidden h-9 p-0.5">
          <button
            type="button"
            class="px-3 h-full text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            :class="
              activeTab === 'clients'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-secondary-text hover:text-primary-text hover:bg-background'
            "
            @click="switchTab('clients')"
          >
            Direct Clients ({{ store.performanceEntriesClients.length }})
          </button>
          <button
            type="button"
            class="px-3 h-full text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            :class="
              activeTab === 'sub_ibs'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-secondary-text hover:text-primary-text hover:bg-background'
            "
            @click="switchTab('sub_ibs')"
          >
            Sub-IB Network ({{ store.performanceEntriesSubIbs.length }})
          </button>
          <button
            type="button"
            class="px-3 h-full text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            :class="
              activeTab === 'trades'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-secondary-text hover:text-primary-text hover:bg-background'
            "
            @click="switchTab('trades')"
          >
            View Trades ({{ totalTradesCount }})
          </button>
        </div>

        <button
          type="button"
          :disabled="store.performanceEntriesLoading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer h-9"
          @click="loadIbDetailData(true)"
        >
          <RefreshCw :size="13" :class="{ 'animate-spin': store.performanceEntriesLoading }" />
          <span>Refresh</span>
        </button>
      </div>

      <!-- LEVEL 3 (client_trades): Back to IB Summary button -->
      <div v-else class="flex items-center gap-2.5">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors cursor-pointer h-9"
          @click="returnToIbSummary"
        >
          <ArrowLeft :size="14" />
          <span>Back to {{ selectedSubIb ? 'Sub-IB Network' : 'Direct Clients' }}</span>
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 2. SUMMARY KPI CARDS                                              -->
    <!-- ================================================================= -->
    <!-- Period Level KPI Cards (When currentLevel === 'ibs_list') -->
    <div v-if="currentLevel === 'ibs_list'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <!-- Skeleton Loading State for Period KPI Cards -->
      <template v-if="store.performanceEntriesLoading">
        <div
          v-for="n in 5"
          :key="`period-skeleton-${n}`"
          class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <div class="h-3 w-24 bg-background rounded" />
            <div class="h-4 w-4 bg-background rounded-full" />
          </div>
          <div class="h-7 w-32 bg-background rounded mt-2" />
          <div class="h-2.5 w-24 bg-background rounded mt-1" />
        </div>
      </template>

      <!-- KPI Cards with Real API Data -->
      <template v-else>
        <!-- Grand Total Commission -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Grand Total Commission</span>
            <DollarSign :size="16" class="text-primary-green" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-green tabular-nums">
              +{{ formatUSD(periodSummary?.grand_total) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Aggregated commission payout</p>
          </div>
        </div>

        <!-- Grand Total Lots -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Traded Volume</span>
            <BarChart3 :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ formatLots(periodSummary?.grand_total_lots) }} lots
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Traded volume in period</p>
          </div>
        </div>

        <!-- Eligible IBs Count -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Eligible Main IBs</span>
            <Users :size="16" class="text-primary" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ periodSummary?.ib_count ?? 0 }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Active partner accounts</p>
          </div>
        </div>

        <!-- Total Deals / Entries -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Deals / Entries</span>
            <Coins :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ (periodSummary?.entry_count || 0).toLocaleString() }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Individual trade commissions</p>
          </div>
        </div>

        <!-- Period Window -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Period Window</span>
            <Calendar :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-sm font-bold text-primary-text font-mono truncate">
              {{ periodSummary?.period_key || activePeriodLabel }}
            </p>
            <p class="text-[10px] text-secondary-text font-mono mt-0.5">
              {{ formatPeriodDate(periodSummary?.start) }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- IB Level KPI Cards (When currentLevel === 'ib_summary') -->
    <div v-else-if="currentLevel === 'ib_summary'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <!-- Skeleton Loading for Step 2 IB KPI Cards -->
      <template v-if="store.performanceEntriesLoading">
        <div
          v-for="n in 6"
          :key="`ib-skeleton-${n}`"
          class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2.5"
          :class="n === 1 ? 'lg:col-span-2' : ''"
        >
          <div class="flex items-center justify-between">
            <div class="h-3 w-20 bg-background rounded" />
            <div class="h-4 w-4 bg-background rounded-full" />
          </div>
          <div class="h-6 w-28 bg-background rounded mt-2" />
          <div class="h-2.5 w-16 bg-background rounded mt-1" />
        </div>
      </template>

      <!-- IB KPI Cards with Real Data -->
      <template v-else>
        <!-- Grand Total Commission -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between lg:col-span-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Grand Total Commission</span>
            <DollarSign :size="16" class="text-primary-green" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-green tabular-nums">
              +{{ formatUSD(grandTotalCommission) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              {{ formatLots(totalLots) }} lots &middot; {{ totalEntries }} entries in period
            </p>
          </div>
        </div>

        <!-- Direct Performance Commission -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Direct Clients</span>
            <Users :size="16" class="text-primary" />
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-primary-text tabular-nums">
              +{{ formatUSD(directCommission) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              {{ formatLots(directLots) }} lots &middot; {{ directEntries }} trades
            </p>
          </div>
        </div>

        <!-- From Sub-IBs -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">From Sub-IBs</span>
            <GitFork :size="16" class="text-primary-yellow" />
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-primary-yellow tabular-nums">
              +{{ formatUSD(subIbsCommission) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              {{ formatLots(subIbsLots) }} lots &middot; {{ subIbsEntries }} trades
            </p>
          </div>
        </div>

        <!-- Paid to Master -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Paid to Master</span>
            <TrendingUp :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-primary-text tabular-nums">
              {{ Number(paidToMaster) > 0 ? `-${formatUSD(paidToMaster)}` : "$0.00" }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Upline / Master IB share
            </p>
          </div>
        </div>

        <!-- Traded Volume -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Volume</span>
            <BarChart3 :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-lg font-bold text-primary-text tabular-nums">
              {{ formatLots(totalLots) }} lots
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Direct &amp; sub-IB aggregate
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- ================================================================= -->
    <!-- 3. STEP 1: MAIN IBS LIST VIEW (currentLevel === 'ibs_list')       -->
    <!-- ================================================================= -->
    <div v-if="currentLevel === 'ibs_list'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div class="flex items-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold">
            <Users :size="14" />
            <span>Main IB Partners</span>
            <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
              {{ filteredIbs.length }}
            </span>
          </div>
        </div>

        <div class="relative w-full sm:w-80">
          <input
            v-model="ibSearch"
            type="text"
            placeholder="Search IB by name, email, ID..."
            class="w-full h-9 pl-9 pr-8 text-xs rounded-xl border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors"
          />
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <button
            v-if="ibSearch"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
            @click="ibSearch = ''"
          >
            <X :size="13" />
          </button>
        </div>
      </div>

      <!-- Main IBs DataTable -->
      <DataTable
        :columns="ibTableColumns"
        :data="filteredIbs"
        :loading="store.performanceEntriesLoading"
        row-key="ib_id"
        table-key="performance-main-ibs-table"
        :per-page-options="[10, 20, 50, 100]"
        empty-title="No Main IBs Found"
        empty-text="There are no partner commission records found for this period."
      >
        <!-- Cell: ID -->
        <template #cell-id="{ row }">
          <span class="font-mono text-xs font-bold text-primary">
            #{{ row.ib_id }}
          </span>
        </template>

        <!-- Cell: IB Partner Details -->
        <template #cell-ib="{ row }">
          <div class="space-y-0.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-primary-text text-xs">
                {{ row.ib_name || `IB #${row.ib_id}` }}
              </span>
              <span class="text-[11px] font-mono text-secondary-text px-1.5 py-0.2 bg-background rounded border border-primary-border">
                IB ID: #{{ row.ib_id }}
              </span>
            </div>
            <p class="text-[11px] text-secondary-text font-mono truncate max-w-[240px]">
              {{ row.ib_email || "No email" }} &middot; User #{{ row.ib_user_id || "N/A" }}
            </p>
          </div>
        </template>

        <!-- Cell: Performance Commission (Direct Clients) -->
        <template #cell-performance_commission="{ row }">
          <div class="space-y-1 text-right font-mono">
            <span class="text-xs font-bold text-primary-green tabular-nums">
              +{{ formatUSD(row.performance_commission) }}
            </span>
            <div v-if="row.performance_lots != null || row.entry_count != null" class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
              <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                {{ formatLots(row.performance_lots ?? row.total_lots) }} lots
              </span>
              <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                {{ row.entry_count || 0 }} deals
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Commission from Sub-IBs -->
        <template #cell-commission_from_subibs="{ row }">
          <div class="space-y-1 text-right font-mono">
            <span
              class="text-xs font-bold tabular-nums"
              :class="Number(row.commission_from_subibs) > 0 ? 'text-primary' : 'text-secondary-text'"
            >
              +{{ formatUSD(row.commission_from_subibs) }}
            </span>
            <div v-if="row.lots_from_subibs != null || row.entry_count_from_subibs != null" class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
              <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                {{ formatLots(row.lots_from_subibs || 0) }} lots
              </span>
              <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                {{ row.entry_count_from_subibs || 0 }} entries
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Commission Paid to Master -->
        <template #cell-commission_paid_to_master="{ row }">
          <div class="space-y-1 text-right font-mono">
            <span class="text-xs font-bold text-secondary-text tabular-nums">
              {{ Number(row.commission_paid_to_master) > 0 ? `-${formatUSD(row.commission_paid_to_master)}` : "$0.00" }}
            </span>
            <div v-if="row.lots_paid_to_master != null" class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
              <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                {{ formatLots(row.lots_paid_to_master) }} lots
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Total Commission (Grand Total) -->
        <template #cell-total_commission="{ row }">
          <div class="space-y-0.5 text-right">
            <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
              +{{ formatUSD(row.grand_total_commission ?? row.total_commission) }}
            </span>
            <div v-if="row.by_currency && Object.keys(row.by_currency).length" class="flex flex-wrap items-center justify-end gap-1 font-mono text-[10px]">
              <span
                v-for="(amount, curr) in row.by_currency"
                :key="curr"
                class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text"
              >
                {{ curr }}: {{ formatUSD(amount) }}
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Total Lots -->
        <template #cell-total_lots="{ row }">
          <div class="space-y-0.5 text-right">
            <span class="font-mono text-xs font-bold text-primary-text tabular-nums">
              {{ formatLots(row.total_lots_all ?? row.total_lots) }} lots
            </span>
            <div v-if="row.lots_by_symbol && Object.keys(row.lots_by_symbol).length" class="flex flex-wrap items-center justify-end gap-1 font-mono text-[10px]">
              <span
                v-for="(lots, symbol) in row.lots_by_symbol"
                :key="symbol"
                class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text"
              >
                {{ symbol }}: {{ formatLots(lots) }}
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Entries Count -->
        <template #cell-entries="{ row }">
          <div class="space-y-1 text-right font-mono">
            <span class="text-xs font-bold text-primary-text tabular-nums">
              {{ row.entry_count_all ?? row.entry_count }} entries
            </span>
            <div class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
              <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                Dir: {{ row.entry_count || 0 }}
              </span>
              <span
                class="px-1.5 py-0.2 rounded bg-background border border-primary-border whitespace-nowrap"
                :class="(row.entry_count_from_subibs || 0) > 0 ? 'text-primary' : 'text-secondary-text'"
              >
                Sub: {{ row.entry_count_from_subibs || 0 }}
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Wallet Target -->
        <template #cell-wallet="{ row }">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider"
            :class="
              row.wallet_target === 'demo'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            "
          >
            {{ row.wallet_target === 'demo' ? 'Demo Wallet' : 'Main Wallet' }}
          </span>
        </template>

        <!-- Cell: Payout Mode -->
        <template #cell-mode="{ row }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
            :class="
              row.payout_mode === 'auto_settlement'
                ? 'bg-primary/10 text-primary border border-primary-border'
                : 'bg-card-background text-secondary-text border border-primary-border'
            "
          >
            {{ row.payout_mode === 'auto_settlement' ? 'Auto Settlement' : 'Require Approval' }}
          </span>
        </template>

        <!-- Cell: Action View Button -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
              title="View Partner Breakdown"
              @click="openIbDetail(row)"
            >
              <Eye :size="13" />
              <span>View</span>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- ================================================================= -->
    <!-- 4. STEP 2: IB DIRECT CLIENTS TAB (currentLevel === 'ib_summary')  -->
    <!-- ================================================================= -->
    <div v-else-if="currentLevel === 'ib_summary' && activeTab === 'clients'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div class="flex items-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold">
            <Users :size="14" />
            <span>Direct Clients</span>
            <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
              {{ filteredDirectClients.length }}
            </span>
          </div>
        </div>

        <div class="relative w-full sm:w-80">
          <input
            v-model="clientSearch"
            type="text"
            placeholder="Search client by name, email, user ID..."
            class="w-full h-9 pl-9 pr-8 text-xs rounded-xl border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors"
          />
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <button
            v-if="clientSearch"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
            @click="clientSearch = ''"
          >
            <X :size="13" />
          </button>
        </div>
      </div>

      <!-- Clients DataTable -->
      <DataTable
        :columns="clientTableColumns"
        :data="filteredDirectClients"
        :loading="store.performanceEntriesLoading"
        row-key="user_id"
        table-key="performance-direct-clients-table"
        empty-title="No Direct Clients Found"
        empty-text="There are no direct client trades recorded for this partner in this period."
      >
        <template #cell-client="{ row }">
          <div class="space-y-0.5">
            <p class="font-bold text-primary-text text-xs">
              {{ row.name || `Client #${row.user_id}` }}
            </p>
            <p class="text-[11px] text-secondary-text font-mono">
              <span
                v-if="row.email"
                class="cursor-pointer hover:underline text-primary"
                :title="`${row.email} (Ctrl+Click to open in new tab)`"
                @click="goToClient(row.email, $event)"
              >{{ row.email }}</span>
              <span v-else>User #{{ row.user_id }}</span>
              &middot; ID: #{{ row.user_id }}
            </p>
          </div>
        </template>

        <template #cell-logins="{ row }">
          <div class="flex flex-wrap items-center gap-1">
            <template v-if="row.logins && row.logins.length">
              <span
                v-for="login in row.logins"
                :key="login"
                class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text hover:border-primary cursor-pointer hover:underline"
                :title="`Trading Account ${login} (Ctrl+Click to open in new tab)`"
                @click="goToTradingAccount(login, $event)"
              >
                {{ login }}
              </span>
            </template>
            <span v-else class="text-secondary-text font-mono">-</span>
          </div>
        </template>

        <template #cell-entry_count="{ row }">
          <span class="font-mono text-primary-text font-semibold text-xs">
            {{ (row.entry_count || 0).toLocaleString() }}
          </span>
        </template>

        <template #cell-total_lots="{ row }">
          <span class="font-mono text-primary-text font-medium text-xs">
            {{ formatLots(row.total_lots) }} lots
          </span>
        </template>

        <template #cell-total_commission="{ row }">
          <span class="font-mono font-bold text-primary-green text-xs">
            +{{ formatUSD(row.total_commission) }}
          </span>
        </template>

        <template #cell-commission_paid_to_master="{ row }">
          <span class="font-mono text-xs" :class="Number(row.commission_paid_to_master) > 0 ? 'text-rose-500' : 'text-secondary-text'">
            {{ Number(row.commission_paid_to_master) > 0 ? `-${formatUSD(row.commission_paid_to_master)}` : "$0.00" }}
          </span>
        </template>

        <template #cell-action="{ row }">
          <div class="flex items-center justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
              title="View line items for this client"
              @click="drillIntoClientTrades(row, null)"
            >
              <span>View Trades</span>
              <ArrowLeft :size="12" class="rotate-180" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- ================================================================= -->
    <!-- 5. STEP 2: SUB-IB NETWORK TAB (currentLevel === 'ib_summary')     -->
    <!-- ================================================================= -->
    <div v-else-if="currentLevel === 'ib_summary' && activeTab === 'sub_ibs'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div class="flex items-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold">
            <GitFork :size="14" />
            <span>Sub-IB Network</span>
            <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
              {{ filteredSubIbs.length }}
            </span>
          </div>
        </div>

        <div class="relative w-full sm:w-80">
          <input
            v-model="subIbSearch"
            type="text"
            placeholder="Search Sub-IB by name, email, ID, client..."
            class="w-full h-9 pl-9 pr-8 text-xs rounded-xl border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors"
          />
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <button
            v-if="subIbSearch"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
            @click="subIbSearch = ''"
          >
            <X :size="13" />
          </button>
        </div>
      </div>

      <!-- Sub-IB Summary Overview -->
      <div
        v-if="store.performanceEntriesSubIbsSummary"
        class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card-background border border-primary-border rounded-xl p-3 text-xs"
      >
        <div>
          <span class="text-secondary-text text-[11px]">Total Sub-IBs</span>
          <p class="font-bold text-primary-text font-mono text-sm mt-0.5">
            {{ store.performanceEntriesSubIbsSummary.sub_ib_count || store.performanceEntriesSubIbs.length }}
          </p>
        </div>
        <div>
          <span class="text-secondary-text text-[11px]">Total Sub-IB Commission</span>
          <p class="font-bold text-primary font-mono text-sm mt-0.5">
            +{{ formatUSD(store.performanceEntriesSubIbsSummary.total_commission) }}
          </p>
        </div>
        <div>
          <span class="text-secondary-text text-[11px]">Total Sub-IB Lots</span>
          <p class="font-bold text-primary-text font-mono text-sm mt-0.5">
            {{ formatLots(store.performanceEntriesSubIbsSummary.total_lots) }} lots
          </p>
        </div>
        <div>
          <span class="text-secondary-text text-[11px]">Total Sub-IB Entries</span>
          <p class="font-bold text-primary-text font-mono text-sm mt-0.5">
            {{ store.performanceEntriesSubIbsSummary.entry_count || 0 }} trades
          </p>
        </div>
      </div>

      <!-- Sub-IB Empty State -->
      <div
        v-if="!filteredSubIbs.length && !store.performanceEntriesLoading"
        class="flex flex-col items-center justify-center p-12 rounded-2xl bg-card-background border border-primary-border text-center space-y-2"
      >
        <GitFork :size="24" class="text-secondary-text" />
        <h4 class="text-xs font-bold text-primary-text">No Sub-IBs Recorded</h4>
        <p class="text-xs text-secondary-text max-w-sm">
          No downline Sub-IB commissions recorded for this partner in this period.
        </p>
      </div>

      <!-- Sub-IB Cards -->
      <div v-else class="space-y-4">
        <div
          v-for="sub in filteredSubIbs"
          :key="sub.sub_ib_id"
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-primary-border">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-primary-text">
                  {{ sub.sub_ib_name || `Sub-IB #${sub.sub_ib_id}` }}
                </span>
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  SUB-IB ID: #{{ sub.sub_ib_id }}
                </span>
                <span v-if="sub.sub_ib_user_id" class="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                  USER ID: #{{ sub.sub_ib_user_id }}
                </span>
              </div>
              <p class="text-xs text-secondary-text font-mono">
                <span
                  v-if="sub.sub_ib_email"
                  class="cursor-pointer hover:underline text-primary"
                  :title="`${sub.sub_ib_email} (Ctrl+Click to open in new tab)`"
                  @click="goToClient(sub.sub_ib_email, $event)"
                >{{ sub.sub_ib_email }}</span>
                <span v-else>No email recorded</span>
              </p>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap">
              <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
                <span class="text-[10px] text-secondary-text block">Commission Earned</span>
                <strong class="text-primary font-bold">+{{ formatUSD(sub.total_commission) }}</strong>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
                <span class="text-[10px] text-secondary-text block">Volume Traded</span>
                <strong class="text-primary-text font-bold">{{ formatLots(sub.total_lots) }} lots</strong>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
                <span class="text-[10px] text-secondary-text block">Trades</span>
                <strong class="text-primary-text font-bold">{{ sub.entry_count }}</strong>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
                <span class="text-[10px] text-secondary-text block">Clients</span>
                <strong class="text-primary-text font-bold">{{ sub.client_count || sub.clients?.length || 0 }}</strong>
              </div>
            </div>
          </div>

          <!-- Nested Clients Table under Sub-IB -->
          <div class="space-y-2">
            <p class="text-xs font-semibold text-secondary-text flex items-center gap-1.5">
              <Users :size="13" />
              <span>Clients under {{ sub.sub_ib_name || `Sub-IB #${sub.sub_ib_id}` }} ({{ sub.clients?.length || 0 }})</span>
            </p>

            <div class="overflow-x-auto rounded-xl border border-primary-border">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-background/60 border-b border-primary-border text-secondary-text font-semibold uppercase text-[10px] font-mono">
                    <th class="p-3">Client</th>
                    <th class="p-3">Trading Accounts</th>
                    <th class="p-3 text-center">Trades</th>
                    <th class="p-3 text-right">Volume (Lots)</th>
                    <th class="p-3 text-right">Commission</th>
                    <th class="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-border/60">
                  <tr
                    v-for="subClient in (sub.clients || [])"
                    :key="subClient.user_id"
                    class="hover:bg-background/40 transition-colors"
                  >
                    <td class="p-3">
                      <p class="font-bold text-primary-text">
                        {{ subClient.name || `Client #${subClient.user_id}` }}
                      </p>
                      <p class="text-[11px] text-secondary-text font-mono">
                        User ID: #{{ subClient.user_id }}
                      </p>
                    </td>

                    <td class="p-3">
                      <div class="flex flex-wrap items-center gap-1">
                        <template v-if="subClient.logins && subClient.logins.length">
                          <span
                            v-for="login in subClient.logins"
                            :key="login"
                            class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text hover:border-primary cursor-pointer hover:underline"
                            :title="`Trading Account ${login} (Ctrl+Click to open in new tab)`"
                            @click="goToTradingAccount(login, $event)"
                          >
                            {{ login }}
                          </span>
                        </template>
                        <span v-else class="text-secondary-text font-mono">-</span>
                      </div>
                    </td>

                    <td class="p-3 text-center font-mono font-bold text-primary-text tabular-nums">
                      {{ subClient.entry_count }}
                    </td>

                    <td class="p-3 text-right font-mono font-semibold text-primary-text tabular-nums">
                      {{ formatLots(subClient.total_lots) }}
                    </td>

                    <td class="p-3 text-right font-mono font-bold text-primary-green tabular-nums">
                      +{{ formatUSD(subClient.total_commission) }}
                    </td>

                    <td class="p-3 text-right">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                        title="View trades for this client"
                        @click="drillIntoClientTrades(subClient, sub)"
                      >
                        <span>View Trades</span>
                        <ArrowLeft :size="12" class="rotate-180" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 6. STEP 3: TRADE LINE ITEMS TABLE (Client Trades or IB Trades)    -->
    <!-- ================================================================= -->
    <div v-else class="space-y-4">
      <!-- Active Client Banner (When drilling into a specific client) -->
      <div
        v-if="selectedClient"
        class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-bold text-primary-text">
              {{ selectedClient.name || `Client #${selectedClient.user_id}` }}
            </span>
            <span class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              USER ID: #{{ selectedClient.user_id }}
            </span>
            <span
              v-if="selectedSubIb"
              class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20"
            >
              Downline of {{ selectedSubIb.sub_ib_name || `Sub-IB #${selectedSubIb.sub_ib_id}` }}
            </span>
            <span
              v-else
              class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            >
              Direct Client
            </span>
          </div>
          <p class="text-xs text-secondary-text font-mono">
            <span
              v-if="selectedClient.email"
              class="cursor-pointer hover:underline text-primary"
              :title="`${selectedClient.email} (Ctrl+Click to open in new tab)`"
              @click="goToClient(selectedClient.email, $event)"
            >{{ selectedClient.email }}</span>
            <span v-else>No email</span>
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
            <span class="text-[10px] text-secondary-text block">Client Commission</span>
            <strong class="text-primary-green font-bold">+{{ formatUSD(selectedClient.total_commission) }}</strong>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
            <span class="text-[10px] text-secondary-text block">Client Lots</span>
            <strong class="text-primary-text font-bold">{{ formatLots(selectedClient.total_lots) }} lots</strong>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
            <span class="text-[10px] text-secondary-text block">Total Deals</span>
            <strong class="text-primary-text font-bold">{{ selectedClient.entry_count || store.performanceEntriesPagination.total }}</strong>
          </div>
        </div>
      </div>

      <!-- Trade Items Filter Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card-background border border-primary-border rounded-xl p-2.5">
        <div class="flex items-center gap-2 flex-wrap flex-1">
          <div class="relative w-full sm:w-72">
            <input
              v-model="tradeSearch"
              type="text"
              placeholder="Search by position ID, symbol, login..."
              class="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-primary-border bg-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors"
            />
            <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text" />
            <button
              v-if="tradeSearch"
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              @click="tradeSearch = ''"
            >
              <X :size="12" />
            </button>
          </div>
        </div>

        <div class="text-xs text-secondary-text font-mono">
          Showing <strong>{{ filteredTradeItems.length }}</strong> line items
        </div>
      </div>

      <!-- Trades DataTable -->
      <DataTable
        :columns="tradesTableColumns"
        :data="filteredTradeItems"
        :loading="store.performanceEntriesLoading"
        :pagination="store.performanceEntriesPagination"
        row-key="id"
        table-key="performance-trades-entries-table"
        empty-title="No Trade Entries Found"
        empty-text="There are no individual trade entries recorded for this selection."
        @page-change="handleTradePageChange"
        @per-page-change="handleTradePerPageChange"
      >
        <template #cell-id="{ row }">
          <span class="font-mono text-primary-text font-semibold text-xs">
            #{{ row.id }}
          </span>
        </template>

        <template #cell-position_id="{ row }">
          <span class="font-mono text-primary font-bold text-xs">
            #{{ row.trade?.position_id || row.trade_id || row.id }}
          </span>
        </template>

        <template #cell-login="{ row }">
          <span
            v-if="row.trade?.login || row.login"
            class="font-mono text-primary-text font-semibold text-xs px-2 py-0.5 rounded bg-background border border-primary-border hover:border-primary cursor-pointer hover:underline"
            :title="`Trading Account ${row.trade?.login || row.login} (Ctrl+Click to open in new tab)`"
            @click="goToTradingAccount(row.trade?.login || row.login, $event)"
          >
            {{ row.trade?.login || row.login }}
          </span>
          <span v-else class="font-mono text-secondary-text font-semibold text-xs">-</span>
        </template>

        <template #cell-symbol="{ row }">
          <span class="font-mono font-bold text-primary text-xs">
            {{ row.trade?.symbol || row.symbol || "-" }}
          </span>
        </template>

        <template #cell-lots="{ row }">
          <span class="font-mono text-primary-text font-medium text-xs">
            {{ formatLots(row.trade?.lots ?? row.lots) }}
          </span>
        </template>

        <template #cell-commission="{ row }">
          <span class="font-mono font-bold text-primary-green text-xs">
            +{{ formatUSD(row.total_commission ?? row.commission) }}
          </span>
        </template>

        <template #cell-attribution="{ row }">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase font-mono"
            :class="
              row.attribution === 'from_subibs'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            "
          >
            {{ row.attribution === 'from_subibs' ? 'From Sub-IB' : 'Direct Performance' }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status || 'approved'" />
        </template>

        <template #cell-close_price="{ row }">
          <span class="font-mono text-secondary-text text-xs">
            {{ row.trade?.close_price != null ? Number(row.trade.close_price) : "—" }}
          </span>
        </template>

        <template #cell-close_time="{ row }">
          <span class="font-mono text-secondary-text text-xs whitespace-nowrap">
            {{ formatTime(row.trade?.close_time || row.close_time) }}
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  Users,
  GitFork,
  Calendar,
  RefreshCw,
  Search,
  X,
  DollarSign,
  TrendingUp,
  BarChart3,
  Eye,
  Coins,
} from "lucide-vue-next";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import { goToTradingAccount, goToClient } from "@/composables/useNavigation";

const props = defineProps({
  periodRow: {
    type: Object,
    default: () => ({}),
  },
  frequency: {
    type: String,
    default: "daily",
  },
  dateFrom: {
    type: String,
    default: "",
  },
  dateTo: {
    type: String,
    default: "",
  },
  filterIbId: {
    type: [String, Number, null],
    default: null,
  },
  statusFilter: {
    type: String,
    default: "all",
  },
  walletTarget: {
    type: String,
    default: "all",
  },
});

const emit = defineEmits(["back"]);

const route = useRoute();
const router = useRouter();
const store = useCommissionEngineStore();

// ─── 3-Step Navigation Flow State ──────────────────────────────────────────
// 'ibs_list' (Step 1) | 'ib_summary' (Step 2) | 'client_trades' (Step 3)
const currentLevel = ref("ibs_list");

const selectedIb = ref(null);
const selectedClient = ref(null);
const selectedSubIb = ref(null);

// Active Step 2 summary tab: 'clients' | 'sub_ibs' | 'trades'
const activeTab = ref("clients");

// Search inputs
const ibSearch = ref("");
const clientSearch = ref("");
const subIbSearch = ref("");
const tradeSearch = ref("");

// ─── Period Label & Headers ──────────────────────────────────────────────────
const activePeriodLabel = computed(() => {
  const row = props.periodRow || {};
  return (
    row?.label ||
    row?.period_key ||
    (route.params.period ? decodeURIComponent(route.params.period) : "") ||
    props.dateFrom ||
    "Selected Period"
  );
});

const effectiveWalletTarget = computed(() => {
  if (selectedIb.value?.wallet_target) return selectedIb.value.wallet_target;
  return props.walletTarget;
});

// ─── Step 1: Period Summary (Exclusively from API Response) ───────────────────
const periodSummary = computed(() => {
  return store.performanceEntriesPeriodSummary || null;
});

// ─── Step 2: Metrics for Selected IB ─────────────────────────────────────────
const ibSummary = computed(() => store.performanceEntriesIbSummary || {});

const grandTotalCommission = computed(() => {
  return (
    ibSummary.value.grand_total_commission ??
    ibSummary.value.total_commission ??
    selectedIb.value?.grand_total_commission ??
    selectedIb.value?.total_commission ??
    0
  );
});

const directCommission = computed(() => {
  return (
    ibSummary.value.performance_commission ??
    selectedIb.value?.performance_commission ??
    0
  );
});

const directLots = computed(() => {
  return (
    ibSummary.value.performance_lots ??
    selectedIb.value?.performance_lots ??
    selectedIb.value?.total_lots ??
    0
  );
});

const directEntries = computed(() => {
  return (
    ibSummary.value.entry_count ??
    selectedIb.value?.entry_count ??
    0
  );
});

const subIbsCommission = computed(() => {
  return (
    ibSummary.value.commission_from_subibs ??
    selectedIb.value?.commission_from_subibs ??
    0
  );
});

const subIbsLots = computed(() => {
  return (
    ibSummary.value.lots_from_subibs ??
    selectedIb.value?.lots_from_subibs ??
    0
  );
});

const subIbsEntries = computed(() => {
  return (
    ibSummary.value.entry_count_from_subibs ??
    selectedIb.value?.entry_count_from_subibs ??
    0
  );
});

const paidToMaster = computed(() => {
  return (
    ibSummary.value.commission_paid_to_master ??
    selectedIb.value?.commission_paid_to_master ??
    0
  );
});

const totalLots = computed(() => {
  return (
    ibSummary.value.total_lots ??
    selectedIb.value?.total_lots_all ??
    selectedIb.value?.total_lots ??
    0
  );
});

const totalEntries = computed(() => {
  return (
    ibSummary.value.entry_count_all ??
    selectedIb.value?.entry_count_all ??
    selectedIb.value?.entry_count ??
    0
  );
});

const totalTradesCount = computed(() => {
  return totalEntries.value || store.performanceEntriesList.length;
});

// ─── Filtered Lists ──────────────────────────────────────────────────────────
const filteredIbs = computed(() => {
  const list = store.performanceEntriesIbs || [];
  const q = ibSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((ib) => {
    const name = String(ib.ib_name || "").toLowerCase();
    const email = String(ib.ib_email || "").toLowerCase();
    const id = String(ib.ib_id || "");
    const userId = String(ib.ib_user_id || "");
    return name.includes(q) || email.includes(q) || id.includes(q) || userId.includes(q);
  });
});

const filteredDirectClients = computed(() => {
  const list = store.performanceEntriesClients || [];
  const q = clientSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => {
    const name = String(c.name || "").toLowerCase();
    const email = String(c.email || "").toLowerCase();
    const id = String(c.user_id || "");
    const logins = Array.isArray(c.logins) ? c.logins.map(String).join(" ") : "";
    return name.includes(q) || email.includes(q) || id.includes(q) || logins.includes(q);
  });
});

const filteredSubIbs = computed(() => {
  const list = store.performanceEntriesSubIbs || [];
  const q = subIbSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((s) => {
    const name = String(s.sub_ib_name || "").toLowerCase();
    const email = String(s.sub_ib_email || "").toLowerCase();
    const id = String(s.sub_ib_id || "");
    const userId = String(s.sub_ib_user_id || "");
    const clientMatch =
      Array.isArray(s.clients) &&
      s.clients.some((c) => {
        return String(c.name || "").toLowerCase().includes(q) || String(c.user_id || "").includes(q);
      });
    return name.includes(q) || email.includes(q) || id.includes(q) || userId.includes(q) || clientMatch;
  });
});

const filteredTradeItems = computed(() => {
  const list = store.performanceEntriesList || [];
  const q = tradeSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((item) => {
    const id = String(item.id || "");
    const pos = String(item.trade?.position_id || item.trade_id || "");
    const sym = String(item.trade?.symbol || item.symbol || "").toLowerCase();
    const login = String(item.trade?.login || item.login || "");
    return id.includes(q) || pos.includes(q) || sym.includes(q) || login.includes(q);
  });
});

// ─── Table Columns ────────────────────────────────────────────────────────────
const ibTableColumns = [
  { key: "id", label: "ID", width: "90px" },
  { key: "ib", label: "IB Partner", width: "240px" },
  { key: "performance_commission", label: "Direct Comm.", align: "right", width: "150px" },
  { key: "commission_from_subibs", label: "From Sub-IBs", align: "right", width: "155px" },
  { key: "commission_paid_to_master", label: "Paid to Master", align: "right", width: "140px" },
  { key: "total_commission", label: "Total Commission", align: "right", width: "165px" },
  { key: "total_lots", label: "Total Lots", align: "right", width: "170px" },
  { key: "entries", label: "Entries", align: "right", width: "135px" },
  { key: "wallet", label: "Wallet Target", align: "center", width: "130px" },
  { key: "mode", label: "Payout Mode", align: "center", width: "140px" },
  { key: "actions", label: "Action", align: "right", width: "110px", sticky: "right" },
];

const clientTableColumns = [
  { key: "client", label: "Client Account", width: "240px" },
  { key: "logins", label: "Logins / MT5", width: "200px" },
  { key: "entry_count", label: "Deals", align: "center", width: "100px" },
  { key: "total_lots", label: "Volume (Lots)", align: "right", width: "140px" },
  { key: "total_commission", label: "Commission", align: "right", width: "150px" },
  { key: "commission_paid_to_master", label: "Paid to Master", align: "right", width: "130px" },
  { key: "action", label: "Action", align: "right", width: "130px", sticky: "right" },
];

const tradesTableColumns = [
  { key: "id", label: "Entry ID", width: "100px" },
  { key: "position_id", label: "Position", width: "140px" },
  { key: "login", label: "Account / Login", width: "130px" },
  { key: "symbol", label: "Symbol", width: "120px" },
  { key: "lots", label: "Lots", align: "right", width: "110px" },
  { key: "commission", label: "Commission", align: "right", width: "130px" },
  { key: "attribution", label: "Attribution", align: "center", width: "150px" },
  { key: "status", label: "Status", align: "center", width: "120px" },
  { key: "close_price", label: "Close Price", align: "right", width: "120px" },
  { key: "close_time", label: "Close Time", width: "170px" },
];

// ─── Format Helpers ───────────────────────────────────────────────────────────
const formatUSD = (num) => {
  if (num == null || num === "" || isNaN(Number(num))) return "$0.00";
  const n = Number(num);
  const isNegative = n < 0;
  const str = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 });
  return (isNegative ? "-$" : "$") + str;
};

const formatLots = (num) => {
  if (num == null || num === "" || isNaN(Number(num))) return "0.00";
  return Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? String(iso)
      : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(iso);
  }
};

const formatPeriodDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? String(iso)
      : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return String(iso);
  }
};

// ─── API Query Builder ────────────────────────────────────────────────────────
const buildQueryParams = (extra = {}) => {
  const row = props.periodRow || {};
  const periodParam = route.params.period ? decodeURIComponent(route.params.period) : undefined;
  const periodKey = periodParam || row?.period_key || row?.label || undefined;
  const frequency = props.frequency || store.performanceEntriesPeriodSummary?.frequency || "daily";

  const params = {
    frequency,
    period_key: periodKey,
    ib_id: props.filterIbId || undefined,
    status: props.statusFilter !== "all" ? props.statusFilter : undefined,
    wallet_target: props.walletTarget !== "all" ? props.walletTarget : undefined,
    ...extra,
  };
  return params;
};

// ─── Navigation & Data Fetching ──────────────────────────────────────────────
// Step 1: Load main IBs list for this period
const loadDrilldownData = async (force = false) => {
  const params = buildQueryParams();
  try {
    await store.fetchPerformanceEntries(params);
  } catch (err) {
    // Handled in store
  }
};

// Step 1 -> Step 2: Open specific IB details
const openIbDetail = (ib) => {
  selectedIb.value = ib;
  selectedClient.value = null;
  selectedSubIb.value = null;
  currentLevel.value = "ib_summary";
  activeTab.value = "clients";
  clientSearch.value = "";
  subIbSearch.value = "";
  tradeSearch.value = "";

  const period = route.params.period || props.periodRow?.period_key || "all";
  router.push(`/commission-engine/reports/details/${encodeURIComponent(period)}/ib/${ib.ib_id}`);
};

// Step 2: Load specific IB's breakdown (clients, sub_ibs, etc.)
const loadIbDetailData = async (force = false) => {
  const ibId = selectedIb.value?.ib_id || route.params.ibId;
  if (!ibId) return;
  const params = buildQueryParams({ ib_id: ibId });
  try {
    await store.fetchPerformanceEntries(params);
    if (selectedIb.value && store.performanceEntriesIbSummary?.ib_name) {
      selectedIb.value.ib_name = store.performanceEntriesIbSummary.ib_name;
    }
  } catch (err) {
    // Handled in store
  }
};

// Step 2 -> Step 1: Back to main IBs list
const backToIbList = () => {
  const period = route.params.period || props.periodRow?.period_key || "all";
  router.push(`/commission-engine/reports/details/${encodeURIComponent(period)}`);
};

// Step 2 tabs switch
const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === "trades") {
    selectedClient.value = null;
    selectedSubIb.value = null;
    store.fetchPerformanceEntries(
      buildQueryParams({
        ib_id: selectedIb.value?.ib_id || route.params.ibId,
        include_items: true,
        page: 1,
        per_page: 50,
      })
    );
  } else {
    selectedClient.value = null;
    selectedSubIb.value = null;
    loadIbDetailData(true);
  }
};

// Step 2 -> Step 3: Drill into closed trades for a client
const drillIntoClientTrades = (client, subIb = null) => {
  selectedClient.value = client;
  selectedSubIb.value = subIb;
  currentLevel.value = "client_trades";
  tradeSearch.value = "";

  const period = route.params.period || props.periodRow?.period_key || "all";
  const ibId = selectedIb.value?.ib_id || route.params.ibId;

  router.push(`/commission-engine/reports/details/${encodeURIComponent(period)}/ib/${ibId}/user/${client.user_id}`);
};

// Step 3 -> Step 2: Return from client trades to IB summary
const returnToIbSummary = () => {
  const period = route.params.period || props.periodRow?.period_key || "all";
  const ibId = selectedIb.value?.ib_id || route.params.ibId;
  router.push(`/commission-engine/reports/details/${encodeURIComponent(period)}/ib/${ibId}`);
};

// Trades pagination
const handleTradePageChange = (newPage) => {
  const pageVal = typeof newPage === "object" && newPage !== null ? newPage.page || 1 : newPage;
  const extra = {
    ib_id: selectedIb.value?.ib_id || route.params.ibId,
    user_id: selectedClient.value?.user_id || route.params.userId || undefined,
    sub_ib_id: selectedSubIb.value?.sub_ib_id || undefined,
    include_items: true,
    page: pageVal,
    per_page: store.performanceEntriesPagination.per_page || 50,
  };
  store.fetchPerformanceEntries(buildQueryParams(extra));
};

const handleTradePerPageChange = (newPerPage) => {
  const perPageVal = typeof newPerPage === "object" && newPerPage !== null ? newPerPage.per_page || 50 : newPerPage;
  const extra = {
    ib_id: selectedIb.value?.ib_id || route.params.ibId,
    user_id: selectedClient.value?.user_id || route.params.userId || undefined,
    sub_ib_id: selectedSubIb.value?.sub_ib_id || undefined,
    include_items: true,
    page: 1,
    per_page: perPageVal,
  };
  store.fetchPerformanceEntries(buildQueryParams(extra));
};

const handleBack = () => {
  emit("back");
};

// ─── Route Synchronization (Preserves State on Refresh & Navigation) ──────────
const syncFromRoute = () => {
  const period = route.params.period;
  const ibId = route.params.ibId;
  const userId = route.params.userId;

  if (userId && ibId && period) {
    currentLevel.value = "client_trades";
    if (!selectedIb.value || String(selectedIb.value.ib_id) !== String(ibId)) {
      const cachedIb = store.performanceEntriesIbs.find((i) => String(i.ib_id) === String(ibId));
      selectedIb.value = cachedIb || { ib_id: Number(ibId), ib_name: `IB #${ibId}` };
    }
    if (!selectedClient.value || String(selectedClient.value.user_id) !== String(userId)) {
      selectedClient.value = { user_id: Number(userId), name: `Client #${userId}` };
    }
    const extra = {
      ib_id: Number(ibId),
      user_id: Number(userId),
      include_items: true,
      page: 1,
      per_page: 50,
    };
    store.fetchPerformanceEntries(buildQueryParams(extra));
  } else if (ibId && period) {
    currentLevel.value = "ib_summary";
    selectedClient.value = null;
    selectedSubIb.value = null;
    if (!selectedIb.value || String(selectedIb.value.ib_id) !== String(ibId)) {
      const cached = store.performanceEntriesIbs.find((i) => String(i.ib_id) === String(ibId));
      selectedIb.value = cached || { ib_id: Number(ibId), ib_name: `IB #${ibId}` };
    }
    if (activeTab.value === "trades") {
      store.fetchPerformanceEntries(
        buildQueryParams({
          ib_id: Number(ibId),
          include_items: true,
          page: 1,
          per_page: 50,
        })
      );
    } else {
      loadIbDetailData(true);
    }
  } else if (period) {
    currentLevel.value = "ibs_list";
    selectedIb.value = null;
    selectedClient.value = null;
    selectedSubIb.value = null;
    loadDrilldownData(true);
  }
};

watch(
  () => [route.path, route.params.period, route.params.ibId, route.params.userId],
  () => {
    syncFromRoute();
  }
);

onMounted(() => {
  syncFromRoute();
});
</script>
