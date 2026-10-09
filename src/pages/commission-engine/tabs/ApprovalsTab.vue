<template>
  <div class="space-y-6">
    <!-- ================================================================= -->
    <!-- STEP 1: Main Approvals List (currentView === 'list')               -->
    <!-- ================================================================= -->
    <div v-if="currentView === 'list'" class="space-y-6">
      <!-- Summary KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <template v-if="store.approvalsLoading && (!store.approvalsSummary || store.approvalsSummary.empty)">
          <div v-for="n in 5" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
            <div class="h-3 w-24 bg-background rounded" />
            <div class="h-6 w-32 bg-background rounded" />
          </div>
        </template>
        <template v-else>
          <!-- Grand Total Pending -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Grand Total Pending</span>
              <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary-green" />
            </div>
            <div class="mt-2">
              <p class="text-2xl font-bold text-primary-green tabular-nums">+${{ formatNum(store.approvalsSummary?.grand_total) }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Aggregated commission payout</p>
            </div>
          </div>

          <!-- Grand Total Lots -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Grand Total Lots</span>
              <HugeIcon :icon="Coins01Icon" :size="16" class="text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-2xl font-bold text-primary-text tabular-nums">{{ formatNum(store.approvalsSummary?.grand_total_lots ?? store.approvalsSummary?.total_lots) }} lots</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Traded volume in period</p>
            </div>
          </div>

          <!-- Total IBs with Pending -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">IBs with Pending</span>
              <HugeIcon :icon="UserGroupIcon" :size="16" class="text-primary" />
            </div>
            <div class="mt-2">
              <p class="text-2xl font-bold text-primary-text tabular-nums">{{ store.approvalsSummary?.ib_count ?? 0 }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Eligible partner accounts</p>
            </div>
          </div>

          <!-- Pending Entries -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Pending Entries</span>
              <HugeIcon :icon="Invoice01Icon" :size="16" class="text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-2xl font-bold text-primary-text tabular-nums">{{ store.approvalsSummary?.entry_count ?? 0 }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Individual trade commissions</p>
            </div>
          </div>

          <!-- Period Window -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Period Window</span>
              <HugeIcon :icon="Calendar01Icon" :size="16" class="text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-sm font-bold text-primary-text font-mono truncate">{{ activePeriodLabel }}</p>
              <p class="text-[10px] text-secondary-text font-mono mt-0.5">
                {{ formatShortDate(store.approvalsSummary?.start) }}
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card-background border border-primary-border rounded-xl p-2.5">
        <div class="flex items-center gap-2 flex-wrap flex-1">
          <!-- Frequency Toggle -->
          <div class="flex items-center rounded-lg border border-primary-border bg-card-background overflow-hidden h-9">
            <button
              v-for="freq in frequencies"
              :key="freq.value"
              type="button"
              :disabled="store.approvalsLoading || store.approvalPeriodsLoading"
              class="px-3 h-full text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              :class="activeFrequency === freq.value ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              @click="handleFrequencyChange(freq.value)"
            >
              {{ freq.label }}
            </button>
          </div>

          <!-- Period Selector -->
          <BaseSelect
            v-model="selectedPeriodKey"
            :options="periodSelectOptions"
            :is-loading="store.approvalPeriodsLoading"
            placeholder="Select period..."
            class="w-full sm:w-44"
            customClass="h-9"
            @update:model-value="handlePeriodChange"
          />

          <!-- Wallet Target Filter -->
          <BaseSelect
            v-model="filterWalletTarget"
            :options="walletTargetOptions"
            placeholder="All Wallets"
            class="w-32 sm:w-36"
            customClass="h-9"
            @update:model-value="handleFilterChange"
          />

          <!-- Payout Mode Filter -->
          <BaseSelect
            v-model="filterPayoutMode"
            :options="payoutModeOptions"
            placeholder="All Modes"
            class="w-36 sm:w-40"
            customClass="h-9"
            @update:model-value="handleFilterChange"
          />

          <!-- Filter by IB -->
          <BaseSelect
            v-model="filterIbId"
            :options="store.ibSearchOptions"
            :is-loading="store.searchLoading"
            placeholder="Filter by IB..."
            searchable
            clearable
            class="w-full sm:w-44"
            customClass="h-9"
            @search="onIbSearch"
            @update:model-value="handleFilterChange"
          />

          <!-- Reset Button -->
          <button
            v-if="hasActiveFilters"
            type="button"
            class="rounded-lg px-2.5 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-red transition-colors cursor-pointer flex items-center gap-1.5"
            @click="handleResetFilters"
          >
            <HugeIcon :icon="Cancel01Icon" :size="13" />
            <span>Reset Filter</span>
          </button>
        </div>

        <!-- Refresh Button -->
        <div class="flex items-center gap-2">
          <Tooltip text="Refresh" position="center">
            <button
              type="button"
              :disabled="store.approvalsLoading || store.approvalPeriodsLoading"
              class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer h-9 w-9"
              @click="loadApprovalsSummary(true)"
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="15"
                :class="{ 'animate-spin': store.approvalsLoading || store.approvalPeriodsLoading }"
              />
            </button>
          </Tooltip>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!store.approvalsLoading && (!store.approvalsSummary || store.approvalsSummary.empty || !store.approvalsSummary.items?.length)"
        class="flex flex-col items-center justify-center p-14 rounded-2xl bg-card-background border border-primary-border text-center min-h-[320px] space-y-4 shadow-2xs"
      >
        <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <HugeIcon :icon="CheckmarkCircle02Icon" :size="24" />
        </div>
        <div class="space-y-1.5 max-w-md">
          <h3 class="text-sm font-bold text-primary-text">
            {{ store.approvalsSummary?.empty_message || "No commission records requiring approval" }}
          </h3>
          <p class="text-xs text-secondary-text leading-relaxed">
            There are no pending commission entries for the <strong class="text-primary-text">{{ activePeriodLabel }}</strong> period under the <strong class="capitalize text-primary-text">{{ activeFrequency }}</strong> workflow.
          </p>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <router-link
            to="/commission-engine/commissions"
            class="btn-secondary"
          >
            <HugeIcon :icon="Coins01Icon" :size="14" />
            <span>View All Commissions</span>
          </router-link>
        </div>
      </div>

      <!-- IB-wise Pending Summary Table -->
      <div v-else class="space-y-4">
        <DataTable
          :columns="columns"
          :data="store.approvalsSummary.items"
          :loading="store.approvalsLoading"
          row-key="ib_id"
          table-key="commission-approvals-table"
          :per-page-options="[10, 20, 50, 100]"
          empty-title="No IB records found"
          empty-text="No IBs match the current filter criteria."
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
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-primary-text text-xs">
                  {{ row.ib_name || `IB #${row.ib_id}` }}
                </span>
                <span class="text-[11px] font-mono text-secondary-text px-1.5 py-0.2 bg-background rounded border border-primary-border">
                  FM ID: #{{ row.ib_id }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text font-mono truncate max-w-[220px]">
                {{ row.ib_email || "No email" }} &middot; User #{{ row.ib_user_id || "N/A" }}
              </p>
            </div>
          </template>

          <!-- Cell: Period / Executed -->
          <template #cell-period="{ row }">
            <div class="space-y-0.5 font-mono text-xs">
              <p class="text-primary-text font-semibold">{{ activePeriodLabel }}</p>
              <p class="text-[10px] text-secondary-text">
                {{ formatShortDate(store.approvalsSummary?.start) }} &ndash; {{ formatShortDate(store.approvalsSummary?.end) }}
              </p>
            </div>
          </template>

          <!-- Cell: Frequency Type -->
          <template #cell-frequency="{ row }">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-card-background border border-primary-border text-secondary-text">
              {{ activeFrequency }}
            </span>
          </template>

          <!-- Cell: Total Commission -->
          <template #cell-total="{ row }">
            <div class="space-y-0.5 text-right">
              <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
                +${{ formatNum(row.total_commission) }}
              </span>
              <div v-if="row.by_currency && Object.keys(row.by_currency).length" class="flex flex-wrap items-center justify-end gap-1 font-mono text-[10px]">
                <span
                  v-for="(amount, curr) in row.by_currency"
                  :key="curr"
                  class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text"
                >
                  {{ curr }}: ${{ formatNum(amount) }}
                </span>
              </div>
            </div>
          </template>

          <!-- Cell: Total Lots -->
          <template #cell-total_lots="{ row }">
            <div class="space-y-0.5 text-right">
              <span class="font-mono text-xs font-bold text-primary-text tabular-nums">
                {{ formatNum(row.total_lots) }} lots
              </span>
              <div v-if="row.lots_by_symbol && Object.keys(row.lots_by_symbol).length" class="flex flex-wrap items-center justify-end gap-1 font-mono text-[10px]">
                <span
                  v-for="(lots, symbol) in row.lots_by_symbol"
                  :key="symbol"
                  class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text"
                >
                  {{ symbol }}: {{ formatNum(lots) }}
                </span>
              </div>
            </div>
          </template>

          <!-- Cell: Entries Count -->
          <template #cell-entries="{ row }">
            <span class="inline-flex items-center px-2 py-0.5 rounded-lg bg-card-background border border-primary-border text-xs font-mono font-bold text-primary-text tabular-nums">
              {{ row.entry_count }}
            </span>
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

          <!-- Cell: Status -->
          <template #cell-status="{ row }">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Pending
            </span>
          </template>

          <!-- Cell: Actions -->
          <template #cell-actions="{ row }">
            <div class="flex items-center gap-2 justify-end">
              <!-- View Step 2 Details Button -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                title="View Settlement Details"
                @click="openIbDetail(row)"
              >
                <HugeIcon :icon="ViewIcon" :size="13" />
                <span>View</span>
              </button>

              <!-- Approve IB Button -->
              <button
                v-if="canApprove && row.can_approve !== false"
                type="button"
                :disabled="store.approveIbLoading"
                class="btn-success !px-2.5 !py-1.5 text-xs"
                title="Approve all pending commissions for this IB in this period"
                @click="openApproveConfirm(row)"
              >
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="13" />
                <span>Approve</span>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- STEP 2: IB Approval Details (currentView === 'ib_detail')           -->
    <!-- ================================================================= -->
    <div v-else-if="currentView === 'ib_detail'" class="space-y-6">
      <!-- Header & Navigation Bar (Back button rendered in TopBar) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white">
              Settlement #{{ selectedIb?.ib_id }}
            </span>

            <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border">
              FM: <strong class="text-primary-text font-semibold">{{ selectedIb?.ib_name || `IB #${selectedIb?.ib_id}` }}</strong> (ID: #{{ selectedIb?.ib_id }})
            </span>

            <span class="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 capitalize">
              Pending Approval
            </span>

            <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase bg-card-background text-secondary-text border border-primary-border">
              {{ activeFrequency }}
            </span>

            <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-card-background text-primary border border-primary-border uppercase">
              USD
            </span>

            <span
              class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono"
              :class="
                selectedIb?.wallet_target === 'demo'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              "
            >
              {{ selectedIb?.wallet_target === 'demo' ? 'Demo Wallet' : 'Main Wallet' }}
            </span>
          </div>

          <p class="text-xs text-secondary-text flex items-center gap-1.5">
            <HugeIcon :icon="Calendar01Icon" :size="13" />
            Period: <span class="font-medium text-primary-text">{{ activePeriodLabel }}</span>
            ({{ formatShortDate(store.approvalsSummary?.start) }} &ndash; {{ formatShortDate(store.approvalsSummary?.end) }})
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Sub-view toggle (Client Summaries vs Flat Trades) -->
          <div class="flex items-center rounded-lg border border-primary-border bg-card-background overflow-hidden h-9">
            <button
              type="button"
              class="px-3 h-full text-xs font-medium transition-colors cursor-pointer"
              :class="step2SubView === 'clients' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              @click="setStep2SubView('clients')"
            >
              Client Summaries ({{ store.approvalEntriesClients.length }})
            </button>
            <button
              type="button"
              class="px-3 h-full text-xs font-medium transition-colors cursor-pointer"
              :class="step2SubView === 'flat_trades' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              @click="setStep2SubView('flat_trades')"
            >
              View Trades ({{ ibTotalEntries }})
            </button>
          </div>

          <!-- Refresh Button -->
          <button
            type="button"
            :disabled="store.approvalEntriesLoading"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer h-9"
            @click="loadIbDetailData(true)"
          >
            <HugeIcon :icon="RefreshCwIcon" :size="14" :class="{ 'animate-spin': store.approvalEntriesLoading }" />
            <span>Refresh</span>
          </button>

          <!-- Approve Period Button -->
          <button
            v-if="canApprove && selectedIb?.can_approve !== false"
            type="button"
            :disabled="store.approveIbLoading"
            class="btn-success !px-3.5 !py-2 text-xs h-9"
            @click="openApproveConfirm(selectedIb)"
          >
            <HugeIcon :icon="CheckmarkCircle02Icon" :size="14" />
            <span>Approve IB Period</span>
          </button>
        </div>
      </div>

      <!-- Key Metrics Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <!-- Total Commission -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Commission</span>
            <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary-green" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-green tabular-nums">
              +${{ formatNum(ibTotalCommission) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5 truncate">
              {{ selectedIb?.ib_name }} (FM #{{ selectedIb?.ib_id }})
            </p>
          </div>
        </div>

        <!-- Total Lots -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Lots</span>
            <HugeIcon :icon="Coins01Icon" :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ formatNum(ibTotalLots) }} lots
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Traded volume across all clients</p>
          </div>
        </div>

        <!-- Total Clients -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Clients</span>
            <HugeIcon :icon="UserGroupIcon" :size="16" class="text-primary" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ store.approvalEntriesClients.length }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Benefitting client accounts</p>
          </div>
        </div>

        <!-- Total Entries -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Trades</span>
            <HugeIcon :icon="Invoice01Icon" :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ ibTotalEntries }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Individual trade commissions</p>
          </div>
        </div>
      </div>

      <!-- Sub-view 1: Client Summaries (view: "clients_summary") -->
      <template v-if="step2SubView === 'clients'">
        <!-- Client Summaries Header & Search -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs">
              <HugeIcon :icon="UserGroupIcon" :size="14" />
              <span>Client Summaries</span>
              <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
                {{ filteredClients.length }}
              </span>
            </div>
          </div>

          <!-- Search Client Filter -->
          <div class="relative w-full sm:w-80">
            <input
              v-model="clientSearchQuery"
              type="text"
              placeholder="Search client by name, email, ID, account..."
              class="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors"
            />
            <HugeIcon
              :icon="Search01Icon"
              :size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
            />
            <button
              v-if="clientSearchQuery"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              @click="clientSearchQuery = ''"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
            </button>
          </div>
        </div>

        <!-- Clients DataTable -->
        <DataTable
          :columns="clientColumns"
          :data="filteredClients"
          :loading="store.approvalEntriesLoading"
          row-key="user_id"
          table-key="ib-client-summaries-datatable"
          :per-page-options="[10, 20, 50, 100]"
          empty-title="No clients found"
          empty-text="There are no client records matching your search for this IB period."
        >
          <!-- Cell: Client Details -->
          <template #cell-client="{ row }">
            <div class="space-y-0.5">
              <p class="text-xs font-bold text-primary-text">
                {{ row.name || `Client #${row.user_id}` }}
              </p>
              <p class="text-[11px] text-secondary-text font-mono truncate max-w-[220px]">
                {{ row.email || 'No email' }}
              </p>
              <p class="text-[10px] text-secondary-text font-mono">
                User ID: #{{ row.user_id }}
              </p>
            </div>
          </template>

          <!-- Cell: Trading Accounts (Logins) -->
          <template #cell-accounts="{ row }">
            <div class="flex flex-wrap items-center gap-1.5">
              <template v-if="row.logins && row.logins.length">
                <span
                  v-for="login in row.logins"
                  :key="login"
                  class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text"
                >
                  {{ login }}
                </span>
              </template>
              <span v-else class="text-secondary-text text-xs font-mono">—</span>
              <span class="text-[10px] text-secondary-text font-mono px-1">
                {{ (row.logins?.length || 1) }} {{ (row.logins?.length || 1) === 1 ? 'Account' : 'Accounts' }}
              </span>
            </div>
          </template>

          <!-- Cell: Trades Count -->
          <template #cell-trades="{ row }">
            <span class="font-mono text-xs font-bold text-primary-text tabular-nums">
              {{ row.entry_count }}
            </span>
          </template>

          <!-- Cell: Total Lots Traded -->
          <template #cell-lots="{ row }">
            <div class="space-y-0.5 text-right font-mono">
              <p class="text-xs font-bold text-primary-text tabular-nums">
                {{ formatNum(row.total_lots) }} lots
              </p>
              <div v-if="row.lots_by_symbol && Object.keys(row.lots_by_symbol).length" class="flex flex-wrap items-center justify-end gap-1 text-[10px]">
                <span
                  v-for="(lots, sym) in row.lots_by_symbol"
                  :key="sym"
                  class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text"
                >
                  {{ sym }}: {{ formatNum(lots) }}
                </span>
              </div>
            </div>
          </template>

          <!-- Cell: Total Commission -->
          <template #cell-commission="{ row }">
            <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
              +${{ formatNum(row.total_commission) }}
            </span>
          </template>

          <!-- Cell: Action (Details > button) -->
          <template #cell-action="{ row }">
            <div class="flex items-center justify-end">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors cursor-pointer"
                title="View detailed closed trades for this client"
                @click="openClientBreakdown(row)"
              >
                <span>Details</span>
                <HugeIcon :icon="ArrowRight01Icon" :size="13" />
              </button>
            </div>
          </template>
        </DataTable>
      </template>

      <!-- Sub-view 2: Flat Trades (include_items: true) -->
      <template v-else-if="step2SubView === 'flat_trades'">
        <!-- Flat Trades Filter Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs">
              <HugeIcon :icon="Invoice01Icon" :size="14" />
              <span>All IB Flat Trades (include_items)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
                {{ store.approvalEntriesPagination?.total_items || store.approvalEntriesList.length }}
              </span>
            </div>
          </div>

          <!-- Trade Search Input -->
          <div class="relative w-full sm:w-72">
            <input
              v-model="tradeSearchQuery"
              type="text"
              placeholder="Search ticket, symbol, login..."
              class="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors font-mono"
              @input="onTradeSearchInput"
            />
            <HugeIcon
              :icon="Search01Icon"
              :size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
            />
            <button
              v-if="tradeSearchQuery"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              @click="clearTradeSearch"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
            </button>
          </div>
        </div>

        <!-- Flat Trades DataTable -->
        <DataTable
          :columns="tradeColumns"
          :data="filteredTradeList"
          :loading="store.approvalEntriesLoading"
          :pagination="store.approvalEntriesPagination"
          row-key="id"
          table-key="ib-flat-trades-datatable"
          :per-page-options="[10, 20, 50, 100]"
          empty-title="No flat trade entries found"
          empty-text="There are no closed trade line items for this IB in the selected period."
          @page-change="handleTradePageChange"
          @per-page-change="handleTradePerPageChange"
        >
          <!-- Cell: Ticket / Position ID -->
          <template #cell-position_id="{ row }">
            <span class="font-mono text-primary-text font-bold text-xs">
              #{{ row.trade?.position_id || row.id }}
            </span>
          </template>

          <!-- Cell: Login / Account -->
          <template #cell-login="{ row }">
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text">
              {{ row.trade?.login || row.login || '—' }}
            </span>
          </template>

          <!-- Cell: Symbol -->
          <template #cell-symbol="{ row }">
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary-border text-primary"
            >
              {{ row.trade?.symbol || row.symbol || '—' }}
            </span>
          </template>

          <!-- Cell: Lots Traded -->
          <template #cell-lots="{ row }">
            <span class="font-mono text-xs font-semibold text-primary-text tabular-nums">
              {{ row.trade?.lots ?? row.closed_volume_lots ?? row.lots ?? '—' }} lots
            </span>
          </template>

          <!-- Cell: Commission Earned -->
          <template #cell-commission="{ row }">
            <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
              +${{ formatNum(row.total_commission) }}
            </span>
          </template>

          <!-- Cell: Open Time -->
          <template #cell-open_time="{ row }">
            <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
              {{ formatDate(row.trade?.open_time) }}
            </span>
          </template>

          <!-- Cell: Close Time -->
          <template #cell-close_time="{ row }">
            <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
              {{ formatDate(row.trade?.close_time) }}
            </span>
          </template>

          <!-- Cell: Created At -->
          <template #cell-created_at="{ row }">
            <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
              {{ formatDate(row.created_at) }}
            </span>
          </template>
        </DataTable>
      </template>
    </div>

    <!-- ================================================================= -->
    <!-- STEP 3: Client Commission Breakdown (currentView === 'client_detail') -->
    <!-- ================================================================= -->
    <div v-else-if="currentView === 'client_detail'" class="space-y-6">
      <!-- Header & Navigation Bar (Back button rendered in TopBar) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white">
              Settlement #{{ selectedIb?.ib_id }}
            </span>

            <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border">
              FM: <strong class="text-primary-text font-semibold">{{ selectedIb?.ib_name || `IB #${selectedIb?.ib_id}` }}</strong> (FM #{{ selectedIb?.ib_id }})
            </span>

            <span class="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 capitalize">
              Pending Approval
            </span>

            <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-card-background text-primary border border-primary-border uppercase">
              USD
            </span>
          </div>

          <p class="text-xs text-secondary-text flex items-center gap-1.5">
            <HugeIcon :icon="Calendar01Icon" :size="13" />
            Period: <span class="font-medium text-primary-text">{{ activePeriodLabel }}</span>
            &middot; Client: <strong class="text-primary-text">{{ selectedClient?.name }}</strong> (User #{{ selectedClient?.user_id }})
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            :disabled="store.approvalEntriesLoading"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer"
            @click="loadClientTradesData(true)"
          >
            <HugeIcon :icon="RefreshCwIcon" :size="14" :class="{ 'animate-spin': store.approvalEntriesLoading }" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Client Profile Hero Card -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-base flex items-center justify-center shrink-0">
              {{ (selectedClient?.name || "C")[0].toUpperCase() }}
            </div>
            <div class="min-w-0 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-primary-text truncate">
                  {{ selectedClient?.name || `Client #${selectedClient?.user_id}` }}
                </h2>
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border text-secondary-text bg-background border-primary-border">
                  USER ID: #{{ selectedClient?.user_id }}
                </span>
              </div>
              <p class="text-xs text-secondary-text font-mono flex items-center gap-2">
                <span>{{ selectedClient?.email || 'No email' }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border flex items-center gap-2 text-xs font-mono">
              <span class="text-secondary-text">Accounts:</span>
              <strong class="text-primary-text">{{ selectedClient?.logins?.length || 1 }}</strong>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border flex items-center gap-2 text-xs font-mono">
              <span class="text-secondary-text">Total Trades:</span>
              <strong class="text-primary-text">{{ selectedClient?.entry_count || clientTradeCount }}</strong>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border flex items-center gap-2 text-xs font-mono">
              <span class="text-secondary-text">Total Lots:</span>
              <strong class="text-primary-text">{{ formatNum(selectedClient?.total_lots) }} lots</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards for Client -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <!-- Net Commission -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Commission Earned</span>
            <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary-green" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-green tabular-nums">
              +${{ formatNum(selectedClient?.total_commission ?? store.approvalEntriesSummary?.total_commission) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Calculated partner payout</p>
          </div>
        </div>

        <!-- Traded Volume -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Volume (Lots)</span>
            <HugeIcon :icon="Coins01Icon" :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ formatNum(selectedClient?.total_lots ?? store.approvalEntriesSummary?.total_lots) }} lots
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Closed trade lot volume</p>
          </div>
        </div>

        <!-- Total Trades -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Trades</span>
            <HugeIcon :icon="Invoice01Icon" :size="16" class="text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">
              {{ selectedClient?.entry_count ?? store.approvalEntriesPagination?.total_items ?? store.approvalEntriesList.length }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Line-item trade records</p>
          </div>
        </div>

        <!-- Avg Commission per Lot -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Avg Commission / Lot</span>
            <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary font-mono tabular-nums">
              ${{ avgCommPerLot }} / lot
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">Effective yield per traded lot</p>
          </div>
        </div>
      </div>

      <!-- Account Filter Tabs & Search Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <!-- Account Filter Tabs -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            :class="!selectedLoginFilter ? 'bg-primary text-white' : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background'"
            @click="handleLoginFilterChange('')"
          >
            All ({{ selectedClient?.entry_count || store.approvalEntriesList.length }})
          </button>
          <button
            v-for="login in (selectedClient?.logins || [])"
            :key="login"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
            :class="String(selectedLoginFilter) === String(login) ? 'bg-primary text-white' : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background'"
            @click="handleLoginFilterChange(login)"
          >
            #{{ login }}
          </button>
        </div>

        <!-- Trade Search Input -->
        <div class="relative w-full sm:w-72">
          <input
            v-model="tradeSearchQuery"
            type="text"
            placeholder="Search ticket, symbol, login..."
            class="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors font-mono"
            @input="onTradeSearchInput"
          />
          <HugeIcon
            :icon="Search01Icon"
            :size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
          />
          <button
            v-if="tradeSearchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
            @click="clearTradeSearch"
          >
            <HugeIcon :icon="Cancel01Icon" :size="13" />
          </button>
        </div>
      </div>

      <!-- Closed Trades Line Items Table -->
      <DataTable
        :columns="tradeColumns"
        :data="filteredTradeList"
        :loading="store.approvalEntriesLoading"
        :pagination="store.approvalEntriesPagination"
        row-key="id"
        table-key="client-approval-trades-datatable"
        :per-page-options="[10, 20, 50, 100]"
        empty-title="No trade line items found"
        empty-text="There are no closed trade entries recorded for this client in the selected period."
        @page-change="handleTradePageChange"
        @per-page-change="handleTradePerPageChange"
      >
        <!-- Cell: Ticket / Position ID -->
        <template #cell-position_id="{ row }">
          <span class="font-mono text-primary-text font-bold text-xs">
            #{{ row.trade?.position_id || row.id }}
          </span>
        </template>

        <!-- Cell: Login / Account -->
        <template #cell-login="{ row }">
          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-background border border-primary-border text-primary-text">
            {{ row.trade?.login || row.login || '—' }}
          </span>
        </template>

        <!-- Cell: Symbol -->
        <template #cell-symbol="{ row }">
          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            {{ row.trade?.symbol || row.symbol || '—' }}
          </span>
        </template>

        <!-- Cell: Lots Traded -->
        <template #cell-lots="{ row }">
          <span class="font-mono text-xs font-semibold text-primary-text tabular-nums">
            {{ row.trade?.lots ?? row.closed_volume_lots ?? row.lots ?? '—' }} lots
          </span>
        </template>

        <!-- Cell: Commission Earned -->
        <template #cell-commission="{ row }">
          <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
            +${{ formatNum(row.total_commission) }}
          </span>
        </template>

        <!-- Cell: Open Time -->
        <template #cell-open_time="{ row }">
          <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
            {{ formatDate(row.trade?.open_time) }}
          </span>
        </template>

        <!-- Cell: Close Time -->
        <template #cell-close_time="{ row }">
          <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
            {{ formatDate(row.trade?.close_time) }}
          </span>
        </template>

        <!-- Cell: Created At -->
        <template #cell-created_at="{ row }">
          <span class="text-[11px] text-secondary-text whitespace-nowrap font-mono">
            {{ formatDate(row.created_at) }}
          </span>
        </template>
      </DataTable>
    </div>

    <!-- Approve Confirmation Dialog -->
    <ConfirmationDialog
      :open="isApproveConfirmOpen"
      :title="`Approve IB #${ibToApprove?.ib_id} Commissions?`"
      :message="approveConfirmMessage"
      confirm-text="Approve & Credit Wallet"
      type="warning"
      :loading="store.approveIbLoading"
      @confirm="handleConfirmApprove"
      @cancel="isApproveConfirmOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Coins01Icon,
  RefreshCwIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
  Invoice01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
  Search01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";

const route = useRoute();
const router = useRouter();

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();
const canApprove = computed(() =>
  hasPermission([
    "ib_commission_approvals.approve",
    "ib_commission.approvals.approve",
    "ib_commission_settlements.approve",
    "ib_commission.settlements.approve",
    "ib_commission.approve",
  ])
);

// ─── 3-Step Navigation Flow State ───────────────────────
// 'list' (Step 1) | 'ib_detail' (Step 2) | 'client_detail' (Step 3)
const currentView = ref("list");
const selectedIb = ref(null);
const selectedClient = ref(null);

// ─── Step 1: Main Approvals Filters & State ─────────────
const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const activeFrequency = ref("daily");
const selectedPeriodKey = ref("");

const filterWalletTarget = ref("");
const filterPayoutMode = ref("");
const filterIbId = ref(null);

const walletTargetOptions = [
  { label: "All Wallets", value: "" },
  { label: "Main Wallet", value: "main" },
  { label: "Demo Wallet", value: "demo" },
];

const payoutModeOptions = [
  { label: "All Modes", value: "" },
  { label: "Require Approval", value: "require_approval" },
  { label: "Auto Settlement", value: "auto_settlement" },
];

const hasActiveFilters = computed(() => {
  return !!filterWalletTarget.value || !!filterPayoutMode.value || !!filterIbId.value;
});

// Table columns for Step 1
const columns = [
  { key: "id", label: "ID", width: "90px" },
  { key: "ib", label: "FM Details", width: "220px" },
  { key: "period", label: "Executed / Period", width: "190px" },
  { key: "frequency", label: "Type", align: "center", width: "100px" },
  { key: "total", label: "Total Commission", align: "right", width: "160px" },
  { key: "total_lots", label: "Total Lots", align: "right", width: "170px" },
  { key: "entries", label: "Entries", align: "center", width: "100px" },
  { key: "wallet", label: "Wallet Target", align: "center", width: "130px" },
  { key: "mode", label: "Payout Mode", align: "center", width: "140px" },
  { key: "status", label: "Status", align: "center", width: "110px" },
  { key: "actions", label: "Actions", align: "right", width: "180px", sticky: "right" },
];

const periodSelectOptions = computed(() => {
  const options = store.approvalPeriods?.options || [];
  return options.map((opt) => ({
    label: opt.label || opt.period_key,
    value: opt.period_key,
    start: opt.start,
    end: opt.end,
  }));
});

const activePeriodLabel = computed(() => {
  const match = periodSelectOptions.value.find((o) => o.value === selectedPeriodKey.value);
  return match?.label || selectedPeriodKey.value || "Selected Period";
});

// ─── Step 2: IB Detail & Client Summaries State ─────────
const step2SubView = ref("clients"); // 'clients' (view: 'clients_summary') | 'flat_trades' (include_items: true)
const clientSearchQuery = ref("");

const setStep2SubView = (sub) => {
  step2SubView.value = sub;
  if (sub === "flat_trades") {
    tradeSearchQuery.value = "";
    tradePage.value = 1;
    loadIbFlatTradesData(true);
  } else {
    clientSearchQuery.value = "";
    loadIbDetailData(true);
  }
};

const clientColumns = [
  { key: "client", label: "Client", width: "240px" },
  { key: "accounts", label: "Accounts", width: "220px" },
  { key: "trades", label: "Trades", align: "center", width: "110px" },
  { key: "lots", label: "Total Lots", align: "right", width: "180px" },
  { key: "commission", label: "Total Commission", align: "right", width: "160px" },
  { key: "action", label: "Action", align: "right", width: "120px", sticky: "right" },
];

const filteredClients = computed(() => {
  const list = store.approvalEntriesClients || [];
  const q = (clientSearchQuery.value || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => {
    const name = String(c.name || "").toLowerCase();
    const email = String(c.email || "").toLowerCase();
    const userId = String(c.user_id || "");
    const logins = Array.isArray(c.logins) ? c.logins.map(String).join(" ") : "";
    return name.includes(q) || email.includes(q) || userId.includes(q) || logins.includes(q);
  });
});

const ibTotalCommission = computed(() => {
  if (store.approvalEntriesSummary?.total_commission != null) {
    return store.approvalEntriesSummary.total_commission;
  }
  return selectedIb.value?.total_commission ?? 0;
});

const ibTotalLots = computed(() => {
  if (store.approvalEntriesSummary?.total_lots != null) {
    return store.approvalEntriesSummary.total_lots;
  }
  return selectedIb.value?.total_lots ?? 0;
});

const ibTotalEntries = computed(() => {
  if (store.approvalEntriesSummary?.entry_count != null) {
    return store.approvalEntriesSummary.entry_count;
  }
  return selectedIb.value?.entry_count ?? 0;
});

// ─── Step 3: Client Breakdown & Closed Trades State ─────
const selectedLoginFilter = ref("");
const tradeSearchQuery = ref("");
const tradePage = ref(1);
const tradePerPage = ref(50);
let tradeSearchDebounce = null;

const tradeColumns = [
  { key: "position_id", label: "Ticket / Position", width: "150px" },
  { key: "login", label: "Account / Login", width: "140px" },
  { key: "symbol", label: "Symbol", width: "120px" },
  { key: "lots", label: "Lots / Volume", align: "right", width: "130px" },
  { key: "commission", label: "Commission", align: "right", width: "140px" },
  { key: "open_time", label: "Open Time", width: "170px" },
  { key: "close_time", label: "Close Time", width: "170px" },
  { key: "created_at", label: "Created At", width: "170px" },
];

const clientTradeCount = computed(() => {
  return selectedClient.value?.entry_count ?? store.approvalEntriesPagination?.total_items ?? store.approvalEntriesList.length;
});

const avgCommPerLot = computed(() => {
  if (selectedClient.value?.avg_commission_per_lot != null) {
    return selectedClient.value.avg_commission_per_lot;
  }
  const comm = Number(selectedClient.value?.total_commission ?? store.approvalEntriesSummary?.total_commission ?? 0);
  const lots = Number(selectedClient.value?.total_lots ?? store.approvalEntriesSummary?.total_lots ?? 0);
  if (!lots || lots <= 0) return 0;
  return comm / lots;
});

const filteredTradeList = computed(() => {
  let list = store.approvalEntriesList || [];
  if (selectedLoginFilter.value) {
    list = list.filter((item) => String(item.trade?.login || item.login) === String(selectedLoginFilter.value));
  }
  const q = (tradeSearchQuery.value || "").trim().toLowerCase();
  if (q) {
    list = list.filter((item) => {
      const pos = String(item.trade?.position_id || item.id || "");
      const sym = String(item.trade?.symbol || item.symbol || "").toLowerCase();
      const login = String(item.trade?.login || item.login || "");
      return pos.includes(q) || sym.includes(q) || login.includes(q);
    });
  }
  return list;
});

// ─── Approval Modal & Action State ──────────────────────
const isApproveConfirmOpen = ref(false);
const ibToApprove = ref(null);

const approveConfirmMessage = computed(() => {
  if (!ibToApprove.value) return "";
  const ib = ibToApprove.value;
  const walletName = ib.wallet_target === "demo" ? "Demo Wallet" : "Main CRM Wallet";
  return `Are you sure you want to approve ${ib.entry_count || 0} pending commissions totaling $${formatNum(ib.total_commission)} for ${ib.ib_name || `IB #${ib.ib_id}`} in period '${activePeriodLabel.value}'? Funds will credit directly to their ${walletName}.`;
});

// ─── IB Search Handler ──────────────────────────────────
let ibSearchDebounce = null;
const onIbSearch = (query) => {
  clearTimeout(ibSearchDebounce);
  if (!query || !query.trim()) {
    store.searchIbs("");
    return;
  }
  ibSearchDebounce = setTimeout(() => {
    store.searchIbs(query).catch(() => {});
  }, 300);
};

// ─── TopBar Meta & Navigation Flow Handlers ─────────────
const syncFromRoute = () => {
  const id = route.params.id || route.query.ib_id;
  const userId = route.params.userId || route.query.user_id;
  const viewParam = route.query.view;

  // Sync frequency & period from query if present
  if (route.query.frequency && frequencies.some((f) => f.value === route.query.frequency)) {
    activeFrequency.value = route.query.frequency;
  }
  if (route.query.period) {
    selectedPeriodKey.value = route.query.period;
  }

  const isClientDetail =
    route.name === "commission-engine-approvals-user" ||
    (id && userId) ||
    (viewParam === "client_detail" && id && userId);

  const isIbDetail =
    route.name === "commission-engine-approvals-detail" ||
    (id && !userId && viewParam !== "client_detail") ||
    (viewParam === "ib_detail" && id);

  if (isClientDetail) {
    currentView.value = "client_detail";
    if (!selectedIb.value || String(selectedIb.value.ib_id) !== String(id)) {
      selectedIb.value = { ib_id: Number(id), ib_name: `IB #${id}` };
    }
    if (!selectedClient.value || String(selectedClient.value.user_id) !== String(userId)) {
      selectedClient.value = { user_id: Number(userId), name: `Client #${userId}` };
    }
    loadClientTradesData();
  } else if (isIbDetail) {
    currentView.value = "ib_detail";
    selectedClient.value = null;
    if (!selectedIb.value || String(selectedIb.value.ib_id) !== String(id)) {
      selectedIb.value = { ib_id: Number(id), ib_name: `IB #${id}` };
    }
    loadIbDetailData();
  } else {
    currentView.value = "list";
    selectedIb.value = null;
    selectedClient.value = null;
    loadApprovalsSummary();
  }
};

const openIbDetail = (ib) => {
  selectedIb.value = ib;
  currentView.value = "ib_detail";
  step2SubView.value = "clients";
  clientSearchQuery.value = "";
  router.push({
    path: `/commission-engine/approvals/details/${ib.ib_id}`,
    query: {
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadIbDetailData();
};

const goBackToList = () => {
  currentView.value = "list";
  selectedIb.value = null;
  selectedClient.value = null;
  router.push({
    path: "/commission-engine/approvals",
    query: {
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadApprovalsSummary();
};

const openClientBreakdown = (client) => {
  selectedClient.value = client;
  currentView.value = "client_detail";
  selectedLoginFilter.value = "";
  tradeSearchQuery.value = "";
  tradePage.value = 1;
  const ibId = selectedIb.value?.ib_id || route.params.id || route.query.ib_id;
  router.push({
    path: `/commission-engine/approvals/details/${ibId}/user/${client.user_id}`,
    query: {
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadClientTradesData();
};

const goBackToIbDetail = () => {
  currentView.value = "ib_detail";
  selectedClient.value = null;
  const ibId = selectedIb.value?.ib_id || route.params.id || route.query.ib_id;
  router.push({
    path: `/commission-engine/approvals/details/${ibId}`,
    query: {
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadIbDetailData();
};

// Sync state when router.back() or browser back button is used
watch(
  () => [route.path, route.params.id, route.params.userId, route.query.view, route.query.ib_id, route.query.user_id],
  () => {
    syncFromRoute();
  }
);

// ─── Data Loaders ───────────────────────────────────────
onMounted(async () => {
  if (!store.ibSearchOptions.length) {
    store.searchIbs("");
  }
  await loadPeriodsAndSummary();
});

const loadPeriodsAndSummary = async () => {
  const periodsData = await store.fetchApprovalPeriods(activeFrequency.value, 12);
  const opts = periodsData?.options || [];
  if (route.query.period) {
    selectedPeriodKey.value = route.query.period;
  } else if (opts.length && !selectedPeriodKey.value) {
    selectedPeriodKey.value = opts[0].period_key;
  } else if (!opts.length) {
    selectedPeriodKey.value = "";
  }
  syncFromRoute();
};

const handleFrequencyChange = async (newFreq) => {
  if (activeFrequency.value === newFreq) return;
  activeFrequency.value = newFreq;
  await loadPeriodsAndSummary();
};

const handlePeriodChange = () => {
  loadApprovalsSummary(true);
};

const handleFilterChange = () => {
  loadApprovalsSummary(true);
};

const handleResetFilters = () => {
  filterWalletTarget.value = "";
  filterPayoutMode.value = "";
  filterIbId.value = null;
  loadApprovalsSummary(true);
};

const loadApprovalsSummary = (force = false) => {
  if (!selectedPeriodKey.value) return;

  const params = {
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    wallet_target: filterWalletTarget.value || undefined,
    payout_mode: filterPayoutMode.value || undefined,
    ib_id: filterIbId.value ? Number(filterIbId.value) : undefined,
  };

  store.fetchApprovalsSummary(params, force);
};

const loadIbDetailData = (force = false) => {
  if (!selectedIb.value?.ib_id || !selectedPeriodKey.value) return;
  store.fetchApprovalEntries({
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    ib_id: selectedIb.value.ib_id,
  }, force);
};

const loadIbFlatTradesData = (force = false) => {
  if (!selectedIb.value?.ib_id || !selectedPeriodKey.value) return;
  store.fetchApprovalEntries({
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    ib_id: selectedIb.value.ib_id,
    include_items: true,
    page: tradePage.value,
    per_page: tradePerPage.value,
    search: tradeSearchQuery.value || undefined,
  }, force);
};

const loadClientTradesData = (force = false) => {
  if (!selectedIb.value?.ib_id || !selectedPeriodKey.value) return;
  store.fetchApprovalEntries({
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    ib_id: selectedIb.value.ib_id,
    user_id: selectedClient.value?.user_id || undefined,
    page: tradePage.value,
    per_page: tradePerPage.value,
    search: tradeSearchQuery.value || undefined,
  }, force);
};

const refreshActiveTrades = (force = true) => {
  if (currentView.value === "client_detail") {
    loadClientTradesData(force);
  } else if (currentView.value === "ib_detail" && step2SubView.value === "flat_trades") {
    loadIbFlatTradesData(force);
  }
};

const handleLoginFilterChange = (login) => {
  selectedLoginFilter.value = login;
};

const onTradeSearchInput = () => {
  clearTimeout(tradeSearchDebounce);
  tradeSearchDebounce = setTimeout(() => {
    tradePage.value = 1;
    refreshActiveTrades(true);
  }, 350);
};

const clearTradeSearch = () => {
  tradeSearchQuery.value = "";
  tradePage.value = 1;
  refreshActiveTrades(true);
};

const handleTradePageChange = (newPage) => {
  tradePage.value = newPage;
  refreshActiveTrades(true);
};

const handleTradePerPageChange = (newPerPage) => {
  tradePerPage.value = newPerPage;
  tradePage.value = 1;
  refreshActiveTrades(true);
};

// ─── Approve Action Handlers ────────────────────────────
const openApproveConfirm = (ib) => {
  ibToApprove.value = ib;
  isApproveConfirmOpen.value = true;
};

const handleConfirmApprove = async () => {
  if (!ibToApprove.value) return;
  try {
    await store.approveIbPeriod({
      frequency: activeFrequency.value,
      period_key: selectedPeriodKey.value,
      ib_id: ibToApprove.value.ib_id,
      dry_run: false,
    });
    isApproveConfirmOpen.value = false;
    if (currentView.value !== "list") {
      goBackToList();
    } else {
      loadApprovalsSummary(true);
    }
  } catch {
    // Error handled by store snackbar
  }
};

// ─── Number & Date Formatters ───────────────────────────
const formatNum = (val) => {
  if (val == null || val === "") return 0;
  return val;
};

const formatShortDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};
</script>
