<script setup>
import { computed, ref, watch } from "vue";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Bot,
  TrendingUp,
  FileText,
  Eye,
  Key,
  Lock,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  Wallet,
  Layers,
  Power,
  RotateCcw,
} from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  open: { type: Boolean, default: false },
  account: { type: Object, default: null },
});

const emit = defineEmits(["close", "success", "open-restrictions"]);

const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const canUpdate = computed(() => hasPermission("trading_account.update"));

// Internal state
const loading = ref(false);
const saving = ref(false);
const fetchError = ref(null);
const showAdvanced = ref(false);

const accountRightsData = ref(null);
const currentFlags = ref({});
const initialFlags = ref({});

const accountId = computed(
  () => props.account?.id ?? props.account?.account_id ?? null,
);
const accountNumber = computed(
  () =>
    accountRightsData.value?.account_number ??
    props.account?.account_number ??
    "—",
);
const clientName = computed(
  () =>
    props.account?.client_name ??
    props.account?.user?.name ??
    props.account?.client?.name ??
    "—",
);
const clientEmail = computed(
  () =>
    props.account?.user?.email ??
    props.account?.client?.email ??
    props.account?.client_email ??
    "",
);
const broker = computed(
  () =>
    props.account?.broker ??
    props.account?.broker_label ??
    props.account?.server ??
    "—",
);
const currency = computed(
  () =>
    props.account?.broker_currency ??
    props.account?.currency ??
    "USD",
);
const tradingType = computed(
  () =>
    accountRightsData.value?.trading_type ??
    props.account?.trading_type ??
    "real",
);
const isRealAccount = computed(() => tradingType.value === "real");

// Definition of Core Flags (Suggested UI Set)
const coreFlagDefinitions = [
  {
    key: "enabled",
    label: "Account Enabled",
    mt5Constant: "USER_RIGHT_ENABLED",
    description: "Master login and account access switch on MT5.",
    icon: CheckCircle2,
    badgeColor: "emerald",
    isSensitive: true,
  },
  {
    key: "trade_disabled",
    label: "Trading Disabled",
    mt5Constant: "USER_RIGHT_TRADE_DISABLED",
    description: "Blocks trading and order placement on MT5 (synced with CRM active status).",
    icon: Power,
    badgeColor: "rose",
    isNegative: true,
  },
  {
    key: "expert",
    label: "Allow EA (Expert Advisors)",
    mt5Constant: "USER_RIGHT_EXPERT",
    description: "Permits automated trading robots and Expert Advisors to execute orders.",
    icon: Bot,
    badgeColor: "blue",
  },
  {
    key: "trailing",
    label: "Trailing Stops",
    mt5Constant: "USER_RIGHT_TRAILING",
    description: "Permits client to place and update server-side trailing stop orders.",
    icon: TrendingUp,
    badgeColor: "purple",
  },
  {
    key: "reports",
    label: "Account Reports",
    mt5Constant: "USER_RIGHT_REPORTS",
    description: "Enables daily and monthly trade report/statement generation and delivery.",
    icon: FileText,
    badgeColor: "indigo",
  },
  {
    key: "readonly",
    label: "Read Only (Investor Mode)",
    mt5Constant: "USER_RIGHT_READONLY",
    description: "Account can view market and positions but cannot trade or alter orders.",
    icon: Eye,
    badgeColor: "amber",
    isSensitive: true,
  },
  {
    key: "password",
    label: "Change Password",
    mt5Constant: "USER_RIGHT_PASSWORD",
    description: "Permits the client to change their MT5 master password from the terminal.",
    icon: Key,
    badgeColor: "cyan",
  },
];

// Definition of Advanced Flags
const advancedFlagDefinitions = [
  {
    key: "investor",
    label: "Investor Access",
    mt5Constant: "USER_RIGHT_INVESTOR",
    description: "Specifies investor password mode restrictions on MT5.",
  },
  {
    key: "confirmed",
    label: "Confirmed Registration",
    mt5Constant: "USER_RIGHT_CONFIRMED",
    description: "Account registration is confirmed and verified on the trade server.",
  },
  {
    key: "reset_pass",
    label: "Reset Password on Login",
    mt5Constant: "USER_RIGHT_RESET_PASS",
    description: "Forces client to choose a new password upon their next MT5 login.",
  },
  {
    key: "otp_enabled",
    label: "OTP Two-Factor Auth",
    mt5Constant: "USER_RIGHT_OTP_ENABLED",
    description: "Enforces MT5 built-in One-Time Password verification upon connection.",
  },
  {
    key: "api_enabled",
    label: "API Access Allowed",
    mt5Constant: "USER_RIGHT_API_ENABLED",
    description: "Permits Manager API and WebAPI automated integration for this account.",
  },
  {
    key: "push_notification",
    label: "Push Notifications",
    mt5Constant: "USER_RIGHT_PUSH_NOTIFICATION",
    description: "Sends real-time MT5 mobile push notifications for trades and orders.",
  },
  {
    key: "exclude_reports",
    label: "Exclude from Broker Reports",
    mt5Constant: "USER_RIGHT_EXCLUDE_REPORTS",
    description: "Omits this account's turnover from global broker accounting reports.",
  },
  {
    key: "technical",
    label: "Technical Account",
    mt5Constant: "USER_RIGHT_TECHNICAL",
    description: "Designates this account for internal liquidity or server maintenance operations.",
  },
  {
    key: "sponsored_hosting",
    label: "Sponsored VPS Hosting",
    mt5Constant: "USER_RIGHT_SPONSORED_HOSTING",
    description: "Grants broker-sponsored MetaQuotes Virtual Hosting access.",
  },
  {
    key: "obsolete",
    label: "Obsolete / Deprecated",
    mt5Constant: "USER_RIGHT_OBSOLETE",
    description: "Legacy MT5 user flag; rarely used.",
  },
];

// Calculate dirty flags for partial payload update
const dirtyFlags = computed(() => {
  const diff = {};
  if (!currentFlags.value || !initialFlags.value) return diff;
  for (const [key, val] of Object.entries(currentFlags.value)) {
    if (initialFlags.value[key] !== val) {
      diff[key] = val;
    }
  }
  return diff;
});

const dirtyCount = computed(() => Object.keys(dirtyFlags.value).length);

// Reset changes back to pristine API state
const resetChanges = () => {
  currentFlags.value = { ...initialFlags.value };
};

// Fetch rights from API
const fetchRights = () => {
  if (!accountId.value) return;

  if (!isRealAccount.value) {
    fetchError.value = "MT5 rights only apply to real accounts (trading_type === 'real').";
    return;
  }

  loading.value = true;
  fetchError.value = null;

  apiRequest("get", urls.tradingAccounts.rights, {
    params: { trading_account_id: accountId.value },
    isTokenRequired: true,
    onSuccess: (res) => {
      loading.value = false;
      const data = res?.data || {};
      accountRightsData.value = data;

      const rawFlags = data.flags || {};
      initialFlags.value = { ...rawFlags };
      currentFlags.value = { ...rawFlags };
    },
    onFailure: (err) => {
      loading.value = false;
      const msg = err?.message || err?.error || "Failed to load MT5 account rights.";
      fetchError.value = msg;
      snackbar.show(msg, "error");
    },
  });
};

// Toggle a flag
const toggleFlag = (key) => {
  if (!canUpdate.value || saving.value) return;
  currentFlags.value[key] = !currentFlags.value[key];
};

// Save updated flags to API
const handleSave = () => {
  if (!canUpdate.value || saving.value || !accountId.value) return;

  const payloadFlags = dirtyFlags.value;
  if (Object.keys(payloadFlags).length === 0) {
    snackbar.show("No changes to save.", "info");
    return;
  }

  saving.value = true;

  apiRequest("post", urls.tradingAccounts.updateRights, {
    data: {
      trading_account_id: accountId.value,
      flags: payloadFlags,
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      saving.value = false;
      const updatedData = res?.data || {};
      if (updatedData.flags) {
        initialFlags.value = { ...updatedData.flags };
        currentFlags.value = { ...updatedData.flags };
      }
      if (accountRightsData.value) {
        accountRightsData.value.rights = updatedData.rights ?? accountRightsData.value.rights;
        accountRightsData.value.is_active = updatedData.is_active ?? accountRightsData.value.is_active;
      }

      snackbar.show(
        res?.message || "MT5 account rights updated successfully.",
        "success"
      );
      emit("success", updatedData);
    },
    onFailure: (err) => {
      saving.value = false;
      snackbar.show(
        err?.message || err?.error || "Failed to update MT5 rights.",
        "error"
      );
    },
  });
};

const closeDrawer = () => {
  if (saving.value) return;
  emit("close");
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      showAdvanced.value = false;
      fetchRights();
    } else {
      accountRightsData.value = null;
      currentFlags.value = {};
      initialFlags.value = {};
      fetchError.value = null;
    }
  }
);
</script>

<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Drawer Panel (Slide from Right) -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-xl md:max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- ================================================================= -->
        <!-- DRAWER HEADER                                                     -->
        <!-- ================================================================= -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
            >
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm sm:text-base font-bold text-primary-text tracking-tight truncate">
                  MT5 Account Rights
                </h3>
                <span
                  v-if="accountRightsData?.rights !== undefined"
                  class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text font-semibold"
                  :title="`Raw MT5 USER_RIGHT_* bitmask value: ${accountRightsData.rights}`"
                >
                  Mask: {{ accountRightsData.rights }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                Configure MetaTrader 5 <span class="font-mono text-primary font-medium">USER_RIGHT_*</span> permissions & flags
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              v-if="isRealAccount && !loading"
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Refresh rights from MT5"
              @click="fetchRights"
            >
              <RefreshCw class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer focus:outline-none"
              @click="closeDrawer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- DRAWER BODY                                                       -->
        <!-- ================================================================= -->
        <div class="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar bg-card-background">
          <!-- Account Info Header Card -->
          <div
            class="bg-background border border-primary-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-full bg-primary/15 text-primary border border-primary/25 flex items-center justify-center shrink-0"
              >
                <Wallet class="w-4.5 h-4.5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold font-mono text-primary-text text-sm">
                    #{{ accountNumber }}
                  </span>
                  <span
                    v-if="accountId"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-card-background border border-primary-border font-mono text-secondary-text"
                  >
                    ID: {{ accountId }}
                  </span>
                  <span
                    class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                    :class="
                      isRealAccount
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    "
                  >
                    {{ tradingType }}
                  </span>
                </div>
                <div class="text-[11px] text-secondary-text truncate mt-1">
                  {{ clientName }}
                  <span v-if="clientEmail" class="opacity-70 font-mono">({{ clientEmail }})</span>
                </div>
              </div>
            </div>

            <!-- Server, Broker & Restriction Badges -->
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              <div class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-[11px] text-secondary-text">
                <span class="text-secondary-text/70">Server:</span>
                <span class="font-semibold text-primary-text ml-1">{{ broker }}</span>
              </div>
              <div class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-[11px] text-secondary-text font-mono font-medium">
                {{ currency }}
              </div>
              <!-- Internal transfer CRM badge -->
              <div
                v-if="account?.restrict_internal_transfer !== undefined"
                class="px-2 py-1 rounded-lg border text-[10px] font-medium flex items-center gap-1"
                :class="
                  account.restrict_internal_transfer
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                "
                title="Internal transfer restriction is managed via CRM Transaction Restrictions"
              >
                <Lock v-if="account.restrict_internal_transfer" class="w-3 h-3" />
                <span>{{ account.restrict_internal_transfer ? 'Transfers Blocked (CRM)' : 'Transfers OK' }}</span>
              </div>
            </div>
          </div>

          <!-- Non-real account error guard -->
          <div
            v-if="!isRealAccount"
            class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3"
          >
            <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p class="font-bold">Not Supported for Demo Accounts</p>
              <p class="mt-1 text-secondary-text">
                MT5 Rights endpoints only manage permissions for live trading accounts (<code class="font-mono">trading_type === 'real'</code>). Demo accounts do not support remote USER_RIGHT modification.
              </p>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-else-if="loading" class="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 class="w-8 h-8 text-primary animate-spin" />
            <p class="text-xs text-secondary-text font-medium">
              Fetching MT5 permissions for account #{{ accountNumber }}...
            </p>
          </div>

          <!-- Error State -->
          <div
            v-else-if="fetchError"
            class="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-start justify-between gap-3"
          >
            <div class="flex items-start gap-2.5">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p class="font-bold">Failed to load rights</p>
                <p class="mt-0.5 text-secondary-text">{{ fetchError }}</p>
              </div>
            </div>
            <button
              type="button"
              class="px-2.5 py-1 rounded bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors text-xs shrink-0 cursor-pointer"
              @click="fetchRights"
            >
              Retry
            </button>
          </div>

          <!-- Content when Loaded -->
          <template v-else>
            <!-- Core Rights Section -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Shield class="w-4 h-4 text-primary" />
                  <h4 class="text-xs font-bold uppercase tracking-wider text-primary-text">
                    Core Rights (Primary Flags)
                  </h4>
                </div>
                <span class="text-[11px] text-secondary-text font-medium">
                  {{ coreFlagDefinitions.length }} rights
                </span>
              </div>

              <div class="grid grid-cols-1 gap-2.5">
                <div
                  v-for="flag in coreFlagDefinitions"
                  :key="flag.key"
                  class="p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3.5 cursor-pointer select-none"
                  :class="[
                    currentFlags[flag.key] !== initialFlags[flag.key]
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                      : 'border-primary-border bg-card-background hover:border-primary-border/80 hover:bg-background/40',
                    !canUpdate ? 'opacity-80 cursor-default' : '',
                  ]"
                  @click="canUpdate && !saving && toggleFlag(flag.key)"
                >
                  <div class="flex items-start gap-3 min-w-0">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      :class="
                        currentFlags[flag.key]
                          ? flag.isNegative
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-background text-secondary-text border border-primary-border'
                      "
                    >
                      <component :is="flag.icon" class="w-4 h-4" />
                    </div>

                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-semibold text-primary-text">
                          {{ flag.label }}
                        </span>
                        <code class="text-[9px] font-mono text-secondary-text opacity-70">
                          {{ flag.mt5Constant }}
                        </code>
                        <!-- Modified badge -->
                        <span
                          v-if="currentFlags[flag.key] !== initialFlags[flag.key]"
                          class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          modified
                        </span>
                      </div>
                      <p class="text-[11px] text-secondary-text mt-0.5 line-clamp-2">
                        {{ flag.description }}
                      </p>
                    </div>
                  </div>

                  <!-- Toggle Switch -->
                  <div class="shrink-0 flex items-center gap-2" @click.stop>
                    <button
                      type="button"
                      role="switch"
                      :disabled="!canUpdate || saving"
                      :aria-checked="currentFlags[flag.key]"
                      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="currentFlags[flag.key] ? 'bg-primary' : 'bg-primary-border'"
                      @click="toggleFlag(flag.key)"
                    >
                      <span
                        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        :class="currentFlags[flag.key] ? 'translate-x-4' : 'translate-x-0'"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Internal Transfer Note Banner -->
            <div
              class="p-3.5 rounded-xl border border-primary-border bg-background/50 flex items-start justify-between gap-3 text-xs"
            >
              <div class="flex items-start gap-2.5 min-w-0">
                <Info class="w-4 h-4 text-secondary-text shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <p class="font-semibold text-primary-text">
                    Looking to restrict Internal Transfers?
                  </p>
                  <p class="text-[11px] text-secondary-text mt-0.5">
                    Internal transfers between wallets and accounts are enforced via CRM transaction rules (<code class="font-mono">restrict_internal_transfer</code>), not MT5 protocol bits.
                  </p>
                </div>
              </div>
            </div>

            <!-- Advanced Flags Accordion -->
            <div class="border border-primary-border rounded-xl overflow-hidden bg-card-background">
              <button
                type="button"
                class="w-full px-4 py-3 flex items-center justify-between bg-background/40 hover:bg-background/80 transition-colors text-xs font-semibold text-primary-text cursor-pointer select-none"
                @click="showAdvanced = !showAdvanced"
              >
                <div class="flex items-center gap-2">
                  <SlidersHorizontal class="w-3.5 h-3.5 text-secondary-text" />
                  <span>Advanced MT5 Flags</span>
                  <span class="text-[10px] text-secondary-text font-normal font-mono">
                    ({{ advancedFlagDefinitions.length }} flags)
                  </span>
                </div>
                <div class="flex items-center gap-1.5 text-secondary-text">
                  <span class="text-[10px]">{{ showAdvanced ? 'Hide' : 'Show' }}</span>
                  <component :is="showAdvanced ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
                </div>
              </button>

              <div
                v-if="showAdvanced"
                class="p-3.5 space-y-2 border-t border-primary-border bg-card-background"
              >
                <div
                  v-for="flag in advancedFlagDefinitions"
                  :key="flag.key"
                  class="p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors"
                  :class="[
                    currentFlags[flag.key] !== initialFlags[flag.key]
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                      : 'border-primary-border/60 bg-background/30 hover:bg-background/60',
                    canUpdate ? 'cursor-pointer' : 'cursor-default',
                  ]"
                  @click="canUpdate && !saving && toggleFlag(flag.key)"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-medium text-primary-text">
                        {{ flag.label }}
                      </span>
                      <code class="text-[9px] font-mono text-secondary-text opacity-70">
                        {{ flag.mt5Constant }}
                      </code>
                      <span
                        v-if="currentFlags[flag.key] !== initialFlags[flag.key]"
                        class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      >
                        modified
                      </span>
                    </div>
                    <p class="text-[11px] text-secondary-text mt-0.5 line-clamp-1">
                      {{ flag.description }}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    :disabled="!canUpdate || saving"
                    :aria-checked="currentFlags[flag.key]"
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50"
                    :class="currentFlags[flag.key] ? 'bg-primary' : 'bg-primary-border'"
                    @click.stop="toggleFlag(flag.key)"
                  >
                    <span
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="currentFlags[flag.key] ? 'translate-x-4' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- ================================================================= -->
        <!-- DRAWER FOOTER                                                     -->
        <!-- ================================================================= -->
        <div
          class="px-6 py-4 border-t border-primary-border flex items-center justify-between gap-3 bg-card-background shrink-0"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              v-if="dirtyCount > 0"
              class="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{{ dirtyCount }} flag{{ dirtyCount > 1 ? "s" : "" }} modified</span>
            </span>
            <span v-else class="text-xs text-secondary-text">
              No unsaved changes
            </span>
          </div>

          <div class="flex items-center gap-2.5">
            <button
              v-if="dirtyCount > 0"
              type="button"
              :disabled="saving"
              class="px-3 py-2 rounded-xl border border-primary-border hover:bg-background text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors cursor-pointer flex items-center gap-1.5"
              @click="resetChanges"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-primary-border hover:bg-background text-xs font-semibold text-primary-text transition-colors cursor-pointer"
              @click="closeDrawer"
            >
              Cancel
            </button>

            <button
              v-if="canUpdate && isRealAccount"
              type="button"
              :disabled="saving || dirtyCount === 0 || loading"
              class="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              @click="handleSave"
            >
              <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
              <ShieldCheck v-else class="w-3.5 h-3.5" />
              <span>{{ saving ? "Saving to MT5..." : `Save Rights${dirtyCount > 0 ? ` (${dirtyCount})` : ''}` }}</span>
            </button>
            <span
              v-else-if="!canUpdate"
              class="text-[11px] text-secondary-text font-medium px-2 py-1 rounded bg-background border border-primary-border"
            >
              View Only (No Update Permission)
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Panel slide-out-from-right transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
