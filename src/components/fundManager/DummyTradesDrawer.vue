<template>
  <div>
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="handleClose"
      />
    </Transition>

    <!-- Drawer Panel (Wide for Financial Trades Table) -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-5xl bg-card-background border-l border-primary-border shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between gap-4 bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div
              class="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 bg-primary/10 border-primary/20 text-primary"
            >
              <CandlestickChart class="w-5 h-5 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate" :title="labelName">
                  {{ labelName }}
                </h3>
                <span
                  class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text shrink-0"
                >
                  FM #{{ fmId }}
                </span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1"
                >
                  <HugeIcon :icon="AiMagicIcon" :size="10" />
                  <span>Dummy Trades</span>
                </span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border inline-flex items-center gap-1 bg-background text-secondary-text border-primary-border"
                >
                  {{ store.dummyTradesPagination.total }} Total Records
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5 flex items-center gap-1.5 font-medium">
                <span v-if="userName" class="truncate">{{ userName }}</span>
                <span v-if="userName" class="text-secondary-text/50">·</span>
                <span class="font-mono text-secondary-text select-all truncate">{{ userEmail }}</span>
              </p>
            </div>
          </div>

          <!-- Header Right Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Delete Selected Button (when trades selected) -->
            <button
              v-if="selectedTradeIds.length > 0 && hasPermission('dummyfm.delete')"
              type="button"
              class="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold bg-primary-red/10 border border-primary-red/20 text-primary-red hover:bg-primary-red hover:text-white transition cursor-pointer"
              title="Delete Selected Trades"
              @click="openDeleteSelectedConfirm"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete ({{ selectedTradeIds.length }}) Selected</span>
            </button>

            <!-- Delete All Trades Button -->
            <button
              v-if="store.dummyTrades.length > 0 && hasPermission('dummyfm.delete')"
              type="button"
              class="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border border-primary-red/30 bg-card-background hover:bg-primary-red/10 text-primary-red transition cursor-pointer"
              title="Delete All Dummy Trades for this FM"
              @click="openDeleteAllConfirm"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Delete All</span>
            </button>

            <!-- Refresh Button -->
            <button
              type="button"
              :disabled="store.dummyTradesLoading"
              class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer disabled:opacity-50"
              title="Refresh Trades"
              @click="loadTrades(true)"
            >
              <RefreshCw
                class="w-3.5 h-3.5"
                :class="{ 'animate-spin': store.dummyTradesLoading }"
              />
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="handleClose"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Drawer Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- TOP FILTER TOOLBAR -->
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-card-background/60 border border-primary-border p-2.5 rounded-xl"
          >
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
              <!-- Symbol Search Input -->
              <div class="relative h-9 w-full sm:w-48">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
                />
                <input
                  v-model="symbolFilter"
                  type="text"
                  placeholder="Filter symbol (e.g. EURUSD)..."
                  class="w-full h-full pl-8 pr-7 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text uppercase font-mono"
                  @keyup.enter="handleFilterChange"
                />
                <button
                  v-if="symbolFilter"
                  @click="clearSymbolFilter"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Status Filter Select -->
              <BaseSelect
                v-model="statusFilter"
                :options="statusOptions"
                placeholder="All Status"
                clearable
                class="w-full sm:w-32 shrink-0"
                @update:modelValue="handleFilterChange"
              />

              <!-- From Date Input -->
              <div class="relative h-9 w-full sm:w-36">
                <input
                  v-model="fromDateFilter"
                  type="date"
                  placeholder="From date"
                  title="From Date"
                  class="w-full h-full px-2.5 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors font-mono"
                  @change="handleFilterChange"
                />
              </div>

              <!-- To Date Input -->
              <div class="relative h-9 w-full sm:w-36">
                <input
                  v-model="toDateFilter"
                  type="date"
                  placeholder="To date"
                  title="To Date"
                  class="w-full h-full px-2.5 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors font-mono"
                  @change="handleFilterChange"
                />
              </div>

              <!-- Per Page Select -->
              <BaseSelect
                :modelValue="store.dummyTradesPagination.per_page"
                :options="perPageOptions"
                placeholder="Per Page"
                class="w-full sm:w-28 shrink-0"
                @update:modelValue="handlePerPageChange"
              />

              <!-- Reset Filters -->
              <button
                v-if="hasActiveFilters"
                type="button"
                class="h-9 px-2.5 rounded-lg text-xs font-semibold text-secondary-text hover:bg-background hover:text-primary-text border border-transparent hover:border-primary-border transition cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Reset All Filters"
                @click="resetFilters"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <!-- SUMMARY ANALYTICS RIBBON -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-card-background border border-primary-border rounded-xl p-3">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">
                Total Trades
              </span>
              <span class="text-base font-extrabold text-primary-text font-mono mt-0.5 block">
                {{ store.dummyTradesPagination.total }}
              </span>
            </div>

            <div class="bg-card-background border border-primary-border rounded-xl p-3">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">
                Total Volume
              </span>
              <span class="text-base font-extrabold text-primary font-mono mt-0.5 block">
                {{ totalLots.toFixed(2) }} <span class="text-xs font-normal text-secondary-text">Lots</span>
              </span>
            </div>

            <div class="bg-card-background border border-primary-border rounded-xl p-3">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">
                Page Net PnL
              </span>
              <span
                class="text-base font-extrabold font-mono mt-0.5 block"
                :class="pagePnL >= 0 ? 'text-primary-green' : 'text-primary-red'"
              >
                {{ pagePnL >= 0 ? '+' : '' }}{{ formatMoney(pagePnL, currency) }}
              </span>
            </div>

            <div class="bg-card-background border border-primary-border rounded-xl p-3">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">
                Win / Loss (Page)
              </span>
              <span class="text-base font-extrabold text-primary-text font-mono mt-0.5 block">
                <span class="text-primary-green">{{ winTradesCount }}W</span>
                <span class="text-secondary-text font-normal"> / </span>
                <span class="text-primary-red">{{ lossTradesCount }}L</span>
              </span>
            </div>
          </div>

          <!-- SPREADSHEET TABLE CONTAINER -->
          <div class="border border-primary-border rounded-xl overflow-hidden bg-card-background/60 shadow-xs">
            <!-- Loading Skeleton -->
            <div v-if="store.dummyTradesLoading" class="p-4 space-y-2.5">
              <div
                v-for="n in 6"
                :key="n"
                class="h-10 bg-background rounded-lg animate-pulse w-full"
              />
            </div>

            <!-- Empty State -->
            <div
              v-else-if="store.dummyTrades.length === 0"
              class="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-xs"
              >
                <CandlestickChart class="w-7 h-7 text-primary" />
              </div>
              <h4 class="text-sm font-bold text-primary-text mb-1">
                {{ hasActiveFilters ? 'No matching dummy trades found' : 'No dummy trades recorded' }}
              </h4>
              <p class="text-xs text-secondary-text max-w-sm mb-4">
                {{
                  hasActiveFilters
                    ? 'Try adjusting your search criteria or clearing active filters.'
                    : 'Import simulated trade history or add trades to view performance here.'
                }}
              </p>
              <button
                v-if="hasActiveFilters"
                type="button"
                class="px-3.5 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-primary-text transition cursor-pointer flex items-center gap-1.5"
                @click="resetFilters"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            </div>

            <!-- Trades Data Table -->
            <div v-else class="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table class="w-full min-w-[960px] border-collapse text-left text-xs">
                <thead class="sticky top-0 z-10 bg-background border-b border-primary-border shadow-2xs">
                  <tr class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                    <!-- Checkbox Column -->
                    <th class="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        :indeterminate="isIndeterminate"
                        class="custom-checkbox"
                        @change="toggleSelectAll"
                      />
                    </th>
                    <th class="py-2.5 px-3">#ID</th>
                    <th class="py-2.5 px-3">Symbol</th>
                    <th class="py-2.5 px-3">Type</th>
                    <th class="py-2.5 px-3 text-right">Lot</th>
                    <th class="py-2.5 px-3 text-right">Entry Price</th>
                    <th class="py-2.5 px-3 text-right">Exit Price</th>
                    <th class="py-2.5 px-3 text-right">Realized PnL</th>
                    <th class="py-2.5 px-3 text-center">Status</th>
                    <th class="py-2.5 px-3">Opened At</th>
                    <th class="py-2.5 px-3">Closed At</th>
                    <th class="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-border/60">
                  <tr
                    v-for="trade in store.dummyTrades"
                    :key="trade.id"
                    class="hover:bg-background/50 transition-colors font-mono text-[11px]"
                    :class="{ 'bg-primary/5': selectedTradeIds.includes(trade.id) }"
                  >
                    <!-- Row Checkbox -->
                    <td class="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        :checked="selectedTradeIds.includes(trade.id)"
                        class="custom-checkbox"
                        @change="toggleSelectTrade(trade.id)"
                      />
                    </td>

                    <!-- Trade ID -->
                    <td class="py-2.5 px-3 font-bold text-primary-text">
                      #{{ trade.id }}
                    </td>

                    <!-- Symbol -->
                    <td class="py-2.5 px-3 font-bold text-primary-text">
                      <span class="px-1.5 py-0.5 rounded bg-background border border-primary-border text-[11px]">
                        {{ trade.symbol || '—' }}
                      </span>
                    </td>

                    <!-- Type (BUY/SELL) -->
                    <td class="py-2.5 px-3">
                      <span
                        class="px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider border inline-flex items-center gap-1"
                        :class="
                          isBuyType(trade.type || trade.order_type)
                            ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                            : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                        "
                      >
                        <ArrowUpRight v-if="isBuyType(trade.type || trade.order_type)" class="w-2.5 h-2.5" />
                        <ArrowDownRight v-else class="w-2.5 h-2.5" />
                        {{ (trade.type || trade.order_type || 'BUY').toUpperCase() }}
                      </span>
                    </td>

                    <!-- Lot -->
                    <td class="py-2.5 px-3 text-right text-primary-text font-bold">
                      {{ formatLot(trade.lot) }}
                    </td>

                    <!-- Entry Price -->
                    <td class="py-2.5 px-3 text-right text-primary-text">
                      {{ formatPrice(trade.entry_price) }}
                    </td>

                    <!-- Exit / Current Price -->
                    <td class="py-2.5 px-3 text-right text-primary-text">
                      {{ formatPrice(trade.exit_price ?? trade.current_price) }}
                    </td>

                    <!-- Realized PnL -->
                    <td
                      class="py-2.5 px-3 text-right font-bold"
                      :class="Number(trade.pnl || 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                    >
                      {{ Number(trade.pnl || 0) >= 0 ? '+' : '' }}{{ formatMoney(trade.pnl, currency) }}
                    </td>

                    <!-- Status -->
                    <td class="py-2.5 px-3 text-center">
                      <span
                        class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
                        :class="
                          String(trade.status || '').toLowerCase() === 'open'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        "
                      >
                        <span
                          class="w-1 h-1 rounded-full"
                          :class="String(trade.status || '').toLowerCase() === 'open' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"
                        />
                        {{ trade.status || 'closed' }}
                      </span>
                    </td>

                    <!-- Opened At -->
                    <td class="py-2.5 px-3 text-secondary-text whitespace-nowrap text-[10px]">
                      {{ formatTimestamp(trade.opened_at) }}
                    </td>

                    <!-- Closed At -->
                    <td class="py-2.5 px-3 text-secondary-text whitespace-nowrap text-[10px]">
                      {{ formatTimestamp(trade.closed_at) }}
                    </td>

                    <!-- Actions -->
                    <td class="py-2.5 px-3 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-1 justify-end">
                        <!-- View Trade Details -->
                        <button
                          type="button"
                          class="p-1 rounded hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer"
                          title="View Trade Details"
                          @click="openViewModal(trade)"
                        >
                          <Eye class="w-3.5 h-3.5" />
                        </button>

                        <!-- Edit Trade -->
                        <button
                          v-if="hasPermission('dummyfm.update')"
                          type="button"
                          class="p-1 rounded hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer"
                          title="Edit Dummy Trade"
                          @click="openEditModal(trade)"
                        >
                          <Pencil class="w-3.5 h-3.5" />
                        </button>

                        <!-- Delete Trade -->
                        <button
                          v-if="hasPermission('dummyfm.delete')"
                          type="button"
                          class="p-1 rounded hover:bg-rose-500/10 text-secondary-text hover:text-rose-500 transition cursor-pointer"
                          title="Delete Dummy Trade"
                          @click="openDeleteSingleConfirm(trade)"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PAGINATION BAR -->
            <div
              v-if="store.dummyTradesPagination.pages > 1 || store.dummyTradesPagination.total > store.dummyTradesPagination.per_page"
              class="px-4 py-3 border-t border-primary-border bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              <span class="text-secondary-text font-medium">
                Showing page <span class="font-bold text-primary-text font-mono">{{ store.dummyTradesPagination.page }}</span> of <span class="font-bold text-primary-text font-mono">{{ store.dummyTradesPagination.pages }}</span>
                ({{ store.dummyTradesPagination.total }} total items)
              </span>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  :disabled="store.dummyTradesPagination.page <= 1"
                  class="px-2.5 py-1 rounded-lg border border-primary-border hover:bg-card-background text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                  @click="handlePageChange(store.dummyTradesPagination.page - 1)"
                >
                  Prev
                </button>

                <div class="flex items-center gap-1 px-1 font-mono">
                  <span class="px-2 py-0.5 rounded bg-primary text-white font-bold text-xs">
                    {{ store.dummyTradesPagination.page }}
                  </span>
                </div>

                <button
                  type="button"
                  :disabled="store.dummyTradesPagination.page >= store.dummyTradesPagination.pages"
                  class="px-2.5 py-1 rounded-lg border border-primary-border hover:bg-card-background text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                  @click="handlePageChange(store.dummyTradesPagination.page + 1)"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div
          class="px-6 py-3.5 border-t border-primary-border bg-background/50 flex items-center justify-between shrink-0"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-secondary-text">
              Selected: <span class="font-mono font-bold text-primary-text">{{ selectedTradeIds.length }}</span> trades
            </span>
          </div>

          <button
            type="button"
            class="h-8 px-4 rounded-lg bg-card-background border border-primary-border text-primary-text hover:bg-background text-xs font-semibold transition cursor-pointer"
            @click="handleClose"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>

    <!-- VIEW SINGLE TRADE DETAILS MODAL -->
    <Transition name="backdrop">
      <div
        v-if="isViewModalOpen"
        class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        @click="isViewModalOpen = false"
      >
        <div
          class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden cursor-default"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-primary-border bg-background/50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                #{{ activeTrade?.id }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-primary-text">
                  Trade Details - {{ activeTrade?.symbol }}
                </h4>
                <p class="text-[11px] text-secondary-text">
                  Simulated Trade Information
                </p>
              </div>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition"
              @click="isViewModalOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body Grid -->
          <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Trade ID</span>
                <span class="font-bold text-primary-text font-mono mt-0.5 block">#{{ activeTrade?.id }}</span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Symbol</span>
                <span class="font-bold text-primary-text font-mono mt-0.5 block">{{ activeTrade?.symbol || '—' }}</span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Direction / Type</span>
                <span
                  class="font-extrabold uppercase mt-0.5 block"
                  :class="isBuyType(activeTrade?.type || activeTrade?.order_type) ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ (activeTrade?.type || activeTrade?.order_type || 'BUY').toUpperCase() }}
                </span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Lot / Volume</span>
                <span class="font-bold text-primary-text font-mono mt-0.5 block">{{ formatLot(activeTrade?.lot) }} Lots</span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Entry Price</span>
                <span class="font-bold text-primary-text font-mono mt-0.5 block">{{ formatPrice(activeTrade?.entry_price) }}</span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Exit / Current Price</span>
                <span class="font-bold text-primary-text font-mono mt-0.5 block">{{ formatPrice(activeTrade?.exit_price ?? activeTrade?.current_price) }}</span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Realized PnL</span>
                <span
                  class="font-extrabold font-mono mt-0.5 block text-sm"
                  :class="Number(activeTrade?.pnl || 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ Number(activeTrade?.pnl || 0) >= 0 ? '+' : '' }}{{ formatMoney(activeTrade?.pnl, currency) }}
                </span>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                <span class="text-secondary-text text-[10px] uppercase font-bold block">Trade Status</span>
                <span class="font-bold capitalize mt-0.5 block" :class="String(activeTrade?.status).toLowerCase() === 'open' ? 'text-amber-500' : 'text-emerald-500'">
                  {{ activeTrade?.status || 'closed' }}
                </span>
              </div>

              <div class="col-span-2 bg-background/60 border border-primary-border/60 rounded-lg p-2.5 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-secondary-text text-[10px] uppercase font-bold">Opened At</span>
                  <span class="font-mono text-primary-text font-semibold">{{ formatTimestamp(activeTrade?.opened_at) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-secondary-text text-[10px] uppercase font-bold">Closed At</span>
                  <span class="font-mono text-primary-text font-semibold">{{ formatTimestamp(activeTrade?.closed_at) }}</span>
                </div>
                <div v-if="activeTrade?.created_at" class="flex items-center justify-between">
                  <span class="text-secondary-text text-[10px] uppercase font-bold">Created At</span>
                  <span class="font-mono text-secondary-text">{{ formatTimestamp(activeTrade?.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3.5 border-t border-primary-border bg-background/50 flex items-center justify-between">
            <button
              v-if="hasPermission('dummyfm.delete')"
              type="button"
              class="h-8 px-3 rounded-lg border border-primary-red/30 bg-primary-red/10 text-primary-red hover:bg-primary-red hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              @click="openDeleteSingleConfirm(activeTrade)"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete Trade</span>
            </button>
            <div v-else />

            <div class="flex items-center gap-2">
              <button
                v-if="hasPermission('dummyfm.update')"
                type="button"
                class="h-8 px-3.5 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                @click="openEditModal(activeTrade)"
              >
                <Pencil class="w-3.5 h-3.5" />
                <span>Edit Trade</span>
              </button>

              <button
                type="button"
                class="h-8 px-3.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer"
                @click="isViewModalOpen = false"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- EDIT SINGLE TRADE MODAL -->
    <Transition name="backdrop">
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        @click="isEditModalOpen = false"
      >
        <div
          class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden cursor-default"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-primary-border bg-background/50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                <Pencil class="w-4 h-4" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-primary-text">
                  Edit Dummy Trade #{{ editForm.id }}
                </h4>
                <p class="text-[11px] text-secondary-text">
                  Update simulation parameters for this trade record.
                </p>
              </div>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="isEditModalOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Edit Form Body -->
          <form @submit.prevent="handleEditSubmit">
            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <!-- Symbol -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Symbol <span class="text-primary-red">*</span></label>
                  <input
                    v-model="editForm.symbol"
                    type="text"
                    required
                    placeholder="e.g. EURUSD"
                    class="input-field px-3 py-2 text-xs uppercase font-mono"
                  />
                </div>

                <!-- Order Type (BUY/SELL) -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Direction (Type) <span class="text-primary-red">*</span></label>
                  <div class="flex items-center gap-2 h-9">
                    <button
                      type="button"
                      class="flex-1 h-full rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1"
                      :class="editForm.type === 'BUY' ? 'bg-primary-green text-white border-primary-green' : 'bg-background text-secondary-text border-primary-border hover:bg-card-background'"
                      @click="editForm.type = 'BUY'"
                    >
                      <ArrowUpRight class="w-3.5 h-3.5" />
                      BUY
                    </button>
                    <button
                      type="button"
                      class="flex-1 h-full rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1"
                      :class="editForm.type === 'SELL' ? 'bg-primary-red text-white border-primary-red' : 'bg-background text-secondary-text border-primary-border hover:bg-card-background'"
                      @click="editForm.type = 'SELL'"
                    >
                      <ArrowDownRight class="w-3.5 h-3.5" />
                      SELL
                    </button>
                  </div>
                </div>

                <!-- Lot Size -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Volume (Lots) <span class="text-primary-red">*</span></label>
                  <input
                    v-model.number="editForm.lot"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 1.0"
                    class="input-field px-3 py-2 text-xs font-mono"
                  />
                </div>

                <!-- Status -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Trade Status <span class="text-primary-red">*</span></label>
                  <BaseSelect
                    v-model="editForm.status"
                    :options="tradeStatusOptions"
                    placeholder="Select status"
                    class="w-full"
                  />
                </div>

                <!-- Entry Price -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Entry Price <span class="text-primary-red">*</span></label>
                  <input
                    v-model.number="editForm.entry_price"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1.0850"
                    class="input-field px-3 py-2 text-xs font-mono"
                  />
                </div>

                <!-- Exit Price -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Exit Price</label>
                  <input
                    v-model.number="editForm.exit_price"
                    type="number"
                    step="any"
                    placeholder="e.g. 1.0920"
                    class="input-field px-3 py-2 text-xs font-mono"
                  />
                </div>

                <!-- Current Price -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Current Price</label>
                  <input
                    v-model.number="editForm.current_price"
                    type="number"
                    step="any"
                    placeholder="e.g. 1.0920"
                    class="input-field px-3 py-2 text-xs font-mono"
                  />
                </div>

                <!-- Realized PnL -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Realized PnL <span class="text-primary-red">*</span></label>
                  <input
                    v-model.number="editForm.pnl"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 450.00"
                    class="input-field px-3 py-2 text-xs font-mono font-bold"
                    :class="Number(editForm.pnl || 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                  />
                </div>

                <!-- Opened At Timestamp -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Opened At</label>
                  <input
                    v-model="editForm.opened_at"
                    type="datetime-local"
                    class="input-field px-3 py-2 text-xs font-mono"
                  />
                </div>

                <!-- Closed At Timestamp -->
                <div>
                  <label class="font-bold text-primary-text block mb-1">Closed At</label>
                  <input
                    v-model="editForm.closed_at"
                    type="datetime-local"
                    class="input-field px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-3.5 border-t border-primary-border bg-background/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer"
                :disabled="store.dummyTradesActionLoading"
                @click="isEditModalOpen = false"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="btn-primary"
                :disabled="store.dummyTradesActionLoading"
              >
                <Loader2 v-if="store.dummyTradesActionLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ store.dummyTradesActionLoading ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- DELETE SINGLE CONFIRMATION DIALOG -->
    <ConfirmationDialog
      :open="isDeleteSingleModalOpen"
      title="Delete Dummy Trade"
      :message="`Are you sure you want to delete trade #${tradeToDelete?.id} (${tradeToDelete?.symbol} ${tradeToDelete?.type || 'TRADE'})? This action cannot be undone.`"
      confirm-text="Delete Trade"
      cancel-text="Cancel"
      type="danger"
      :loading="store.dummyTradesActionLoading"
      @confirm="handleConfirmDeleteSingle"
      @cancel="isDeleteSingleModalOpen = false"
    />

    <!-- DELETE SELECTED CONFIRMATION DIALOG -->
    <ConfirmationDialog
      :open="isDeleteSelectedModalOpen"
      title="Delete Selected Dummy Trades"
      :message="`Are you sure you want to delete ${selectedTradeIds.length} selected dummy trade records? This action cannot be undone.`"
      :confirm-text="`Delete ${selectedTradeIds.length} Trades`"
      cancel-text="Cancel"
      type="danger"
      :loading="store.dummyTradesActionLoading"
      @confirm="handleConfirmDeleteSelected"
      @cancel="isDeleteSelectedModalOpen = false"
    />

    <!-- DELETE ALL CONFIRMATION DIALOG -->
    <ConfirmationDialog
      :open="isDeleteAllModalOpen"
      title="Delete All Dummy Trades"
      :message="`Are you sure you want to delete ALL dummy trade records for '${labelName}' (#${fmId})? This will permanently wipe all simulated trade logs and cannot be undone.`"
      confirm-text="Delete All Trades"
      cancel-text="Cancel"
      type="danger"
      :loading="store.dummyTradesActionLoading"
      @confirm="handleConfirmDeleteAll"
      @cancel="isDeleteAllModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  X,
  RefreshCw,
  Search,
  RotateCcw,
  Trash2,
  Eye,
  Pencil,
  CandlestickChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-vue-next'
import { AiMagicIcon } from '@hugeicons/core-free-icons'
import BaseSelect from '@/components/common/BaseSelect.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import { useFmLeaderboardStore } from '@/stores/fmLeaderboard/fmLeaderboard'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
})

const emit = defineEmits(['close', 'edit-dummy', 'import-trades'])

const store = useFmLeaderboardStore()
const permissionsStore = useMyPermissionsStore()
const hasPermission = (perm) => permissionsStore.hasPermission(perm)

// Filters State
const symbolFilter = ref('')
const statusFilter = ref(null)
const fromDateFilter = ref('')
const toDateFilter = ref('')

// Checkbox selection state
const selectedTradeIds = ref([])

// Modals State
const isViewModalOpen = ref(false)
const activeTrade = ref(null)

const isEditModalOpen = ref(false)
const editForm = ref({
  id: null,
  symbol: '',
  type: 'BUY',
  lot: 1.0,
  entry_price: 0,
  exit_price: null,
  current_price: null,
  pnl: 0,
  status: 'closed',
  opened_at: '',
  closed_at: '',
})

// Confirmation Dialog states
const isDeleteSingleModalOpen = ref(false)
const tradeToDelete = ref(null)
const isDeleteSelectedModalOpen = ref(false)
const isDeleteAllModalOpen = ref(false)

// Select options
const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Closed', value: 'closed' },
  { label: 'Open', value: 'open' },
]

const tradeStatusOptions = [
  { label: 'Closed', value: 'closed' },
  { label: 'Open', value: 'open' },
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

// Computed item helpers
const fmId = computed(() => {
  return (
    props.item?.fm_id ||
    props.item?.dummy_fm?.fm_id ||
    props.item?.fund_manager?.id ||
    props.item?.id ||
    null
  )
})

const labelName = computed(() => {
  return (
    props.item?.label_name ||
    props.item?.fund_manager?.label_name ||
    props.item?.user_name ||
    `FM #${fmId.value || 'N/A'}`
  )
})

const userName = computed(() => {
  return (
    props.item?.user_name ||
    props.item?.fund_manager?.user_name ||
    props.item?.user?.name ||
    ''
  )
})

const userEmail = computed(() => {
  return (
    props.item?.user_email ||
    props.item?.fund_manager?.user_email ||
    props.item?.user?.email ||
    '—'
  )
})

const currency = computed(() => {
  return (
    props.item?.broker_currency ||
    props.item?.fund_manager?.broker_currency ||
    'USD'
  )
})

// Summary metrics computed
const totalLots = computed(() => {
  return (store.dummyTrades || []).reduce((acc, t) => acc + (Number(t.lot) || 0), 0)
})

const pagePnL = computed(() => {
  return (store.dummyTrades || []).reduce((acc, t) => acc + (Number(t.pnl) || 0), 0)
})

const winTradesCount = computed(() => {
  return (store.dummyTrades || []).filter((t) => Number(t.pnl || 0) > 0).length
})

const lossTradesCount = computed(() => {
  return (store.dummyTrades || []).filter((t) => Number(t.pnl || 0) < 0).length
})

const hasActiveFilters = computed(() => {
  return Boolean(
    symbolFilter.value.trim() ||
    statusFilter.value !== null ||
    fromDateFilter.value ||
    toDateFilter.value
  )
})

// Selection computed
const isAllSelected = computed(() => {
  const trades = store.dummyTrades || []
  if (trades.length === 0) return false
  return trades.every((t) => selectedTradeIds.value.includes(t.id))
})

const isIndeterminate = computed(() => {
  const trades = store.dummyTrades || []
  if (trades.length === 0) return false
  const selectedCount = trades.filter((t) => selectedTradeIds.value.includes(t.id)).length
  return selectedCount > 0 && selectedCount < trades.length
})

// Helpers
const isBuyType = (val) => String(val || '').trim().toUpperCase() === 'BUY'

const formatLot = (lot) => {
  const num = Number(lot)
  return isNaN(num) ? '—' : num.toFixed(2)
}

const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') return '—'
  const num = Number(price)
  return isNaN(num) ? String(price) : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })
}

const formatMoney = (val, cur = 'USD') => {
  const num = Number(val) || 0
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`
}

const formatTimestamp = (ts) => {
  if (!ts) return '—'
  try {
    const d = new Date(ts)
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (_) {
    return String(ts)
  }
}

const toDatetimeLocal = (isoStr) => {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const min = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
  } catch (_) {
    return ''
  }
}

// Data Fetching
const loadTrades = (force = false, page = store.dummyTradesPagination.page) => {
  if (!fmId.value) return
  const params = {
    page: page || 1,
    per_page: store.dummyTradesPagination.per_page || 50,
  }
  if (symbolFilter.value.trim()) {
    params.symbol = symbolFilter.value.trim().toUpperCase()
  }
  if (statusFilter.value) {
    params.status = statusFilter.value
  }
  if (fromDateFilter.value) {
    params.from_date = fromDateFilter.value
  }
  if (toDateFilter.value) {
    params.to_date = toDateFilter.value
  }

  selectedTradeIds.value = []
  store.fetchDummyTrades(fmId.value, params)
}

const handlePageChange = (page) => {
  loadTrades(true, page)
}

const handlePerPageChange = (val) => {
  store.dummyTradesPagination.per_page = Number(val)
  loadTrades(true, 1)
}

const handleFilterChange = () => {
  loadTrades(true, 1)
}

const clearSymbolFilter = () => {
  symbolFilter.value = ''
  handleFilterChange()
}

const resetFilters = () => {
  symbolFilter.value = ''
  statusFilter.value = null
  fromDateFilter.value = ''
  toDateFilter.value = ''
  handleFilterChange()
}

// Selection Handlers
const toggleSelectTrade = (id) => {
  const index = selectedTradeIds.value.indexOf(id)
  if (index > -1) {
    selectedTradeIds.value.splice(index, 1)
  } else {
    selectedTradeIds.value.push(id)
  }
}

const toggleSelectAll = () => {
  const trades = store.dummyTrades || []
  if (isAllSelected.value) {
    selectedTradeIds.value = []
  } else {
    selectedTradeIds.value = trades.map((t) => t.id)
  }
}

// View & Edit Modal Handlers
const openViewModal = (trade) => {
  activeTrade.value = trade
  isViewModalOpen.value = true
}

const openEditModal = (trade) => {
  isViewModalOpen.value = false
  editForm.value = {
    id: trade.id,
    symbol: trade.symbol || '',
    type: (trade.type || trade.order_type || 'BUY').toUpperCase(),
    lot: Number(trade.lot) || 1.0,
    entry_price: Number(trade.entry_price) || 0,
    exit_price: trade.exit_price != null ? Number(trade.exit_price) : null,
    current_price: trade.current_price != null ? Number(trade.current_price) : null,
    pnl: Number(trade.pnl) || 0,
    status: trade.status || 'closed',
    opened_at: toDatetimeLocal(trade.opened_at),
    closed_at: toDatetimeLocal(trade.closed_at),
  }
  isEditModalOpen.value = true
}

const handleEditSubmit = async () => {
  if (!editForm.value.id) return

  const payload = {
    symbol: editForm.value.symbol.trim().toUpperCase(),
    type: editForm.value.type,
    lot: Number(editForm.value.lot),
    entry_price: Number(editForm.value.entry_price),
    pnl: Number(editForm.value.pnl),
    status: editForm.value.status,
  }

  if (editForm.value.exit_price !== null && editForm.value.exit_price !== '') {
    payload.exit_price = Number(editForm.value.exit_price)
  }
  if (editForm.value.current_price !== null && editForm.value.current_price !== '') {
    payload.current_price = Number(editForm.value.current_price)
  }
  if (editForm.value.opened_at) {
    payload.opened_at = new Date(editForm.value.opened_at).toISOString()
  }
  if (editForm.value.closed_at) {
    payload.closed_at = new Date(editForm.value.closed_at).toISOString()
  } else if (editForm.value.status === 'open') {
    payload.closed_at = null
  }

  try {
    await store.updateDummyTrade(editForm.value.id, payload)
    isEditModalOpen.value = false
    loadTrades(true)
  } catch (err) {
    console.error('Failed to update dummy trade:', err)
  }
}

// Delete Confirmation Handlers
const openDeleteSingleConfirm = (trade) => {
  isViewModalOpen.value = false
  tradeToDelete.value = trade
  isDeleteSingleModalOpen.value = true
}

const handleConfirmDeleteSingle = async () => {
  if (!tradeToDelete.value || !fmId.value) return
  try {
    await store.deleteDummyTrades(fmId.value, { trade_id: tradeToDelete.value.id })
    isDeleteSingleModalOpen.value = false
    tradeToDelete.value = null
    loadTrades(true)
  } catch (err) {
    console.error('Failed to delete single dummy trade:', err)
  }
}

const openDeleteSelectedConfirm = () => {
  if (selectedTradeIds.value.length === 0) return
  isDeleteSelectedModalOpen.value = true
}

const handleConfirmDeleteSelected = async () => {
  if (!fmId.value || selectedTradeIds.value.length === 0) return
  try {
    await store.deleteDummyTrades(fmId.value, { trade_ids: selectedTradeIds.value })
    isDeleteSelectedModalOpen.value = false
    selectedTradeIds.value = []
    loadTrades(true)
  } catch (err) {
    console.error('Failed to delete selected dummy trades:', err)
  }
}

const openDeleteAllConfirm = () => {
  isDeleteAllModalOpen.value = true
}

const handleConfirmDeleteAll = async () => {
  if (!fmId.value) return
  try {
    await store.deleteDummyTrades(fmId.value, { all: true })
    isDeleteAllModalOpen.value = false
    selectedTradeIds.value = []
    loadTrades(true)
  } catch (err) {
    console.error('Failed to delete all dummy trades:', err)
  }
}

const handleClose = () => {
  selectedTradeIds.value = []
  emit('close')
}

// Watch for drawer open / item change
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && fmId.value) {
      loadTrades(true, 1)
    }
  }
)

watch(
  () => props.item,
  (newItem) => {
    if (props.open && newItem) {
      loadTrades(true, 1)
    }
  }
)
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
