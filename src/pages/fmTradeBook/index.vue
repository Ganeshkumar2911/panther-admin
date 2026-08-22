<template>
  <div class="space-y-6 pb-12">
    <!-- TOP HEADER / BREADCRUMB CARD -->
    <div
      class="bg-card-background border border-primary-border rounded-lg p-5 shadow-2xs"
    >
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <!-- Left Title & Meta -->
        <div class="flex items-center gap-3">
          <button
            class="p-2 rounded-lg border border-primary-border bg-background text-secondary-text hover:text-primary-text hover:bg-card-background transition-colors cursor-pointer"
            @click="goBack"
            title="Go Back"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>

          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1
                class="text-lg font-bold text-primary-text flex items-center gap-2"
              >
                <BookOpen class="w-5 h-5 text-primary" />
                {{ headerTitle }}
              </h1>

              <!-- Mode Badge -->
              <span
                class="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border"
                :class="
                  isFollowerMode
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                "
              >
                {{ isFollowerMode ? "Follower Trade Book" : "FM Trade Book" }}
              </span>

              <!-- Live Account Status -->
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                :class="
                  activeStatus
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="activeStatus ? 'bg-emerald-500' : 'bg-zinc-500'"
                />
                {{ activeStatus ? "Active" : "Inactive" }}
              </span>
            </div>

            <div
              class="flex items-center gap-4 text-xs text-secondary-text mt-1.5 flex-wrap"
            >
              <span
                v-if="accountNumber"
                class="flex items-center gap-1 font-mono font-semibold text-primary-text"
              >
                <span class="text-secondary-text">Account:</span>
                #{{ accountNumber }}
              </span>

              <span
                v-if="brokerGroup"
                class="flex items-center gap-1 font-mono text-secondary-text"
              >
                <Server class="w-3.5 h-3.5 text-secondary-text" />
                {{ brokerGroup }}
              </span>

              <span
                v-if="leverageOrRatio"
                class="text-xs font-bold text-primary"
              >
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
            title="Refresh Data"
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.isRefreshing || store.isLoading }"
            />
          </button>
        </div>
      </div>

      <!-- KPI Summary Ribbon Cards (Specific to Mode & Active Tab) -->
      <!-- FM MASTER TRADES MODE -->
      <div
        v-if="!isFollowerMode"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Trades</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.total_trades ?? store.summary.total_positions ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Open Trades</span
            >
            <Clock class="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p class="text-xl font-extrabold text-amber-500 font-mono">
            {{ store.summary.open_trades ?? store.summary.open_positions ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Closed Trades</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.closed_trades ?? store.summary.closed_positions ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(store.summary.total_lot ?? store.summary.total_volume)
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background col-span-2 sm:col-span-1"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Net PnL</span
            >
            <TrendingUp
              v-if="
                Number(
                  store.summary.total_pnl ?? store.summary.total_profit ?? 0,
                ) >= 0
              "
              class="w-3.5 h-3.5 text-emerald-500"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="
              Number(
                store.summary.total_pnl ?? store.summary.total_profit ?? 0,
              ) >= 0
                ? 'text-emerald-500'
                : 'text-rose-500'
            "
          >
            {{
              formatPnl(store.summary.total_pnl ?? store.summary.total_profit)
            }}
          </p>
        </div>
      </div>

      <!-- FOLLOWER MODE: POSITIONS TAB (6 KPI Cards) -->
      <div
        v-else-if="store.activeTab === 'positions'"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Positions</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.total_positions ?? store.summary.total_trades ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Open Positions</span
            >
            <Clock class="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p class="text-xl font-extrabold text-amber-500 font-mono">
            {{ store.summary.open_positions ?? store.summary.open_trades ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Closed Positions</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.closed_positions ?? store.summary.closed_trades ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Win Rate</span
            >
            <TrendingUp class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div class="flex items-baseline gap-1.5">
            <p class="text-xl font-extrabold text-emerald-500 font-mono">
              {{
                store.summary.win_rate != null
                  ? Number(store.summary.win_rate).toFixed(1) + "%"
                  : "-"
              }}
            </p>
            <span
              v-if="
                store.summary.winning_positions !== undefined ||
                store.summary.winning_trades !== undefined
              "
              class="text-[10px] font-semibold text-secondary-text"
            >
              ({{
                store.summary.winning_positions ??
                store.summary.winning_trades ??
                0
              }}W/{{
                store.summary.losing_positions ??
                store.summary.losing_trades ??
                0
              }}L)
            </span>
          </div>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(
                store.summary.total_volume ??
                  store.summary.total_lot ??
                  store.summary.total_lots,
              )
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Profit</span
            >
            <TrendingUp
              v-if="
                Number(
                  store.summary.total_profit ?? store.summary.total_pnl ?? 0,
                ) >= 0
              "
              class="w-3.5 h-3.5 text-emerald-500"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="
              Number(
                store.summary.total_profit ?? store.summary.total_pnl ?? 0,
              ) >= 0
                ? 'text-emerald-500'
                : 'text-rose-500'
            "
          >
            {{
              formatPnl(store.summary.total_profit ?? store.summary.total_pnl)
            }}
          </p>
        </div>
      </div>

      <!-- FOLLOWER MODE: ORDERS TAB (5 KPI Cards) -->
      <div
        v-else-if="store.activeTab === 'orders'"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Orders</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ store.summary.total_orders ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Filled Orders</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p class="text-xl font-extrabold text-emerald-500 font-mono">
            {{ store.summary.filled_orders ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Rejected Orders</span
            >
            <X class="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p class="text-xl font-extrabold text-rose-500 font-mono">
            {{ store.summary.rejected_orders ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(
                store.summary.total_volume ??
                  store.summary.total_lot ??
                  store.summary.total_lots,
              )
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background col-span-2 sm:col-span-1"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Fill Rate</span
            >
            <TrendingUp class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.total_orders
                ? Math.round(
                    ((store.summary.filled_orders || 0) /
                      store.summary.total_orders) *
                      100,
                  ) + "%"
                : "-"
            }}
          </p>
        </div>
      </div>

      <!-- FOLLOWER MODE: DEALS TAB (6 KPI Cards) -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Deals</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ store.summary.total_deals ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >IN Deals</span
            >
            <Clock class="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p class="text-xl font-extrabold text-amber-500 font-mono">
            {{ store.summary.in_deals ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >OUT Deals</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p class="text-xl font-extrabold text-emerald-500 font-mono">
            {{ store.summary.out_deals ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(
                store.summary.total_volume ??
                  store.summary.total_lot ??
                  store.summary.total_lots,
              )
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Commission / Storage</span
            >
            <DollarSign class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <p class="text-sm font-extrabold text-primary-text font-mono mt-1">
            {{ formatCurrency(store.summary.total_commission || 0) }}
            <span class="text-[10px] text-secondary-text font-normal"
              >/ {{ formatCurrency(store.summary.total_storage || 0) }}</span
            >
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Profit</span
            >
            <TrendingUp
              v-if="
                Number(
                  store.summary.total_profit ?? store.summary.total_pnl ?? 0,
                ) >= 0
              "
              class="w-3.5 h-3.5 text-emerald-500"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="
              Number(
                store.summary.total_profit ?? store.summary.total_pnl ?? 0,
              ) >= 0
                ? 'text-emerald-500'
                : 'text-rose-500'
            "
          >
            {{
              formatPnl(store.summary.total_profit ?? store.summary.total_pnl)
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- TABS BAR & FILTERS SECTION -->
    <div
      class="bg-card-background border border-primary-border rounded-lg p-4 space-y-4 shadow-2xs"
    >
      <!-- Tabs Switcher -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-border pb-3"
      >
        <!-- For FM Master Trade Book: Show Single Master Trades Tab -->
        <div v-if="!isFollowerMode" class="flex items-center gap-1.5">
          <div
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 bg-primary text-white shadow-xs"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Master Trades</span>
            <span
              v-if="
                store.positions.length > 0 || store.pagination.total_items > 0
              "
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-white/20 text-white"
            >
              {{
                store.summary.total_positions ??
                store.summary.total_trades ??
                store.pagination.total_items ??
                store.positions.length
              }}
            </span>
          </div>
        </div>

        <!-- For Follower Trade Book: Show 3 Multi-Tabs -->
        <div v-else class="flex items-center gap-1.5">
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="
              store.activeTab === 'positions'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="store.setActiveTab('positions')"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Positions</span>
            <span
              v-if="positionsBadgeCount > 0"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="
                store.activeTab === 'positions'
                  ? 'bg-white/20 text-white'
                  : 'bg-card-background text-secondary-text'
              "
            >
              {{ positionsBadgeCount }}
            </span>
          </button>

          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="
              store.activeTab === 'orders'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="store.setActiveTab('orders')"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>Orders</span>
            <span
              v-if="ordersBadgeCount > 0"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="
                store.activeTab === 'orders'
                  ? 'bg-white/20 text-white'
                  : 'bg-card-background text-secondary-text'
              "
            >
              {{ ordersBadgeCount }}
            </span>
          </button>

          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="
              store.activeTab === 'deals'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="store.setActiveTab('deals')"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Deals History</span>
            <span
              v-if="dealsBadgeCount > 0"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="
                store.activeTab === 'deals'
                  ? 'bg-white/20 text-white'
                  : 'bg-card-background text-secondary-text'
              "
            >
              {{ dealsBadgeCount }}
            </span>
          </button>
        </div>

        <div class="text-[11px] text-secondary-text font-medium">
          Viewing
          <strong class="text-primary-text font-mono capitalize">{{
            isFollowerMode ? store.activeTab : "Master Trades"
          }}</strong>
          records
        </div>
      </div>

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-50 max-w-sm">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none"
          />
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
          <!-- Status / State / Entry Filter (Dynamic per active Tab) -->
          <div class="w-36">
            <BaseSelect
              :modelValue="store.filters.status"
              :options="statusOptions"
              :placeholder="statusPlaceholder"
              @update:modelValue="store.setStatusFilter"
            />
          </div>

          <!-- Type / Action Filter -->
          <div class="w-32">
            <BaseSelect
              :modelValue="store.filters.type"
              :options="typeOptions"
              placeholder="Side / Action"
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
    <div
      class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs"
    >
      <div class="overflow-x-auto">
        <!-- 1. POSITIONS TABLE (Used for both FM Master Trades and Follower Positions) -->
        <table
          v-if="store.activeTab === 'positions'"
          class="w-full border-collapse text-left text-xs min-w-240"
        >
          <thead>
            <tr
              class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]"
            >
              <th class="py-3 px-4">Ticket / Position ID</th>
              <th class="py-3 px-3">Account</th>
              <th class="py-3 px-3">Symbol</th>
              <th class="py-3 px-3">Type</th>
              <th class="py-3 px-3">Status</th>
              <th class="py-3 px-3 text-right">Volume (Lots)</th>
              <th class="py-3 px-3 text-right">Entry Price</th>
              <th class="py-3 px-3 text-right">Exit Price</th>
              <th class="py-3 px-3 text-right">PnL ({{ currencySymbol }})</th>
              <th class="py-3 px-3 text-right">Opened Time</th>
              <th class="py-3 px-4 text-right">Closed Time</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60">
            <template v-if="store.isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td v-for="c in 11" :key="c" class="py-4 px-3">
                  <div class="h-4 bg-background rounded w-3/4" />
                </td>
              </tr>
            </template>

            <template v-else-if="store.positions.length === 0">
              <tr>
                <td colspan="11" class="py-16 px-4 text-center">
                  <div
                    class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2 text-secondary-text"
                  >
                    <BookOpen class="w-8 h-8 opacity-40 mb-1" />
                    <p class="text-sm font-bold text-primary-text">
                      No positions found
                    </p>
                    <p class="text-xs">
                      {{
                        hasActiveFilters
                          ? "No positions match your current search filters."
                          : "There are currently no position records available."
                      }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else>
              <tr
                v-for="item in store.positions"
                :key="item.id || item.position_ticket"
                class="hover:bg-background/40 transition-colors"
              >
                <td
                  class="py-3 px-4 font-mono font-bold text-primary select-all"
                >
                  #{{ item.position_ticket || item.id || "-" }}
                </td>
                <td class="py-3 px-3 font-mono font-bold text-primary-text">
                  {{ item.account_number || "-" }}
                </td>
                <td class="py-3 px-3 font-bold text-primary-text">
                  {{ item.symbol || "-" }}
                </td>
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
                    :class="
                      item.action_name === 'BUY' ||
                      item.action === 0 ||
                      item.type === 'BUY'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    "
                  >
                    {{
                      item.action_name ||
                      (item.action === 0
                        ? "BUY"
                        : item.action === 1
                          ? "SELL"
                          : item.type || "-")
                    }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                    :class="
                      String(item.status || '').toUpperCase() === 'OPEN'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                    "
                  >
                    <span
                      v-if="String(item.status || '').toUpperCase() === 'OPEN'"
                      class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                    />
                    {{ item.status || (item.is_open ? "OPEN" : "CLOSED") }}
                  </span>
                </td>
                <td
                  class="py-3 px-3 text-right font-mono font-bold text-primary-text"
                >
                  {{ formatLot(getTradeLot(item)) }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{
                    formatPrice(
                      item.price_open ??
                        item.entry_price ??
                        item.price_position ??
                        item.price,
                    )
                  }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(item.price_close ?? item.exit_price) }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                  <span
                    class="tabular-nums transition-colors duration-200"
                    :class="
                      Number(livePNL(item)) >= 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    "
                  >
                    {{ formatPnl(livePNL(item)) }}
                  </span>
                </td>
                <td
                  class="py-3 px-3 text-right font-medium text-secondary-text whitespace-nowrap"
                >
                  {{
                    formatDate(
                      item.time_create || item.created_at || item.time_open,
                    )
                  }}
                </td>
                <td
                  class="py-3 px-4 text-right font-medium text-secondary-text whitespace-nowrap"
                >
                  {{
                    item.time_close || item.closed_at || item.time_closed
                      ? formatDate(
                          item.time_close || item.closed_at || item.time_closed,
                        )
                      : "-"
                  }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 2. ORDERS TABLE (Follower Mode) -->
        <table
          v-else-if="store.activeTab === 'orders'"
          class="w-full border-collapse text-left text-xs min-w-240"
        >
          <thead>
            <tr
              class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]"
            >
              <th class="py-3 px-4">Order Ticket</th>
              <th class="py-3 px-3">Position Ticket</th>
              <th class="py-3 px-3">Account</th>
              <th class="py-3 px-3">Symbol</th>
              <th class="py-3 px-3">Side</th>
              <th class="py-3 px-3">State</th>
              <th class="py-3 px-3 text-right">Initial Vol</th>
              <th class="py-3 px-3 text-right">Current Vol</th>
              <th class="py-3 px-3 text-right">Order Price</th>
              <th class="py-3 px-3 text-right">Current Price</th>
              <th class="py-3 px-3 text-right">Setup Time</th>
              <th class="py-3 px-4 text-right">Done Time</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60">
            <template v-if="store.isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td v-for="c in 12" :key="c" class="py-4 px-3">
                  <div class="h-4 bg-background rounded w-3/4" />
                </td>
              </tr>
            </template>

            <template v-else-if="store.orders.length === 0">
              <tr>
                <td colspan="12" class="py-16 px-4 text-center">
                  <div
                    class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2 text-secondary-text"
                  >
                    <Clock class="w-8 h-8 opacity-40 mb-1" />
                    <p class="text-sm font-bold text-primary-text">
                      No orders found
                    </p>
                    <p class="text-xs">
                      {{
                        hasActiveFilters
                          ? "No orders match your current filters."
                          : "There are currently no orders recorded."
                      }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else>
              <tr
                v-for="order in store.orders"
                :key="order.id || order.order_ticket"
                class="hover:bg-background/40 transition-colors"
              >
                <td
                  class="py-3 px-4 font-mono font-bold text-primary select-all"
                >
                  #{{ order.order_ticket || order.id || "-" }}
                </td>
                <td class="py-3 px-3 font-mono text-secondary-text">
                  #{{ order.position_ticket || "-" }}
                </td>
                <td class="py-3 px-3 font-mono font-bold text-primary-text">
                  {{ order.account_number || "-" }}
                </td>
                <td class="py-3 px-3 font-bold text-primary-text">
                  {{ order.symbol || "-" }}
                </td>
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
                    :class="
                      order.type_name === 'BUY' ||
                      order.type === 0 ||
                      order.action_name === 'BUY'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    "
                  >
                    {{
                      order.type_name ||
                      (order.type === 0
                        ? "BUY"
                        : order.type === 1
                          ? "SELL"
                          : order.action_name || "-")
                    }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <Tooltip
                    v-if="
                      String(order.state_name || '').toUpperCase() ===
                        'REJECTED' ||
                      order.state === 5 ||
                      order.reject_reason ||
                      order.comment
                    "
                    :text="order.reject_reason || order.comment || 'REJECTED'"
                    position="center"
                  >
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 cursor-help"
                    >
                      <span>{{ order.state_name || "REJECTED" }}</span>
                      <Info class="w-3 h-3 text-rose-400 shrink-0" />
                    </span>
                  </Tooltip>
                  <span
                    v-else-if="
                      String(order.state_name || '').toUpperCase() ===
                        'FILLED' || order.state === 4
                    "
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    {{ order.state_name || "FILLED" }}
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  >
                    {{ order.state_name || order.state || "-" }}
                  </span>
                </td>
                <td
                  class="py-3 px-3 text-right font-mono font-bold text-primary-text"
                >
                  {{ formatLot(getTradeLot(order)) }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{
                    formatLot(order.volume_current ?? order.volume_closed ?? 0)
                  }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(order.price_order ?? order.price) }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(order.price_current ?? order.price_position) }}
                </td>
                <td
                  class="py-3 px-3 text-right font-medium text-secondary-text whitespace-nowrap"
                >
                  {{ formatDate(order.time_setup || order.created_at) }}
                </td>
                <td
                  class="py-3 px-4 text-right font-medium text-secondary-text whitespace-nowrap"
                >
                  {{
                    order.time_done || order.closed_at
                      ? formatDate(order.time_done || order.closed_at)
                      : "-"
                  }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 3. DEALS HISTORY TABLE (Follower Mode) -->
        <table
          v-else-if="store.activeTab === 'deals'"
          class="w-full border-collapse text-left text-xs min-w-240"
        >
          <thead>
            <tr
              class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]"
            >
              <th class="py-3 px-4">Deal Ticket</th>
              <th class="py-3 px-3">Position Ticket</th>
              <th class="py-3 px-3">Order Ticket</th>
              <th class="py-3 px-3">Account</th>
              <th class="py-3 px-3">Symbol</th>
              <th class="py-3 px-3">Action</th>
              <th class="py-3 px-3">Entry</th>
              <th class="py-3 px-3 text-right">Volume</th>
              <th class="py-3 px-3 text-right">Deal Price</th>
              <th class="py-3 px-3 text-right">Position Price</th>
              <th class="py-3 px-3 text-right">
                Profit ({{ currencySymbol }})
              </th>
              <th class="py-3 px-3 text-right">
                Commission / Fee ({{ currencySymbol }})
              </th>
              <th class="py-3 px-4 text-right">Time</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60">
            <template v-if="store.isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td v-for="c in 13" :key="c" class="py-4 px-3">
                  <div class="h-4 bg-background rounded w-3/4" />
                </td>
              </tr>
            </template>

            <template v-else-if="store.deals.length === 0">
              <tr>
                <td colspan="13" class="py-16 px-4 text-center">
                  <div
                    class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2 text-secondary-text"
                  >
                    <CheckCircle2 class="w-8 h-8 opacity-40 mb-1" />
                    <p class="text-sm font-bold text-primary-text">
                      No deal history found
                    </p>
                    <p class="text-xs">
                      {{
                        hasActiveFilters
                          ? "No deals match your current filters."
                          : "There are currently no deals recorded."
                      }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else>
              <tr
                v-for="deal in store.deals"
                :key="deal.id || deal.deal_ticket"
                class="hover:bg-background/40 transition-colors"
              >
                <td
                  class="py-3 px-4 font-mono font-bold text-primary select-all"
                >
                  #{{ deal.deal_ticket || deal.id || "-" }}
                </td>
                <td class="py-3 px-3 font-mono text-secondary-text">
                  #{{ deal.position_ticket || "-" }}
                </td>
                <td class="py-3 px-3 font-mono text-secondary-text">
                  #{{ deal.order_ticket || "-" }}
                </td>
                <td class="py-3 px-3 font-mono font-bold text-primary-text">
                  {{ deal.account_number || "-" }}
                </td>
                <td class="py-3 px-3 font-bold text-primary-text">
                  {{ deal.symbol || "-" }}
                </td>
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
                    :class="
                      deal.action_name === 'BUY' || deal.action === 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    "
                  >
                    {{
                      deal.action_name ||
                      (deal.action === 0
                        ? "BUY"
                        : deal.action === 1
                          ? "SELL"
                          : "-")
                    }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                    :class="
                      deal.entry_name === 'IN' || deal.entry === 0
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    "
                  >
                    {{
                      deal.entry_name ||
                      (deal.entry === 0 ? "IN" : deal.entry === 1 ? "OUT" : "-")
                    }}
                  </span>
                </td>
                <td
                  class="py-3 px-3 text-right font-mono font-bold text-primary-text"
                >
                  {{ formatLot(getTradeLot(deal)) }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(deal.price) }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatPrice(deal.price_position) }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold">
                  <span
                    :class="
                      Number(deal.profit ?? deal.profit_raw ?? 0) >= 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    "
                  >
                    {{ formatPnl(deal.profit ?? deal.profit_raw) }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right font-mono text-secondary-text">
                  {{ formatCurrency(deal.commission || deal.fee || 0) }}
                </td>
                <td
                  class="py-3 px-4 text-right font-medium text-secondary-text whitespace-nowrap"
                >
                  {{ formatDate(deal.time) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Table Bottom Summary & Pagination Bar -->
      <div
        class="px-5 py-3.5 border-t border-primary-border bg-background/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div class="text-secondary-text font-medium">
          Showing
          <strong class="text-primary-text font-mono">{{
            currentTableCount
          }}</strong>
          entries
          <span v-if="store.pagination.total_items > 0">
            of
            <strong class="text-primary-text font-mono">{{
              store.pagination.total_items
            }}</strong>
            total
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
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  BookOpen,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  RotateCcw,
  ArrowLeft,
  Layers,
  Server,
  Info,
} from "lucide-vue-next";
import { useFmTradeBookStore } from "@/stores/fmTradeBook/fmTradeBook";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { formatDate as formatTime } from "@/utils/timeFormatter.js";
import { livePNL } from "@/utils/livePNL.js";

const store = useFmTradeBookStore();
const route = useRoute();
const router = useRouter();

const searchInput = ref("");
const dateRange = ref(null);

// Mode detection: checks route name and params
const isFollowerMode = computed(() => {
  return (
    route.name === "follower-trade-book" ||
    route.path.includes("/follower/trade-book")
  );
});

const activeStatus = computed(() => {
  if (store.accountInfo) {
    return store.accountInfo.is_active ?? store.accountInfo.status === "active";
  }
  return true;
});

const headerTitle = computed(() => {
  if (isFollowerMode.value) {
    return (
      store.accountInfo?.name ||
      store.accountInfo?.user_name ||
      "Follower Account"
    );
  }
  return store.accountInfo?.label_name || "Fund Manager Master Account";
});

const accountNumber = computed(() => {
  return (
    store.accountInfo?.account_number ||
    store.accountInfo?.master_account?.account_number ||
    route.query.account_number ||
    ""
  );
});

const brokerGroup = computed(() => {
  return (
    store.accountInfo?.broker_group ||
    store.accountInfo?.master_account?.broker_group ||
    ""
  );
});

const leverageOrRatio = computed(() => {
  if (isFollowerMode.value && store.accountInfo?.copy_ratio) {
    return `Ratio: ${store.accountInfo.copy_ratio}x`;
  }
  if (store.accountInfo?.broker_leverage) {
    return `1:${store.accountInfo.broker_leverage}`;
  }
  return "";
});

const currentTableCount = computed(() => {
  if (!isFollowerMode.value) return store.positions.length;
  if (store.activeTab === "orders") return store.orders.length;
  if (store.activeTab === "deals") return store.deals.length;
  return store.positions.length;
});

// Tab Badge Counts
const positionsBadgeCount = computed(() => {
  if (store.activeTab === "positions") {
    return (
      store.summary.total_positions ??
      store.pagination.total_items ??
      store.positions.length
    );
  }
  return store.positions.length;
});

const ordersBadgeCount = computed(() => {
  if (store.activeTab === "orders") {
    return (
      store.summary.total_orders ??
      store.pagination.total_items ??
      store.orders.length
    );
  }
  return store.orders.length;
});

const dealsBadgeCount = computed(() => {
  if (store.activeTab === "deals") {
    return (
      store.summary.total_deals ??
      store.pagination.total_items ??
      store.deals.length
    );
  }
  return store.deals.length;
});

// Filter dropdown options (Dynamic per active Tab)
const statusPlaceholder = computed(() => {
  if (store.activeTab === "orders") return "Order State";
  if (store.activeTab === "deals") return "Entry Type";
  return "Status";
});

const statusOptions = computed(() => {
  if (store.activeTab === "orders") {
    if (store.availableFilters?.order_states?.length) {
      return store.availableFilters.order_states.map((s) => ({
        label: s.label || String(s).toUpperCase(),
        value: s.value !== undefined ? s.value : s,
      }));
    }
    return [
      { label: "All States", value: "" },
      { label: "Filled", value: "FILLED" },
      { label: "Rejected", value: "REJECTED" },
    ];
  }

  if (store.activeTab === "deals") {
    if (store.availableFilters?.deal_entries?.length) {
      return store.availableFilters.deal_entries.map((e) => ({
        label: e.label || String(e).toUpperCase(),
        value: e.value !== undefined ? e.value : e,
      }));
    }
    return [
      { label: "All Entries", value: "" },
      { label: "IN (Entry)", value: "IN" },
      { label: "OUT (Exit)", value: "OUT" },
    ];
  }

  // Positions / Master trades
  if (store.availableFilters?.statuses?.length) {
    return store.availableFilters.statuses.map((s) => ({
      label: s.label || String(s).toUpperCase(),
      value: s.value !== undefined ? s.value : s,
    }));
  }
  return [
    { label: "All Statuses", value: "" },
    { label: "Open", value: "OPEN" },
    { label: "Closed", value: "CLOSED" },
  ];
});

const typeOptions = computed(() => {
  if (store.activeTab === "deals") {
    return [
      { label: "All Actions", value: "" },
      { label: "BUY", value: "BUY" },
      { label: "SELL", value: "SELL" },
    ];
  }

  if (store.availableFilters?.types?.length) {
    return store.availableFilters.types.map((t) => ({
      label: t.label || String(t).toUpperCase(),
      value: t.value !== undefined ? t.value : t,
    }));
  }
  return [
    { label: "All Sides", value: "" },
    { label: "Buy", value: "BUY" },
    { label: "Sell", value: "SELL" },
  ];
});

const hasActiveFilters = computed(() => {
  return (
    !!store.filters.search ||
    !!store.filters.status ||
    !!store.filters.type ||
    !!store.filters.symbol ||
    !!store.filters.start_date ||
    !!store.filters.end_date
  );
});

let searchDebounceTimer = null;
const handleSearch = (val) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    store.setSearch(val);
  }, 350);
};

const clearSearch = () => {
  searchInput.value = "";
  store.setSearch("");
};

const handleDateRangeChange = (val) => {
  dateRange.value = val;
  if (val && Array.isArray(val) && val.length === 2) {
    store.setDateFilter(val[0], val[1]);
  } else if (!val) {
    store.setDateFilter("", "");
  }
};

const handleDateRangeClear = () => {
  dateRange.value = null;
  store.setDateFilter("", "");
};

const handleResetFilters = () => {
  searchInput.value = "";
  dateRange.value = null;
  store.resetFilters();
};

const formatPrice = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
};

const getTradeLot = (item) => {
  if (!item) return 0;

  // 1. Direct lot field
  if (item.lot !== undefined && item.lot !== null && Number(item.lot) > 0) {
    const raw = Number(item.lot);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 2. Active volume (if > 0)
  if (
    item.volume !== undefined &&
    item.volume !== null &&
    Number(item.volume) > 0
  ) {
    const raw = Number(item.volume);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 3. Closed / Traded volume (for closed positions where volume is 0)
  if (
    item.volume_closed !== undefined &&
    item.volume_closed !== null &&
    Number(item.volume_closed) > 0
  ) {
    const raw = Number(item.volume_closed);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 4. Initial volume
  if (
    item.volume_initial !== undefined &&
    item.volume_initial !== null &&
    Number(item.volume_initial) > 0
  ) {
    const raw = Number(item.volume_initial);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 5. Traded volume
  if (
    item.volume_traded !== undefined &&
    item.volume_traded !== null &&
    Number(item.volume_traded) > 0
  ) {
    const raw = Number(item.volume_traded);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 6. Raw volume
  if (
    item.volume_raw !== undefined &&
    item.volume_raw !== null &&
    Number(item.volume_raw) > 0
  ) {
    const raw = Number(item.volume_raw);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  return item.volume ?? item.lot ?? 0;
};

const formatLot = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  let num = Number(val);
  if (isNaN(num)) return "-";
  if (num >= 100 && Number.isInteger(num)) {
    num = num / 10000;
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const activeCurrency = computed(() => {
  if (route.query.currency) return String(route.query.currency).toUpperCase();
  if (route.query.broker_currency)
    return String(route.query.broker_currency).toUpperCase();

  if (store.accountInfo) {
    const c =
      store.accountInfo.broker_currency ||
      store.accountInfo.currency ||
      store.accountInfo.coverage_account?.broker_currency ||
      store.accountInfo.trading_account?.broker_currency;
    if (c) return String(c).toUpperCase();
  }

  try {
    const raw = localStorage.getItem("active_fm");
    if (raw) {
      const parsed = JSON.parse(raw);
      const c =
        parsed.broker_currency ||
        parsed.currency ||
        parsed.coverage_account?.broker_currency ||
        parsed.master_account?.broker_currency;
      if (c) return String(c).toUpperCase();
    }
  } catch (e) {
    // ignore
  }

  return "USD";
});

const isUsc = computed(() => activeCurrency.value === "USC");
const currencySymbol = computed(() => (isUsc.value ? "USC" : "$"));

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  let num = Number(val);
  if (isNaN(num)) return "-";
  if (isUsc.value) {
    num = num * 100;
  }
  const formatted = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = num < 0 ? "-" : "";
  return isUsc.value ? `${prefix}USC ${formatted}` : `${prefix}$${formatted}`;
};



const formatPnl = (val) => {
  if (val === null || val === undefined || val === "") return "-";

  const num = Number(val);
  if (Number.isNaN(num)) return "-";

  if (Math.abs(num) < 0.000001) {
    return isUsc.value ? "USC 0.00" : "$0.00";
  }

  const prefix = num > 0 ? "+" : "-";
  const formattedNum = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isUsc.value
    ? `${prefix}USC ${formattedNum}`
    : `${prefix}$${formattedNum}`;
};

const formatDate = (val) => {
  if (!val) return "-";
  return formatTime(val);
};



const goBack = () => {
  if (isFollowerMode.value) {
    const fmId = route.query.fm_id;
    if (fmId) {
      router.push(`/fm/followers/${fmId}`);
    } else {
      router.back();
    }
  } else {
    router.push("/fm-leaderboard");
  }
};

const initContext = () => {
  const targetId = route.params.id;
  let parsedInfo = null;

  if (isFollowerMode.value) {
    store.setContext({
      type: "follower",
      id: targetId,
      info: null,
    });
    store.fetchFollowerInfo(targetId);
  } else {
    try {
      const raw = localStorage.getItem("active_fm");
      if (raw) {
        parsedInfo = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read active_fm from storage:", e);
    }

    store.setContext({
      type: "fm",
      id: targetId,
      info: parsedInfo,
    });
  }

  store.fetchFilters();
  store.fetchTradesData();
};

onMounted(() => {
  initContext();
});

onUnmounted(() => {
  store.resetAll();
});
</script>
