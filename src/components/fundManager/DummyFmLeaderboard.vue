<template>
  <div class="space-y-4">
    <!-- DUMMY FM TOOLBAR: Search, Reset, Refresh, View Switcher -->
    <div
      class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3"
    >
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1"
      >
        <!-- Real / Dummy FM Tab Switcher Pill -->
        <div
          class="flex items-center gap-1 p-0.5 bg-background border border-primary-border rounded-lg shrink-0 h-9"
        >
          <button
            type="button"
            @click="emit('switch-tab', 'real')"
            class="flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-bold transition-all cursor-pointer select-none"
            :class="
              activeTab === 'real'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
            "
          >
            <HugeIcon :icon="UserGroupIcon" :size="15" />
            <span>Real FM Info</span>
          </button>

          <button
            type="button"
            @click="emit('switch-tab', 'dummy')"
            class="flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-bold transition-all cursor-pointer select-none"
            :class="
              activeTab === 'dummy'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
            "
          >
            <HugeIcon :icon="UserAiIcon" :size="15" />
            <span>Dummy FM Info</span>
          </button>
        </div>

        <!-- Search Input (full width for dummy) -->
        <div class="relative h-9 w-full sm:max-w-56">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search dummy fund manager by label, name, email or ID..."
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

        <!-- Per Page Option -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-28 shrink-0"
          @update:modelValue="handlePerPageChange"
        />

        <!-- Clear Search / Filters -->
        <button
          v-if="searchQuery"
          type="button"
          class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          @click="searchQuery = ''"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Reset
        </button>

        <!-- Refresh Button -->
        <button
          type="button"
          :disabled="store.isLoading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0 sm:ml-auto"
          title="Refresh Dummy Fund Managers"
          @click="
            () => store.fetchFmLeaderboard(true, store.pagination.page, 'dummy')
          "
        >
          <RefreshCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': store.isLoading }"
          />
        </button>
      </div>

      <!-- View Switcher (Grid / List) -->
      <div class="flex items-center gap-2 justify-end shrink-0">
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
      </div>
    </div>

    <!-- SKELETON LOADING STATE -->
    <div v-if="store.isLoading">
      <div
        v-if="layoutMode === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-lg p-5 flex flex-col justify-between animate-pulse space-y-4"
        >
          <div>
            <!-- Header Skeleton -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div
                  class="w-11 h-11 rounded-xl bg-background border border-primary-border/60 shrink-0"
                />
                <div class="space-y-1.5 min-w-0 flex-1">
                  <div class="h-4 w-32 bg-background rounded" />
                  <div class="h-3 w-20 bg-background rounded" />
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <div class="h-5 w-16 bg-background rounded-full" />
                <div class="h-7 w-7 bg-background rounded-lg" />
              </div>
            </div>

            <!-- Email & KYC Banner Skeleton -->
            <div
              class="bg-background/80 border border-primary-border/80 rounded-xl px-3 py-2 flex items-center justify-between mb-3.5"
            >
              <div class="flex items-center gap-2">
                <div class="w-3.5 h-3.5 rounded bg-background shrink-0" />
                <div class="h-3 w-40 bg-background rounded" />
              </div>
              <div class="h-4 w-16 bg-background rounded-md" />
            </div>

            <!-- Total Return & Win Rate Hero Skeleton -->
            <div
              class="bg-background/70 border border-primary-border/80 rounded-xl p-3 flex items-center justify-between mb-3"
            >
              <div class="space-y-1.5">
                <div class="h-2.5 w-24 bg-background rounded" />
                <div class="h-5 w-28 bg-background rounded" />
              </div>
              <div class="flex flex-col items-end space-y-1.5">
                <div class="h-2.5 w-14 bg-background rounded" />
                <div class="h-6 w-14 bg-background rounded-lg" />
              </div>
            </div>

            <!-- Simulation Metrics Grid Skeleton (3 columns) -->
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div
                class="bg-background/40 border border-primary-border/40 rounded-xl p-2 flex flex-col items-center gap-1.5"
              >
                <div class="h-2 w-16 bg-background rounded" />
                <div class="h-3.5 w-10 bg-background rounded" />
              </div>
              <div
                class="bg-background/40 border border-primary-border/40 rounded-xl p-2 flex flex-col items-center gap-1.5"
              >
                <div class="h-2 w-16 bg-background rounded" />
                <div class="h-3.5 w-10 bg-background rounded" />
              </div>
              <div
                class="bg-background/40 border border-primary-border/40 rounded-xl p-2 flex flex-col items-center gap-1.5"
              >
                <div class="h-2 w-14 bg-background rounded" />
                <div class="h-3.5 w-10 bg-background rounded" />
              </div>
            </div>

            <!-- Active Since Skeleton Box -->
            <div
              class="bg-background/40 border border-primary-border/40 rounded-xl p-2.5 mb-3 flex items-center justify-between"
            >
              <div class="h-2.5 w-16 bg-background rounded" />
              <div class="h-2.5 w-20 bg-background rounded" />
            </div>
          </div>

          <!-- Card Action Footer Skeleton -->
          <div
            class="pt-3 mt-2 border-t border-primary-border/60 flex items-center justify-between gap-2"
          >
            <div
              class="h-7 w-28 bg-background border border-primary-border/60 rounded-lg"
            />
            <div
              class="h-7 w-8 bg-background border border-primary-border/60 rounded-lg shrink-0"
            />
          </div>
        </div>
      </div>
      <div
        v-else
        class="border border-primary-border rounded-lg overflow-hidden bg-card-background/40"
      >
        <div class="p-4 space-y-3">
          <div
            v-for="n in 5"
            :key="n"
            class="h-12 bg-background rounded-xl animate-pulse w-full"
          />
        </div>
      </div>
    </div>

    <!-- MAIN DATA DISPLAY -->
    <div v-else>
      <!-- EMPTY STATE -->
      <div
        v-if="filteredData.length === 0"
        class="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary-border bg-card-background/30 py-16 px-4 text-center"
      >
        <div
          class="relative flex h-16 w-16 items-center justify-center rounded-lg bg-background border border-primary-border mb-4"
        >
          <Sparkles class="w-8 h-8 text-primary" />
        </div>

        <h3 class="text-base font-semibold text-primary-text mb-1">
          {{
            searchQuery
              ? "No matching dummy fund managers"
              : "No dummy fund managers found"
          }}
        </h3>
        <p class="max-w-xs text-xs text-secondary-text mb-5">
          {{
            searchQuery
              ? "Try adjusting your search criteria."
              : "Create or configure simulation metrics for any Real Fund Manager to display them here."
          }}
        </p>

        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border bg-card-background px-4 py-2 text-xs font-medium text-primary-text hover:bg-background transition-colors cursor-pointer"
        >
          <RotateCcw class="mr-1.5 h-3.5 w-3.5" />
          Clear Search
        </button>
        <button
          v-else
          @click="$emit('switch-to-real')"
          class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow cursor-pointer transition-colors bg-primary hover:bg-primary-hover"
        >
          <Users class="mr-1.5 h-4 w-4" />
          <span>View Real Fund Managers</span>
        </button>
      </div>

      <!-- GRID CARD VIEW -->
      <div
        v-else-if="layoutMode === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <div
          v-for="item in filteredData"
          :key="getFmId(item)"
          class="bg-card-background border border-primary-border rounded-lg p-5 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <!-- Card Identity Header -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div
                  class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform"
                >
                  <HugeIcon
                    :icon="User02Icon"
                    :size="20"
                    class="text-primary"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h4
                      class="text-base font-bold text-primary-text truncate tracking-tight"
                      :title="getLabelName(item)"
                    >
                      {{ getLabelName(item) }}
                    </h4>
                    <span
                      class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text shrink-0"
                      title="Fund Manager ID"
                    >
                      #{{ getFmId(item) }}
                    </span>
                  </div>
                  <p
                    v-if="getUserName(item)"
                    class="text-xs text-secondary-text truncate font-medium"
                  >
                    {{ getUserName(item) }}
                  </p>
                </div>
              </div>

              <!-- Status Badges & Actions Dropdown -->
              <div class="flex items-center gap-1.5 shrink-0">
                <div class="flex flex-col items-end gap-1">
                  <span
                    class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5"
                    :class="
                      getIsActive(item)
                        ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                        : 'bg-background text-secondary-text border border-primary-border'
                    "
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full animate-pulse"
                      :class="
                        getIsActive(item) ? 'bg-primary-green' : 'bg-zinc-400'
                      "
                    />
                    {{ getIsActive(item) ? "Active" : "Inactive" }}
                  </span>

                  <span
                    v-if="isDummyActive(item)"
                    class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    title="Dummy Leaderboard Simulation is Enabled"
                  >
                    <HugeIcon
                      :icon="AddTeamIcon"
                      :size="11"
                      class="text-amber-500 shrink-0"
                    />
                    <span>Dummy Enabled</span>
                  </span>
                </div>

                <DropdownMenu
                  :items="getRowActions(item)"
                  @select="(menuItem) => onMenuSelect(menuItem, item)"
                />
              </div>
            </div>

            <!-- Prominent User Email Banner -->
            <div
              class="bg-background/80 border border-primary-border/80 rounded-lg px-3 py-2 flex items-center justify-between mb-3.5"
            >
              <div class="flex items-center gap-2 min-w-0">
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                <span
                  class="text-xs font-semibold text-primary-text truncate font-mono select-all"
                  :title="getUserEmail(item)"
                >
                  {{ getUserEmail(item) }}
                </span>
              </div>
              <span
                v-if="getKycStatus(item)"
                class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0"
                :class="getKycBadgeClass(getKycStatus(item))"
              >
                KYC: {{ getKycStatus(item) }}
              </span>
            </div>

            <!-- Hero Return & Win Rate Banner -->
            <div
              class="bg-background/70 border border-primary-border/80 rounded-lg p-3 flex items-center justify-between mb-3"
            >
              <div>
                <p
                  class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text"
                >
                  Total Return
                </p>
                <p
                  class="text-base font-extrabold text-primary-green tracking-tight mt-0.5"
                >
                  +{{ formatMoney(getTotalReturn(item), getCurrency(item)) }}
                </p>
              </div>
              <div class="text-right">
                <p
                  class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text"
                >
                  Win Rate
                </p>
                <div
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs mt-0.5"
                >
                  <span>{{ formatPercent(getWinRate(item)) }}</span>
                </div>
              </div>
            </div>

            <!-- Simulation Metrics Grid -->
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div
                class="bg-background/40 border border-primary-border/40 rounded-lg p-2 text-center"
              >
                <p
                  class="text-[9px] uppercase font-semibold tracking-wider text-secondary-text mb-0.5"
                >
                  Profit Share
                </p>
                <p class="text-xs font-bold text-primary-text">
                  {{ formatPercent(getProfitSharing(item)) }}
                </p>
              </div>
              <div
                class="bg-background/40 border border-primary-border/40 rounded-lg p-2 text-center"
              >
                <p
                  class="text-[9px] uppercase font-semibold tracking-wider text-secondary-text mb-0.5"
                >
                  Max DD
                </p>
                <p class="text-xs font-bold text-primary-red">
                  {{ formatPercent(getMaxDrawdown(item)) }}
                </p>
              </div>
              <div
                class="bg-background/40 border border-primary-border/40 rounded-lg p-2 text-center"
              >
                <p
                  class="text-[9px] uppercase font-semibold tracking-wider text-secondary-text mb-0.5"
                >
                  Copiers
                </p>
                <p class="text-xs font-bold text-primary">
                  {{ getCopiers(item) }}
                </p>
              </div>
            </div>

            <!-- Active Since Footer Info -->
            <div
              class="bg-background/40 border border-primary-border/40 rounded-lg p-2.5 flex items-center justify-between text-xs"
            >
              <span class="text-secondary-text text-[11px]">Active Since</span>
              <span class="font-bold text-primary-text font-mono text-[11px]">{{
                formatDate(getActiveSince(item))
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLE LIST VIEW -->
      <div v-else-if="layoutMode === 'list'" class="space-y-3">
        <!-- Desktop Table -->
        <div
          class="hidden md:block w-full border border-primary-border rounded-lg overflow-x-auto bg-card-background/40"
        >
          <table class="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead>
              <tr
                class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]"
              >
                <th class="py-3 px-4 w-[280px]">Fund Manager & Email</th>
                <th class="py-3 px-3 w-[200px]">Total Return & Win Rate</th>
                <th class="py-3 px-3 w-[200px]">Profit Share & Drawdown</th>
                <th class="py-3 px-3 w-[150px]">Copiers</th>
                <th class="py-3 px-3 w-[150px]">Active Since</th>
                <th class="py-3 px-4 text-right w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr
                v-for="item in filteredData"
                :key="getFmId(item)"
                class="hover:bg-background/50 transition-colors"
              >
                <!-- Fund Manager & Email -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 bg-primary/10 border-primary/20 text-primary"
                    >
                      <HugeIcon
                        :icon="AddTeamIcon"
                        :size="16"
                        class="text-primary"
                      />
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <p
                          class="font-bold text-primary-text text-xs truncate max-w-[130px]"
                          :title="getLabelName(item)"
                        >
                          {{ getLabelName(item) }}
                        </p>
                        <span
                          class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-background border border-primary-border text-primary shrink-0"
                        >
                          FM #{{ getFmId(item) }}
                        </span>
                        <span
                          class="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                          :class="
                            getIsActive(item)
                              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                              : 'bg-background text-secondary-text border border-primary-border'
                          "
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="
                              getIsActive(item)
                                ? 'bg-primary-green'
                                : 'bg-zinc-400'
                            "
                          />
                          {{ getIsActive(item) ? "Active" : "Inactive" }}
                        </span>
                        <span
                          v-if="isDummyActive(item)"
                          class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          title="Dummy Simulation is Enabled"
                        >
                          <HugeIcon
                            :icon="AddTeamIcon"
                            :size="11"
                            class="text-amber-500 shrink-0"
                          />
                          <span>Dummy Enabled</span>
                        </span>
                      </div>
                      <p
                        class="text-[11px] text-secondary-text font-mono truncate select-all"
                        :title="getUserEmail(item)"
                      >
                        {{ getUserEmail(item) }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Total Return & Win Rate -->
                <td class="py-3.5 px-3">
                  <p class="font-bold text-primary-green font-mono text-xs">
                    +{{ formatMoney(getTotalReturn(item), getCurrency(item)) }}
                  </p>
                  <p class="text-[11px] text-secondary-text">
                    Win Rate:
                    <span class="font-semibold text-primary-text">{{
                      formatPercent(getWinRate(item))
                    }}</span>
                  </p>
                </td>

                <!-- Profit Share & Drawdown -->
                <td class="py-3.5 px-3">
                  <p class="font-bold text-primary-text font-mono text-xs">
                    {{ formatPercent(getProfitSharing(item)) }}
                  </p>
                  <p class="text-[11px] text-primary-red font-semibold">
                    Max DD: {{ formatPercent(getMaxDrawdown(item)) }}
                  </p>
                </td>

                <!-- Copiers -->
                <td class="py-3.5 px-3">
                  <span class="font-extrabold text-primary text-xs">{{
                    getCopiers(item)
                  }}</span>
                  <span class="text-[11px] text-secondary-text ml-1"
                    >users</span
                  >
                </td>

                <!-- Active Since -->
                <td
                  class="py-3.5 px-3 font-mono text-secondary-text text-[11px]"
                >
                  {{ formatDate(getActiveSince(item)) }}
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

        <!-- Mobile Table Cards -->
        <div class="md:hidden space-y-3">
          <div
            v-for="item in filteredData"
            :key="getFmId(item)"
            class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs bg-primary/10 border-primary/20 text-primary shrink-0"
                >
                  <HugeIcon
                    :icon="AddTeamIcon"
                    :size="16"
                    class="text-primary"
                  />
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-primary-text text-sm truncate">
                    {{ getLabelName(item) }}
                  </h4>
                  <p class="text-xs text-secondary-text font-mono truncate">
                    {{ getUserEmail(item) }} · FM #{{ getFmId(item) }}
                  </p>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex flex-col items-end gap-1 shrink-0">
                <div class="flex items-center gap-1.5 flex-wrap justify-end">
                  <span
                    class="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border"
                    :class="
                      getIsActive(item)
                        ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                        : 'bg-background text-secondary-text border border-primary-border'
                    "
                  >
                    {{ getIsActive(item) ? "Active" : "Inactive" }}
                  </span>
                  <span
                    v-if="isDummyActive(item)"
                    class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  >
                    <HugeIcon
                      :icon="AddTeamIcon"
                      :size="11"
                      class="text-amber-500 shrink-0"
                    />
                    <span>Dummy Enabled</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Mobile Metrics Row -->
            <div
              class="grid grid-cols-2 gap-2 bg-background/50 p-2.5 rounded-lg border border-primary-border/60 text-xs"
            >
              <div>
                <span class="text-[10px] text-secondary-text uppercase"
                  >Total Return</span
                >
                <p class="font-bold text-primary-green">
                  +{{ formatMoney(getTotalReturn(item), getCurrency(item)) }}
                </p>
              </div>
              <div>
                <span class="text-[10px] text-secondary-text uppercase"
                  >Win Rate</span
                >
                <p class="font-bold text-primary">
                  {{ formatPercent(getWinRate(item)) }}
                </p>
              </div>
              <div>
                <span class="text-[10px] text-secondary-text uppercase"
                  >Profit Share</span
                >
                <p class="font-bold text-primary-text">
                  {{ formatPercent(getProfitSharing(item)) }}
                </p>
              </div>
              <div>
                <span class="text-[10px] text-secondary-text uppercase"
                  >Copiers</span
                >
                <p class="font-bold text-primary-text">
                  {{ getCopiers(item) }} users
                </p>
              </div>
            </div>

            <!-- Mobile Action Row -->
            <div
              class="flex items-center justify-between pt-2 border-t border-primary-border/60"
            >
              <button
                class="px-2.5 py-1.5 rounded-lg border border-primary-border text-xs font-semibold text-primary-text flex items-center gap-1 cursor-pointer"
                @click="$emit('open-details', item)"
              >
                <Eye class="w-3.5 h-3.5 text-primary" />
                <span>Details</span>
              </button>

              <DropdownMenu
                :items="getRowActions(item)"
                @select="(menuItem) => onMenuSelect(menuItem, item)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- STANDARD APP PAGINATION -->
      <div class="mt-4">
        <Pagination
          v-if="store.pagination.total_items > store.pagination.per_page"
          :pagination="store.pagination"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <ConfirmationDialog
      :open="isDeleteModalOpen"
      title="Delete Dummy Fund Manager"
      :message="`Are you sure you want to delete the dummy simulation for '${getLabelName(itemToDelete)}'? This action will remove simulation data and cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      :loading="isDeleting"
      @confirm="handleDeleteConfirm"
      @cancel="isDeleteModalOpen = false"
    />

    <!-- TOGGLE CONFIRMATION MODAL -->
    <ConfirmationDialog
      :open="isToggleModalOpen"
      :title="
        isDummy(itemToToggle)
          ? 'Switch to Real Fund Manager'
          : 'Switch to Dummy Fund Manager'
      "
      :message="`Are you sure you want to switch '${getLabelName(itemToToggle)}' to ${isDummy(itemToToggle) ? 'Real' : 'Dummy'} mode?`"
      :confirm-text="
        isDummy(itemToToggle) ? 'Switch to Real' : 'Switch to Dummy'
      "
      cancel-text="Cancel"
      type="warning"
      :loading="isTogglingConfirm"
      @confirm="handleToggleConfirm"
      @cancel="isToggleModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Search,
  RotateCcw,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  Users,
  UsersRound,
  Mail,
  Loader2,
  X,
  FileSpreadsheet,
} from "lucide-vue-next";
import {
  UserGroupIcon,
  UserAiIcon,
  AiMagicIcon,
  User02Icon,
  AddTeamIcon,
} from "@hugeicons/core-free-icons";
import Tooltip from "@/components/common/Tooltip.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import DropdownMenu from "@/components/common/DropdownMenu.vue";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import { useFmLeaderboardStore } from "@/stores/fmLeaderboard/fmLeaderboard";

const props = defineProps({
  isToggling: {
    type: Object,
    default: () => ({}),
  },
  activeTab: {
    type: String,
    default: "dummy",
  },
});

const store = useFmLeaderboardStore();

const emit = defineEmits([
  "open-details",
  "edit-dummy",
  "import-trades",
  "toggle-status",
  "switch-to-real",
  "switch-tab",
]);

const permissionsStore = useMyPermissionsStore();
const hasPermission = (perm) => permissionsStore.hasPermission(perm);

// Local state
const searchQuery = ref("");
const layoutMode = ref("grid");
const isDeleteModalOpen = ref(false);
const itemToDelete = ref(null);
const isDeleting = ref(false);
const isToggleModalOpen = ref(false);
const itemToToggle = ref(null);
const isTogglingConfirm = ref(false);

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

// Helper Accessors specifically for Dummy FM structure
const getFmId = (item) =>
  item?.fm_id ||
  item?.dummy_fm?.fm_id ||
  item?.fund_manager?.id ||
  item?.id ||
  "N/A";

const getLabelName = (item) =>
  item?.label_name ||
  item?.fund_manager?.label_name ||
  item?.user_name ||
  `FM #${getFmId(item)}`;

const getUserName = (item) =>
  item?.user_name || item?.fund_manager?.user_name || item?.user?.name || "";

const getUserEmail = (item) =>
  item?.user_email ||
  item?.fund_manager?.user_email ||
  item?.user?.email ||
  "N/A";

const getKycStatus = (item) =>
  item?.kyc_status ||
  item?.fund_manager?.kyc_status ||
  item?.user?.kyc_status ||
  "";

const isTruthy = (val) =>
  val === true || val === 1 || val === "1" || val === "true";

const isDummyActive = (item) => {
  if (item?.dummy_fm && typeof item.dummy_fm.enabled !== "undefined") {
    return isTruthy(item.dummy_fm.enabled);
  }
  if (typeof item?.is_dummy !== "undefined") {
    return isTruthy(item.is_dummy);
  }
  if (typeof item?.enabled !== "undefined") {
    return isTruthy(item.enabled);
  }
  return true;
};

const getIsActive = (item) => {
  if (
    item?.fund_manager &&
    typeof item.fund_manager.is_active !== "undefined"
  ) {
    return isTruthy(item.fund_manager.is_active);
  }
  if (typeof item?.is_active !== "undefined") {
    return isTruthy(item.is_active);
  }
  if (item?.dummy_fm && typeof item.dummy_fm.enabled !== "undefined") {
    return isTruthy(item.dummy_fm.enabled);
  }
  if (typeof item?.enabled !== "undefined") {
    return isTruthy(item.enabled);
  }
  return true;
};

const isDummy = (item) => isDummyActive(item);

const getTotalReturn = (item) =>
  item?.dummy_fm?.total_return ?? item?.total_return ?? 0;

const getWinRate = (item) => item?.dummy_fm?.win_rate ?? item?.win_rate ?? 0;

const getProfitSharing = (item) =>
  item?.dummy_fm?.profit_sharing ?? item?.profit_sharing ?? 0;

const getMaxDrawdown = (item) =>
  item?.dummy_fm?.max_drawdown ?? item?.max_drawdown ?? 0;

const getCopiers = (item) =>
  item?.dummy_fm?.active_copiers ??
  item?.dummy_fm?.copiers ??
  item?.active_copiers ??
  item?.copiers ??
  0;

const getActiveSince = (item) =>
  item?.dummy_fm?.active_since ??
  item?.active_since ??
  item?.fund_manager?.created_at ??
  item?.created_at ??
  "";

const getCurrency = (item) =>
  item?.fund_manager?.broker_currency || item?.broker_currency || "USD";

// Formatting
const formatMoney = (val, cur = "USD") => {
  const num = Number(val) || 0;
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
};

const formatPercent = (val) => {
  const num = Number(val) || 0;
  return `${num.toFixed(1)}%`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? String(dateStr)
      : d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  } catch (_) {
    return String(dateStr);
  }
};

const getKycBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "verified")
    return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "pending" || s === "submitted")
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (s === "rejected")
    return "bg-primary-red/10 text-primary-red border-primary-red/20";
  return "bg-background text-secondary-text border-primary-border";
};

// Filtered Data based on search query
const filteredData = computed(() => {
  const list = store.data || [];
  if (!searchQuery.value.trim()) return list;

  const query = searchQuery.value.toLowerCase().trim();
  return list.filter((item) => {
    const label = getLabelName(item).toLowerCase();
    const name = getUserName(item).toLowerCase();
    const email = getUserEmail(item).toLowerCase();
    const fmId = String(getFmId(item));
    return (
      label.includes(query) ||
      name.includes(query) ||
      email.includes(query) ||
      fmId.includes(query)
    );
  });
});

const handlePerPageChange = (val) => {
  store.updatePerPage(val);
};

const handlePageChange = (page) => {
  store.pagination.page = page;
  store.fetchFmLeaderboard(true, page, "dummy");
};

// Row Actions Dropdown Menu Handlers
const getRowActions = (item) => {
  const actions = [
    {
      action: "details",
      label: "Full Details",
      icon: Eye,
    },
    {
      action: "import-trades",
      label: "Import Dummy Trades",
      icon: FileSpreadsheet,
    },
    {
      action: "toggle-mode",
      label: isDummy(item) ? "Switch to Real FM" : "Switch to Dummy FM",
      icon: isDummy(item) ? Users : UsersRound,
    },
  ];

  if (hasPermission("fund_manager.update")) {
    actions.push({
      action: "edit",
      label: "Edit Dummy FM",
      icon: Pencil,
    });
  }

  actions.push({
    divider: true,
  });

  actions.push({
    action: "delete",
    label: "Delete Dummy FM",
    icon: Trash2,
    danger: true,
  });

  return actions;
};

const onMenuSelect = (menuItem, item) => {
  switch (menuItem.action) {
    case "details":
      return emit("open-details", item);
    case "import-trades":
      return emit("import-trades", item);
    case "toggle-mode":
      return openToggleConfirm(item);
    case "edit":
      return emit("edit-dummy", item);
    case "delete":
      return confirmDelete(item);
  }
};

// Toggle Handlers
const openToggleConfirm = (item) => {
  itemToToggle.value = item;
  isToggleModalOpen.value = true;
};

const handleToggleConfirm = async () => {
  if (!itemToToggle.value) return;
  isTogglingConfirm.value = true;
  try {
    await store.toggleFundManagerType(itemToToggle.value);
    isToggleModalOpen.value = false;
    itemToToggle.value = null;
  } catch (err) {
    console.error("Toggle error:", err);
  } finally {
    isTogglingConfirm.value = false;
  }
};

// Delete Handlers
const confirmDelete = (item) => {
  itemToDelete.value = item;
  isDeleteModalOpen.value = true;
};

const handleDeleteConfirm = async () => {
  if (!itemToDelete.value) return;
  const fmId = getFmId(itemToDelete.value);
  isDeleting.value = true;
  try {
    await store.deleteDummyFundManager(fmId);
    isDeleteModalOpen.value = false;
    itemToDelete.value = null;
  } catch (_) {
    // Errors are already notified by the store snackbar
  } finally {
    isDeleting.value = false;
  }
};
</script>
