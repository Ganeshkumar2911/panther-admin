<template>
  <div class="space-y-4 py-2">
    <!-- Toolbar Header: Search, Filters, View Switcher & Actions -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2.5 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap"
      >
        <!-- Search Input -->
        <div class="relative w-full sm:w-56 xl:w-64 h-9">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search label, name, email or account..."
            class="w-full h-full pl-8 pr-7 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Visibility Filter -->
        <BaseSelect
          v-model="selectedVisibility"
          :options="visibilityOptions"
          placeholder="Visibility"
          class="w-full sm:w-36 xl:w-36"
        />

        <!-- Status Filter -->
        <BaseSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Status"
          class="w-full sm:w-32 xl:w-32"
        />

        <!-- KYC Filter -->
        <BaseSelect
          v-model="selectedKyc"
          :options="kycOptions"
          placeholder="KYC Status"
          class="w-full sm:w-36 xl:w-36"
        />

        <!-- Per Page Option -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-28 xl:w-28"
          @update:modelValue="handlePerPageChange"
        />

        <!-- Clear Filters Button -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer flex items-center gap-1.5"
          @click="resetFilters"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Reset
        </button>

        <!-- Refresh Button -->
        <button
          type="button"
          :disabled="store.isLoading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer sm:ml-auto"
          title="Refresh"
          @click="() => store.fetchFmLeaderboard(true)"
        >
          <RefreshCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': store.isLoading }"
          />
        </button>
      </div>

      <!-- View Switcher & Add Button -->
      <div class="flex items-center gap-2 justify-between xl:justify-end shrink-0">
        <!-- View Switcher (Grid / List) -->
        <div
          class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 h-9 shrink-0"
        >
          <Tooltip text="Grid Card View" placement="top">
            <button
              @click="layoutMode = 'grid'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'grid'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip text="Table List View" placement="top">
            <button
              @click="layoutMode = 'list'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'list'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <List class="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        <!-- Add Fund Manager Button -->
        <button
          v-if="hasPermission('fund_manager.create')"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow h-9"
          @click="handleAdd"
        >
          <Plus class="w-4 h-4" />
          <span>Add Fund Manager</span>
        </button>
      </div>
    </div>

    <!-- SKELETON LOADING STATE -->
    <div v-if="store.isLoading">
      <!-- Grid Skeleton -->
      <div v-if="layoutMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl overflow-hidden animate-pulse p-5 space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-background" />
              <div class="space-y-1.5">
                <div class="h-3.5 w-32 bg-background rounded" />
                <div class="h-2.5 w-24 bg-background rounded" />
              </div>
            </div>
            <div class="h-5 w-16 bg-background rounded-full" />
          </div>
          <div class="h-16 bg-background rounded-xl" />
          <div class="grid grid-cols-3 gap-2">
            <div v-for="m in 3" :key="m" class="h-12 bg-background rounded-xl" />
          </div>
          <div class="h-10 bg-background rounded-xl" />
        </div>
      </div>

      <!-- List Skeleton -->
      <div v-else class="border border-primary-border rounded-2xl overflow-hidden bg-card-background/40">
        <div class="p-4 space-y-3">
          <div v-for="n in 5" :key="n" class="h-10 bg-background rounded animate-pulse w-full" />
        </div>
      </div>
    </div>

    <!-- MAIN DATA DISPLAY -->
    <div v-else>
      <!-- EMPTY STATE -->
      <div
        v-if="filteredData.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-border bg-card-background/30 py-16 px-4 text-center"
      >
        <div
          class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background border border-primary-border shadow-sm mb-4"
        >
          <UserRoundPlus class="w-8 h-8 text-secondary-text" />
        </div>

        <h3 class="text-base font-semibold text-primary-text mb-1">
          {{ hasActiveFilters ? 'No matching fund managers found' : 'No fund managers found' }}
        </h3>
        <p class="max-w-xs text-xs text-secondary-text mb-5">
          {{
            hasActiveFilters
              ? 'Try adjusting your search criteria or clearing active filters.'
              : 'Get started by adding your first fund manager to configure shares and fees.'
          }}
        </p>

        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border bg-card-background px-4 py-2 text-xs font-medium text-primary-text hover:bg-background transition-colors cursor-pointer"
        >
          <RotateCcw class="mr-1.5 h-3.5 w-3.5" />
          Clear Filters
        </button>
        <button
          v-else-if="hasPermission('fund_manager.create')"
          @click="handleAdd"
          class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-white shadow cursor-pointer hover:bg-primary-hover transition-colors"
        >
          <Plus class="mr-1.5 h-4 w-4" />
          Add Fund Manager
        </button>
      </div>

      <!-- GRID CARD VIEW -->
      <div
        v-else-if="layoutMode === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <div
          v-for="item in filteredData"
          :key="item.id"
          class="bg-card-background border border-primary-border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <!-- Card Identity Header -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform"
                >
                  {{ (item.label_name || 'FM')[0].toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <h4
                    class="text-base font-bold text-primary-text truncate tracking-tight"
                    :title="item.label_name"
                  >
                    {{ item.label_name || 'Unnamed Fund Manager' }}
                  </h4>
                  <p v-if="item.user?.name" class="text-xs text-secondary-text truncate font-medium">
                    {{ item.user.name }}
                  </p>
                </div>
              </div>

              <!-- Status Badges -->
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                  :class="
                    item.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                  "
                >
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="item.is_active ? 'bg-emerald-500' : 'bg-zinc-400'" />
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span
                  class="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border"
                >
                  {{ item.visibility_type || 'public' }}
                </span>
              </div>
            </div>

            <!-- Prominent User Email Banner -->
            <div class="bg-background/80 border border-primary-border/80 rounded-xl px-3 py-2 flex items-center justify-between mb-3.5 shadow-2xs">
              <div class="flex items-center gap-2 min-w-0">
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                <span class="text-xs font-semibold text-primary-text truncate font-mono select-all" :title="item.user?.email">
                  {{ item.user?.email || 'No email registered' }}
                </span>
              </div>
              <span v-if="item.user?.kyc_status" class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0" :class="getKycBadgeClass(item.user.kyc_status)">
                KYC: {{ item.user.kyc_status }}
              </span>
            </div>

            <!-- Hero Min Capital Banner -->
            <div class="bg-background/70 border border-primary-border/80 rounded-xl p-3 flex items-center justify-between mb-3 shadow-2xs">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text">Min Investment Capital</p>
                <p class="text-base font-extrabold text-primary-text tracking-tight mt-0.5">
                  {{ formatMoney(item.min_capital, item.broker_currency) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text">Perf Fee</p>
                <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs mt-0.5">
                  <span>{{ formatPercent(item.performance_fee) }}</span>
                </div>
              </div>
            </div>

            <!-- Core Fees Grid -->
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div class="bg-background/40 border border-primary-border/40 rounded-xl p-2 text-center">
                <p class="text-[9px] uppercase font-semibold tracking-wider text-secondary-text mb-0.5">Management</p>
                <p class="text-xs font-bold text-primary-text">{{ formatPercent(item.management_fee) }}</p>
                <p v-if="item.management_fee_interval" class="text-[9px] text-secondary-text capitalize">
                  {{ item.management_fee_interval }}
                </p>
              </div>
              <div class="bg-background/40 border border-primary-border/40 rounded-xl p-2 text-center">
                <p class="text-[9px] uppercase font-semibold tracking-wider text-secondary-text mb-0.5">Registration</p>
                <p class="text-xs font-bold text-primary-text">
                  {{ item.registration_fee ? formatMoney(item.registration_fee, item.broker_currency) : 'Free' }}
                </p>
              </div>
              <div class="bg-background/40 border border-primary-border/40 rounded-xl p-2 text-center">
                <p class="text-[9px] uppercase font-semibold tracking-wider text-secondary-text mb-0.5">Leverage</p>
                <p class="text-xs font-bold text-primary">1:{{ item.broker_leverage || '—' }}</p>
                <p class="text-[9px] text-secondary-text uppercase font-mono">
                  {{ item.broker_currency || 'USD' }}
                </p>
              </div>
            </div>

            <!-- Shares Allocation Visual Distribution Bar -->
            <div class="bg-background/40 border border-primary-border/40 rounded-xl p-2.5 mb-3 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-semibold text-secondary-text">
                <span class="uppercase tracking-wider text-[9px]">Share Distribution</span>
                <span class="text-primary-text text-[10px] font-bold">
                  Broker {{ item.broker_share }}% · FM {{ item.fm_share }}% · IB {{ item.ib_pool_percentage }}%
                </span>
              </div>
              <!-- Stacked Progress Bar -->
              <div class="h-2 w-full bg-background border border-primary-border/60 rounded-full overflow-hidden flex">
                <div
                  class="bg-primary h-full transition-all"
                  :style="{ width: `${Math.min(100, item.broker_share || 0)}%` }"
                  title="Broker Share"
                />
                <div
                  class="bg-indigo-500 h-full transition-all"
                  :style="{ width: `${Math.min(100 - (item.broker_share || 0), item.fm_share || 0)}%` }"
                  title="FM Share"
                />
                <div
                  class="bg-emerald-500 h-full transition-all"
                  :style="{ width: `${Math.min(100, item.ib_pool_percentage || 0)}%` }"
                  title="IB Pool Percentage"
                />
              </div>
            </div>

            <!-- Account Specifications Summary -->
            <div class="space-y-1.5 text-xs py-2 border-t border-primary-border/60">
              <div class="flex items-center justify-between">
                <span class="text-secondary-text text-[11px]">Accounts</span>
                <span class="font-bold text-primary-text font-mono text-[11px]">
                  Master: <span class="text-primary font-bold">{{ item.master_account?.account_number || `#${item.master_account_id}` }}</span>
                  · Cov: <span class="text-indigo-400 font-bold">{{ item.coverage_account?.account_number || `#${item.coverage_account_id}` }}</span>
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-secondary-text text-[11px]">Broker Group</span>
                <Tooltip v-if="item.broker_group" :text="item.broker_group" placement="left">
                  <span class="font-medium text-primary-text max-w-[140px] truncate block text-[11px] font-mono">
                    {{ item.broker_group }}
                  </span>
                </Tooltip>
                <span v-else class="text-[11px] text-secondary-text">—</span>
              </div>
            </div>
          </div>

          <!-- Card Action Footer -->
          <div
            class="pt-3 mt-2 border-t border-primary-border/60 flex items-center justify-between gap-2"
          >
            <button
              class="px-2.5 py-1.5 rounded-lg border border-primary-border hover:bg-background text-primary-text text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              @click="openDetailsDrawer(item)"
            >
              <Eye class="w-3.5 h-3.5 text-primary" />
              <span>Full Details</span>
            </button>

            <DropdownMenu
              :items="getRowActions(item)"
              @select="(menuItem) => onMenuSelect(menuItem, item)"
            />
          </div>
        </div>
      </div>

      <!-- TABLE LIST VIEW -->
      <div v-else-if="layoutMode === 'list'" class="space-y-3">
        <!-- Desktop Table (md and up) -->
        <div
          class="hidden md:block w-full border border-primary-border rounded-2xl overflow-x-auto bg-card-background/40 shadow-sm"
        >
          <table class="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead>
              <tr
                class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]"
              >
                <th class="py-3 px-4 w-[260px]">Fund Manager & Email</th>
                <th class="py-3 px-3 w-[220px]">Master / Coverage Accounts</th>
                <th class="py-3 px-3 w-[180px]">Capital & Fees</th>
                <th class="py-3 px-3 w-[170px]">Share Split</th>
                <th class="py-3 px-3 w-[150px]">Status & Settlement</th>
                <th class="py-3 px-4 text-right w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr
                v-for="item in filteredData"
                :key="item.id"
                class="hover:bg-background/50 transition-colors"
              >
                <!-- Fund Manager & Email -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0"
                    >
                      #{{ item.id }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-primary-text text-xs truncate" :title="item.label_name">
                        {{ item.label_name || 'Unnamed FM' }}
                      </p>
                      <p class="text-[11px] font-semibold text-primary select-all truncate max-w-[210px]" :title="item.user?.email">
                        {{ item.user?.email || 'No email' }}
                      </p>
                      <p v-if="item.user?.name" class="text-[10px] text-secondary-text truncate">
                        {{ item.user.name }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Accounts & Group -->
                <td class="py-3.5 px-3">
                  <div class="space-y-0.5">
                    <div class="font-mono text-[11px] text-primary-text font-semibold">
                      Master: <span class="font-bold text-primary">{{ item.master_account?.account_number || `#${item.master_account_id}` }}</span>
                    </div>
                    <div class="font-mono text-[11px] text-secondary-text">
                      Coverage: <span class="font-semibold text-primary-text">{{ item.coverage_account?.account_number || `#${item.coverage_account_id}` }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[11px]">
                      <Tooltip v-if="item.broker_group" :text="item.broker_group" placement="left">
                        <span class="truncate max-w-[130px] font-mono text-secondary-text block">
                          {{ item.broker_group }}
                        </span>
                      </Tooltip>
                      <span class="text-primary font-bold text-[10px]">1:{{ item.broker_leverage }} {{ item.broker_currency || 'USD' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Capital & Fees -->
                <td class="py-3.5 px-3 whitespace-nowrap">
                  <p class="font-extrabold text-primary-text text-xs">
                    {{ formatMoney(item.min_capital, item.broker_currency) }}
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    Perf: <span class="font-semibold text-primary-text">{{ formatPercent(item.performance_fee) }}</span> · Mgmt: <span class="font-semibold text-primary-text">{{ formatPercent(item.management_fee) }}</span>
                  </p>
                </td>

                <!-- Share Split -->
                <td class="py-3.5 px-3 whitespace-nowrap text-[11px]">
                  <p class="text-primary-text font-semibold">
                    Broker {{ formatPercent(item.broker_share) }} · FM {{ formatPercent(item.fm_share) }}
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    IB Pool: {{ formatPercent(item.ib_pool_percentage) }}
                  </p>
                </td>

                <!-- Status & Settlement -->
                <td class="py-3.5 px-3 whitespace-nowrap">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span
                        class="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                        :class="
                          item.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        "
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active ? 'bg-emerald-500' : 'bg-zinc-400'" />
                        {{ item.is_active ? 'Active' : 'Inactive' }}
                      </span>
                      <span
                        class="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border"
                      >
                        {{ item.visibility_type || 'public' }}
                      </span>
                      <span
                        v-if="item.user?.kyc_status"
                        class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        :class="getKycBadgeClass(item.user.kyc_status)"
                      >
                        {{ item.user.kyc_status }}
                      </span>
                    </div>
                    <p class="text-[10px] text-secondary-text capitalize">
                      {{ item.settlement || item.settlement_type }} ({{ item.settlement_time }})
                    </p>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <DropdownMenu
                    :items="getRowActions(item)"
                    @select="(menuItem) => onMenuSelect(menuItem, item)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile / Tablet List View (< md screens) -->
        <div class="block md:hidden space-y-3">
          <div
            v-for="item in filteredData"
            :key="item.id"
            class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3 shadow-2xs"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  #{{ item.id }}
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-primary-text text-sm truncate">{{ item.label_name || 'Unnamed FM' }}</p>
                  <p class="text-[11px] font-semibold text-primary truncate select-all">{{ item.user?.email || 'No email' }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1 shrink-0">
                <span
                  class="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border"
                  :class="
                    item.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                  "
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span
                  class="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border"
                >
                  {{ item.visibility_type || 'public' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs bg-background/50 border border-primary-border/60 rounded-lg p-2.5">
              <div>
                <span class="text-[10px] text-secondary-text block uppercase">Min Capital</span>
                <span class="font-bold text-primary-text">{{ formatMoney(item.min_capital, item.broker_currency) }}</span>
              </div>
              <div>
                <span class="text-[10px] text-secondary-text block uppercase">Perf Fee</span>
                <span class="font-bold text-primary">{{ formatPercent(item.performance_fee) }}</span>
              </div>
              <div>
                <span class="text-[10px] text-secondary-text block uppercase">Master Account</span>
                <span class="font-mono text-primary-text font-bold">{{ item.master_account?.account_number || `#${item.master_account_id}` }}</span>
              </div>
              <div>
                <span class="text-[10px] text-secondary-text block uppercase">Coverage Account</span>
                <span class="font-mono text-primary-text font-bold">{{ item.coverage_account?.account_number || `#${item.coverage_account_id}` }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <button
                class="px-2.5 py-1.5 rounded-lg border border-primary-border text-xs font-semibold text-primary-text flex items-center gap-1 cursor-pointer"
                @click="openDetailsDrawer(item)"
              >
                <Eye class="w-3.5 h-3.5 text-primary" /> Details
              </button>
              <DropdownMenu
                :items="getRowActions(item)"
                @select="(menuItem) => onMenuSelect(menuItem, item)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- ADD / EDIT FUND MANAGER DIALOG -->
    <AddEditFundManager
      :open="dialogOpen"
      :mode="dialogMode"
      :item="selectedItem"
      @close="dialogOpen = false"
      @success="dialogOpen = false"
    />

    <!-- FULL DETAILS SIDE DRAWER PANEL -->
    <FmDetailsDrawer
      :open="detailsDrawerOpen"
      :item="selectedDetailsItem"
      @close="detailsDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarDays,
  Edit,
  Plus,
  UserRoundPlus,
  LayoutGrid,
  List,
  Search,
  X,
  RefreshCw,
  RotateCcw,
  User,
  Clock,
  Eye,
  Mail,
  Calculator,
  Tag,
  Users,
  BookOpen
} from 'lucide-vue-next'
import { useFmLeaderboardStore } from '@/stores/fmLeaderboard/fmLeaderboard'
import Pagination from '@/components/common/Pagination.vue'
import AddEditFundManager from '@/components/fundManager/AddEditFundManager.vue'
import FmDetailsDrawer from '@/components/fundManager/FmDetailsDrawer.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import DropdownMenu from '@/components/common/DropdownMenu.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import { perPageOptions } from '@/constants/pagination'

const store = useFmLeaderboardStore()
const { hasPermission } = usePermissionCheck()
const router = useRouter()

const layoutMode = ref('grid')
const searchQuery = ref('')
const selectedVisibility = ref('ALL')
const selectedStatus = ref('ALL')
const selectedKyc = ref('ALL')

const dialogOpen = ref(false)
const dialogMode = ref('add')
const selectedItem = ref(null)

const detailsDrawerOpen = ref(false)
const selectedDetailsItem = ref(null)

const visibilityOptions = [
  { label: 'All Visibility', value: 'ALL' },
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
]

const statusOptions = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const kycOptions = [
  { label: 'All KYC Status', value: 'ALL' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
]

const hasActiveFilters = computed(() => {
  return (
    Boolean(searchQuery.value.trim()) ||
    selectedVisibility.value !== 'ALL' ||
    selectedStatus.value !== 'ALL' ||
    selectedKyc.value !== 'ALL'
  )
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedVisibility.value = 'ALL'
  selectedStatus.value = 'ALL'
  selectedKyc.value = 'ALL'
}

const filteredData = computed(() => {
  if (!store.data || !Array.isArray(store.data)) return []
  return store.data.filter((item) => {
    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchLabel = item.label_name?.toLowerCase().includes(q)
      const matchUserName = item.user?.name?.toLowerCase().includes(q)
      const matchEmail = item.user?.email?.toLowerCase().includes(q)
      const matchMasterId = String(item.master_account_id ?? '').includes(q)
      const matchMasterNo = item.master_account?.account_number?.toLowerCase().includes(q)
      const matchCoverageId = String(item.coverage_account_id ?? '').includes(q)
      const matchCoverageNo = item.coverage_account?.account_number?.toLowerCase().includes(q)
      const matchFmId = String(item.id ?? '').includes(q)

      if (!matchLabel && !matchUserName && !matchEmail && !matchMasterId && !matchMasterNo && !matchCoverageId && !matchCoverageNo && !matchFmId) {
        return false
      }
    }
    // Visibility filter
    if (selectedVisibility.value !== 'ALL') {
      if (item.visibility_type !== selectedVisibility.value) return false
    }
    // Status filter
    if (selectedStatus.value !== 'ALL') {
      const isActive = selectedStatus.value === 'active'
      if (item.is_active !== isActive) return false
    }
    // KYC filter
    if (selectedKyc.value !== 'ALL') {
      if (item.user?.kyc_status !== selectedKyc.value) return false
    }
    return true
  })
})

const formatDate = (val) => {
  if (!val) return '—'
  const date = new Date(val)
  if (isNaN(date.getTime())) return String(val)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMoney = (val, currency = '') => {
  if (val == null || val === '') return '—'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return currency ? `${currency} ${formatted}` : `$${formatted}`
}

const formatPercent = (val) => {
  if (val == null || val === '') return '0%'
  return `${val}%`
}

const getKycBadgeClass = (status) => {
  if (status === 'approved') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  if (status === 'pending') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  if (status === 'rejected') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
}

const handleAdd = () => {
  dialogMode.value = 'add'
  selectedItem.value = null
  dialogOpen.value = true
}

const handleEdit = (item) => {
  dialogMode.value = 'edit'
  selectedItem.value = item
  dialogOpen.value = true
}

const setActiveFm = (item) => {
  if (!item) return
  try {
    localStorage.setItem('active_fm', JSON.stringify(item))
  } catch (err) {
    console.error('Failed to store active FM in localStorage:', err)
  }
}

const openDetailsDrawer = (item) => {
  setActiveFm(item)
  selectedDetailsItem.value = item
  detailsDrawerOpen.value = true
}

const handlePageChange = (page) => {
  store.pagination.page = page
  store.fetchFmLeaderboard(true, page)
}

const handlePerPageChange = (val) => {
  store.updatePerPage(val)
}

const handleSettlement = (item) => {
  if (!item || item.id == null) return
  setActiveFm(item)
  router.push({ name: 'fm-settlement-preview', params: { id: item.id } })
}

const getRowActions = (item) => {
  const actions = [
    {
      action: 'details',
      label: 'Full Details',
      icon: Eye,
    },
    {
      action: 'trade-book',
      label: 'Trade Book',
      icon: BookOpen,
    },
    {
      action: 'offers',
      label: 'Offers',
      icon: Tag,
    },
    {
      action: 'followers',
      label: 'Followers / Clients',
      icon: Users,
    },
  ]

  if (hasPermission('fund_manager.view_seletement')) {
    actions.push({
      action: 'settlement',
      label: 'Settlement',
      icon: Calculator,
    })
  }

  if (hasPermission('fund_manager.update')) {
    actions.push({
      action: 'edit',
      label: 'Edit',
      icon: Edit,
    })
  }

  return actions
}

const onMenuSelect = (menuItem, item) => {
  setActiveFm(item)
  switch (menuItem.action) {
    case 'details':
      return openDetailsDrawer(item)
    case 'trade-book':
      return router.push({ name: 'fm-trade-book', params: { id: item.id } })
    case 'offers':
      return router.push({ name: 'fm-offers', params: { id: item.id } })
    case 'followers':
      return router.push({ name: 'fm-followers', params: { id: item.id } })
    case 'settlement':
      return handleSettlement(item)
    case 'edit':
      return handleEdit(item)
  }
}

onMounted(() => {
  store.fetchFmLeaderboard()
})
</script>
