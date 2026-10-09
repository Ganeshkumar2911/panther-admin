<template>
  <div class="space-y-6">
    <!-- ================================================================= -->
    <!-- STEP 1: Main Approvals List (currentView === 'list')               -->
    <!-- ================================================================= -->
    <div v-if="currentView === 'list'" class="space-y-6">
      <!-- Summary KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Skeleton Loading State for KPI Cards -->
        <template v-if="store.approvalsLoading">
          <div
            v-for="n in 5"
            :key="`summary-skeleton-${n}`"
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

        <!-- KPI Cards with Data -->
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

      <!-- Main Content Area: Loading Skeleton vs Empty State vs IB Summary Table -->
      <!-- 1. Skeleton Loading Table -->
      <div v-if="store.approvalsLoading" class="space-y-4">
        <DataTable
          :columns="columns"
          :data="[]"
          :loading="true"
          row-key="ib_id"
          table-key="commission-approvals-table"
        />
      </div>

      <!-- 2. Empty State -->
      <div
        v-else-if="!store.approvalsSummary || store.approvalsSummary.empty || !store.approvalsSummary.items?.length"
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

      <!-- 3. IB-wise Pending Summary Table -->
      <div v-else class="space-y-4">
        <DataTable
          :columns="columns"
          :data="store.approvalsSummary.items"
          :loading="false"
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
                  IB ID: #{{ row.ib_id }}
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
                {{ formatPeriodDateRange(store.approvalsSummary?.start, store.approvalsSummary?.end, activeFrequency) }}
              </p>
            </div>
          </template>

          <!-- Cell: Frequency Type -->
          <template #cell-frequency="{ row }">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-card-background border border-primary-border text-secondary-text">
              {{ activeFrequency }}
            </span>
          </template>

          <!-- Cell: Performance Commission (Direct Clients) -->
          <template #cell-performance_commission="{ row }">
            <div class="space-y-1 text-right font-mono">
              <span class="text-xs font-bold text-primary-green tabular-nums">
                +${{ formatNum(row.performance_commission) }}
              </span>
              <div v-if="row.performance_lots != null || row.entry_count != null" class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
                <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                  {{ formatNum(row.performance_lots ?? row.total_lots) }} lots
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
                +${{ formatNum(row.commission_from_subibs) }}
              </span>
              <div v-if="row.lots_from_subibs != null || row.entry_count_from_subibs != null" class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
                <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                  {{ formatNum(row.lots_from_subibs || 0) }} lots
                </span>
                <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                  {{ row.entry_count_from_subibs || 0 }} entries
                </span>
              </div>
            </div>
          </template>

          <!-- Cell: Commission Paid to Master (Upline Share) -->
          <template #cell-commission_paid_to_master="{ row }">
            <div class="space-y-1 text-right font-mono">
              <span class="text-xs font-bold text-secondary-text tabular-nums">
                ${{ formatNum(row.commission_paid_to_master) }}
              </span>
              <div v-if="row.lots_paid_to_master != null" class="flex flex-col items-end gap-0.5 font-mono text-[10px]">
                <span class="px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text whitespace-nowrap">
                  {{ formatNum(row.lots_paid_to_master) }} lots
                </span>
              </div>
            </div>
          </template>

          <!-- Cell: Total Commission (Grand Total) -->
          <template #cell-total="{ row }">
            <div class="space-y-0.5 text-right">
              <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
                +${{ formatNum(row.grand_total_commission ?? row.total_commission) }}
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
                {{ formatNum(row.total_lots_all ?? row.total_lots) }} lots
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

          <!-- Cell: Entries Count (Total, Direct & Sub-IBs) -->
          <template #cell-entries="{ row }">
            <div class="space-y-0.5 text-center font-mono">
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-card-background border border-primary-border text-xs font-bold text-primary-text tabular-nums shadow-2xs">
                {{ row.entry_count_all ?? row.entry_count }}
              </span>
              <div class="flex items-center justify-center gap-1 text-[10px] text-secondary-text">
                <span title="Direct Client Trades">
                  Dir: <strong class="text-primary-text font-semibold">{{ row.entry_count || 0 }}</strong>
                </span>
                <span class="text-secondary-text/50">&middot;</span>
                <span
                  title="Sub-IB Network Trades"
                  :class="(row.entry_count_from_subibs || 0) > 0 ? 'text-primary' : 'text-secondary-text'"
                >
                  Sub: <strong :class="(row.entry_count_from_subibs || 0) > 0 ? 'text-primary font-bold' : 'text-secondary-text font-semibold'">{{ row.entry_count_from_subibs || 0 }}</strong>
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
      <!-- Header & Navigation Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white">
              Settlement #{{ selectedIb?.ib_id }}
            </span>

            <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border">
              IB: <strong class="text-primary-text font-semibold">{{ selectedIb?.ib_name || `IB #${selectedIb?.ib_id}` }}</strong> (ID: #{{ selectedIb?.ib_id }})
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
            <span class="text-secondary-text">({{ formatPeriodDateRange(store.approvalsSummary?.start, store.approvalsSummary?.end, activeFrequency) }})</span>
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Sub-view toggle (Direct Clients vs Sub-IBs vs Flat Trades) -->
          <div class="flex items-center rounded-lg border border-primary-border bg-card-background overflow-hidden h-9">
            <button
              type="button"
              class="px-3 h-full text-xs font-medium transition-colors cursor-pointer"
              :class="step2SubView === 'clients' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              @click="setStep2SubView('clients')"
            >
              Direct Clients ({{ store.approvalEntriesClients.length }})
            </button>
            <button
              type="button"
              class="px-3 h-full text-xs font-medium transition-colors cursor-pointer"
              :class="step2SubView === 'sub_ibs' ? 'bg-primary text-white font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              @click="setStep2SubView('sub_ibs')"
            >
              Sub-IB Network ({{ store.approvalEntriesSubIbs.length }})
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
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <!-- Skeleton Loading State for Step 2 KPIs -->
        <template v-if="store.approvalEntriesLoading">
          <div
            v-for="n in 6"
            :key="`ib-skeleton-${n}`"
            class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2.5"
            :class="n === 1 ? 'lg:col-span-2' : ''"
          >
            <div class="h-3 w-20 bg-background rounded" />
            <div class="h-6 w-28 bg-background rounded mt-2" />
            <div class="h-2.5 w-16 bg-background rounded mt-1" />
          </div>
        </template>

        <template v-else>
          <!-- Total Commission -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between lg:col-span-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Commission</span>
              <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary-green" />
            </div>
            <div class="mt-2">
              <p class="text-2xl font-bold text-primary-green tabular-nums">
                +${{ formatNum(ibTotalCommission) }}
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5 truncate">
                {{ selectedIb?.ib_name }} (IB #{{ selectedIb?.ib_id }})
              </p>
            </div>
          </div>

          <!-- Direct Clients Commission -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Direct Clients</span>
              <HugeIcon :icon="UserGroupIcon" :size="16" class="text-primary" />
            </div>
            <div class="mt-2">
              <p class="text-lg font-bold text-primary-text tabular-nums">
                +${{ formatNum(ibDirectCommission) }}
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5">
                {{ formatNum(ibDirectLots) }} lots &middot; {{ store.approvalEntriesClients.length }} clients
              </p>
            </div>
          </div>

          <!-- From Sub-IBs Commission -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">From Sub-IBs</span>
              <HugeIcon :icon="Layers01Icon" :size="16" class="text-primary-cyan" />
            </div>
            <div class="mt-2">
              <p class="text-lg font-bold text-primary tabular-nums">
                +${{ formatNum(ibSubIbsCommission) }}
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5">
                {{ formatNum(ibSubIbsLots) }} lots &middot; {{ store.approvalEntriesSubIbs.length }} Sub-IBs
              </p>
            </div>
          </div>

          <!-- Paid to Master (Upline) -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Paid to Master</span>
              <HugeIcon :icon="Coins01Icon" :size="16" class="text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-lg font-bold text-secondary-text tabular-nums">
                ${{ formatNum(ibPaidToMaster) }}
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5">
                {{ formatNum(ibPaidToMasterLots) }} lots (Upline share)
              </p>
            </div>
          </div>

          <!-- Total Lots Traded -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Lots</span>
              <HugeIcon :icon="Coins01Icon" :size="16" class="text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-lg font-bold text-primary-text tabular-nums">
                {{ formatNum(ibTotalLots) }} lots
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5">Combined trade volume</p>
            </div>
          </div>

          <!-- Total Trades -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Trades</span>
              <HugeIcon :icon="Invoice01Icon" :size="16" class="text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-lg font-bold text-primary-text tabular-nums">
                {{ ibTotalEntries }}
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5">Closed trade entries</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Sub-view 1: Direct Client Summaries -->
      <template v-if="step2SubView === 'clients'">
        <!-- Client Summaries Header & Search -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs">
              <HugeIcon :icon="UserGroupIcon" :size="14" />
              <span>Direct Clients</span>
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
              placeholder="Search direct client by name, email, ID..."
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
          empty-title="No direct clients found"
          empty-text="There are no direct client records matching your search for this IB period."
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
            <div class="space-y-0.5 text-right font-mono">
              <span class="text-xs font-bold text-primary-green tabular-nums">
                +${{ formatNum(row.total_commission) }}
              </span>
              <div v-if="row.by_currency && Object.keys(row.by_currency).length" class="flex flex-wrap items-center justify-end gap-1 text-[10px]">
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

          <!-- Cell: Paid to Master (Upline) -->
          <template #cell-paid_to_master="{ row }">
            <span class="font-mono text-xs font-bold text-secondary-text tabular-nums">
              ${{ formatNum(row.commission_paid_to_master || 0) }}
            </span>
          </template>

          <!-- Cell: Action (Details > button) -->
          <template #cell-action="{ row }">
            <div class="flex items-center justify-end">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors cursor-pointer"
                title="View detailed closed trades for this direct client"
                @click="openDirectClientBreakdown(row)"
              >
                <span>Details</span>
                <HugeIcon :icon="ArrowRight01Icon" :size="13" />
              </button>
            </div>
          </template>
        </DataTable>
      </template>

      <!-- Sub-view 2: Sub-IB Network Breakdown -->
      <template v-else-if="step2SubView === 'sub_ibs'">
        <!-- Sub-IB Network Header & Search -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs">
              <HugeIcon :icon="Layers01Icon" :size="14" />
              <span>Sub-IB Network</span>
              <span class="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
                {{ filteredSubIbs.length }}
              </span>
            </div>
          </div>

          <!-- Search Sub-IB Filter -->
          <div class="relative w-full sm:w-80">
            <input
              v-model="subIbSearchQuery"
              type="text"
              placeholder="Search Sub-IB by name, email, ID, client..."
              class="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition-colors"
            />
            <HugeIcon
              :icon="Search01Icon"
              :size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
            />
            <button
              v-if="subIbSearchQuery"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              @click="subIbSearchQuery = ''"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
            </button>
          </div>
        </div>

        <!-- Sub-IB Summary Overview Banner -->
        <div
          v-if="store.approvalEntriesSubIbsSummary"
          class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card-background border border-primary-border rounded-xl p-3 text-xs"
        >
          <div>
            <span class="text-secondary-text text-[11px]">Total Sub-IBs</span>
            <p class="font-bold text-primary-text font-mono text-sm mt-0.5">
              {{ store.approvalEntriesSubIbsSummary.sub_ib_count || store.approvalEntriesSubIbs.length }}
            </p>
          </div>
          <div>
            <span class="text-secondary-text text-[11px]">Total Sub-IB Commission</span>
            <p class="font-bold text-primary font-mono text-sm mt-0.5">
              +${{ formatNum(store.approvalEntriesSubIbsSummary.total_commission) }}
            </p>
          </div>
          <div>
            <span class="text-secondary-text text-[11px]">Total Sub-IB Lots</span>
            <p class="font-bold text-primary-text font-mono text-sm mt-0.5">
              {{ formatNum(store.approvalEntriesSubIbsSummary.total_lots) }} lots
            </p>
          </div>
          <div>
            <span class="text-secondary-text text-[11px]">Total Sub-IB Entries</span>
            <p class="font-bold text-primary-text font-mono text-sm mt-0.5">
              {{ store.approvalEntriesSubIbsSummary.entry_count || 0 }} trades
            </p>
          </div>
        </div>

        <!-- Sub-IB Loading State -->
        <div v-if="store.approvalEntriesLoading" class="space-y-4">
          <div v-for="n in 2" :key="`subib-skeleton-${n}`" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-3">
            <div class="h-4 w-40 bg-background rounded" />
            <div class="h-20 bg-background rounded" />
          </div>
        </div>

        <!-- Sub-IB Empty State -->
        <div
          v-else-if="!filteredSubIbs.length"
          class="flex flex-col items-center justify-center p-12 rounded-2xl bg-card-background border border-primary-border text-center space-y-2"
        >
          <HugeIcon :icon="Layers01Icon" :size="24" class="text-secondary-text" />
          <h4 class="text-xs font-bold text-primary-text">No Sub-IBs Recorded</h4>
          <p class="text-xs text-secondary-text max-w-sm">
            This IB does not have any downline Sub-IB commissions recorded for the {{ activePeriodLabel }} period.
          </p>
        </div>

        <!-- Sub-IBs List / Cards -->
        <div v-else class="space-y-4">
          <div
            v-for="sub in filteredSubIbs"
            :key="sub.sub_ib_id"
            class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
          >
            <!-- Sub-IB Header Info -->
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
                  {{ sub.sub_ib_email || 'No email recorded' }}
                </p>
              </div>

              <!-- Sub-IB Metrics -->
              <div class="flex items-center gap-2.5 flex-wrap">
                <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
                  <span class="text-[10px] text-secondary-text block">Commission Earned</span>
                  <strong class="text-primary font-bold">+${{ formatNum(sub.total_commission) }}</strong>
                </div>
                <div class="px-3 py-1.5 rounded-xl bg-background border border-primary-border text-right font-mono text-xs">
                  <span class="text-[10px] text-secondary-text block">Volume Traded</span>
                  <strong class="text-primary-text font-bold">{{ formatNum(sub.total_lots) }} lots</strong>
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

            <!-- Nested Sub-IB Clients Table -->
            <div class="space-y-2">
              <p class="text-xs font-semibold text-secondary-text flex items-center gap-1.5">
                <HugeIcon :icon="UserGroupIcon" :size="13" />
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
                      <!-- Client Name & ID -->
                      <td class="p-3">
                        <p class="font-bold text-primary-text">
                          {{ subClient.name || `Client #${subClient.user_id}` }}
                        </p>
                        <p class="text-[11px] text-secondary-text font-mono">
                          User ID: #{{ subClient.user_id }}
                        </p>
                      </td>

                      <!-- Logins / Accounts -->
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
                          <span v-else class="text-secondary-text font-mono">—</span>
                        </div>
                      </td>

                      <!-- Trades -->
                      <td class="p-3 text-center font-mono font-bold text-primary-text tabular-nums">
                        {{ subClient.entry_count }}
                      </td>

                      <!-- Lots -->
                      <td class="p-3 text-right font-mono font-bold text-primary-text tabular-nums">
                        {{ formatNum(subClient.total_lots) }} lots
                      </td>

                      <!-- Commission -->
                      <td class="p-3 text-right font-mono font-bold text-primary tabular-nums">
                        +${{ formatNum(subClient.total_commission) }}
                      </td>

                      <!-- Action -->
                      <td class="p-3 text-right">
                        <button
                          type="button"
                          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors cursor-pointer"
                          title="View trade line items for this sub-IB client"
                          @click="openSubIbClientBreakdown(sub, subClient)"
                        >
                          <span>View Trades</span>
                          <HugeIcon :icon="ArrowRight01Icon" :size="13" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Sub-view 3: Flat Trades (include_items: true) -->
      <template v-else-if="step2SubView === 'flat_trades'">
        <!-- Flat Trades Filter Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div class="flex items-center gap-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs">
              <HugeIcon :icon="Invoice01Icon" :size="14" />
              <span>All IB Flat Trades</span>
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
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary-border"
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
      <!-- Header & Navigation Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white">
              Settlement #{{ selectedIb?.ib_id }}
            </span>

            <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-card-background text-secondary-text border border-primary-border">
              IB: <strong class="text-primary-text font-semibold">{{ selectedIb?.ib_name || `IB #${selectedIb?.ib_id}` }}</strong> (ID: #{{ selectedIb?.ib_id }})
            </span>

            <!-- Sub-IB Badge if applicable -->
            <span
              v-if="selectedSubIb"
              class="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              Sub-IB: {{ selectedSubIb.sub_ib_name || `Sub-IB #${selectedSubIb.sub_ib_id}` }} (#{{ selectedSubIb.sub_ib_id }})
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
            &middot; Client: <strong class="text-primary-text">{{ selectedClient?.name || `Client #${selectedClient?.user_id}` }}</strong> (User #{{ selectedClient?.user_id }})
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
                <span
                  v-if="selectedSubIb"
                  class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20"
                >
                  Via Sub-IB: {{ selectedSubIb.sub_ib_name || `#${selectedSubIb.sub_ib_id}` }}
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
        <!-- Skeleton Loading State for Client KPIs -->
        <template v-if="store.approvalEntriesLoading">
          <div
            v-for="n in 4"
            :key="`client-kpi-skeleton-${n}`"
            class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2.5"
          >
            <div class="h-3 w-24 bg-background rounded" />
            <div class="h-6 w-28 bg-background rounded mt-2" />
            <div class="h-2.5 w-16 bg-background rounded mt-1" />
          </div>
        </template>

        <template v-else>
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
        </template>
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
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Coins01Icon,
  RefreshCwIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
  Invoice01Icon,
  UserGroupIcon,
  Layers01Icon,
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
const selectedSubIb = ref(null);
const selectedClient = ref(null);

// ─── Step 1: Main Approvals Filters & State ─────────────
const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const activeFrequency = ref("monthly");
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
  { key: "ib", label: "IB Partner", width: "220px" },
  { key: "period", label: "Executed / Period", width: "190px" },
  { key: "frequency", label: "Type", align: "center", width: "100px" },
  { key: "performance_commission", label: "Direct Comm.", align: "right", width: "140px" },
  { key: "commission_from_subibs", label: "Comm. From Sub-IBs", align: "right", width: "155px" },
  { key: "commission_paid_to_master", label: "Comm. Paid to Master", align: "right", width: "140px" },
  { key: "total", label: "Total Commission", align: "right", width: "160px" },
  { key: "total_lots", label: "Total Lots", align: "right", width: "170px" },
  { key: "entries", label: "Entries", align: "center", width: "125px" },
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

// ─── Step 2: IB Detail & Sub-views State ────────────────
// 'clients' (Direct Clients) | 'sub_ibs' (Sub-IB Network) | 'flat_trades' (All line items)
const step2SubView = ref("clients");
const clientSearchQuery = ref("");
const subIbSearchQuery = ref("");

const setStep2SubView = (sub) => {
  step2SubView.value = sub;
  if (sub === "flat_trades") {
    tradeSearchQuery.value = "";
    tradePage.value = 1;
    loadIbFlatTradesData(true);
  } else {
    clientSearchQuery.value = "";
    subIbSearchQuery.value = "";
    loadIbDetailData(true);
  }
};

const clientColumns = [
  { key: "client", label: "Client", width: "240px" },
  { key: "accounts", label: "Accounts", width: "220px" },
  { key: "trades", label: "Trades", align: "center", width: "110px" },
  { key: "lots", label: "Total Lots", align: "right", width: "170px" },
  { key: "commission", label: "Total Commission", align: "right", width: "160px" },
  { key: "paid_to_master", label: "Paid to Master", align: "right", width: "130px" },
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

const filteredSubIbs = computed(() => {
  const list = store.approvalEntriesSubIbs || [];
  const q = (subIbSearchQuery.value || "").trim().toLowerCase();
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

// KPI Aggregated Values for Step 2
const ibTotalCommission = computed(() => {
  if (store.approvalEntriesIbSummary?.grand_total_commission != null) {
    return store.approvalEntriesIbSummary.grand_total_commission;
  }
  if (store.approvalEntriesSummary?.total_commission != null) {
    return store.approvalEntriesSummary.total_commission;
  }
  return selectedIb.value?.grand_total_commission ?? selectedIb.value?.total_commission ?? 0;
});

const ibDirectCommission = computed(() => {
  if (store.approvalEntriesIbSummary?.performance_commission != null) {
    return store.approvalEntriesIbSummary.performance_commission;
  }
  if (store.approvalEntriesSummary?.performance_commission != null) {
    return store.approvalEntriesSummary.performance_commission;
  }
  return selectedIb.value?.performance_commission ?? 0;
});

const ibDirectLots = computed(() => {
  if (store.approvalEntriesIbSummary?.performance_lots != null) {
    return store.approvalEntriesIbSummary.performance_lots;
  }
  if (store.approvalEntriesSummary?.total_lots != null) {
    return store.approvalEntriesSummary.total_lots;
  }
  return selectedIb.value?.performance_lots ?? selectedIb.value?.total_lots ?? 0;
});

const ibSubIbsCommission = computed(() => {
  if (store.approvalEntriesIbSummary?.commission_from_subibs != null) {
    return store.approvalEntriesIbSummary.commission_from_subibs;
  }
  if (store.approvalEntriesSubIbsSummary?.total_commission != null) {
    return store.approvalEntriesSubIbsSummary.total_commission;
  }
  return selectedIb.value?.commission_from_subibs ?? 0;
});

const ibSubIbsLots = computed(() => {
  if (store.approvalEntriesIbSummary?.lots_from_subibs != null) {
    return store.approvalEntriesIbSummary.lots_from_subibs;
  }
  if (store.approvalEntriesSubIbsSummary?.total_lots != null) {
    return store.approvalEntriesSubIbsSummary.total_lots;
  }
  return selectedIb.value?.lots_from_subibs ?? 0;
});

const ibPaidToMaster = computed(() => {
  if (store.approvalEntriesIbSummary?.commission_paid_to_master != null) {
    return store.approvalEntriesIbSummary.commission_paid_to_master;
  }
  return selectedIb.value?.commission_paid_to_master ?? 0;
});

const ibPaidToMasterLots = computed(() => {
  if (store.approvalEntriesIbSummary?.lots_paid_to_master != null) {
    return store.approvalEntriesIbSummary.lots_paid_to_master;
  }
  return selectedIb.value?.lots_paid_to_master ?? 0;
});

const ibTotalLots = computed(() => {
  if (store.approvalEntriesIbSummary?.total_lots != null) {
    return store.approvalEntriesIbSummary.total_lots;
  }
  if (store.approvalEntriesSummary?.total_lots != null) {
    return store.approvalEntriesSummary.total_lots;
  }
  return selectedIb.value?.total_lots_all ?? selectedIb.value?.total_lots ?? 0;
});

const ibTotalEntries = computed(() => {
  if (store.approvalEntriesIbSummary?.entry_count != null) {
    return store.approvalEntriesIbSummary.entry_count;
  }
  if (store.approvalEntriesSummary?.entry_count != null) {
    return store.approvalEntriesSummary.entry_count;
  }
  return selectedIb.value?.entry_count_all ?? selectedIb.value?.entry_count ?? 0;
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
  const comm = Number(selectedClient.value?.total_commission ?? store.approvalEntriesSummary?.total_commission ?? 0);
  const lots = Number(selectedClient.value?.total_lots ?? store.approvalEntriesSummary?.total_lots ?? 0);
  if (!lots || lots <= 0) return "0.00";
  return (comm / lots).toFixed(2);
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
  const totalAmt = ib.grand_total_commission ?? ib.total_commission ?? 0;
  return `Are you sure you want to approve pending commissions totaling $${formatNum(totalAmt)} for ${ib.ib_name || `IB #${ib.ib_id}`} in period '${activePeriodLabel.value}'? Funds will credit directly to their ${walletName}.`;
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
  const subIbId = route.query.sub_ib_id;
  const viewParam = route.query.view;

  // Sync frequency & period from query if present
  if (route.query.frequency && frequencies.some((f) => f.value === route.query.frequency)) {
    activeFrequency.value = route.query.frequency;
  }
  if (route.query.period) {
    selectedPeriodKey.value = route.query.period;
  }

  if (subIbId) {
    if (!selectedSubIb.value || String(selectedSubIb.value.sub_ib_id) !== String(subIbId)) {
      selectedSubIb.value = {
        sub_ib_id: Number(subIbId),
        sub_ib_name: `Sub-IB #${subIbId}`,
      };
    }
  } else {
    selectedSubIb.value = null;
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
    loadClientTradesData(true);
  } else if (isIbDetail) {
    currentView.value = "ib_detail";
    selectedClient.value = null;
    if (!selectedIb.value || String(selectedIb.value.ib_id) !== String(id)) {
      selectedIb.value = { ib_id: Number(id), ib_name: `IB #${id}` };
    }
    loadIbDetailData(true);
  } else {
    currentView.value = "list";
    selectedIb.value = null;
    selectedSubIb.value = null;
    selectedClient.value = null;
    loadApprovalsSummary(true);
  }
};

const openIbDetail = (ib) => {
  selectedIb.value = ib;
  selectedSubIb.value = null;
  currentView.value = "ib_detail";
  step2SubView.value = "clients";
  clientSearchQuery.value = "";
  subIbSearchQuery.value = "";
  router.push({
    path: `/commission-engine/approvals/details/${ib.ib_id}`,
    query: {
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadIbDetailData(true);
};

const goBackToList = () => {
  currentView.value = "list";
  selectedIb.value = null;
  selectedSubIb.value = null;
  selectedClient.value = null;
  router.push({
    path: "/commission-engine/approvals",
    query: {
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadApprovalsSummary(true);
};

const openDirectClientBreakdown = (client) => {
  selectedSubIb.value = null;
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
  loadClientTradesData(true);
};

const openSubIbClientBreakdown = (sub, client) => {
  selectedSubIb.value = sub;
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
      sub_ib_id: sub.sub_ib_id,
    },
  });
  loadClientTradesData(true);
};

// Sync state when router changes
watch(
  () => [route.path, route.params.id, route.params.userId, route.query.view, route.query.ib_id, route.query.user_id, route.query.sub_ib_id],
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
  try {
    const periodsData = await store.fetchApprovalPeriods(activeFrequency.value, 12, true);
    const opts = periodsData?.options || [];
    
    // Validate whether current selectedPeriodKey exists in the new frequency's periods
    const exists = opts.some((o) => o.period_key === selectedPeriodKey.value);
    if (!exists) {
      selectedPeriodKey.value = opts.length ? opts[0].period_key : "";
    }

    // Keep URL query in sync
    router.replace({
      query: {
        ...route.query,
        frequency: activeFrequency.value,
        period: selectedPeriodKey.value,
      },
    });

    loadApprovalsSummary(true);
  } catch {
    // Handled in store
  }
};

const handleFrequencyChange = async (newFreq) => {
  if (activeFrequency.value === newFreq && !store.approvalsLoading) return;
  activeFrequency.value = newFreq;
  selectedPeriodKey.value = "";
  store.approvalsSummary = null;
  await loadPeriodsAndSummary();
};

const handlePeriodChange = (newPeriod) => {
  if (newPeriod) {
    selectedPeriodKey.value = newPeriod;
  }
  store.approvalsSummary = null;
  router.replace({
    query: {
      ...route.query,
      frequency: activeFrequency.value,
      period: selectedPeriodKey.value,
    },
  });
  loadApprovalsSummary(true);
};

const handleFilterChange = () => {
  store.approvalsSummary = null;
  loadApprovalsSummary(true);
};

const handleResetFilters = () => {
  filterWalletTarget.value = "";
  filterPayoutMode.value = "";
  filterIbId.value = null;
  store.approvalsSummary = null;
  loadApprovalsSummary(true);
};

const loadApprovalsSummary = (force = true) => {
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

const loadIbDetailData = (force = true) => {
  if (!selectedIb.value?.ib_id || !selectedPeriodKey.value) return;
  store.fetchApprovalEntries({
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    ib_id: selectedIb.value.ib_id,
  }, force);
};

const loadIbFlatTradesData = (force = true) => {
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

const loadClientTradesData = (force = true) => {
  if (!selectedIb.value?.ib_id || !selectedPeriodKey.value) return;
  const subIbIdParam = selectedSubIb.value?.sub_ib_id || (route.query.sub_ib_id ? Number(route.query.sub_ib_id) : undefined);
  store.fetchApprovalEntries({
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    ib_id: selectedIb.value.ib_id,
    sub_ib_id: subIbIdParam,
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
  if (val == null || isNaN(Number(val))) return "0.00";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

const formatPeriodDateRange = (start, end, frequency = activeFrequency.value) => {
  if (!start) return "—";
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) return start;

  if (frequency === "daily") {
    // For daily: show only single date (e.g. "7 Oct 2026")
    return formatShortDate(start);
  }

  if (frequency === "weekly") {
    if (!end) return formatShortDate(start);
    const endDate = new Date(end);
    // Exclusive upper boundary: subtract 1 day to show true inclusive week range (e.g. Mon - Sun)
    if (!isNaN(endDate.getTime())) {
      const inclusiveEnd = new Date(endDate.getTime() - 1000 * 60 * 60 * 24);
      return `${formatShortDate(start)} – ${formatShortDate(inclusiveEnd)}`;
    }
    return formatShortDate(start);
  }

  if (frequency === "monthly") {
    if (!end) return formatShortDate(start);
    const endDate = new Date(end);
    // Exclusive upper boundary: subtract 1 day to show true month end (e.g. 1 Oct 2026 - 31 Oct 2026)
    if (!isNaN(endDate.getTime())) {
      const inclusiveEnd = new Date(endDate.getTime() - 1000 * 60 * 60 * 24);
      return `${formatShortDate(start)} – ${formatShortDate(inclusiveEnd)}`;
    }
    return formatShortDate(start);
  }

  return formatShortDate(start);
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
