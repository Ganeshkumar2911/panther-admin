<template>
  <div class="space-y-6 py-2">
    <!-- Top Context & Identity Banner -->
    <div class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6 shadow-2xs relative overflow-hidden">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <!-- Left: Identity Details -->
        <div class="flex items-start sm:items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <BookOpen class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-lg sm:text-xl font-bold text-primary-text tracking-tight truncate">
                {{ headerTitle }}
              </h1>

              <!-- Mode Badge -->
              <span
                class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs"
                :class="isFollowerMode
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-primary/10 text-primary border-primary/20'"
              >
                {{ isFollowerMode ? 'Follower Trade Book' : 'FM Master Trade Book' }}
              </span>

              <!-- Status Badge -->
              <span
                v-if="activeStatus !== null"
                class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                :class="activeStatus
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="activeStatus ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'" />
                {{ activeStatus ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Meta Information Subtitle Row -->
            <div class="flex items-center gap-3 text-xs text-secondary-text mt-2 flex-wrap font-medium">
              <span v-if="accountNumber" class="inline-flex items-center gap-1 font-mono font-bold text-primary-text">
                <Layers class="w-3.5 h-3.5 text-primary" />
                Account #{{ accountNumber }}
              </span>

              <span v-if="userEmail" class="flex items-center gap-1 font-mono text-primary font-semibold select-all">
                <Mail class="w-3.5 h-3.5 text-secondary-text" />
                {{ userEmail }}
              </span>

              <span v-if="brokerGroup" class="flex items-center gap-1 font-mono text-secondary-text">
                <Server class="w-3.5 h-3.5 text-secondary-text" />
                {{ brokerGroup }}
              </span>

              <span v-if="leverageOrRatio" class="text-xs font-bold text-primary">
                {{ leverageOrRatio }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              class="p-2 rounded-lg border border-primary-border bg-background text-secondary-text hover:text-primary-text hover:bg-card-background transition-colors cursor-pointer shadow-2xs"
              :disabled="store.isLoading || store.isRefreshing"
              @click="store.fetchTradesData(true)"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.isRefreshing || store.isLoading }" />
            </button>
        </div>
      </div>

      <!-- KPI Summary Ribbon Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-primary-border/60">
        <!-- 1. Total Positions / Trades -->
        <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Total Positions</span>
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ store.summary.total_positions || store.summary.total_trades || 0 }}
          </p>
        </div>

        <!-- 2. Open Positions -->
        <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Open Positions</span>
            <Clock class="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p class="text-xl font-extrabold text-amber-500 font-mono">
            {{ store.summary.open_positions || 0 }}
          </p>
        </div>

        <!-- 3. Closed Positions -->
        <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Closed Positions</span>
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ store.summary.closed_positions || 0 }}
          </p>
        </div>

        <!-- 4. Total Traded Volume -->
        <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Total Volume</span>
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ formatLot(store.summary.total_lot || store.summary.total_volume) }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <!-- 5. Net Realized / Total PnL -->
        <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background col-span-2 sm:col-span-1">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Net PnL</span>
            <TrendingUp v-if="(store.summary.total_pnl || 0) >= 0" class="w-3.5 h-3.5 text-emerald-500" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="(store.summary.total_pnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'"
          >
            {{ formatPnl(store.summary.total_pnl) }}
          </p>
        </div>
      </div>
    </div>

    <!-- TABS BAR & FILTERS SECTION -->
    <div class="bg-card-background border border-primary-border rounded-lg p-4 space-y-4 shadow-2xs">
      <!-- Tabs Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-border pb-3">
        <div class="flex items-center gap-1.5">
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="store.activeTab === 'positions'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="store.setActiveTab('positions')"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Positions</span>
            <span
              v-if="store.positions.length > 0"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="store.activeTab === 'positions' ? 'bg-white/20 text-white' : 'bg-card-background text-secondary-text'"
            >
              {{ store.positions.length }}
            </span>
          </button>

          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="store.activeTab === 'orders'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="store.setActiveTab('orders')"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>Orders</span>
            <span
              v-if="store.orders.length > 0"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="store.activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-card-background text-secondary-text'"
            >
              {{ store.orders.length }}
            </span>
          </button>

          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="store.activeTab === 'deals'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="store.setActiveTab('deals')"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Deals History</span>
            <span
              v-if="store.deals.length > 0"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="store.activeTab === 'deals' ? 'bg-white/20 text-white' : 'bg-card-background text-secondary-text'"
            >
              {{ store.deals.length }}
            </span>
          </button>
        </div>

        <div class="text-[11px] text-secondary-text font-medium">
          Viewing <strong class="text-primary-text font-mono capitalize">{{ store.activeTab }}</strong> records
        </div>
      </div>

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none" />
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search symbol, ticket, account..."
            class="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary transition-colors font-medium"
            @input="handleSearch($event.target.value)"
          />
          <button
            v-if="searchInput"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
            @click="clearSearch"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Dropdowns & Datepicker Controls -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Status Filter -->
          <div class="w-32">
            <BaseSelect
              :modelValue="store.filters.status"
              :options="statusOptions"
              placeholder="Status"
              @update:modelValue="store.setStatusFilter"
            />
          </div>

          <!-- Type Filter -->
          <div class="w-28">
            <BaseSelect
              :modelValue="store.filters.type"
              :options="typeOptions"
              placeholder="Side / Type"
              @update:modelValue="store.setTypeFilter"
            />
          </div>

          <!-- Date Range Filter -->
          <div class="w-56">
            <BaseDatePicker
              :modelValue="dateRange"
              range
              placeholder="Select date range"
              valueFormat="YYYY-MM-DD"
              @update:modelValue="handleDateRangeChange"
              @clear="handleDateRangeClear"
            />
          </div>

          <!-- Reset Filter Button -->
          <button
            v-if="hasActiveFilters"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:border-primary/40 transition-colors cursor-pointer shadow-2xs"
            @click="handleResetFilters"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN DATA TABLE -->
    <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <!-- 1. POSITIONS TABLE -->
        <table v-if="store.activeTab === 'positions'" class="w-full border-collapse text-left text-xs min-w-[960px]">
          <thead>
            <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4">Ticket / Position ID</th>
              <th class="py-3 px-3">Account</th>
              <th class="py-3 px-3">Symbol</th>
              <th class="py-3 px-3">Type</th>
              <th class="py-3 px-3">Status</th>
              <th class="py-3 px-3 text-right">Volume (Lots)</th>
              <th class="py-3 px-3 text-right">Entry Price</th>
              <th class="py-3 px-3 text-right">Exit / Current</th>
              <th class="py-3 px-3 text-right">PnL ($)</th>
              <th class="py-3 px-3 text-right">Opened Time</th>
              <th class="py-3 px-4 text-right">Closed Time</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60">
            <!-- Loading Skeleton -->
            <template v-if="store.isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td v-for="c in 11" :key="c" class="py-4 px-3">
                  <div class="h-4 bg-background rounded w-3/4" />
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="store.positions.length === 0">
              <tr>
                <td colspan="11" class="py-16 px-4 text-center">
                  <div class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2 text-secondary-text">
                    <BookOpen class="w-8 h-8 opacity-40 mb-1" />
                    <p class="text-sm font-bold text-primary-text">No positions found</p>
                    <p class="text-xs">
                      {{ hasActiveFilters ? 'No positions match your current search filters.' : 'There are currently no position records available.' }}
                    </p>
                    <button
                      v-if="hasActiveFilters"
                      class="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer mt-2"
                      @click="handleResetFilters"
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr
                v-for="item in store.positions"
                :key="item.id || item.mt5_position_id || item.ticket"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Ticket ID -->
                <td class="py-3 px-4 font-mono font-bold text-primary select-all">
                  #{{ item.mt5_position_id || item.ticket || item.id }}
                </td>

                <!-- Account -->
                <td class="py-3 px-3 font-mono font-bold text-primary-text">
                  {{ item.account_number || item.account_id || accountNumber || '—' }}
                </td>

                <!-- Symbol -->
                <td class="py-3 px-3 font-bold text-primary-text">
                  {{ item.symbol }}
                </td>

                <!-- Type -->
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
                    :class="String(item.type || item.order_type || '').toUpperCase() === 'BUY'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                  >
                    {{ item.type || item.order_type || 'BUY' }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                    :class="String(item.status || '').toUpperCase() === 'OPEN'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
                  >
                    <span
                      v-if="String(item.status || '').toUpperCase() === 'OPEN'"
                      class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                    />
                    {{ item.status || 'OPEN' }}
                  </span>
                </td>

                <!-- Volume -->
                <td class="py-3 px-3 text-right font-mono font-bold text-primary-text">
                  {{ formatLot(item.lot ?? item.volume ?? item.total_lot) }}
                </td>

                <!-- Entry Price -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(item.entry_price || item.price_open || item.open_price) }}
                </td>

                <!-- Exit Price -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(item.exit_price || item.price_current || item.close_price) }}
                </td>

                <!-- PnL -->
                <td class="py-3 px-3 text-right font-mono font-bold">
                  <span
                    :class="Number(getTradePnl(item)) >= 0 ? 'text-emerald-500' : 'text-rose-500'"
                  >
                    {{ formatPnl(getTradePnl(item)) }}
                  </span>
                </td>

                <!-- Opened Time -->
                <td class="py-3 px-3 text-right font-medium text-secondary-text whitespace-nowrap">
                  {{ formatDate(item.created_at || item.open_time || item.time_open) }}
                </td>

                <!-- Closed Time -->
                <td class="py-3 px-4 text-right font-medium text-secondary-text whitespace-nowrap">
                  {{ item.closed_at || item.close_time ? formatDate(item.closed_at || item.close_time) : '—' }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 2. ORDERS TABLE -->
        <table v-else-if="store.activeTab === 'orders'" class="w-full border-collapse text-left text-xs min-w-[960px]">
          <thead>
            <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4">Order ID</th>
              <th class="py-3 px-3">Account</th>
              <th class="py-3 px-3">Symbol</th>
              <th class="py-3 px-3">Order Type</th>
              <th class="py-3 px-3">State</th>
              <th class="py-3 px-3 text-right">Initial Volume</th>
              <th class="py-3 px-3 text-right">Current Volume</th>
              <th class="py-3 px-3 text-right">Price Open</th>
              <th class="py-3 px-3 text-right">SL / TP</th>
              <th class="py-3 px-4 text-right">Setup Time</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60">
            <!-- Loading Skeleton -->
            <template v-if="store.isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td v-for="c in 10" :key="c" class="py-4 px-3">
                  <div class="h-4 bg-background rounded w-3/4" />
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="store.orders.length === 0">
              <tr>
                <td colspan="10" class="py-16 px-4 text-center">
                  <div class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2 text-secondary-text">
                    <Clock class="w-8 h-8 opacity-40 mb-1" />
                    <p class="text-sm font-bold text-primary-text">No orders found</p>
                    <p class="text-xs">
                      {{ hasActiveFilters ? 'No orders match your current filters.' : 'There are currently no orders recorded.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr
                v-for="order in store.orders"
                :key="order.id || order.order_id"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Order ID -->
                <td class="py-3 px-4 font-mono font-bold text-primary select-all">
                  #{{ order.order_id || order.id }}
                </td>

                <!-- Account -->
                <td class="py-3 px-3 font-mono font-bold text-primary-text">
                  {{ order.account_number || order.account_id || accountNumber || '—' }}
                </td>

                <!-- Symbol -->
                <td class="py-3 px-3 font-bold text-primary-text">
                  {{ order.symbol }}
                </td>

                <!-- Order Type -->
                <td class="py-3 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border bg-primary/10 text-primary border-primary/20">
                    {{ order.type || order.order_type || 'ORDER' }}
                  </span>
                </td>

                <!-- State -->
                <td class="py-3 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-background text-secondary-text border-primary-border">
                    {{ order.state || order.status || 'PENDING' }}
                  </span>
                </td>

                <!-- Initial Volume -->
                <td class="py-3 px-3 text-right font-mono font-bold text-primary-text">
                  {{ formatLot(order.volume_initial || order.lot || order.volume) }}
                </td>

                <!-- Current Volume -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatLot(order.volume_current || order.volume_remaining || order.lot || 0) }}
                </td>

                <!-- Price Open -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(order.price_open || order.price) }}
                </td>

                <!-- SL / TP -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text text-[11px]">
                  {{ formatPrice(order.sl) }} / {{ formatPrice(order.tp) }}
                </td>

                <!-- Setup Time -->
                <td class="py-3 px-4 text-right font-medium text-secondary-text whitespace-nowrap">
                  {{ formatDate(order.time_setup || order.created_at) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 3. DEALS HISTORY TABLE -->
        <table v-else-if="store.activeTab === 'deals'" class="w-full border-collapse text-left text-xs min-w-[960px]">
          <thead>
            <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4">Deal ID</th>
              <th class="py-3 px-3">Position ID</th>
              <th class="py-3 px-3">Account</th>
              <th class="py-3 px-3">Symbol</th>
              <th class="py-3 px-3">Side</th>
              <th class="py-3 px-3">Entry</th>
              <th class="py-3 px-3 text-right">Volume</th>
              <th class="py-3 px-3 text-right">Executed Price</th>
              <th class="py-3 px-3 text-right">Profit / PnL</th>
              <th class="py-3 px-3 text-right">Commission / Fee</th>
              <th class="py-3 px-4 text-right">Execution Time</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60">
            <!-- Loading Skeleton -->
            <template v-if="store.isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td v-for="c in 11" :key="c" class="py-4 px-3">
                  <div class="h-4 bg-background rounded w-3/4" />
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="store.deals.length === 0">
              <tr>
                <td colspan="11" class="py-16 px-4 text-center">
                  <div class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2 text-secondary-text">
                    <CheckCircle2 class="w-8 h-8 opacity-40 mb-1" />
                    <p class="text-sm font-bold text-primary-text">No deal history found</p>
                    <p class="text-xs">
                      {{ hasActiveFilters ? 'No deals match your current filters.' : 'There are currently no deals recorded.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr
                v-for="deal in store.deals"
                :key="deal.id || deal.deal_id"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Deal ID -->
                <td class="py-3 px-4 font-mono font-bold text-primary select-all">
                  #{{ deal.deal_id || deal.id }}
                </td>

                <!-- Position ID -->
                <td class="py-3 px-3 font-mono text-secondary-text">
                  #{{ deal.position_id || deal.mt5_position_id || '—' }}
                </td>

                <!-- Account -->
                <td class="py-3 px-3 font-mono font-bold text-primary-text">
                  {{ deal.account_number || deal.account_id || accountNumber || '—' }}
                </td>

                <!-- Symbol -->
                <td class="py-3 px-3 font-bold text-primary-text">
                  {{ deal.symbol }}
                </td>

                <!-- Side -->
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
                    :class="String(deal.type || deal.side || '').toUpperCase() === 'BUY'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                  >
                    {{ deal.type || deal.side || 'BUY' }}
                  </span>
                </td>

                <!-- Entry (IN / OUT) -->
                <td class="py-3 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-background text-secondary-text border-primary-border">
                    {{ deal.entry || 'IN' }}
                  </span>
                </td>

                <!-- Volume -->
                <td class="py-3 px-3 text-right font-mono font-bold text-primary-text">
                  {{ formatLot(deal.volume || deal.lot) }}
                </td>

                <!-- Executed Price -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(deal.price || deal.execution_price) }}
                </td>

                <!-- Profit -->
                <td class="py-3 px-3 text-right font-mono font-bold">
                  <span :class="Number(deal.profit || deal.pnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                    {{ formatPnl(deal.profit || deal.pnl) }}
                  </span>
                </td>

                <!-- Fee / Commission -->
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  ${{ formatPrice(deal.commission || deal.fee || 0) }}
                </td>

                <!-- Execution Time -->
                <td class="py-3 px-4 text-right font-medium text-secondary-text whitespace-nowrap">
                  {{ formatDate(deal.time || deal.created_at) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="!store.isLoading && currentListCount > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-primary-border bg-background/30"
      >
        <!-- Per page selector -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-secondary-text">Per page:</span>
          <div class="w-20">
            <BaseSelect
              :modelValue="store.pagination.per_page"
              :options="perPageOptions"
              :dropUp="true"
              @update:modelValue="store.setPerPage"
            />
          </div>
          <span class="text-xs text-secondary-text ml-2">
            Showing
            {{ (store.pagination.page - 1) * store.pagination.per_page + 1 }} -
            {{ Math.min(store.pagination.page * store.pagination.per_page, store.pagination.total_items) }}
            of {{ store.pagination.total_items }} records
          </span>
        </div>

        <!-- Pagination Controls -->
        <Pagination
          v-if="store.pagination.total_pages > 1"
          :pagination="store.pagination"
          @page-change="store.setPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BookOpen, RefreshCw, Activity, Clock, CheckCircle2, DollarSign,
  TrendingUp, TrendingDown, Search, X, RotateCcw, ArrowLeft,
  Layers, Mail, Server
} from 'lucide-vue-next'
import { useFmTradeBookStore } from '@/stores/fmTradeBook/fmTradeBook'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'
import Pagination from '@/components/common/Pagination.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { formatDate } from '@/utils/timeFormatter.js'
import { livePNL } from '@/utils/livePNL.js'

const store = useFmTradeBookStore()
const route = useRoute()
const router = useRouter()

const searchInput = ref('')
const dateRange = ref(null)

// Mode detection: checks route name and params
const isFollowerMode = computed(() => {
  return route.name === 'follower-trade-book' || route.path.includes('/follower/trade-book')
})

const activeStatus = computed(() => {
  if (store.accountInfo) {
    return store.accountInfo.is_active ?? (store.accountInfo.status === 'active')
  }
  return true
})

const headerTitle = computed(() => {
  if (isFollowerMode.value) {
    return store.accountInfo?.name || store.accountInfo?.user_name || 'Follower Account'
  }
  return store.accountInfo?.label_name || 'Fund Manager Master Account'
})

const accountNumber = computed(() => {
  return (
    store.accountInfo?.account_number ||
    store.accountInfo?.master_account?.account_number ||
    route.query.account_number ||
    null
  )
})

const userEmail = computed(() => {
  return store.accountInfo?.email || store.accountInfo?.user_email || store.accountInfo?.user?.email || null
})

const brokerGroup = computed(() => {
  return store.accountInfo?.broker_group || store.accountInfo?.server || null
})

const leverageOrRatio = computed(() => {
  if (isFollowerMode.value) {
    return store.accountInfo?.lot_type ? `Lot: ${store.accountInfo.lot_type} (${store.accountInfo.lot_value ?? '1.0'})` : null
  }
  return store.accountInfo?.broker_leverage ? `1:${store.accountInfo.broker_leverage} ${store.accountInfo.broker_currency || 'USD'}` : null
})

const currentListCount = computed(() => {
  if (store.activeTab === 'positions') return store.positions.length
  if (store.activeTab === 'orders') return store.orders.length
  if (store.activeTab === 'deals') return store.deals.length
  return 0
})

const statusOptions = computed(() => {
  if (store.activeTab === 'orders') {
    return [
      { label: 'All Statuses', value: '' },
      { label: 'PENDING', value: 'PENDING' },
      { label: 'PLACED', value: 'PLACED' },
      { label: 'CANCELLED', value: 'CANCELLED' },
      { label: 'FILLED', value: 'FILLED' },
    ]
  }
  return [
    { label: 'All Statuses', value: '' },
    { label: 'OPEN', value: 'OPEN' },
    { label: 'CLOSED', value: 'CLOSED' },
  ]
})

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'BUY', value: 'BUY' },
  { label: 'SELL', value: 'SELL' },
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const hasActiveFilters = computed(() => {
  return (
    store.filters.search !== '' ||
    store.filters.status !== '' ||
    store.filters.type !== '' ||
    store.filters.start_date !== '' ||
    store.filters.end_date !== '' ||
    dateRange.value !== null
  )
})

const handleSearch = (val) => {
  searchInput.value = val
  store.setSearch(val)
}

const clearSearch = () => {
  searchInput.value = ''
  store.setSearch('')
}

const handleDateRangeChange = (val) => {
  dateRange.value = val
  if (Array.isArray(val) && val.length === 2) {
    store.setDateFilter(val[0], val[1])
  } else if (val && typeof val === 'object' && val.start && val.end) {
    store.setDateFilter(val.start, val.end)
  } else if (!val) {
    store.setDateFilter('', '')
  }
}

const handleDateRangeClear = () => {
  dateRange.value = null
  store.setDateFilter('', '')
}

const handleResetFilters = () => {
  searchInput.value = ''
  dateRange.value = null
  store.resetFilters()
}

const formatPrice = (val) => {
  if (val === null || val === undefined || val === '') return '—'
  const num = Number(val)
  if (isNaN(num)) return '—'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  })
}

const formatLot = (val) => {
  if (val === null || val === undefined || val === '') return '0.00'
  const num = Number(val)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

const formatPnl = (val) => {
  if (val === null || val === undefined || val === '') return '$0.00'
  const num = Number(val)
  if (isNaN(num)) return '$0.00'
  const prefix = num >= 0 ? '+$' : '-$'
  return `${prefix}${Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const getTradePnl = (trade) => {
  return livePNL(trade)
}

const goBack = () => {
  if (isFollowerMode.value) {
    const fmId = route.query.fm_id
    if (fmId) {
      router.push(`/fm/followers/${fmId}`)
    } else {
      router.back()
    }
  } else {
    router.push('/fm-leaderboard')
  }
}

const initContext = () => {
  const targetId = route.params.id
  let parsedInfo = null

  if (isFollowerMode.value) {
    store.setContext({
      type: 'follower',
      id: targetId,
      info: null,
    })
    store.fetchFollowerInfo(targetId)
  } else {
    try {
      const raw = localStorage.getItem('active_fm')
      if (raw) {
        parsedInfo = JSON.parse(raw)
      }
    } catch (e) {
      console.warn('Could not read active_fm from storage:', e)
    }

    store.setContext({
      type: 'fm',
      id: targetId,
      info: parsedInfo,
    })
  }

  store.fetchFilters()
  store.fetchTradesData()
}

onMounted(() => {
  initContext()
})

onUnmounted(() => {
  store.resetAll()
})
</script>
