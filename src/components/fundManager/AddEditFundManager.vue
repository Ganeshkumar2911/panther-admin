<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="closeDialog"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl sm:max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/60"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary"
            >
              <Sliders v-if="mode === 'edit'" class="w-5 h-5" />
              <Plus v-else class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-primary-text text-base font-bold">
                {{ getTitle() }}
              </h2>
              <p class="text-secondary-text text-xs mt-0.5">
                {{
                  mode === "add"
                    ? "Create a new fund manager leaderboard account and MT5 trading setup"
                    : `Update configuration & profile for ID: #${item?.id}`
                }}
              </p>
            </div>
          </div>
          <button
            @click="closeDialog"
            class="p-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-all cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <div class="px-6 py-5 flex flex-col gap-6 overflow-y-auto flex-1">
          <!-- SECTION 1: GENERAL IDENTITY & AUTH -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <User class="w-3.5 h-3.5" />
              Fund Manager Identity & Login
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- User Full Name (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Full Name <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. John Doe"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.name
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span v-if="errors.name" class="text-xs text-primary-red">{{
                  errors.name
                }}</span>
              </div>

              <!-- User Email (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Email Address <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="e.g. fm@example.com"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.email
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span v-if="errors.email" class="text-xs text-primary-red">{{
                  errors.email
                }}</span>
              </div>

              <!-- Label Name (Optional, defaults to Name) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Label / Display Name
                  <span class="text-[11px] font-normal text-secondary-text"
                    >(defaults to Full Name)</span
                  >
                </label>
                <input
                  v-model="form.label_name"
                  type="text"
                  placeholder="e.g. Growth Alpha Strategy"
                  class="bg-background border border-primary-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                />
              </div>

              <!-- Password (Required for add) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Password
                  <span v-if="mode === 'add'" class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  :placeholder="
                    mode === 'add'
                      ? 'Enter Account Password'
                      : 'Leave blank to keep unchanged'
                  "
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.password
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span v-if="errors.password" class="text-xs text-primary-red">{{
                  errors.password
                }}</span>
              </div>

              <!-- Visibility Type -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Visibility Type</label
                >
                <BaseSelect
                  :modelValue="form.visibility_type"
                  :options="visibilityOptions"
                  placeholder="Select visibility"
                  @update:modelValue="form.visibility_type = $event"
                />
              </div>

              <!-- Account Status Switcher (Active/Inactive) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Account Status</label
                >
                <div
                  class="flex items-center gap-4 bg-background border border-primary-border rounded-xl px-4 py-2.5 h-[38px]"
                >
                  <label
                    class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text"
                  >
                    <input
                      type="radio"
                      :value="true"
                      v-model="form.is_active"
                      class="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-emerald-500 font-bold">Active</span>
                  </label>
                  <label
                    class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text"
                  >
                    <input
                      type="radio"
                      :value="false"
                      v-model="form.is_active"
                      class="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-zinc-500 font-semibold">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: BROKER & MT5 ACCOUNT CONFIGURATION -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <div
              class="flex items-center justify-between border-b border-primary-border/60 pb-2"
            >
              <h3
                class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"
              >
                <Server class="w-3.5 h-3.5" />
                Broker Group & MT5 Trading Account
              </h3>
              <span
                v-if="groupsLoading"
                class="text-[11px] text-secondary-text flex items-center gap-1"
              >
                <Loader2 class="w-3 h-3 animate-spin text-primary" /> Loading
                groups...
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Group Preset Selector / Quick Auto-fill -->
              <div
                class="sm:col-span-2 flex flex-col gap-1.5"
                v-if="groupOptions.length > 0"
              >
                <label
                  class="text-xs font-semibold text-secondary-text flex items-center justify-between"
                >
                  <span>Select Group Template</span>
                  <span class="text-[11px] font-normal text-secondary-text"
                    >Auto-populates group, currency & leverage</span
                  >
                </label>
                <BaseSelect
                  :modelValue="selectedGroupValue"
                  :options="groupOptions"
                  placeholder="Choose an existing MT5 group configuration..."
                  searchable
                  @update:modelValue="onGroupPresetSelect"
                />
              </div>

              <!-- Broker Group (Required for MT5 account) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Group <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.broker_group"
                  type="text"
                  placeholder="e.g. real\FM or PCL\RAW"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.broker_group
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.broker_group"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_group }}</span
                >
              </div>

              <!-- Broker Currency (Disabled / Fixed from Group) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Currency <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.broker_currency"
                  :options="currencyOptions"
                  :disabled="true"
                  placeholder="Select currency"
                  @update:modelValue="form.broker_currency = $event"
                />
                <span
                  v-if="errors.broker_currency"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_currency }}</span
                >
              </div>

              <!-- Broker Leverage (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Leverage <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.broker_leverage"
                  :options="leverageOptions"
                  placeholder="Select leverage"
                  @update:modelValue="form.broker_leverage = $event"
                />
                <span
                  v-if="errors.broker_leverage"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_leverage }}</span
                >
              </div>

              <!-- Group Config ID (Optional) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Group Config ID
                  <span class="text-[11px] font-normal text-secondary-text"
                    >(Optional)</span
                  >
                </label>
                <input
                  v-model="form.group_config_id"
                  type="number"
                  placeholder="e.g. 1"
                  class="bg-background border border-primary-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 3: FINANCIALS, FEES & REVENUE SHARE -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <DollarSign class="w-3.5 h-3.5" />
              Financials, Fees & Revenue Share
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Min Investment Capital (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Min Investment Capital ($)
                  <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.min_capital"
                  type="number"
                  placeholder="e.g. 1000"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.min_capital
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.min_capital"
                  class="text-xs text-primary-red"
                  >{{ errors.min_capital }}</span
                >
              </div>

              <!-- Performance Fee (Required, Max 50) -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-semibold text-secondary-text flex items-center justify-between"
                >
                  <span
                    >Performance Fee (%)
                    <span class="text-primary-red">*</span></span
                  >
                  <span
                    class="text-[10px] text-secondary-text font-bold uppercase"
                    >Max 50%</span
                  >
                </label>
                <input
                  v-model="form.performance_fee"
                  type="number"
                  max="50"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 20"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.performance_fee
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.performance_fee"
                  class="text-xs text-primary-red"
                  >{{ errors.performance_fee }}</span
                >
              </div>

              <!-- Broker Share (%) (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Share (%) <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.broker_share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 30"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.broker_share
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                  @input="onBrokerShareInput"
                />
                <span
                  v-if="errors.broker_share"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_share }}</span
                >
              </div>

              <!-- FM Share (%) (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  FM Share (%) <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.fm_share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 70"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.fm_share
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                  @input="onFmShareInput"
                />
                <span v-if="errors.fm_share" class="text-xs text-primary-red">{{
                  errors.fm_share
                }}</span>
              </div>

              <!-- Share Distribution Live Sum Hint -->
              <div
                class="sm:col-span-2 bg-background border border-primary-border/60 rounded-xl p-2.5 flex items-center justify-between text-xs"
              >
                <span class="text-secondary-text font-medium"
                  >FM Share + Broker Share (Must sum to 100%):</span
                >
                <span
                  class="font-mono font-bold"
                  :class="
                    Math.abs(
                      (parseFloat(form.fm_share) || 0) +
                        (parseFloat(form.broker_share) || 0) -
                        100,
                    ) <= 0.01
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  "
                >
                  {{
                    (
                      (parseFloat(form.fm_share) || 0) +
                      (parseFloat(form.broker_share) || 0)
                    ).toFixed(1)
                  }}% / 100%
                </span>
              </div>
              <span
                v-if="errors.share_distribution"
                class="text-xs text-primary-red sm:col-span-2"
                >{{ errors.share_distribution }}</span
              >

              <!-- IB Pool Percentage (Required, Max 100) -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-semibold text-secondary-text flex items-center justify-between"
                >
                  <span
                    >IB Pool Percentage (%)
                    <span class="text-primary-red">*</span></span
                  >
                  <span
                    class="text-[10px] text-secondary-text font-bold uppercase"
                    >Max 100%</span
                  >
                </label>
                <input
                  v-model="form.ib_pool_percentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 10"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.ib_pool_percentage
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.ib_pool_percentage"
                  class="text-xs text-primary-red"
                  >{{ errors.ib_pool_percentage }}</span
                >
              </div>

              <!-- Registration Fee -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Registration Fee ($)</label
                >
                <input
                  v-model="form.registration_fee"
                  type="number"
                  placeholder="e.g. 0"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Management Fee (%) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Management Fee (%)</label
                >
                <input
                  v-model="form.management_fee"
                  type="number"
                  placeholder="e.g. 2"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Management Fee Interval -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Management Interval</label
                >
                <BaseSelect
                  :modelValue="form.management_fee_interval"
                  :options="intervalOptions"
                  placeholder="Select interval"
                  @update:modelValue="form.management_fee_interval = $event"
                />
              </div>

              <!-- Settlement Type (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Settlement Schedule <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.settlement_type"
                  :options="settlementOptions"
                  placeholder="Select schedule"
                  @update:modelValue="form.settlement_type = $event"
                />
                <span
                  v-if="errors.settlement_type"
                  class="text-xs text-primary-red"
                  >{{ errors.settlement_type }}</span
                >
              </div>

              <!-- Settlement Time (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Settlement Time <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.settlement_time"
                  type="time"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.settlement_time
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.settlement_time"
                  class="text-xs text-primary-red"
                  >{{ errors.settlement_time }}</span
                >
              </div>
            </div>
          </div>

          <!-- SECTION 4: CONTACT & ADDRESS (OPTIONAL) -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <MapPin class="w-3.5 h-3.5" />
              Contact & Address Information (Optional)
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Phone Number -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Phone Number</label
                >
                <input
                  v-model="form.phone_number"
                  type="text"
                  placeholder="e.g. +10000000000"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary font-mono"
                />
              </div>

              <!-- Country -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Country</label
                >
                <BaseSelect
                  :modelValue="form.country"
                  :options="countryOptions"
                  placeholder="Select country"
                  searchable
                  @update:modelValue="form.country = $event"
                />
              </div>

              <!-- State -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >State / Province</label
                >
                <input
                  v-model="form.state"
                  type="text"
                  placeholder="e.g. NY"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- City -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >City</label
                >
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="e.g. New York"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Zip Code -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Zip / Postal Code</label
                >
                <input
                  v-model="form.zip_code"
                  type="text"
                  placeholder="e.g. 10001"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary font-mono"
                />
              </div>

              <!-- Full Address -->
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text"
                  >Full Street Address</label
                >
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="e.g. 123 Main St, Suite 400"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-primary-border bg-background/60 flex items-center gap-3 shrink-0"
        >
          <button
            @click="closeDialog"
            :disabled="store.isSubmitting"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:text-primary-text hover:bg-background transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="store.isSubmitting"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="store.isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else>{{
              mode === "add" ? "Create Fund Manager" : "Update Fund Manager"
            }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import {
  Loader2,
  X,
  Plus,
  Sliders,
  User,
  DollarSign,
  Server,
  MapPin,
} from "lucide-vue-next";
import { useFmLeaderboardStore } from "@/stores/fmLeaderboard/fmLeaderboard";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { countries } from "@/utils/countries";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "add" },
  item: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);
const store = useFmLeaderboardStore();

const rawGroups = ref([]);
const groupsLoading = ref(false);
const selectedGroupValue = ref("");

const settlementOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Daily", value: "daily" },
];

const intervalOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const visibilityOptions = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "USC", value: "USC" },
];

const leverageOptions = [
  { label: "1:50", value: 50 },
  { label: "1:100", value: 100 },
  { label: "1:200", value: 200 },
  { label: "1:400", value: 400 },
  { label: "1:500", value: 500 },
  { label: "1:1000", value: 1000 },
];

const countryOptions = computed(() => {
  return countries.map((c) => ({
    label: c.label,
    value: c.value,
  }));
});

const groupOptions = computed(() => {
  return rawGroups.value
    .filter((g) => g.is_added === true)
    .map((g) => ({
      label: `${g.label || g.badge || g.group} (${g.currency || "USD"} · 1:${g.leverage || 100})`,
      value: g.group || g.config_id || g.label,
      data: g,
    }));
});

const form = ref({
  // Required identity / login
  email: "",
  name: "",
  password: "",
  label_name: "",
  visibility_type: "public",
  is_active: true,

  // Broker / MT5
  broker_group: "",
  broker_currency: "USD",
  broker_leverage: 100,
  group_config_id: null,

  // Financials & Fees
  min_capital: "",
  performance_fee: "",
  fm_share: 70,
  broker_share: 30,
  ib_pool_percentage: 10,
  settlement_type: "monthly",
  settlement_time: "00:00",
  management_fee: 2,
  management_fee_interval: "monthly",
  registration_fee: 0,

  // Contact / Address
  phone_number: "",
  country: "",
  state: "",
  city: "",
  address: "",
  zip_code: "",
});

const errors = ref({});

const onBrokerShareInput = () => {
  const b = parseFloat(form.value.broker_share);
  if (!isNaN(b) && b >= 0 && b <= 100) {
    form.value.fm_share = Math.max(0, 100 - b);
  }
};

const onFmShareInput = () => {
  const fm = parseFloat(form.value.fm_share);
  if (!isNaN(fm) && fm >= 0 && fm <= 100) {
    form.value.broker_share = Math.max(0, 100 - fm);
  }
};

const fetchAvailableGroups = async () => {
  groupsLoading.value = true;
  try {
    const endpoint =
      urls.groupConfig?.groups || urls.groupConfig?.list || "/mt5/groups";
    apiRequest(urls.KEYS.GET, endpoint, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
        status: "all",
        account_type: "live",
      },
      onSuccess: (res) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res)
              ? res
              : [];
        rawGroups.value = items;
        groupsLoading.value = false;
      },
      onFailure: () => {
        groupsLoading.value = false;
      },
    });
  } catch {
    groupsLoading.value = false;
  }
};

const onGroupPresetSelect = (groupValue) => {
  selectedGroupValue.value = groupValue;
  const match = rawGroups.value.find(
    (g) =>
      g.group === groupValue ||
      String(g.config_id) === String(groupValue) ||
      g.label === groupValue,
  );
  if (match) {
    form.value.broker_group = match.group || groupValue;
    if (match.currency) form.value.broker_currency = match.currency;
    if (match.leverage) form.value.broker_leverage = Number(match.leverage);
    form.value.group_config_id =
      match.config_id || match.group_config_id || match.id || null;
  } else {
    form.value.broker_group = groupValue;
  }
};

// Reset & Auto-fill form fields when drawer opens
const resetForm = () => {
  selectedGroupValue.value = "";
  if (props.mode === "edit" && props.item) {
    const u = props.item.user || {};
    form.value = {
      email: u.email ?? props.item.email ?? "",
      name: u.name ?? props.item.name ?? "",
      password: "",
      label_name: props.item.label_name ?? "",
      visibility_type: props.item.visibility_type ?? "public",
      is_active: props.item.is_active ?? true,

      broker_group: props.item.broker_group ?? "",
      broker_currency: props.item.broker_currency ?? "USD",
      broker_leverage: props.item.broker_leverage ?? 100,
      group_config_id:
        props.item.group_config_id ??
        props.item.coverage_account?.group_config_id ??
        null,

      min_capital: props.item.min_capital ?? "",
      performance_fee: props.item.performance_fee ?? "",
      fm_share: props.item.fm_share ?? 70,
      broker_share: props.item.broker_share ?? 30,
      ib_pool_percentage: props.item.ib_pool_percentage ?? 10,
      settlement_type:
        props.item.settlement_type ?? props.item.settlement ?? "monthly",
      settlement_time: props.item.settlement_time ?? "00:00",
      management_fee: props.item.management_fee ?? 2,
      management_fee_interval: props.item.management_fee_interval ?? "monthly",
      registration_fee: props.item.registration_fee ?? 0,

      phone_number: u.phone_number ?? props.item.phone_number ?? "",
      country: u.country ?? props.item.country ?? "",
      state: u.state ?? props.item.state ?? "",
      city: u.city ?? props.item.city ?? "",
      address: u.address ?? props.item.address ?? "",
      zip_code: u.zip_code ?? props.item.zip_code ?? "",
    };
  } else {
    // Add mode initial defaults matching new payload schema
    form.value = {
      email: "",
      name: "",
      password: "",
      label_name: "",
      visibility_type: "public",
      is_active: true,

      broker_group: "real\\FM",
      broker_currency: "USD",
      broker_leverage: 100,
      group_config_id: null,

      min_capital: 1000,
      performance_fee: 20,
      fm_share: 70,
      broker_share: 30,
      ib_pool_percentage: 10,
      settlement_type: "monthly",
      settlement_time: "00:00",
      management_fee: 2,
      management_fee_interval: "monthly",
      registration_fee: 0,

      phone_number: "",
      country: "",
      state: "",
      city: "",
      address: "",
      zip_code: "",
    };
  }
  errors.value = {};
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
      fetchAvailableGroups();
    }
  },
  { immediate: true },
);

const closeDialog = () => {
  errors.value = {};
  emit("close");
};

const validateForm = () => {
  const newErrors = {};

  // Email (Required)
  const email = form.value.email?.trim();
  if (!email) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  // Name (Required)
  if (!form.value.name?.trim()) {
    newErrors.name = "Full Name is required";
  }

  // Password (Required for create)
  if (props.mode === "add" && !form.value.password) {
    newErrors.password = "Password is required";
  }

  // Broker Group (Required)
  if (!form.value.broker_group?.trim()) {
    newErrors.broker_group = "Broker group is required for MT5 account";
  }

  // Broker Currency & Leverage
  if (!form.value.broker_currency) {
    newErrors.broker_currency = "Currency is required";
  }
  if (!form.value.broker_leverage) {
    newErrors.broker_leverage = "Leverage is required";
  }

  // Min Capital (Required)
  if (form.value.min_capital === "" || form.value.min_capital == null) {
    newErrors.min_capital = "Min capital is required";
  }

  // Performance Fee (Required, Max 50)
  if (form.value.performance_fee === "" || form.value.performance_fee == null) {
    newErrors.performance_fee = "Performance fee is required";
  } else {
    const pf = parseFloat(form.value.performance_fee);
    if (isNaN(pf) || pf < 0) {
      newErrors.performance_fee = "Must be a valid positive number";
    } else if (pf > 50) {
      newErrors.performance_fee = "Max performance fee allowed is 50%";
    }
  }

  // Broker Share & FM Share (Required, Must sum to 100)
  if (form.value.broker_share === "" || form.value.broker_share == null) {
    newErrors.broker_share = "Broker share is required";
  }
  if (form.value.fm_share === "" || form.value.fm_share == null) {
    newErrors.fm_share = "FM share is required";
  }
  const fm = parseFloat(form.value.fm_share) || 0;
  const broker = parseFloat(form.value.broker_share) || 0;
  if (Math.abs(fm + broker - 100) > 0.01) {
    newErrors.share_distribution =
      "FM Share and Broker Share must sum to exactly 100%";
  }

  // IB Pool Percentage (Required, Max 100)
  if (
    form.value.ib_pool_percentage === "" ||
    form.value.ib_pool_percentage == null
  ) {
    newErrors.ib_pool_percentage = "IB pool percentage is required";
  } else if (parseFloat(form.value.ib_pool_percentage) > 100) {
    newErrors.ib_pool_percentage = "Max 100%";
  }

  // Settlement
  if (!form.value.settlement_type)
    newErrors.settlement_type = "Settlement schedule is required";
  if (!form.value.settlement_time)
    newErrors.settlement_time = "Settlement time is required";

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = {
    email: form.value.email.trim(),
    name: form.value.name.trim(),
    label_name: form.value.label_name?.trim() || form.value.name.trim(),
    visibility_type: form.value.visibility_type || "public",
    is_active: Boolean(form.value.is_active),

    broker_group: form.value.broker_group.trim(),
    broker_currency: form.value.broker_currency || "USD",
    broker_leverage: Number(form.value.broker_leverage) || 100,

    min_capital: Number(form.value.min_capital) || 0,
    performance_fee: Number(form.value.performance_fee) || 0,
    fm_share: Number(form.value.fm_share) || 0,
    broker_share: Number(form.value.broker_share) || 0,
    ib_pool_percentage: Number(form.value.ib_pool_percentage) || 0,
    settlement_type: form.value.settlement_type || "monthly",
    settlement_time: form.value.settlement_time || "00:00",
    management_fee: Number(form.value.management_fee) || 0,
    management_fee_interval: form.value.management_fee_interval || "monthly",
    registration_fee: Number(form.value.registration_fee) || 0,
  };

  if (form.value.group_config_id != null && form.value.group_config_id !== "") {
    payload.group_config_id = Number(form.value.group_config_id);
  }

  if (form.value.password) {
    payload.password = form.value.password;
  }

  if (form.value.phone_number?.trim())
    payload.phone_number = form.value.phone_number.trim();
  if (form.value.country?.trim()) payload.country = form.value.country.trim();
  if (form.value.state?.trim()) payload.state = form.value.state.trim();
  if (form.value.city?.trim()) payload.city = form.value.city.trim();
  if (form.value.address?.trim()) payload.address = form.value.address.trim();
  if (form.value.zip_code?.trim())
    payload.zip_code = form.value.zip_code.trim();

  if (props.mode === "add") {
    await store.createFundManager(payload);
  } else {
    await store.editFundManager(props.item.id, payload);
  }

  if (!store.error) {
    closeDialog();
    emit("success");
  }
};

const getTitle = () =>
  props.mode === "add" ? "Create Fund Manager" : "Edit Fund Manager";
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
