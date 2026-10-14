<template>
  <div class="space-y-6">
    <!-- ================================================================= -->
    <!-- 1. HEADER & NAVIGATION BAR                                        -->
    <!-- ================================================================= -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
            @click="handleBack"
          >
            <ArrowLeft :size="14" />
            <span>Back to Performance</span>
          </button>

          <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white font-mono">
            {{ activePeriodLabel }}
          </span>

          <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase bg-card-background text-secondary-text border border-primary-border">
            {{ (frequency || "daily").toUpperCase() }}
          </span>

          <span
            v-if="selectedIbLabel"
            class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border"
          >
            IB: <strong class="text-primary-text font-semibold">{{ selectedIbLabel }}</strong>
          </span>

          <span
            v-if="walletTarget && walletTarget !== 'all'"
            class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono"
            :class="
              walletTarget === 'demo'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            "
          >
            {{ walletTarget === 'demo' ? 'Demo Wallet' : 'Main Wallet' }}
          </span>
        </div>

        <p class="text-xs text-secondary-text flex items-center gap-1.5">
          <Calendar :size="13" />
          <span>Drill-down breakdown into direct clients, sub-IB network, and trade line items for this period.</span>
        </p>
      </div>

      <!-- Actions & Sub-view Toggles (When in Summary View) -->
      <div v-if="currentLevel === 'summary'" class="flex items-center gap-2.5 flex-wrap">
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
          @click="loadDrilldownData(true)"
        >
          <RefreshCw :size="13" :class="{ 'animate-spin': store.performanceEntriesLoading }" />
          <span>Refresh</span>
        </button>
      </div>

      <!-- Back to Overview Button (When in Client Trades View) -->
      <div v-else class="flex items-center gap-2.5">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors cursor-pointer h-9"
          @click="returnToSummary"
        >
          <ArrowLeft :size="14" />
          <span>Back to {{ activeTab === 'sub_ibs' ? 'Sub-IB Network' : 'Direct Clients' }}</span>
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 2. IB SUMMARY CARD (Network Header Banner)                         -->
    <!-- ================================================================= -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
    </div>

    <!-- ================================================================= -->
    <!-- 3. LEVEL 1: DIRECT CLIENTS TAB                                    -->
    <!-- ================================================================= -->
    <div v-if="currentLevel === 'summary' && activeTab === 'clients'" class="space-y-4">
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
        empty-text="There are no direct client trades recorded for this period."
      >
        <template #cell-client="{ row }">
          <div class="space-y-0.5">
            <p class="font-bold text-primary-text text-xs">
              {{ row.name || `Client #${row.user_id}` }}
            </p>
            <p class="text-[11px] text-secondary-text font-mono">
              {{ row.email || `User #${row.user_id}` }} &middot; ID: #{{ row.user_id }}
            </p>
          </div>
        </template>

        <template #cell-logins="{ row }">
          <div class="flex flex-wrap items-center gap-1">
            <template v-if="row.logins && row.logins.length">
              <span
                v-for="login in row.logins"
                :key="login"
                class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text"
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
    <!-- 4. LEVEL 3: SUB-IB NETWORK TAB                                    -->
    <!-- ================================================================= -->
    <div v-else-if="currentLevel === 'summary' && activeTab === 'sub_ibs'" class="space-y-4">
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
          No downline Sub-IB commissions recorded for this period.
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
                {{ sub.sub_ib_email || "No email recorded" }}
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
                            class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text"
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
    <!-- 5. LEVEL 2 & 4: TRADE LINE ITEMS TABLE (Client Trades or All)      -->
    <!-- ================================================================= -->
    <div v-else class="space-y-4">
      <!-- Active Client / Scope Banner (Level 2 or 4) -->
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
            {{ selectedClient.email || "No email" }}
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
          <span class="font-mono text-primary-text font-semibold text-xs">
            {{ row.trade?.login || row.login || "-" }}
          </span>
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
import { ref, computed, onMounted } from "vue";
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
} from "lucide-vue-next";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";

const props = defineProps({
  periodRow: {
    type: Object,
    required: true,
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

const store = useCommissionEngineStore();

// ─── Local State ─────────────────────────────────────────────────────────────
// Levels: 'summary' (Level 1 / 3) | 'client_trades' (Level 2 / 4)
const currentLevel = ref("summary");
// Active summary tab: 'clients' | 'sub_ibs' | 'trades'
const activeTab = ref("clients");

const selectedClient = ref(null);
const selectedSubIb = ref(null);

const clientSearch = ref("");
const subIbSearch = ref("");
const tradeSearch = ref("");

// ─── Period Label & Headers ──────────────────────────────────────────────────
const activePeriodLabel = computed(() => {
  const row = props.periodRow;
  return row?.label || row?.period_key || props.dateFrom || "Selected Period";
});

const selectedIbLabel = computed(() => {
  if (props.filterIbId) return `Partner #${props.filterIbId}`;
  return null;
});

// ─── Metrics Computed from ib_summary ─────────────────────────────────────────
const ibSummary = computed(() => store.performanceEntriesIbSummary || {});

const grandTotalCommission = computed(() => {
  return ibSummary.value.grand_total_commission ?? ibSummary.value.total_commission ?? props.periodRow?.grand_total_commission ?? 0;
});

const directCommission = computed(() => {
  return ibSummary.value.performance_commission ?? props.periodRow?.performance_commission ?? 0;
});

const directLots = computed(() => {
  return ibSummary.value.performance_lots ?? props.periodRow?.performance_lots ?? 0;
});

const directEntries = computed(() => {
  return ibSummary.value.entry_count ?? props.periodRow?.entry_count ?? 0;
});

const subIbsCommission = computed(() => {
  return ibSummary.value.commission_from_subibs ?? props.periodRow?.commission_from_subibs ?? 0;
});

const subIbsLots = computed(() => {
  return ibSummary.value.lots_from_subibs ?? props.periodRow?.lots_from_subibs ?? 0;
});

const subIbsEntries = computed(() => {
  return ibSummary.value.entry_count_from_subibs ?? props.periodRow?.entry_count_from_subibs ?? 0;
});

const paidToMaster = computed(() => {
  return ibSummary.value.commission_paid_to_master ?? props.periodRow?.commission_paid_to_master ?? 0;
});

const totalLots = computed(() => {
  return ibSummary.value.total_lots ?? props.periodRow?.total_lots ?? 0;
});

const totalEntries = computed(() => {
  return ibSummary.value.entry_count_all ?? props.periodRow?.entry_count_all ?? 0;
});

const totalTradesCount = computed(() => {
  return totalEntries.value || store.performanceEntriesList.length;
});

// ─── Filtered Lists ──────────────────────────────────────────────────────────
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
    const clientMatch = Array.isArray(s.clients) && s.clients.some((c) => {
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
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(iso);
  }
};

// ─── API Query Builder ────────────────────────────────────────────────────────
const buildQueryParams = (extra = {}) => {
  const row = props.periodRow;
  const params = {
    frequency: props.frequency || "daily",
    period_key: row?.period_key || row?.label || undefined,
    date_from: props.dateFrom || (row?.start ? row.start.slice(0, 10) : undefined),
    date_to: props.dateTo || (row?.end ? row.end.slice(0, 10) : undefined),
    ib_id: props.filterIbId || undefined,
    status: props.statusFilter !== "all" ? props.statusFilter : undefined,
    wallet_target: props.walletTarget !== "all" ? props.walletTarget : undefined,
    ...extra,
  };
  return params;
};

// ─── Navigation & Data Fetching ──────────────────────────────────────────────
const loadDrilldownData = async (force = false) => {
  const params = buildQueryParams();
  try {
    await store.fetchPerformanceEntries(params);
  } catch (err) {
    // Handled in store
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === "trades") {
    // When switching to View Trades directly, load all line items
    currentLevel.value = "client_trades";
    selectedClient.value = null;
    selectedSubIb.value = null;
    store.fetchPerformanceEntries(buildQueryParams({ include_items: true, page: 1, per_page: 50 }));
  } else {
    currentLevel.value = "summary";
    selectedClient.value = null;
    selectedSubIb.value = null;
  }
};

const drillIntoClientTrades = (client, subIb = null) => {
  selectedClient.value = client;
  selectedSubIb.value = subIb;
  currentLevel.value = "client_trades";
  tradeSearch.value = "";

  const extra = {
    user_id: client.user_id,
    sub_ib_id: subIb ? subIb.sub_ib_id : undefined,
    include_items: true,
    page: 1,
    per_page: 50,
  };

  store.fetchPerformanceEntries(buildQueryParams(extra));
};

const returnToSummary = () => {
  currentLevel.value = "summary";
  selectedClient.value = null;
  selectedSubIb.value = null;
  loadDrilldownData(true);
};

const handleTradePageChange = (newPage) => {
  const pageVal = typeof newPage === "object" && newPage !== null ? newPage.page || 1 : newPage;
  const extra = {
    user_id: selectedClient.value?.user_id || undefined,
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
    user_id: selectedClient.value?.user_id || undefined,
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

onMounted(() => {
  loadDrilldownData(true);
});
</script>
