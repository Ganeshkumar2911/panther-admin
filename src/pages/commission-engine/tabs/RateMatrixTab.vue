<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Search01Icon,
  Cancel01Icon,
  Loading03Icon,
  Tick02Icon,
  Layers01Icon,
  Coins01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
  InformationCircleIcon,
  RefreshCwIcon,
  FileSpreadsheetIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canManageRates = computed(() => hasPermission("ib_commission.manage_rates"));

// Selection state
const selectedReferralLinkId = ref(null);
const searchDebounceTimer = ref(null);

// Active method & tab
const activeMethod = ref("per_lot");
const selectedGroupConfigId = ref(null);

// Local cell edits for active tab: Key is `${ib_id}_${symbol_group_id}` => number | null
const localCells = ref({});
const isDirty = ref(false);

// Methods list
const methodOptions = [
  { value: "per_lot", label: "Per Lot", description: "Fixed USD per standard lot" },
  { value: "per_spread", label: "Per Spread", description: "% markup per spread" },
  { value: "per_pips", label: "Per Pips", description: "Points per pip movement" },
];

const referralLinkOptions = computed(() => {
  return (store.referralLinks || []).map((link) => {
    const affiliate = link.ib_name || `Affiliate #${link.ib_id || "N/A"}`;
    const campaign = link.name || "Campaign";
    const code = link.code ? `(${link.code})` : "";
    return {
      label: `${affiliate} — ${campaign} ${code}`,
      value: link.id,
      affiliateName: affiliate,
      campaignName: campaign,
      code: link.code,
    };
  });
});

// Active tab data
const activeTab = computed(() => {
  if (!store.rateGrid?.tabs?.length || !selectedGroupConfigId.value) return null;
  return store.rateGrid.tabs.find(
    (t) => t.broker_group_config_id === selectedGroupConfigId.value
  ) || store.rateGrid.tabs[0];
});

// Symbol groups headers
const symbolGroups = computed(() => store.rateGrid?.symbol_groups || []);

// Sync local cells when active tab or rateGrid changes
const initLocalCells = () => {
  const map = {};
  if (activeTab.value?.rows && symbolGroups.value.length) {
    activeTab.value.rows.forEach((row) => {
      symbolGroups.value.forEach((sg) => {
        const key = `${row.ib_id}_${sg.id}`;
        const val = row.rates ? (row.rates[sg.id] ?? row.rates[String(sg.id)]) : null;
        map[key] = val !== undefined ? val : null;
      });
    });
  }
  localCells.value = map;
  isDirty.value = false;
};

watch(
  () => [store.rateGrid, selectedGroupConfigId.value],
  () => {
    initLocalCells();
  },
  { deep: true }
);

// Watch store.activeGroupConfigId
watch(
  () => store.activeGroupConfigId,
  (val) => {
    if (val && val !== selectedGroupConfigId.value) {
      selectedGroupConfigId.value = val;
    }
  },
  { immediate: true }
);

watch(
  () => store.selectedReferralLink,
  (link) => {
    if (link?.id && selectedReferralLinkId.value !== link.id) {
      selectedReferralLinkId.value = link.id;
    }
  },
  { immediate: true }
);

// On mount, do initial search if empty
onMounted(() => {
  if (!store.referralLinks?.length && !store.isFetched.referralLinks) {
    store.searchReferralLinks({ limit: 30 });
  }
});

const handleAffiliateSearch = (q) => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    store.searchReferralLinks({ q: q !== null && q !== undefined ? String(q).trim() : "", limit: 30 }, true);
  }, 300);
};

const handleReferralLinkSelect = (linkId) => {
  selectedReferralLinkId.value = linkId;
  if (linkId) {
    const link = (store.referralLinks || []).find((l) => l.id === linkId);
    store.selectedReferralLink = link || { id: linkId };
    store.fetchRateGrid(linkId, activeMethod.value, true);
  } else {
    store.selectedReferralLink = null;
    store.rateGrid = null;
  }
};

const handleMethodChange = (newMethod) => {
  activeMethod.value = newMethod;
  if (store.selectedReferralLink?.id) {
    store.fetchRateGrid(store.selectedReferralLink.id, newMethod, true);
  }
};

const handleTabSelect = (configId) => {
  selectedGroupConfigId.value = configId;
  store.activeGroupConfigId = configId;
};

const handleCellInput = (ibId, symbolGroupId, event) => {
  const rawValue = event.target.value;
  const key = `${ibId}_${symbolGroupId}`;
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    localCells.value[key] = null;
  } else {
    const num = Number(rawValue);
    localCells.value[key] = isNaN(num) ? null : num;
  }
  isDirty.value = true;
};

const getCellValue = (ibId, symbolGroupId) => {
  const key = `${ibId}_${symbolGroupId}`;
  const val = localCells.value[key];
  return val !== null && val !== undefined ? val : "";
};

// Fill row across all symbol groups
const handleFillRow = (row, rateVal) => {
  symbolGroups.value.forEach((sg) => {
    const key = `${row.ib_id}_${sg.id}`;
    localCells.value[key] = rateVal !== "" && rateVal !== null ? Number(rateVal) : null;
  });
  isDirty.value = true;
};

// Clear active tab
const handleClearTab = () => {
  if (!activeTab.value?.rows) return;
  activeTab.value.rows.forEach((row) => {
    symbolGroups.value.forEach((sg) => {
      const key = `${row.ib_id}_${sg.id}`;
      localCells.value[key] = null;
    });
  });
  isDirty.value = true;
};

// Save rates for the active tab
const handleSave = async () => {
  if (!store.selectedReferralLink?.id || !activeTab.value?.broker_group_config_id) return;

  const cells = [];
  if (activeTab.value.rows) {
    activeTab.value.rows.forEach((row) => {
      symbolGroups.value.forEach((sg) => {
        const key = `${row.ib_id}_${sg.id}`;
        const val = localCells.value[key];
        cells.push({
          ib_id: row.ib_id,
          symbol_group_id: sg.id,
          rate: val !== "" && val !== null && val !== undefined ? Number(val) : null,
        });
      });
    });
  }

  const payload = {
    method: activeMethod.value,
    broker_group_config_id: activeTab.value.broker_group_config_id,
    cells,
  };

  try {
    await store.saveRates(store.selectedReferralLink.id, payload);
    isDirty.value = false;
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <div class="space-y-5">
    <!-- Top Configuration Header & Referral Link Selector -->
    <div
      class="p-5 rounded-2xl bg-card-background border border-primary-border space-y-4"
    >
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Title & Context -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0"
          >
            <HugeIcon :icon="FileSpreadsheetIcon" :size="20" />
          </div>
          <div>
            <h2 class="title-text text-base text-primary-text font-bold">
              Rate Matrix Configuration
            </h2>
            <p class="text-xs text-secondary-text">
              Commission rates per MT5 broker group, affiliate level, and symbol group
            </p>
          </div>
        </div>

        <!-- Method Selector -->
        <div class="flex items-center gap-2 self-start lg:self-center">
          <label class="text-xs font-semibold text-secondary-text whitespace-nowrap">
            Method:
          </label>
          <div class="inline-flex p-1 rounded-xl bg-background border border-primary-border">
            <button
              v-for="m in methodOptions"
              :key="m.value"
              type="button"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              :class="[
                activeMethod === m.value
                  ? 'bg-primary text-white font-bold'
                  : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
              ]"
              @click="handleMethodChange(m.value)"
            >
              {{ m.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Referral Link Picker Bar -->
      <div class="pt-3 border-t border-primary-border flex flex-col md:flex-row md:items-center gap-3">
        <div class="flex-1">
          <label class="block text-xs font-semibold text-primary-text mb-1">
            Affiliate & Referral Campaign <span class="text-primary-red">*</span>
          </label>
          <BaseSelect
            :model-value="selectedReferralLinkId"
            :options="referralLinkOptions"
            placeholder="Search & select by affiliate name or campaign code..."
            variant="surface"
            :searchable="true"
            :is-loading="store.searchLoading"
            @update:model-value="handleReferralLinkSelect"
            @search="handleAffiliateSearch"
          />
        </div>

        <!-- Reload Button -->
        <div v-if="store.selectedReferralLink" class="flex items-end pb-0.5">
          <button
            type="button"
            :disabled="store.ratesLoading"
            class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-colors cursor-pointer shrink-0"
            @click="store.fetchRateGrid(store.selectedReferralLink.id, activeMethod, true)"
          >
            <HugeIcon
              :icon="RefreshCwIcon"
              :size="14"
              :class="{ 'animate-spin': store.ratesLoading }"
            />
            <span>Reload Rates</span>
          </button>
        </div>
      </div>

      <!-- Selected Link Info Bar -->
      <div
        v-if="store.rateGrid && !store.ratesLoading"
        class="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-background/60 border border-primary-border/60 text-xs"
      >
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-1.5">
            <span class="text-secondary-text">Referral Link:</span>
            <span class="font-semibold text-primary-text">
              {{ store.rateGrid.referral_link_name }} ({{ store.rateGrid.referral_link_code }})
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-secondary-text">IB ID:</span>
            <span class="font-mono font-semibold text-primary-text">#{{ store.rateGrid.ib_id }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-secondary-text">Total MT5 Groups:</span>
            <span
              class="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold font-mono text-[11px]"
            >
              {{ store.rateGrid.ib_group_count || store.rateGrid.tabs?.length || 0 }}
            </span>
          </div>
        </div>

        <div class="text-[11px] text-secondary-text flex items-center gap-1">
          <HugeIcon :icon="InformationCircleIcon" :size="13" class="text-primary" />
          <span>Rates saved apply across all referral links of this IB sharing the active MT5 group.</span>
        </div>
      </div>
    </div>

    <!-- ─── SKELETON LOADER STATE (On loading rates) ─── -->
    <div v-if="store.ratesLoading" class="space-y-4">
      <!-- Tabs Bar Skeleton -->
      <div class="flex items-center gap-2 border-b border-primary-border pb-1">
        <div v-for="n in 4" :key="n" class="h-10 w-36 bg-card-background border border-primary-border rounded-t-xl animate-pulse" />
      </div>

      <!-- Table Skeleton Card -->
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden p-4 space-y-3">
        <div class="h-8 bg-background border border-primary-border rounded-xl animate-pulse w-full" />
        <div v-for="r in 3" :key="r" class="h-14 bg-background/50 border border-primary-border rounded-xl animate-pulse w-full" />
      </div>
    </div>

    <!-- ─── EMPTY STATE (No Link Selected) ─── -->
    <div
      v-else-if="!store.selectedReferralLink && !store.rateGrid"
      class="flex flex-col items-center justify-center p-14 rounded-2xl bg-card-background border border-primary-border text-center min-h-[320px] space-y-3"
    >
      <div
        class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
      >
        <HugeIcon :icon="Search01Icon" :size="22" />
      </div>
      <div class="space-y-1 max-w-sm">
        <h3 class="title-text text-base text-primary-text font-bold">
          Select a Referral Campaign Link
        </h3>
        <p class="text-xs text-secondary-text leading-relaxed">
          Search for an affiliate or link code above to inspect and edit multi-tier commission rates.
        </p>
      </div>
    </div>

    <!-- ─── RATE GRID MATRIX AREA ─── -->
    <div v-else-if="store.rateGrid" class="space-y-4">
      <!-- MT5 Broker Group Tabs Navigation -->
      <div class="border-b border-primary-border">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar -mb-px pb-1">
          <button
            v-for="t in store.rateGrid.tabs"
            :key="t.broker_group_config_id"
            type="button"
            class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-colors cursor-pointer select-none shrink-0"
            :class="[
              activeTab?.broker_group_config_id === t.broker_group_config_id
                ? 'border-primary text-primary bg-card-background font-bold'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-card-background/50'
            ]"
            @click="handleTabSelect(t.broker_group_config_id)"
          >
            <HugeIcon :icon="Layers01Icon" :size="14" />
            <span>{{ t.label || t.mt5_group }}</span>

            <!-- Referral links count tag -->
            <span
              class="ml-1 text-[10px] px-1.5 py-0.2 rounded-md border shrink-0 font-mono font-semibold"
              :class="
                activeTab?.broker_group_config_id === t.broker_group_config_id
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-background text-secondary-text border-primary-border'
              "
              :title="`${t.referral_links?.length || 1} referral link(s) share this group`"
            >
              {{ t.referral_links?.length || 1 }} link{{ (t.referral_links?.length || 1) === 1 ? '' : 's' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Active Tab Card Container -->
      <div
        v-if="activeTab"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden"
      >
        <!-- Group Tab Meta Summary Bar -->
        <div
          class="px-5 py-3 bg-background/50 border-b border-primary-border flex flex-wrap items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="text-secondary-text">MT5 Group:</span>
              <span class="font-mono font-bold text-primary-text bg-card-background px-2 py-0.5 rounded border border-primary-border text-[11px]">
                {{ activeTab.mt5_group }}
              </span>
            </div>
            <div v-if="activeTab.currency" class="flex items-center gap-1">
              <span class="text-secondary-text">Currency:</span>
              <span class="font-semibold text-primary-text">{{ activeTab.currency }}</span>
            </div>
            <div v-if="activeTab.account_category" class="flex items-center gap-1">
              <span class="text-secondary-text">Category:</span>
              <span class="capitalize font-medium text-primary-text">{{ activeTab.account_category }}</span>
            </div>
          </div>

          <!-- Action Controls for Active Tab -->
          <div class="flex items-center gap-2">
            <button
              v-if="canManageRates"
              type="button"
              class="px-3 py-1.5 text-xs text-secondary-text hover:text-primary-red hover:bg-primary-red/10 border border-primary-border rounded-lg transition-colors cursor-pointer"
              @click="handleClearTab"
            >
              Clear Tab Rates
            </button>
            <button
              v-if="canManageRates"
              type="button"
              class="px-3 py-1.5 text-xs text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-lg transition-colors cursor-pointer"
              @click="initLocalCells"
            >
              Revert Edits
            </button>
          </div>
        </div>

        <!-- Interactive Rate Matrix Table -->
        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-primary-border bg-background/80 text-secondary-text font-semibold">
                <th class="py-3 px-4 w-36 whitespace-nowrap">Level / Role</th>
                <th class="py-3 px-4 w-48 whitespace-nowrap">Affiliate</th>
                <!-- <th class="py-3 px-3 w-20 text-center whitespace-nowrap">Split %</th> -->

                <!-- Dynamic Symbol Groups Columns -->
                <th
                  v-for="sg in symbolGroups"
                  :key="sg.id"
                  class="py-3 px-4 min-w-[120px] text-center whitespace-nowrap bg-card-background/40"
                >
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-primary-text">{{ sg.name }}</span>
                    <span v-if="sg.code" class="text-[10px] text-secondary-text font-mono font-normal">
                      {{ sg.code }}
                    </span>
                  </div>
                </th>

                <th v-if="canManageRates" class="py-3 px-3 w-28 text-center whitespace-nowrap">
                  Quick Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-primary-border">
              <tr
                v-for="row in activeTab.rows"
                :key="row.ib_id"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Level / Role -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span
                    class="px-2 py-0.5 rounded-md text-xs font-semibold inline-block"
                    :class="
                      row.level === 1
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-background text-secondary-text border border-primary-border'
                    "
                  >
                    {{ row.level_label || (row.level === 1 ? 'Direct Affiliate' : 'Upline') }}
                  </span>
                </td>

                <!-- Affiliate Info -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div>
                    <p class="font-semibold text-primary-text flex items-center gap-1.5">
                      {{ row.name }}
                      <span class="text-[10px] text-secondary-text font-mono font-normal">
                        (#{{ row.ib_id }})
                      </span>
                    </p>
                    <p class="text-[11px] text-secondary-text truncate max-w-[180px]">
                      {{ row.email || "No email" }}
                    </p>
                  </div>
                </td>

                <!-- Split % -->
                <!-- <td class="py-3.5 px-3 text-center whitespace-nowrap">
                  <span class="font-mono text-xs font-medium text-secondary-text">
                    {{ row.split_percentage !== undefined && row.split_percentage !== null ? `${row.split_percentage}%` : '-' }}
                  </span>
                </td> -->

                <!-- Rate Input Cells for Each Symbol Group -->
                <td
                  v-for="sg in symbolGroups"
                  :key="sg.id"
                  class="py-2.5 px-3 text-center"
                >
                  <div class="relative inline-block w-full max-w-[110px]">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      :disabled="!canManageRates"
                      :value="getCellValue(row.ib_id, sg.id)"
                      placeholder="0.00"
                      class="input-field text-center font-mono text-xs px-2 py-1.5 font-bold transition-colors focus:border-primary disabled:bg-background/80"
                      :class="[
                        getCellValue(row.ib_id, sg.id) !== ''
                          ? 'border-primary/40 bg-primary/5 text-primary'
                          : 'border-primary-border text-secondary-text'
                      ]"
                      @input="handleCellInput(row.ib_id, sg.id, $event)"
                    />
                  </div>
                </td>

                <!-- Row Quick Actions -->
                <td v-if="canManageRates" class="py-3.5 px-3 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      class="px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer"
                      title="Set flat rate across row"
                      @click="
                        const firstVal = getCellValue(row.ib_id, symbolGroups[0]?.id);
                        handleFillRow(row, firstVal);
                      "
                    >
                      Fill Row
                    </button>
                    <button
                      type="button"
                      class="px-2 py-1 text-[11px] font-medium text-secondary-text hover:text-primary-red hover:bg-primary-red/10 rounded transition-colors cursor-pointer"
                      title="Clear this affiliate's row"
                      @click="handleFillRow(row, '')"
                    >
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Footer with Save Action -->
        <div
          class="p-4 bg-background/50 border-t border-primary-border flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div class="flex items-center gap-2 text-xs text-secondary-text">
            <span
              v-if="isDirty"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20 font-semibold"
            >
              ● Unsaved changes on this tab
            </span>
            <span v-else class="text-secondary-text">
              All rates on active tab are synchronized with server.
            </span>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              v-if="canManageRates"
              type="button"
              :disabled="store.actionLoading"
              class="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              @click="handleSave"
            >
              <HugeIcon
                v-if="store.actionLoading"
                :icon="Loading03Icon"
                :size="15"
                class="animate-spin"
              />
              <HugeIcon v-else :icon="CheckmarkCircle02Icon" :size="15" />
              <span>Save Tab Rates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
