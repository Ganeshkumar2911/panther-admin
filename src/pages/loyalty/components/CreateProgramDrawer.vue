<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Award class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                Create Loyalty Program
              </h3>
              <p class="text-[11px] text-secondary-text">
                Initialize a new loyalty program campaign with custom rules and scopes
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="create-program-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <!-- General Parameters -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-primary" />
              General Parameters
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Program Code <span class="text-rose-400">*</span></label>
                  <input
                    v-model="form.code"
                    type="text"
                    placeholder="e.g. GOLD_CAMPAIGN"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary uppercase font-mono transition"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Status</label>
                  <BaseSelect
                    v-model="form.status"
                    :options="statusOptions"
                    placeholder="Select status..."
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Program Name <span class="text-rose-400">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Gold Tier Loyalty Campaign"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Description</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  placeholder="Brief description of this loyalty program cycle..."
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Account Scope</label>
                <BaseSelect
                  v-model="form.account_scope"
                  :options="scopeOptions"
                  placeholder="Select account scope..."
                />
                <p class="text-[10px] text-secondary-text">
                  {{ form.account_scope === 'one_per_user' ? 'Clients may link exactly 1 primary trading account.' : 'All eligible client trading accounts are automatically tracked.' }}
                </p>
              </div>

              <!-- Program Promotional Images (Max 4) -->
              <div class="space-y-2 pt-1 border-t border-primary-border/60">
                <div class="flex items-center justify-between">
                  <label class="font-semibold text-primary-text">Program Banners & Images (Max 4)</label>
                  <span class="text-[10px] text-secondary-text font-mono">{{ imageUrlsList.length }}/4</span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(url, idx) in imageUrlsList"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <div class="w-8 h-8 rounded-lg bg-background border border-primary-border overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        v-if="url"
                        :src="url"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.style.display = 'none'"
                      />
                      <ImageIcon v-else class="w-3.5 h-3.5 text-secondary-text" />
                    </div>
                    <input
                      v-model="imageUrlsList[idx]"
                      type="url"
                      placeholder="https://..."
                      class="flex-1 px-3 py-1.5 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      class="w-7 h-7 flex items-center justify-center text-secondary-text hover:text-rose-400 rounded-lg hover:bg-background transition cursor-pointer"
                      title="Remove Image"
                      @click="removeImageUrl(idx)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  v-if="imageUrlsList.length < 4"
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary-border hover:border-primary/50 text-secondary-text hover:text-primary transition text-xs cursor-pointer w-full justify-center"
                  @click="addImageUrl"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Program Banner URL</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Lifecycle Dates -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-primary" />
              Program Lifecycle Dates
            </span>

            <div class="space-y-1">
              <label class="font-semibold text-primary-text">Program Date Range</label>
              <BaseDatePicker
                v-model="dateRange"
                :range="true"
                :enableTime="true"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                placeholder="Select start and end dates"
              />
            </div>
          </div>

          <!-- Points & Qualification Metrics -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Award class="w-3.5 h-3.5 text-primary" />
              Earning & Redemption Thresholds
            </span>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Base Pts / Std Lot</label>
                <input
                  v-model.number="form.base_points_per_lot"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Min Redemption Pts</label>
                <input
                  v-model.number="form.min_redemption_points"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Min Trade Duration (s)</label>
                <input
                  v-model.number="form.min_trade_duration_seconds"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Point Validity (Days)</label>
                <input
                  v-model.number="form.point_validity_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>
          </div>
          <!-- Tier Qualification & Durations -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5 text-primary" />
              Tier Window & Policy Durations
            </span>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Tier Window (Days)</label>
                <input
                  v-model.number="form.tier_window_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Grace Period (Days)</label>
                <input
                  v-model.number="form.grace_period_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1 sm:col-span-2">
                <label class="font-semibold text-primary-text">Dormancy Threshold (Days)</label>
                <input
                  v-model.number="form.dormant_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>

            <!-- Carry Over Toggle -->
            <label class="flex items-center gap-2.5 pt-2 border-t border-primary-border/60 cursor-pointer select-none">
              <input
                v-model="form.carry_over_enrollments"
                type="checkbox"
                class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
              />
              <div>
                <p class="font-semibold text-primary-text">Carry Over Enrollments</p>
                <p class="text-[10px] text-secondary-text">Automatically migrate active members to subsequent cycles</p>
              </div>
            </label>
          </div>

          <!-- Account Eligibility Rules -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-primary-green" />
              Account Eligibility Rules
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.require_kyc"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Require KYC</span>
                    <span class="text-[9px] text-secondary-text">Only verified clients</span>
                  </div>
                </label>

                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.require_live"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Require Live</span>
                    <span class="text-[9px] text-secondary-text">Exclude demo accounts</span>
                  </div>
                </label>

                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.exclude_copy_accounts"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Exclude Copy A/Cs</span>
                    <span class="text-[9px] text-secondary-text">No copy trading accounts</span>
                  </div>
                </label>

                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.earn_on_copy_fills"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Earn on Copy Fills</span>
                    <span class="text-[9px] text-secondary-text">Award on copied fills</span>
                  </div>
                </label>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Excluded Account Categories (Comma-separated)</label>
                <input
                  v-model="excludedCategoriesText"
                  type="text"
                  placeholder="cent, pamm"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Instrument Rules & Suffix Normalization -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                <FileCode class="w-3.5 h-3.5 text-primary" />
                Instrument Rules & Custom Multipliers
              </span>

              <button
                type="button"
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] transition cursor-pointer border border-primary/20"
                @click="addInstrumentRule"
              >
                <Plus class="w-3 h-3" />
                <span>Add Symbol Rule</span>
              </button>
            </div>

            <!-- Normalize Suffixes Toggle -->
            <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
              <input
                v-model="form.instrument_rules.normalize_suffixes"
                type="checkbox"
                class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
              />
              <div>
                <span class="font-semibold text-primary-text block">Normalize Symbol Suffixes</span>
                <span class="text-[10px] text-secondary-text">Strip broker symbol extensions (e.g. EURUSD.pro &rarr; EURUSD)</span>
              </div>
            </label>

            <!-- Rules List -->
            <div v-if="form.instrument_rules.rules && form.instrument_rules.rules.length > 0" class="space-y-2.5">
              <div
                v-for="(rule, index) in form.instrument_rules.rules"
                :key="index"
                class="p-3 bg-card-background border border-primary-border rounded-xl space-y-2 relative"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-primary-text text-[11px]">Symbol Rule #{{ index + 1 }}</span>
                  <button
                    type="button"
                    class="w-6 h-6 flex items-center justify-center rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="Remove Rule"
                    @click="removeInstrumentRule(index)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div class="space-y-0.5 sm:col-span-2">
                    <label class="text-[10px] text-secondary-text font-medium">Symbols (Comma-separated)</label>
                    <input
                      v-model="rule.symbolsText"
                      type="text"
                      placeholder="e.g. EURUSD, XAUUSD, BTCUSD"
                      class="w-full px-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                    />
                  </div>

                  <div class="space-y-0.5">
                    <label class="text-[10px] text-secondary-text font-medium">Match Type</label>
                    <BaseSelect
                      v-model="rule.match"
                      :options="matchTypeOptions"
                      placeholder="Match"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-1 border-t border-primary-border/60">
                  <div class="space-y-0.5">
                    <label class="text-[10px] text-secondary-text font-medium">Base Pts / Lot</label>
                    <input
                      v-model.number="rule.base_points_per_lot"
                      type="number"
                      step="any"
                      placeholder="5"
                      class="w-full px-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                    />
                  </div>

                  <div class="flex items-center pt-3.5">
                    <label class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer select-none">
                      <input
                        v-model="rule.eligible"
                        type="checkbox"
                        class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                      />
                      <span>Eligible for points</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="p-4 text-center text-secondary-text bg-background/30 rounded-lg border border-dashed border-primary-border text-[11px]">
              No custom symbol overrides. Standard base rate applies to all trades.
            </div>
          </div>
        </form>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-program-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ store.actionLoading ? 'Creating...' : 'Create Program' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  X,
  Loader2,
  Award,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "created"]);
const store = useLoyaltyStore();

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

const scopeOptions = [
  { label: "One Account Per User", value: "one_per_user" },
  { label: "All Eligible Accounts", value: "all_eligible_accounts" },
];

const matchTypeOptions = [
  { label: "Exact Match", value: "exact" },
  { label: "Prefix Match", value: "prefix" },
  { label: "Suffix Match", value: "suffix" },
  { label: "Regex Match", value: "regex" },
];

const excludedCategoriesText = ref("cent, pamm");
const imageUrlsList = ref([]);

const addImageUrl = () => {
  if (imageUrlsList.value.length < 4) {
    imageUrlsList.value.push("");
  }
};

const removeImageUrl = (index) => {
  imageUrlsList.value.splice(index, 1);
};

const form = reactive({
  code: "",
  name: "",
  description: "",
  status: "draft",
  account_scope: "one_per_user",
  start_at: "",
  end_at: "",
  base_points_per_lot: 5,
  min_redemption_points: 100,
  min_trade_duration_seconds: 120,
  point_validity_days: 180,
  tier_window_days: 90,
  dormant_days: 90,
  grace_period_days: 14,
  terms_version: "1.0",
  carry_over_enrollments: false,
  eligibility_rules: {
    require_kyc: false,
    require_live: true,
    exclude_copy_accounts: true,
    earn_on_copy_fills: true,
    trading_types: ["real"],
    exclude_account_categories: ["cent", "pamm"],
  },
  instrument_rules: {
    normalize_suffixes: true,
    rules: [],
  },
});

const dateRange = computed({
  get() {
    if (form.start_at || form.end_at) {
      return {
        start: form.start_at || null,
        end: form.end_at || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      form.start_at = "";
      form.end_at = "";
    } else if (Array.isArray(val)) {
      form.start_at = val[0] || "";
      form.end_at = val[1] || "";
    } else if (typeof val === "object") {
      form.start_at = val.start || val.from || "";
      form.end_at = val.end || val.to || "";
    }
  },
});

const addInstrumentRule = () => {
  form.instrument_rules.rules.push({
    symbolsText: "EURUSD, XAUUSD",
    match: "exact",
    base_points_per_lot: form.base_points_per_lot || 5,
    eligible: true,
  });
};

const removeInstrumentRule = (index) => {
  form.instrument_rules.rules.splice(index, 1);
};

const handleSubmit = async () => {
  const categories = excludedCategoriesText.value
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const formattedInstrumentRules = form.instrument_rules.rules.map((r) => ({
    symbols: r.symbolsText.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
    match: r.match,
    base_points_per_lot: Number(r.base_points_per_lot),
    eligible: Boolean(r.eligible),
  }));

  const validUrls = imageUrlsList.value.map((u) => u.trim()).filter(Boolean).slice(0, 4);

  const payload = {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description?.trim() || null,
    status: form.status,
    account_scope: form.account_scope,
    start_at: form.start_at || null,
    end_at: form.end_at || null,
    base_points_per_lot: Number(form.base_points_per_lot),
    min_redemption_points: Number(form.min_redemption_points),
    min_trade_duration_seconds: Number(form.min_trade_duration_seconds),
    point_validity_days: Number(form.point_validity_days),
    tier_window_days: Number(form.tier_window_days),
    dormant_days: Number(form.dormant_days),
    grace_period_days: Number(form.grace_period_days),
    terms_version: form.terms_version,
    carry_over_enrollments: Boolean(form.carry_over_enrollments),
    image_urls: validUrls,
    image_url: validUrls[0] || null,
    eligibility_rules: {
      ...form.eligibility_rules,
      exclude_account_categories: categories,
    },
    instrument_rules: {
      normalize_suffixes: Boolean(form.instrument_rules.normalize_suffixes),
      rules: formattedInstrumentRules,
    },
  };

  await store.createProgram(payload);
  emit("created");
  emit("close");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
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
