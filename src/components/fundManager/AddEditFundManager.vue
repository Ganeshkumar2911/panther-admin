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
            <div class="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
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
                    ? "Create a new fund manager leaderboard entry"
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
          <!-- SECTION 1: GENERAL & IDENTITY -->
          <div class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2">
              <User class="w-3.5 h-3.5" />
              General Identity & Status
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Label Name -->
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text">
                  Label Name <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.label_name"
                  type="text"
                  placeholder="e.g. Growth Alpha Manager"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.label_name ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.label_name" class="text-xs text-primary-red">{{ errors.label_name }}</span>
              </div>

              <!-- User Full Name -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">User Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. John Doe"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- User Email -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Email Address <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="e.g. manager@example.com"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.email ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.email" class="text-xs text-primary-red">{{ errors.email }}</span>
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Password <span v-if="mode === 'add'" class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  :placeholder="mode === 'add' ? 'Enter Password' : 'Leave blank to keep unchanged'"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.password ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.password" class="text-xs text-primary-red">{{ errors.password }}</span>
              </div>

              <!-- Visibility Type -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Visibility Type</label>
                <BaseSelect
                  :modelValue="form.visibility_type"
                  :options="visibilityOptions"
                  placeholder="Select visibility"
                  @update:modelValue="form.visibility_type = $event"
                />
              </div>

              <!-- Active Status Switcher -->
              <div class="flex flex-col gap-1.5 sm:col-span-2 pt-1">
                <label class="text-xs font-semibold text-secondary-text">Account Status</label>
                <div class="flex items-center gap-4 bg-background border border-primary-border rounded-xl px-4 py-2.5">
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text">
                    <input
                      type="radio"
                      :value="true"
                      v-model="form.is_active"
                      class="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-emerald-500 font-bold">Active</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text">
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

          <!-- SECTION 2: FINANCIALS, FEES & SHARE SPLIT -->
          <div class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2">
              <DollarSign class="w-3.5 h-3.5" />
              Financials, Fees & Revenue Share
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Min Capital -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Min Investment Capital <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.min_capital"
                  type="number"
                  placeholder="e.g. 1000"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.min_capital ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.min_capital" class="text-xs text-primary-red">{{ errors.min_capital }}</span>
              </div>

              <!-- Performance Fee -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Performance Fee (%) <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.performance_fee"
                  type="number"
                  placeholder="e.g. 20"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.performance_fee ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.performance_fee" class="text-xs text-primary-red">{{ errors.performance_fee }}</span>
              </div>

              <!-- Broker Share -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Share (%) <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.broker_share"
                  type="number"
                  placeholder="e.g. 30"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.broker_share ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.broker_share" class="text-xs text-primary-red">{{ errors.broker_share }}</span>
              </div>

              <!-- FM Share -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  FM Share (%) <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.fm_share"
                  type="number"
                  placeholder="e.g. 70"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.fm_share ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.fm_share" class="text-xs text-primary-red">{{ errors.fm_share }}</span>
              </div>

              <!-- Share Distribution Live Hint -->
              <div class="sm:col-span-2 bg-background border border-primary-border/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span class="text-secondary-text">Broker + FM Share Sum:</span>
                <span
                  class="font-bold"
                  :class="
                    Math.abs((parseFloat(form.fm_share) || 0) + (parseFloat(form.broker_share) || 0) - 100) <= 0.01
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  "
                >
                  {{ ((parseFloat(form.fm_share) || 0) + (parseFloat(form.broker_share) || 0)).toFixed(2) }}% / 100%
                </span>
              </div>
              <span v-if="errors.share_distribution" class="text-xs text-primary-red sm:col-span-2">{{ errors.share_distribution }}</span>

              <!-- IB Pool Percentage -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  IB Pool Percentage (%) <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.ib_pool_percentage"
                  type="number"
                  placeholder="e.g. 10"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.ib_pool_percentage ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.ib_pool_percentage" class="text-xs text-primary-red">{{ errors.ib_pool_percentage }}</span>
              </div>

              <!-- Registration Fee -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Registration Fee</label>
                <input
                  v-model="form.registration_fee"
                  type="number"
                  placeholder="e.g. 0"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Management Fee -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Management Fee (%)</label>
                <input
                  v-model="form.management_fee"
                  type="number"
                  placeholder="e.g. 2"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Management Fee Interval -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Management Interval</label>
                <BaseSelect
                  :modelValue="form.management_fee_interval"
                  :options="intervalOptions"
                  placeholder="Select interval"
                  @update:modelValue="form.management_fee_interval = $event"
                />
              </div>

              <!-- Settlement Type -->
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
                <span v-if="errors.settlement_type" class="text-xs text-primary-red">{{ errors.settlement_type }}</span>
              </div>

              <!-- Settlement Time -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Settlement Time <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.settlement_time"
                  type="time"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="errors.settlement_time ? 'border-primary-red' : 'border-primary-border focus:border-primary'"
                />
                <span v-if="errors.settlement_time" class="text-xs text-primary-red">{{ errors.settlement_time }}</span>
              </div>
            </div>
          </div>

          <!-- SECTION 3: USER PROFILE & KYC CONFIGURATION -->
          <div class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2">
              <ShieldCheck class="w-3.5 h-3.5" />
              User Details & KYC Profile
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Phone Number -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Phone Number</label>
                <input
                  v-model="form.phone_number"
                  type="text"
                  placeholder="e.g. +10000000000"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Date of Birth -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Date of Birth</label>
                <input
                  v-model="form.date_of_birth"
                  type="date"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary cursor-pointer"
                />
              </div>

              <!-- Country -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Country</label>
                <input
                  v-model="form.country"
                  type="text"
                  placeholder="e.g. US or India [IN]"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- State -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">State</label>
                <input
                  v-model="form.state"
                  type="text"
                  placeholder="e.g. NY"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- City -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">City</label>
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="e.g. New York"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Zip Code -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Zip Code</label>
                <input
                  v-model="form.zip_code"
                  type="text"
                  placeholder="e.g. 10001"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Address -->
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text">Full Address</label>
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="e.g. 123 Main St"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- KYC Status -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">KYC Status</label>
                <BaseSelect
                  :modelValue="form.kyc_status"
                  :options="kycStatusOptions"
                  placeholder="Select status"
                  @update:modelValue="form.kyc_status = $event"
                />
              </div>

              <!-- Verification Channel -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Verification Channel</label>
                <input
                  v-model="form.verification_channel"
                  type="text"
                  placeholder="e.g. Manual or Sumsub"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Docs Uploaded -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Docs Uploaded</label>
                <BaseSelect
                  :modelValue="form.docs_uploaded"
                  :options="yesNoOptions"
                  placeholder="Select..."
                  @update:modelValue="form.docs_uploaded = $event"
                />
              </div>

              <!-- Doc Approved -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">Doc Approved</label>
                <BaseSelect
                  :modelValue="form.doc_approved"
                  :options="yesNoOptions"
                  placeholder="Select..."
                  @update:modelValue="form.doc_approved = $event"
                />
              </div>

              <!-- KYC Reject Reason -->
              <div v-if="form.kyc_status === 'rejected'" class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text">KYC Reject Reason</label>
                <input
                  v-model="form.kyc_reject_reason"
                  type="text"
                  placeholder="Reason for rejection..."
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-red focus:border-primary-red"
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
            <span v-else>{{ mode === "add" ? "Create Fund Manager" : "Update Fund Manager" }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Loader2, X, Plus, Sliders, User, DollarSign, ShieldCheck } from "lucide-vue-next";
import { useFmLeaderboardStore } from "@/stores/fmLeaderboard/fmLeaderboard";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "add" },
  item: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);
const store = useFmLeaderboardStore();

const settlementOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
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

const kycStatusOptions = [
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const form = ref({
  label_name: "",
  is_active: true,
  min_capital: "",
  performance_fee: "",
  fm_share: "",
  broker_share: "",
  ib_pool_percentage: "",
  settlement_type: "daily",
  settlement_time: "00:00",
  management_fee: "",
  management_fee_interval: "monthly",
  registration_fee: "",
  visibility_type: "public",

  name: "",
  email: "",
  password: "",
  phone_number: "",
  date_of_birth: "",
  country: "",
  state: "",
  city: "",
  address: "",
  zip_code: "",
  verification_channel: "",
  docs_uploaded: "",
  doc_approved: "",
  kyc_status: "approved",
  kyc_reject_reason: "",
});

const errors = ref({});

// Reset & Auto-fill form fields when drawer opens
const resetForm = () => {
  if (props.mode === "edit" && props.item) {
    const u = props.item.user || {};
    form.value = {
      label_name: props.item.label_name ?? "",
      is_active: props.item.is_active ?? true,
      min_capital: props.item.min_capital ?? "",
      performance_fee: props.item.performance_fee ?? "",
      fm_share: props.item.fm_share ?? "",
      broker_share: props.item.broker_share ?? "",
      ib_pool_percentage: props.item.ib_pool_percentage ?? "",
      settlement_type: props.item.settlement_type ?? props.item.settlement ?? "daily",
      settlement_time: props.item.settlement_time ?? "00:00",
      management_fee: props.item.management_fee ?? "",
      management_fee_interval: props.item.management_fee_interval ?? "monthly",
      registration_fee: props.item.registration_fee ?? "",
      visibility_type: props.item.visibility_type ?? "public",

      name: u.name ?? props.item.name ?? "",
      email: u.email ?? props.item.email ?? "",
      password: "",
      phone_number: u.phone_number ?? props.item.phone_number ?? "",
      date_of_birth: u.date_of_birth ?? props.item.date_of_birth ?? "",
      country: u.country ?? props.item.country ?? "",
      state: u.state ?? props.item.state ?? "",
      city: u.city ?? props.item.city ?? "",
      address: u.address ?? props.item.address ?? "",
      zip_code: u.zip_code ?? props.item.zip_code ?? "",
      verification_channel: u.verification_channel ?? props.item.verification_channel ?? "",
      docs_uploaded: u.docs_uploaded ?? props.item.docs_uploaded ?? "",
      doc_approved: u.doc_approved ?? props.item.doc_approved ?? "",
      kyc_status: u.kyc_status ?? props.item.kyc_status ?? "approved",
      kyc_reject_reason: u.kyc_reject_reason ?? props.item.kyc_reject_reason ?? "",
    };
  } else {
    // Add mode initial state
    form.value = {
      label_name: "",
      is_active: true,
      min_capital: "",
      performance_fee: "",
      fm_share: "",
      broker_share: "",
      ib_pool_percentage: "",
      settlement_type: "daily",
      settlement_time: "00:00",
      management_fee: "",
      management_fee_interval: "monthly",
      registration_fee: "",
      visibility_type: "public",

      name: "",
      email: "",
      password: "",
      phone_number: "",
      date_of_birth: "",
      country: "",
      state: "",
      city: "",
      address: "",
      zip_code: "",
      verification_channel: "",
      docs_uploaded: "",
      doc_approved: "",
      kyc_status: "approved",
      kyc_reject_reason: "",
    };
  }
  errors.value = {};
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  },
  { immediate: true }
);

const closeDialog = () => {
  errors.value = {};
  emit("close");
};

const validateForm = () => {
  const newErrors = {};
  if (!form.value.label_name?.trim()) newErrors.label_name = "Required";
  
  const email = form.value.email?.trim();
  if (!email) {
    newErrors.email = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  if (props.mode === "add" && !form.value.password) {
    newErrors.password = "Required";
  }

  if (form.value.min_capital === "" || form.value.min_capital == null) newErrors.min_capital = "Required";
  if (form.value.broker_share === "" || form.value.broker_share == null) newErrors.broker_share = "Required";
  if (form.value.fm_share === "" || form.value.fm_share == null) newErrors.fm_share = "Required";
  if (form.value.ib_pool_percentage === "" || form.value.ib_pool_percentage == null) newErrors.ib_pool_percentage = "Required";
  if (form.value.performance_fee === "" || form.value.performance_fee == null) newErrors.performance_fee = "Required";
  if (!form.value.settlement_type) newErrors.settlement_type = "Required";
  if (!form.value.settlement_time) newErrors.settlement_time = "Required";

  const fm = parseFloat(form.value.fm_share) || 0;
  const broker = parseFloat(form.value.broker_share) || 0;
  if (Math.abs(fm + broker - 100) > 0.01) {
    newErrors.share_distribution = "FM and Broker share must sum to exactly 100%";
  }

  if (parseFloat(form.value.ib_pool_percentage) > 100)
    newErrors.ib_pool_percentage = "Max 100%";
  if (parseFloat(form.value.performance_fee) > 100)
    newErrors.performance_fee = "Max 100%";

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = {
    label_name: form.value.label_name,
    is_active: Boolean(form.value.is_active),
    min_capital: parseFloat(form.value.min_capital) || 0,
    performance_fee: parseFloat(form.value.performance_fee) || 0,
    fm_share: parseFloat(form.value.fm_share) || 0,
    broker_share: parseFloat(form.value.broker_share) || 0,
    ib_pool_percentage: parseFloat(form.value.ib_pool_percentage) || 0,
    settlement_type: form.value.settlement_type,
    settlement_time: form.value.settlement_time,
    management_fee: parseFloat(form.value.management_fee) || 0,
    management_fee_interval: form.value.management_fee_interval,
    registration_fee: parseFloat(form.value.registration_fee) || 0,
    visibility_type: form.value.visibility_type,

    name: form.value.name,
    email: form.value.email,
    phone_number: form.value.phone_number,
    date_of_birth: form.value.date_of_birth,
    country: form.value.country,
    state: form.value.state,
    city: form.value.city,
    address: form.value.address,
    zip_code: form.value.zip_code,
    verification_channel: form.value.verification_channel,
    docs_uploaded: form.value.docs_uploaded,
    doc_approved: form.value.doc_approved,
    kyc_status: form.value.kyc_status,
    kyc_reject_reason: form.value.kyc_status === 'rejected' ? form.value.kyc_reject_reason : null,
  };

  if (form.value.password) {
    payload.password = form.value.password;
  }

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
  props.mode === "add" ? "Add Fund Manager" : "Edit Fund Manager";
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
