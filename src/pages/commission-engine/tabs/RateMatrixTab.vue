<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Search01Icon,
  Cancel01Icon,
  Loading03Icon,
  Tick02Icon,
  Layers01Icon,
  InformationCircleIcon,
  RefreshCwIcon,
  FileSpreadsheetIcon,
  CheckmarkCircle02Icon,
  SlidersHorizontalIcon,
  GitBranchIcon,
  LockPasswordIcon,
  SecurityCheckIcon,
  DatabaseSync01Icon,
  DocumentValidationIcon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import LiveBadge from "@/components/LiveBadge.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canManageRates = computed(() =>
  hasPermission("ib_commission.manage_rates"),
);

// Selection state
const selectedReferralLinkId = ref(null);
const searchDebounceTimer = ref(null);

// Active calculation method & group tab
const activeMethod = ref("per_lot");
const selectedGroupConfigId = ref(null);

// Local cell edits for active tab: Key is `${ib_id}_${symbol_group_id}` => number | null
const localCells = ref({});
const isDirty = ref(false);

// Methods list
const methodOptions = [
  {
    value: "per_lot",
    label: "Per Lot",
    prefix: "$",
    description: "Fixed USD per standard lot",
  },
  {
    value: "per_spread",
    label: "Per Spread",
    prefix: "%",
    description: "% markup per spread",
  },
  {
    value: "per_millions_volume",
    label: "Per Million",
    prefix: "$/M",
    description: "USD per million volume traded",
  },
];

const getMethodUnit = computed(() => {
  if (activeMethod.value === "per_spread") return "%";
  if (activeMethod.value === "per_millions_volume") return "$/M";
  return "$";
});

const getMethodUnitLabel = computed(() => {
  if (activeMethod.value === "per_spread") return "% Spread";
  if (activeMethod.value === "per_millions_volume") return "$ / Million";
  return "$ / Lot";
});

const getModeDisplay = computed(() => {
  if (activeMethod.value === "per_spread") return "Spread %";
  if (activeMethod.value === "per_millions_volume") return "USD / Million";
  return "USD / Lot";
});

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
  if (!store.rateGrid?.tabs?.length || !selectedGroupConfigId.value)
    return null;
  return (
    store.rateGrid.tabs.find(
      (t) => t.broker_group_config_id === selectedGroupConfigId.value,
    ) || store.rateGrid.tabs[0]
  );
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
        const val = row.rates
          ? (row.rates[sg.id] ?? row.rates[String(sg.id)])
          : null;
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
  { deep: true },
);

// Watch store.activeGroupConfigId
watch(
  () => store.activeGroupConfigId,
  (val) => {
    if (val && val !== selectedGroupConfigId.value) {
      selectedGroupConfigId.value = val;
    }
  },
  { immediate: true },
);

watch(
  () => store.selectedReferralLink,
  (link) => {
    if (link?.id && selectedReferralLinkId.value !== link.id) {
      selectedReferralLinkId.value = link.id;
    }
  },
  { immediate: true },
);

// On mount, do initial search if empty
onMounted(() => {
  if (!store.referralLinks?.length && !store.isFetched?.referralLinks) {
    store.searchReferralLinks({ limit: 30 });
  }
});

const handleAffiliateSearch = (q) => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    store.searchReferralLinks(
      { q: q !== null && q !== undefined ? String(q).trim() : "", limit: 30 },
      true,
    );
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
    localCells.value[key] =
      rateVal !== "" && rateVal !== null ? Number(rateVal) : null;
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
  if (
    !store.selectedReferralLink?.id ||
    !activeTab.value?.broker_group_config_id
  )
    return;

  const cells = [];
  if (activeTab.value.rows) {
    activeTab.value.rows.forEach((row) => {
      symbolGroups.value.forEach((sg) => {
        const key = `${row.ib_id}_${sg.id}`;
        const val = localCells.value[key];
        cells.push({
          ib_id: row.ib_id,
          symbol_group_id: sg.id,
          rate:
            val !== "" && val !== null && val !== undefined
              ? Number(val)
              : null,
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
    <!-- Top Configuration Header & Method Selector -->
    <div class="glass-card space-y-4">
      <div
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <!-- Title & Context -->
        <div class="flex items-center gap-3.5">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h2 class="text-base text-primary-text font-bold tracking-tight">
                Rate Matrix Configuration
              </h2>
              <LiveBadge />
            </div>
            <p class="text-xs text-secondary-text mt-1">
              Commission rates per MT5 broker group, affiliate level, and symbol
              group hierarchy
            </p>
          </div>
        </div>

        <!-- Method Selector Segmented Control & Mode Badge -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Method Selector Buttons -->
          <div
            class="inline-flex p-1 bg-background border border-primary-border gap-1 backdrop-blur-xs rounded-lg"
          >
            <Tooltip
              v-for="m in methodOptions"
              :key="m.value"
              :text="m.description"
              position="bottom"
            >
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer"
                :class="[
                  activeMethod === m.value
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white font-bold '
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background',
                ]"
                @click="handleMethodChange(m.value)"
              >
                <span class="font-mono text-[11px] opacity-85">{{
                  m.prefix
                }}</span>
                <span>{{ m.label }}</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Referral Link Picker Bar -->
      <div
        class="pt-3.5 border-t border-primary-border flex flex-col md:flex-row md:items-end justify-between gap-3"
      >
        <div class="w-full max-w-lg">
          <label
            class="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-1.5"
          >
            AFFILIATE &amp; REFERRAL CAMPAIGN
            <span class="text-primary-red">*</span>
          </label>
          <div class="flex justify-between items-center gap-2">
            <div class="flex-1">
              <BaseSelect
                :model-value="selectedReferralLinkId"
                :options="referralLinkOptions"
                placeholder="Search & select by affiliate name or campaign code..."
                variant="surface"
                :searchable="true"
                py="2"
                :is-loading="store.searchLoading"
                @update:model-value="handleReferralLinkSelect"
                @search="handleAffiliateSearch"
              />
            </div>

            <!-- Reload Rates Button -->
            <button
              v-if="store.selectedReferralLink"
              type="button"
              :disabled="store.ratesLoading"
              class="flex items-center justify-center w-9 h-9 text-secondary-text hover:text-primary-text bg-background hover:bg-card-background border border-primary-border rounded-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Reload rates from server"
              @click="
                store.fetchRateGrid(
                  store.selectedReferralLink.id,
                  activeMethod,
                  true,
                )
              "
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="14"
                :class="{ 'animate-spin': store.ratesLoading }"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Selected Link Info Ribbon (Full Width & Clean) -->
      <div
        v-if="store.rateGrid && !store.ratesLoading"
        class="flex flex-wrap items-center gap-3 px-3.5 py-2.5 rounded-lg bg-background border border-primary-border text-xs"
      >
        <!-- Campaign Name & Code -->
        <div class="inline-flex items-center gap-1.5">
          <span class="text-secondary-text">Campaign:</span>
          <span class="font-bold text-primary-text font-mono">
            {{
              store.rateGrid.referral_link_name ||
              store.rateGrid.referral_link_code
            }}
          </span>
          <span
            v-if="store.rateGrid.referral_link_code"
            class="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold"
          >
            {{ store.rateGrid.referral_link_code }}
          </span>
        </div>

        <span class="text-secondary-text/40 hidden sm:inline">•</span>

        <!-- IB ID -->
        <div class="inline-flex items-center gap-1.5">
          <span class="text-secondary-text">IB Partner:</span>
          <span class="font-mono font-bold text-primary-text"
            >#{{ store.rateGrid.ib_id }}</span
          >
        </div>

        <span class="text-secondary-text/40 hidden sm:inline">•</span>

        <!-- Total MT5 Groups -->
        <div class="inline-flex items-center gap-1.5">
          <span class="text-secondary-text">MT5 Groups:</span>
          <span
            class="px-2 py-0.5 rounded-md bg-card-background border border-primary-border text-primary-text font-bold font-mono text-[11px]"
          >
            {{
              store.rateGrid.ib_group_count || store.rateGrid.tabs?.length || 0
            }}
            Configured
          </span>
        </div>

        <span class="text-secondary-text/40 hidden sm:inline">•</span>

        <!-- Active Calculation Unit -->
        <div class="inline-flex items-center gap-1.5">
          <span class="text-secondary-text">Active Unit:</span>
          <span
            class="font-mono font-bold px-2 py-0.5 rounded-md bg-primary-green/10 text-primary-green border border-primary-green/20 text-[11px]"
          >
            {{ getMethodUnitLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- ─── SKELETON LOADER STATE (On loading rates) ─── -->
    <div v-if="store.ratesLoading" class="space-y-4">
      <!-- Tabs Bar Skeleton -->
      <div class="flex items-center gap-2 border-b border-primary-border pb-1">
        <div
          v-for="n in 3"
          :key="n"
          class="h-10 w-40 bg-card-background border border-primary-border rounded-t-xl animate-pulse"
        />
      </div>

      <!-- Table Skeleton Card -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden p-5 space-y-4"
      >
        <div
          class="h-10 bg-background border border-primary-border rounded-lg animate-pulse w-full"
        />
        <div
          v-for="r in 3"
          :key="r"
          class="h-16 bg-background/50 border border-primary-border rounded-lg animate-pulse w-full"
        />
      </div>
    </div>

    <!-- ─── EMPTY STATE (No Link Selected) ─── -->
    <div
      v-else-if="!store.selectedReferralLink && !store.rateGrid"
      class="flex flex-col items-center justify-center p-14 rounded-2xl bg-card-background border border-primary-border text-center min-h-[320px] space-y-3"
    >
      <div
        class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
      >
        <HugeIcon :icon="Search01Icon" :size="22" />
      </div>
      <div class="space-y-1 max-w-sm">
        <h3 class="title-text text-base text-primary-text font-bold">
          Select a Referral Campaign Link
        </h3>
        <p class="text-xs text-secondary-text leading-relaxed">
          Search for an affiliate partner or referral campaign above to
          configure multi-tier matrix rates.
        </p>
      </div>
    </div>

    <!-- ─── RATE GRID MATRIX AREA ─── -->
    <div v-else-if="store.rateGrid" class="space-y-4">
      <!-- MT5 Broker Group Tabs Navigation -->
      <div class="border-b border-primary-border">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="t in store.rateGrid.tabs"
            :key="t.broker_group_config_id"
            type="button"
            class="group flex items-center gap-2 px-4 py-2.5 text-xs rounded-t-xl font-semibold border-b-2 transition-all cursor-pointer select-none shrink-0"
            :class="[
              activeTab?.broker_group_config_id === t.broker_group_config_id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-card-background/60',
            ]"
            @click="handleTabSelect(t.broker_group_config_id)"
          >
            <HugeIcon
              :icon="Layers01Icon"
              :size="14"
              class="transition-colors"
              :class="
                activeTab?.broker_group_config_id === t.broker_group_config_id
                  ? 'text-primary'
                  : 'text-secondary-text group-hover:text-primary-text'
              "
            />
            <span class="font-mono font-bold">{{
              t.label || t.mt5_group
            }}</span>

            <!-- Referral links count tag -->
            <span
              class="ml-1 text-[10px] px-2 py-0.5 rounded-md border shrink-0 font-mono font-bold transition-colors"
              :class="
                activeTab?.broker_group_config_id === t.broker_group_config_id
                  ? 'bg-primary/10 text-primary border-primary/20 '
                  : 'bg-background text-secondary-text border-primary-border group-hover:border-primary-border/80'
              "
              :title="`${t.referral_links?.length || 1} referral link(s) configured with this MT5 group`"
            >
              {{ t.referral_links?.length || 1 }} link{{
                (t.referral_links?.length || 1) === 1 ? "" : "s"
              }}
            </span>
          </button>
        </div>
      </div>

      <!-- Active Tab Card Container -->
      <div
        v-if="activeTab"
        class="bg-card-background border border-primary-border rounded-xl overflow-hidden "
      >
        <!-- Group Tab Meta Summary Bar -->
        <div
          class="px-5 py-3.5 bg-background/60 border-b border-primary-border flex flex-wrap items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 text-xs flex-wrap">
            <!-- Group Path -->
            <div class="flex items-center gap-1.5">
              <span
                class="text-xs font-bold uppercase tracking-wider text-secondary-text"
                >GROUP:</span
              >
              <span
                class="inline-flex items-center gap-1.5 font-mono font-bold text-primary-text bg-card-background px-2.5 py-1 rounded-lg border border-primary-border text-xs"
              >
                <HugeIcon
                  :icon="GitBranchIcon"
                  :size="13"
                  class="text-primary"
                />
                {{ activeTab.mt5_group }}
              </span>
            </div>

            <!-- Currency -->
            <div v-if="activeTab.currency" class="flex items-center gap-1.5">
              <span class="text-secondary-text font-medium">Currency:</span>
              <span
                class="font-mono font-bold text-primary-text bg-card-background px-2 py-0.5 rounded-md border border-primary-border text-[11px]"
              >
                {{ activeTab.currency }}
              </span>
            </div>

            <!-- Category -->
            <div
              v-if="activeTab.account_category"
              class="flex items-center gap-1.5"
            >
              <span class="text-secondary-text font-medium">Category:</span>
              <span
                class="uppercase font-bold text-primary-text bg-card-background px-2 py-0.5 rounded-md border border-primary-border text-[11px]"
              >
                {{ activeTab.account_category }}
              </span>
            </div>
          </div>

          <!-- Tab Action Controls -->
          <div class="flex items-center gap-2">
            <button
              v-if="canManageRates"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-secondary-text hover:text-primary-text hover:bg-card-background border border-primary-border rounded-lg transition-colors cursor-pointer"
              title="Revert modifications on this tab back to server state"
              @click="initLocalCells"
            >
              <HugeIcon :icon="RefreshCwIcon" :size="12" />
              <span>Revert Edits</span>
            </button>
            <button
              v-if="canManageRates"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-red hover:bg-primary-red/10 border border-primary-red/20 rounded-lg transition-colors cursor-pointer"
              title="Clear all rate inputs on this tab"
              @click="handleClearTab"
            >
              <HugeIcon :icon="Cancel01Icon" :size="12" />
              <span>Clear Tab Rates</span>
            </button>
          </div>
        </div>

        <!-- Interactive Rate Matrix Table -->
        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                class="border-b border-primary-border bg-background/80 text-secondary-text font-bold text-[11px] uppercase tracking-wider"
              >
                <th class="py-3.5 px-4 w-44 whitespace-nowrap">LEVEL / ROLE</th>
                <th class="py-3.5 px-4 min-w-[200px] whitespace-nowrap">
                  AFFILIATE PARTNER
                </th>

                <!-- Dynamic Symbol Groups Columns -->
                <th
                  v-for="sg in symbolGroups"
                  :key="sg.id"
                  class="py-3 px-4 min-w-[130px] text-center whitespace-nowrap bg-card-background/40"
                >
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="flex items-center gap-1">
                      <span
                        class="font-bold text-primary-text uppercase tracking-tight"
                        >{{ sg.name }}</span
                      >
                      <span
                        class="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold"
                      >
                        {{ getMethodUnit }}
                      </span>
                    </div>
                    <span
                      v-if="sg.code"
                      class="text-[10px] text-secondary-text font-mono font-normal lowercase"
                    >
                      {{ sg.code }}
                    </span>
                  </div>
                </th>

                <th
                  v-if="canManageRates"
                  class="py-3.5 px-3 w-36 text-center whitespace-nowrap"
                >
                  QUICK ACTIONS
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-primary-border">
              <tr
                v-for="row in activeTab.rows"
                :key="row.ib_id"
                class="hover:bg-background/40 transition-colors group"
              >
                <!-- Level / Role Column with Left Accent Stripe -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <!-- Left Stripe -->
                    <span
                      class="w-1.5 h-7 rounded-full shrink-0"
                      :class="row.level === 1 ? 'bg-primary-green' : 'bg-primary'"
                    />
                    <div class="space-y-0.5">
                      <span
                        class="px-2 py-0.5 rounded text-[11px] font-bold font-mono inline-block uppercase tracking-wider"
                        :class="
                          row.level === 1
                            ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        "
                      >
                        LEVEL {{ row.level }}
                      </span>
                      <p class="text-[11px] text-secondary-text font-medium">
                        {{
                          row.level_label ||
                          (row.level === 1
                            ? "Direct Affiliate"
                            : row.level === 2
                              ? "Master Partner"
                              : "Sub-Affiliate")
                        }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Affiliate Info -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div>
                    <p
                      class="font-bold text-primary-text flex items-center gap-1.5 text-xs"
                    >
                      <span>{{ row.name }}</span>
                      <span
                        class="text-[11px] text-secondary-text font-mono font-normal px-1.5 py-0.2 bg-background rounded border border-primary-border"
                      >
                        #{{ row.ib_id }}
                      </span>
                    </p>
                    <p
                      class="text-[11px] text-secondary-text truncate max-w-[200px] mt-0.5 font-mono"
                    >
                      {{ row.email || "No email provided" }}
                    </p>
                  </div>
                </td>

                <!-- Rate Input Cells for Each Symbol Group -->
                <td
                  v-for="sg in symbolGroups"
                  :key="sg.id"
                  class="py-2.5 px-3 text-center"
                >
                  <div
                    class="relative inline-flex items-center justify-center w-full max-w-[125px]"
                  >
                    <!-- Prefix (e.g. $) -->
                    <span
                      v-if="getMethodUnit !== '%'"
                      class="absolute left-3 text-xs text-secondary-text font-mono font-semibold pointer-events-none select-none"
                    >
                      {{ getMethodUnit }}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      :disabled="!canManageRates"
                      :value="getCellValue(row.ib_id, sg.id)"
                      placeholder="0.00"
                      class="w-full text-center font-mono text-xs py-2 font-bold rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-background/80"
                      :class="[
                        getMethodUnit !== '%' ? 'pl-6 pr-2.5' : 'pl-2.5 pr-6',
                        getCellValue(row.ib_id, sg.id) !== ''
                          ? 'border-primary/50 bg-primary/5 text-primary font-bold'
                          : 'border-primary-border text-primary-text bg-background focus:bg-card-background',
                      ]"
                      @input="handleCellInput(row.ib_id, sg.id, $event)"
                    />
                    <!-- Suffix (e.g. %) -->
                    <span
                      v-if="getMethodUnit === '%'"
                      class="absolute right-3 text-xs text-secondary-text font-mono font-semibold pointer-events-none select-none"
                    >
                      %
                    </span>
                  </div>
                </td>

                <!-- Row Quick Actions -->
                <td
                  v-if="canManageRates"
                  class="py-3.5 px-3 text-center whitespace-nowrap"
                >
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      class="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors cursor-pointer"
                      title="Set flat rate across row based on first column"
                      @click="
                        const firstVal = getCellValue(
                          row.ib_id,
                          symbolGroups[0]?.id,
                        );
                        handleFillRow(row, firstVal);
                      "
                    >
                      Fill Row
                    </button>
                    <button
                      type="button"
                      class="p-1.5 text-secondary-text hover:text-primary-red hover:bg-primary-red/10 border border-primary-border hover:border-primary-red/30 rounded-lg transition-colors cursor-pointer"
                      title="Clear this affiliate's row"
                      @click="handleFillRow(row, '')"
                    >
                      <HugeIcon :icon="Cancel01Icon" :size="13" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Footer with Sync Status & Save Action -->
        <div
          class="p-4 bg-background/50 border-t border-primary-border flex flex-col lg:flex-row items-center justify-between gap-4"
        >
          <!-- Sync / Dirty Badge -->
          <div class="flex items-center gap-3 text-xs w-full lg:w-auto">
            <div
              v-if="isDirty"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/30 font-bold"
            >
              <span class="w-2 h-2 rounded-full bg-primary-yellow animate-ping" />
              <span>Unsaved changes on this MT5 group tab</span>
            </div>
            <div
              v-else
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-green/10 text-primary-green border border-primary-green/20 font-bold text-xs"
            >
              <HugeIcon
                :icon="Tick02Icon"
                :size="14"
                class="text-primary-green"
              />
              <span>All rates on this tab are synchronized with server</span>
            </div>
          </div>

          <!-- Right Action Buttons -->
          <div class="flex items-center gap-2.5 w-full lg:w-auto justify-end">
            <button
              v-if="canManageRates && isDirty"
              type="button"
              class="px-4 py-2.5 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background border border-primary-border rounded-lg transition-all cursor-pointer"
              @click="initLocalCells"
            >
              Discard Changes
            </button>
            <button
              v-if="canManageRates"
              type="button"
              :disabled="store.actionLoading"
              class="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center "
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
