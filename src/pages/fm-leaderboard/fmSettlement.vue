<template>
  <div class="px-4 pb-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <span
            v-if="store.settlement?.preview"
            class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
          >
            Preview Mode
          </span>
          <span
            v-if="store.settlement?.settlement_id"
            class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-card-background text-secondary-text border border-primary-border"
          >
            Settlement #{{ store.settlement.settlement_id }}
          </span>
          <span
            class="px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-card-background text-primary border border-primary-border uppercase"
          >
            {{ activeCurrency }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          :disabled="store.loading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer"
          @click="store.fetchSettlement()"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
          Refresh
        </button>

        <button
          v-if="!hasEmptyData && hasPermission('fund_manager.run_seletement')"
          :disabled="store.runLoading || store.loading"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-primary/20"
          @click="confirmOpen = true"
        >
          <Loader2 v-if="store.runLoading" class="w-3.5 h-3.5 animate-spin" />
          <PlayCircle v-else class="w-3.5 h-3.5" />
          Run Settlement
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!store.loading && hasEmptyData"
      class="flex flex-col items-center justify-center py-20 gap-4 bg-card-background border border-primary-border rounded-2xl"
    >
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center">
        <ReceiptText class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center max-w-sm px-4">
        <p class="text-sm font-semibold text-primary-text">No Trades for Settlement</p>
        <p class="text-xs text-secondary-text mt-1">
          There are currently no closed follower trades available to settle for this fund manager.
        </p>
      </div>
    </div>

    <template v-else>

      <!-- Key Metrics Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Skeletons -->
        <template v-if="store.loading">
          <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
            <div class="h-3 w-16 bg-background rounded" />
            <div class="h-6 w-24 bg-background rounded" />
          </div>
        </template>

        <template v-else>
          <!-- Total PnL -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total PnL</span>
              <TrendingUp v-if="totalPnl >= 0" class="w-3.5 h-3.5 text-primary-green" />
              <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
            </div>
            <div class="mt-2">
              <p
                class="text-xl font-bold tabular-nums"
                :class="totalPnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
              >
                {{ totalPnl > 0 ? '+' : '' }}{{ formatCurrency(totalPnl) }}
              </p>
              <p class="text-[10px] text-secondary-text mt-0.5 truncate">{{ store.settlement?.fm_name }} (FM #{{ store.settlement?.fm_id }})</p>
            </div>
          </div>

          <!-- Total Fee -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Fee</span>
              <DollarSign class="w-3.5 h-3.5 text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-xl font-bold text-primary-text tabular-nums">{{ formatCurrency(summaryData.total_fee) }}</p>
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
              <p class="text-xl font-bold text-primary-text tabular-nums">{{ formatCurrency(summaryData.total_fm_net_after_agents) }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Gross: {{ formatCurrency(summaryData.total_fm_fee) }}</p>
            </div>
          </div>

          <!-- Broker Net Fee -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Broker Net</span>
              <Building2 class="w-3.5 h-3.5 text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-xl font-bold text-primary-text tabular-nums">{{ formatCurrency(summaryData.total_broker_net) }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Gross: {{ formatCurrency(summaryData.total_broker_fee) }}</p>
            </div>
          </div>

          <!-- IB Pool Distributed -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">IB Distributed</span>
              <GitBranch class="w-3.5 h-3.5 text-secondary-text" />
            </div>
            <div class="mt-2">
              <p class="text-xl font-bold text-primary-green tabular-nums">{{ formatCurrency(summaryData.total_ib_distributed) }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">{{ store.settlement?.ib_summary?.length ?? 0 }} IBs Benefiting</p>
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
              <p class="text-[10px] text-secondary-text mt-0.5">{{ summaryData.unique_followers }} Unique Follower{{ summaryData.unique_followers === 1 ? '' : 's' }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Tabs & Search -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-primary-border pb-3">
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'followers' ? 'bg-primary text-white' : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'followers'"
          >
            <Users class="w-3.5 h-3.5" />
            Follower Trades
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="activeTab === 'followers' ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'"
            >
              {{ store.settlement?.followers?.length ?? 0 }}
            </span>
          </button>

          <button
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'ib_summary' ? 'bg-primary text-white' : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'ib_summary'"
          >
            <PieChart class="w-3.5 h-3.5" />
            IB Summary
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="activeTab === 'ib_summary' ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'"
            >
              {{ store.settlement?.ib_summary?.length ?? 0 }}
            </span>
          </button>

          <button
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'ib_distribution' ? 'bg-primary text-white' : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'ib_distribution'"
          >
            <GitBranch class="w-3.5 h-3.5" />
            IB Distribution Logs
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="activeTab === 'ib_distribution' ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'"
            >
              {{ store.settlement?.ib_distribution?.length ?? 0 }}
            </span>
          </button>

          <button
            v-if="store.settlement?.agent_distribution?.length"
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'agent_distribution' ? 'bg-primary text-white' : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'agent_distribution'"
          >
            <Shield class="w-3.5 h-3.5" />
            Agent Distribution
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="activeTab === 'agent_distribution' ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'"
            >
              {{ store.settlement.agent_distribution.length }}
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div v-if="activeTab === 'followers' || activeTab === 'ib_distribution' || activeTab === 'ib_summary'" class="relative w-full sm:w-64">
          <Search class="w-3.5 h-3.5 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, ID..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text placeholder:text-secondary-text outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: FOLLOWER TRADES TABLE -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'followers'">

        <!-- Desktop Table -->
        <div class="hidden lg:block border border-primary-border rounded-2xl overflow-hidden bg-card-background">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-primary-border bg-background/50">
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Follower</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Account</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Trade</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Gross PnL</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Profit > HWM</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Total Fee</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">FM Fee</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Broker Fee</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">IB Pool</th>
                  <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Net PnL</th>
                  <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3 w-10">Details</th>
                </tr>
              </thead>

              <tbody v-if="store.loading">
                <tr v-for="n in 4" :key="n" class="border-b border-primary-border animate-pulse">
                  <td class="p-3"><div class="h-3 w-28 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-16 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-16 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
                  <td class="p-3 flex justify-end"><div class="h-3 w-16 bg-background rounded" /></td>
                  <td class="p-3"><div class="h-4 w-4 bg-background rounded mx-auto" /></td>
                </tr>
              </tbody>

              <tbody v-else>
                <template v-for="f in filteredFollowers" :key="f.follower_id + '-' + f.trade_id">
                  <tr
                    class="border-b border-primary-border transition-colors cursor-pointer"
                    :class="expandedFollowerKey === `${f.follower_id}-${f.trade_id}` ? 'bg-background/80' : 'hover:bg-background/40'"
                    @click="toggleFollowerExpand(`${f.follower_id}-${f.trade_id}`)"
                  >
                    <!-- Follower -->
                    <td class="p-3">
                      <p class="text-xs font-semibold text-primary-text">{{ f.user_name }}</p>
                      <p class="text-[11px] text-secondary-text">{{ f.user_email }}</p>
                      <p class="text-[10px] text-secondary-text">User ID: #{{ f.user_id }}</p>
                    </td>

                    <!-- Account -->
                    <td class="p-3">
                      <p class="text-xs font-mono font-medium text-primary-text">{{ f.account_number }}</p>
                      <p class="text-[10px] text-secondary-text">Acc ID: {{ f.trading_account_id }}</p>
                    </td>

                    <!-- Trade / Symbol -->
                    <td class="p-3">
                      <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-background border border-primary-border text-primary-text">
                        {{ f.symbol }}
                      </span>
                      <p class="text-[10px] text-secondary-text mt-0.5 font-mono">Trade #{{ f.trade_id }}</p>
                    </td>

                    <!-- Gross PnL -->
                    <td class="p-3">
                      <span
                        class="text-xs font-semibold tabular-nums"
                        :class="f.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                      >
                        {{ f.gross_pnl > 0 ? '+' : '' }}{{ formatCurrency(f.gross_pnl, getRowCurrency(f)) }}
                      </span>
                    </td>

                    <!-- Profit Above HWM -->
                    <td class="p-3">
                      <span class="text-xs font-medium text-primary-text tabular-nums">
                        {{ formatCurrency(f.hwm?.profit_above_hwm, getRowCurrency(f)) }}
                      </span>
                    </td>

                    <!-- Total Fee -->
                    <td class="p-3">
                      <span class="text-xs font-medium text-primary-text tabular-nums">
                        {{ formatCurrency(f.fee, getRowCurrency(f)) }}
                      </span>
                    </td>

                    <!-- FM Fee (Gross / Net) -->
                    <td class="p-3">
                      <p class="text-xs font-medium text-primary-text tabular-nums">{{ formatCurrency(f.distribution?.fm_net_after_agents ?? f.fm_fee, getRowCurrency(f)) }}</p>
                      <p v-if="f.distribution?.fm_fee !== f.distribution?.fm_net_after_agents" class="text-[10px] text-secondary-text">
                        Gross: {{ formatCurrency(f.fm_fee, getRowCurrency(f)) }}
                      </p>
                    </td>

                    <!-- Broker Fee (Gross / Net) -->
                    <td class="p-3">
                      <p class="text-xs font-medium text-primary-text tabular-nums">{{ formatCurrency(f.distribution?.broker_net ?? f.broker_net ?? f.broker_fee, getRowCurrency(f)) }}</p>
                      <p v-if="f.broker_fee !== f.broker_net" class="text-[10px] text-secondary-text">
                        Gross: {{ formatCurrency(f.broker_fee, getRowCurrency(f)) }}
                      </p>
                    </td>

                    <!-- IB Pool -->
                    <td class="p-3">
                      <span class="text-xs font-medium text-primary-green tabular-nums">
                        {{ formatCurrency(f.ib_pool, getRowCurrency(f)) }}
                      </span>
                    </td>

                    <!-- Net PnL -->
                    <td class="p-3 text-right">
                      <span
                        class="text-xs font-bold tabular-nums"
                        :class="f.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                      >
                        {{ f.net_pnl > 0 ? '+' : '' }}{{ formatCurrency(f.net_pnl, getRowCurrency(f)) }}
                      </span>
                    </td>

                    <!-- Toggle Icon -->
                    <td class="p-3 text-center">
                      <ChevronDown
                        class="w-4 h-4 text-secondary-text mx-auto transition-transform duration-200"
                        :class="{ 'rotate-180 text-primary': expandedFollowerKey === `${f.follower_id}-${f.trade_id}` }"
                      />
                    </td>
                  </tr>

                  <!-- Accordion Expanded Breakdown -->
                  <tr
                    v-if="expandedFollowerKey === `${f.follower_id}-${f.trade_id}`"
                    class="border-b border-primary-border bg-background/50"
                  >
                    <td colspan="11" class="p-4">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <!-- HWM Breakdown -->
                        <div class="bg-card-background border border-primary-border rounded-xl p-3.5 space-y-2.5">
                          <p class="text-xs font-semibold text-primary-text flex items-center gap-1.5">
                            <Activity class="w-3.5 h-3.5 text-primary" /> High Water Mark (HWM)
                          </p>
                          <div class="space-y-1.5 text-xs">
                            <div class="flex justify-between">
                              <span class="text-secondary-text">Previous HWM:</span>
                              <span class="font-mono text-primary-text">{{ formatCurrency(f.hwm?.previous_hwm, getRowCurrency(f)) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">Current Total Before:</span>
                              <span class="font-mono text-primary-text">{{ formatCurrency(f.hwm?.current_total_before, getRowCurrency(f)) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">Profit Above HWM:</span>
                              <span class="font-mono font-semibold text-primary-green">{{ formatCurrency(f.hwm?.profit_above_hwm, getRowCurrency(f)) }}</span>
                            </div>
                            <div class="flex justify-between border-t border-primary-border pt-1.5">
                              <span class="text-secondary-text">New Equity:</span>
                              <span class="font-mono font-semibold text-primary-text">{{ formatCurrency(f.hwm?.new_equity, getRowCurrency(f)) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Config Shares -->
                        <div class="bg-card-background border border-primary-border rounded-xl p-3.5 space-y-2.5">
                          <p class="text-xs font-semibold text-primary-text flex items-center gap-1.5">
                            <Sliders class="w-3.5 h-3.5 text-primary" /> Configuration & Splits
                          </p>
                          <div class="space-y-1.5 text-xs">
                            <div class="flex justify-between">
                              <span class="text-secondary-text">Performance Fee:</span>
                              <span class="font-medium text-primary-text">{{ f.config?.performance_fee }}%</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">FM Share / Broker Share:</span>
                              <span class="font-medium text-primary-text">{{ f.config?.fm_share }}% / {{ f.config?.broker_share }}%</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">IB Pool Percentage:</span>
                              <span class="font-medium text-primary-text">{{ f.config?.ib_pool_percentage }}%</span>
                            </div>
                            <div class="flex justify-between border-t border-primary-border pt-1.5">
                              <span class="text-secondary-text">Settlement Type:</span>
                              <span class="font-medium capitalize text-primary-text">{{ f.config?.settlement_type }}</span>
                            </div>
                            <div class="flex justify-between text-[11px] text-secondary-text">
                              <span>Offer #{{ f.config?.offer_id }}</span>
                              <span>Join Link #{{ f.config?.join_link_id }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Fee Distribution & IB Splits -->
                        <div class="bg-card-background border border-primary-border rounded-xl p-3.5 space-y-2.5">
                          <p class="text-xs font-semibold text-primary-text flex items-center gap-1.5">
                            <GitBranch class="w-3.5 h-3.5 text-primary" /> Trade Distribution
                          </p>
                          <div class="space-y-1.5 text-xs">
                            <div class="flex justify-between">
                              <span class="text-secondary-text">Total Calculated Fee:</span>
                              <span class="font-mono font-medium text-primary-text">{{ formatCurrency(f.distribution?.total_fee, getRowCurrency(f)) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">FM Fee (Net):</span>
                              <span class="font-mono text-primary-text">{{ formatCurrency(f.distribution?.fm_net_after_agents, getRowCurrency(f)) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">Broker Fee (Net):</span>
                              <span class="font-mono text-primary-text">{{ formatCurrency(f.distribution?.broker_net, getRowCurrency(f)) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-secondary-text">IB Pool / Distributed:</span>
                              <span class="font-mono text-primary-green">{{ formatCurrency(f.distribution?.ib_pool, getRowCurrency(f)) }} / {{ formatCurrency(f.distribution?.ib_distributed, getRowCurrency(f)) }}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      <!-- Per-trade IB Splits Table if available -->
                      <div v-if="f.distribution?.ib_splits?.length" class="mt-3 bg-card-background border border-primary-border rounded-xl p-3">
                        <p class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider mb-2">
                          IB Commission Splits for Trade #{{ f.trade_id }}
                        </p>
                        <div class="overflow-x-auto">
                          <table class="w-full text-xs">
                            <thead>
                              <tr class="border-b border-primary-border text-[10px] text-secondary-text uppercase">
                                <th class="text-left py-1.5 px-2 font-medium">IB Name</th>
                                <th class="text-left py-1.5 px-2 font-medium">IB Email</th>
                                <th class="text-left py-1.5 px-2 font-medium">Level</th>
                                <th class="text-left py-1.5 px-2 font-medium">Pool Share %</th>
                                <th class="text-left py-1.5 px-2 font-medium">Split %</th>
                                <th class="text-right py-1.5 px-2 font-medium">Commission</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="split in f.distribution.ib_splits"
                                :key="split.ib_id"
                                class="border-b border-primary-border/50 last:border-none"
                              >
                                <td class="py-1.5 px-2 font-medium text-primary-text">
                                  {{ split.ib_name }} (ID #{{ split.ib_user_id }})
                                </td>
                                <td class="py-1.5 px-2 text-secondary-text">{{ split.ib_email }}</td>
                                <td class="py-1.5 px-2 text-secondary-text">L{{ split.ib_level }}</td>
                                <td class="py-1.5 px-2 font-mono text-primary-text">{{ split.pool_share_pct }}%</td>
                                <td class="py-1.5 px-2 font-mono text-primary-text">{{ split.split_percentage }}%</td>
                                <td class="py-1.5 px-2 text-right font-mono font-semibold text-primary-green">
                                  {{ formatCurrency(split.commission, getRowCurrency(f)) }}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>

                <tr v-if="filteredFollowers.length === 0">
                  <td colspan="11" class="text-center py-10 text-xs text-secondary-text">
                    No follower trades found matching your search.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Follower Cards -->
        <div class="lg:hidden space-y-3">
          <div
            v-for="f in filteredFollowers"
            :key="f.follower_id + '-' + f.trade_id"
            class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-primary-text">{{ f.user_name }}</p>
                <p class="text-[11px] text-secondary-text">{{ f.user_email }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-mono bg-background border border-primary-border px-1.5 py-0.5 rounded text-primary-text">
                    {{ f.symbol }}
                  </span>
                  <span class="text-[10px] text-secondary-text font-mono">
                    Trade #{{ f.trade_id }} · Acc {{ f.account_number }}
                  </span>
                </div>
              </div>

              <div class="text-right">
                <p class="text-[10px] text-secondary-text">Net PnL</p>
                <span
                  class="text-sm font-bold tabular-nums"
                  :class="f.net_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ f.net_pnl > 0 ? '+' : '' }}{{ formatCurrency(f.net_pnl, getRowCurrency(f)) }}
                </span>
              </div>
            </div>

            <!-- Card Metrics Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-background rounded-xl p-2.5">
                <p class="text-[10px] text-secondary-text">Gross PnL</p>
                <p class="font-semibold tabular-nums mt-0.5" :class="f.gross_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
                  {{ f.gross_pnl > 0 ? '+' : '' }}{{ formatCurrency(f.gross_pnl, getRowCurrency(f)) }}
                </p>
              </div>

              <div class="bg-background rounded-xl p-2.5">
                <p class="text-[10px] text-secondary-text">Total Fee</p>
                <p class="font-semibold text-primary-text tabular-nums mt-0.5">{{ formatCurrency(f.fee, getRowCurrency(f)) }}</p>
              </div>

              <div class="bg-background rounded-xl p-2.5">
                <p class="text-[10px] text-secondary-text">FM Net Fee</p>
                <p class="font-semibold text-primary-text tabular-nums mt-0.5">
                  {{ formatCurrency(f.distribution?.fm_net_after_agents ?? f.fm_fee, getRowCurrency(f)) }}
                </p>
              </div>

              <div class="bg-background rounded-xl p-2.5">
                <p class="text-[10px] text-secondary-text">Broker Net</p>
                <p class="font-semibold text-primary-text tabular-nums mt-0.5">
                  {{ formatCurrency(f.distribution?.broker_net ?? f.broker_net ?? f.broker_fee, getRowCurrency(f)) }}
                </p>
              </div>
            </div>

            <!-- Expand button for mobile -->
            <button
              class="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-secondary-text hover:text-primary-text border-t border-primary-border mt-1 cursor-pointer"
              @click="toggleFollowerExpand(`${f.follower_id}-${f.trade_id}`)"
            >
              <span>{{ expandedFollowerKey === `${f.follower_id}-${f.trade_id}` ? 'Hide Details' : 'View Full Details' }}</span>
              <ChevronDown
                class="w-3.5 h-3.5 transition-transform"
                :class="{ 'rotate-180': expandedFollowerKey === `${f.follower_id}-${f.trade_id}` }"
              />
            </button>

            <!-- Expanded mobile details -->
            <div
              v-if="expandedFollowerKey === `${f.follower_id}-${f.trade_id}`"
              class="pt-2 space-y-3 border-t border-primary-border/60 text-xs"
            >
              <div class="bg-background rounded-xl p-3 space-y-1.5">
                <p class="text-[11px] font-semibold text-primary-text">High Water Mark (HWM)</p>
                <div class="flex justify-between text-[11px] text-secondary-text">
                  <span>Previous HWM:</span>
                  <span class="font-mono text-primary-text">{{ formatCurrency(f.hwm?.previous_hwm, getRowCurrency(f)) }}</span>
                </div>
                <div class="flex justify-between text-[11px] text-secondary-text">
                  <span>Profit Above HWM:</span>
                  <span class="font-mono text-primary-green">{{ formatCurrency(f.hwm?.profit_above_hwm, getRowCurrency(f)) }}</span>
                </div>
                <div class="flex justify-between text-[11px] text-secondary-text">
                  <span>New Equity:</span>
                  <span class="font-mono text-primary-text">{{ formatCurrency(f.hwm?.new_equity, getRowCurrency(f)) }}</span>
                </div>
              </div>

              <div class="bg-background rounded-xl p-3 space-y-1.5">
                <p class="text-[11px] font-semibold text-primary-text">Configuration</p>
                <div class="flex justify-between text-[11px] text-secondary-text">
                  <span>Performance Fee:</span>
                  <span class="text-primary-text">{{ f.config?.performance_fee }}%</span>
                </div>
                <div class="flex justify-between text-[11px] text-secondary-text">
                  <span>FM / Broker Share:</span>
                  <span class="text-primary-text">{{ f.config?.fm_share }}% / {{ f.config?.broker_share }}%</span>
                </div>
                <div class="flex justify-between text-[11px] text-secondary-text">
                  <span>IB Pool Share:</span>
                  <span class="text-primary-text">{{ f.config?.ib_pool_percentage }}%</span>
                </div>
              </div>

              <div v-if="f.distribution?.ib_splits?.length" class="bg-background rounded-xl p-3 space-y-2">
                <p class="text-[11px] font-semibold text-primary-text">IB Splits</p>
                <div
                  v-for="split in f.distribution.ib_splits"
                  :key="split.ib_id"
                  class="flex items-center justify-between border-b border-primary-border/40 pb-1.5 last:border-none last:pb-0 text-[11px]"
                >
                  <div>
                    <p class="font-medium text-primary-text">{{ split.ib_name }} (L{{ split.ib_level }})</p>
                    <p class="text-[10px] text-secondary-text">{{ split.ib_email }}</p>
                  </div>
                  <span class="font-mono font-semibold text-primary-green">{{ formatCurrency(split.commission, getRowCurrency(f)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: IB SUMMARY -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'ib_summary'">
        <div class="border border-primary-border rounded-2xl overflow-hidden bg-card-background">
          <div class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-card-background">
            <div class="flex items-center gap-2">
              <PieChart class="w-4 h-4 text-secondary-text" />
              <span class="text-xs font-semibold text-primary-text">IB Settlement Summary</span>
            </div>
            <span class="text-xs text-secondary-text">
              Total Commission: <span class="font-semibold text-primary-green">{{ formatCurrency(summaryData.total_ib_distributed) }}</span>
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-primary-border bg-background/50">
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">IB Partner</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Level</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Split %</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Eligible Trades</th>
                  <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Total Commission</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(ib, idx) in filteredIbSummary"
                  :key="ib.ib_id || idx"
                  class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
                >
                  <td class="p-3">
                    <p class="text-xs font-semibold text-primary-text">{{ ib.ib_name }}</p>
                    <p class="text-[11px] text-secondary-text">{{ ib.ib_email }}</p>
                    <p class="text-[10px] text-secondary-text">User ID: #{{ ib.ib_user_id }} · IB ID: #{{ ib.ib_id }}</p>
                  </td>

                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-background border border-primary-border text-primary-text">
                      Level {{ ib.ib_level }}
                    </span>
                  </td>

                  <td class="p-3">
                    <span class="text-xs font-mono text-primary-text">{{ ib.split_percentage }}%</span>
                  </td>

                  <td class="p-3">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="tid in ib.trade_ids"
                        :key="tid"
                        class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-background border border-primary-border text-secondary-text"
                      >
                        #{{ tid }}
                      </span>
                    </div>
                  </td>

                  <td class="p-3 text-right">
                    <span class="text-xs font-bold font-mono text-primary-green">
                      {{ formatCurrency(ib.total_commission) }}
                    </span>
                  </td>
                </tr>

                <tr v-if="filteredIbSummary.length === 0">
                  <td colspan="5" class="text-center py-10 text-xs text-secondary-text">
                    No IB summary records found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 3: IB DISTRIBUTION LOGS -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'ib_distribution'">
        <div class="border border-primary-border rounded-2xl overflow-hidden bg-card-background">
          <div class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-card-background">
            <div class="flex items-center gap-2">
              <GitBranch class="w-4 h-4 text-secondary-text" />
              <span class="text-xs font-semibold text-primary-text">IB Distribution Breakdown (Per Trade)</span>
            </div>
            <span class="text-xs text-secondary-text">
              {{ store.settlement?.ib_distribution?.length ?? 0 }} Records
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-primary-border bg-background/50">
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Trade ID</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">IB Partner</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Level</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Pool Share %</th>
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Split %</th>
                  <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Commission</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(ib, idx) in filteredIbDistribution"
                  :key="idx"
                  class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
                >
                  <td class="p-3 font-mono text-xs font-semibold text-primary-text">
                    #{{ ib.trade_id }}
                  </td>

                  <td class="p-3">
                    <p class="text-xs font-semibold text-primary-text">{{ ib.ib_name }}</p>
                    <p class="text-[11px] text-secondary-text">{{ ib.ib_email }}</p>
                    <p class="text-[10px] text-secondary-text">User ID: #{{ ib.ib_user_id }}</p>
                  </td>

                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-background border border-primary-border text-primary-text">
                      Level {{ ib.ib_level }}
                    </span>
                  </td>

                  <td class="p-3 font-mono text-xs text-primary-text">
                    {{ ib.pool_share_pct }}%
                  </td>

                  <td class="p-3 font-mono text-xs text-primary-text">
                    {{ ib.split_percentage }}%
                  </td>

                  <td class="p-3 text-right font-mono text-xs font-semibold text-primary-green">
                    {{ formatCurrency(ib.commission) }}
                  </td>
                </tr>

                <tr v-if="filteredIbDistribution.length === 0">
                  <td colspan="6" class="text-center py-10 text-xs text-secondary-text">
                    No IB distribution logs found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 4: AGENT DISTRIBUTION -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'agent_distribution'">
        <div class="border border-primary-border rounded-2xl overflow-hidden bg-card-background">
          <div class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-card-background">
            <div class="flex items-center gap-2">
              <Shield class="w-4 h-4 text-secondary-text" />
              <span class="text-xs font-semibold text-primary-text">Agent Distribution</span>
            </div>
            <span class="text-xs text-secondary-text">
              Total Agent Distributed: <span class="font-semibold text-primary-text">{{ formatCurrency(summaryData.total_agent_distributed) }}</span>
            </span>
          </div>

          <div v-if="!store.settlement?.agent_distribution?.length" class="text-center py-12 text-xs text-secondary-text">
            No agent distributions recorded for this settlement.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-primary-border bg-background/50">
                  <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Agent</th>
                  <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3">Commission</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(agent, idx) in store.settlement.agent_distribution"
                  :key="idx"
                  class="border-b border-primary-border last:border-none"
                >
                  <td class="p-3 text-xs font-medium text-primary-text">{{ agent.name || agent.email || 'Agent' }}</td>
                  <td class="p-3 text-right text-xs font-semibold text-primary-green tabular-nums">{{ formatCurrency(agent.commission) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </template>

    <!-- Confirm Dialog -->
    <RunSettlementConfirm
      :open="confirmOpen"
      :settlement="store.settlement"
      :currency="activeCurrency"
      :run-loading="store.runLoading"
      @close="confirmOpen = false"
      @confirm="handleRun"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  PlayCircle,
  ReceiptText,
  Users,
  GitBranch,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Building2,
  Activity,
  Sliders,
  ChevronDown,
  Search,
  RotateCw,
  Shield,
} from 'lucide-vue-next'
import { useRunSettlementStore } from '@/stores/fmLeaderboard/runSettlement'
import RunSettlementConfirm from '@/components/fundManager/RunSettlementConfirm.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const route = useRoute()
const store = useRunSettlementStore()
const { hasPermission } = usePermissionCheck()

const confirmOpen = ref(false)
const activeTab = ref('followers')
const searchQuery = ref('')
const expandedFollowerKey = ref(null)
const fmInfo = ref(null)

const loadFmInfo = () => {
  try {
    const raw = localStorage.getItem('active_fm')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (String(parsed?.id) === String(route.params.id)) {
        fmInfo.value = parsed
      }
    }
  } catch (e) {
    console.error('Failed to load active FM from localStorage:', e)
  }
}

const activeCurrency = computed(() => {
  return (
    route.query.currency ||
    store.settlement?.broker_currency ||
    store.settlement?.currency ||
    fmInfo.value?.broker_currency ||
    fmInfo.value?.currency ||
    fmInfo.value?.coverage_account?.broker_currency ||
    fmInfo.value?.master_account?.broker_currency ||
    'USD'
  )
})

const getCurrencySymbol = (currency) => {
  const c = String(currency || '').trim().toUpperCase()
  if (c === 'USC' || c === 'CENT') return 'C'
  if (c === 'CAD') return 'C$'
  if (c === 'EUR') return '€'
  if (c === 'GBP') return '£'
  if (c === 'INR') return '₹'
  if (c === 'JPY') return '¥'
  if (c === 'USD') return '$'
  return c ? `${c} ` : '$'
}

const formatCurrency = (val, currency = null) => {
  if (val === null || val === undefined || val === '') return '—'
  const num = Number(val)
  if (isNaN(num)) return '—'
  const sym = getCurrencySymbol(currency || activeCurrency.value)
  const isNegative = num < 0
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${isNegative ? '-' : ''}${sym}${formatted}`
}

const getRowCurrency = (row) => {
  return (
    row?.broker_currency ||
    row?.currency ||
    row?.trading_account?.broker_currency ||
    row?.account?.broker_currency ||
    activeCurrency.value ||
    'USD'
  )
}

const toggleFollowerExpand = (key) => {
  expandedFollowerKey.value = expandedFollowerKey.value === key ? null : key
}

const summaryData = computed(() => {
  const s = store.settlement?.summary || {}
  return {
    total_pnl: s.total_pnl ?? store.settlement?.total_pnl ?? 0,
    total_fee: s.total_fee ?? store.settlement?.total_fee ?? 0,
    total_trades: s.total_trades ?? store.settlement?.total_trades ?? 0,
    unique_followers: s.unique_followers ?? (store.settlement?.followers ? new Set(store.settlement.followers.map(f => f.follower_id)).size : 0),
    total_fm_fee: s.total_fm_fee ?? 0,
    total_fm_net_after_agents: s.total_fm_net_after_agents ?? s.total_fm_fee ?? 0,
    total_broker_fee: s.total_broker_fee ?? 0,
    total_broker_net: s.total_broker_net ?? s.total_broker_fee ?? 0,
    total_ib_distributed: s.total_ib_distributed ?? 0,
    total_agent_distributed: s.total_agent_distributed ?? 0,
  }
})

const totalPnl = computed(() => summaryData.value.total_pnl)

const hasEmptyData = computed(() => {
  if (store.loading) return false
  if (!store.settlement) return true
  const followersCount = store.settlement?.followers?.length ?? 0
  const tradesCount = store.settlement?.total_trades ?? store.settlement?.summary?.total_trades ?? 0
  return followersCount === 0 && tradesCount === 0
})

// Search filtered lists
const filteredFollowers = computed(() => {
  const list = store.settlement?.followers || []
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(f =>
    String(f.user_name || '').toLowerCase().includes(q) ||
    String(f.user_email || '').toLowerCase().includes(q) ||
    String(f.account_number || '').toLowerCase().includes(q) ||
    String(f.user_id || '').includes(q) ||
    String(f.trade_id || '').includes(q) ||
    String(f.symbol || '').toLowerCase().includes(q)
  )
})

const filteredIbSummary = computed(() => {
  const list = store.settlement?.ib_summary || []
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(ib =>
    String(ib.ib_name || '').toLowerCase().includes(q) ||
    String(ib.ib_email || '').toLowerCase().includes(q) ||
    String(ib.ib_user_id || '').includes(q) ||
    String(ib.ib_id || '').includes(q)
  )
})

const filteredIbDistribution = computed(() => {
  const list = store.settlement?.ib_distribution || []
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(ib =>
    String(ib.ib_name || '').toLowerCase().includes(q) ||
    String(ib.ib_email || '').toLowerCase().includes(q) ||
    String(ib.ib_user_id || '').includes(q) ||
    String(ib.trade_id || '').includes(q)
  )
})

const handleRun = async () => {
  await store.runSettlement()
  confirmOpen.value = false
}

onMounted(() => {
  loadFmInfo()
  store.fetchSettlement()
})
</script>