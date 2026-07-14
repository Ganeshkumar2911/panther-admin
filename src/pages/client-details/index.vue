<template>
  <div
    class="h-screen bg-background text-primary-text flex flex-col -m-4 lg:-m-6"
  >
    <!-- TOP BAR -->
    <div class="border-b border-primary-border px-6 py-4">
      <div class="flex items-start justify-between gap-4">
        <!-- Avatar -->
        <div class="md:flex-2 flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-lg shrink-0"
          >
            {{ initials }}
          </div>

          <!-- Name + meta -->
          <div class="flex-1">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-lg font-semibold text-primary-text">
                {{ user.name }}
              </h1>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="
                  user.is_active
                    ? 'bg-primary-green/10 text-primary-green'
                    : 'bg-primary-red/10 text-primary-red'
                "
              >
                {{ user.is_active ? "Active" : "Inactive" }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-blue/10 text-primary-blue"
              >
                {{ user.state }}
              </span>
              <span
                class="text-[11px] text-secondary-text uppercase tracking-widest"
              >
                {{ user.role }}
              </span>
            </div>

            <div class="flex items-center gap-6 mt-1 flex-wrap">
              <span class="text-[11px] text-secondary-text">
                CLIENT ID
                <span class="text-primary-text font-medium tabular-nums"
                  >#{{ user.id }}</span
                >
              </span>
              <span class="text-[11px] text-secondary-text">
                WHITELABEL
                <span class="text-primary-text font-medium">{{
                  whitelabel
                }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="border-l border-primary-border h-20"></div>

        <!-- Email / Phone / KYC -->
        <div class="hidden flex-1 md:flex flex-col gap-2 text-sm">
          <div>
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest mb-0.5"
            >
              Email
            </p>
            <p class="text-primary-text tabular-nums">{{ user.email }}</p>
          </div>
          <div>
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest"
            >
              Phone
            </p>
            <p class="text-primary-text tabular-nums">
              {{ user.phone_number ?? "-" }}
            </p>
          </div>
        </div>

        <div class="border-l border-primary-border h-20"></div>

        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest mb-0.5"
            >
              KYC
            </p>
            <span
              class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              :class="kycClass"
            >
              {{ user.kyc_status }}
            </span>
          </div>
          <div class="mt-4">
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest mb-0.5"
            >
              Country
            </p>
            <p class="text-primary-text tabular-nums">
              {{ user.country ?? "-" }}
            </p>
          </div>
        </div>

        <!-- <div class="border-l border-primary-border h-20"></div> -->

        <!-- Quick Actions -->
        <div class="shrink-0 border border-primary-border rounded-lg p-3">
          <p class="text-secondary-text font-extralight text-xs">
            Quick Actions
          </p>
          <div class="flex items-center gap-1 mt-2">
            <button
              v-for="action in quickActions"
              :key="action.label"
              :title="action.label"
              class="cursor-pointer border border-primary-border p-2 rounded-lg text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
            >
              <component :is="action.icon" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Sub-tabs -->
      <!-- <div class="flex items-center gap-1 mt-4 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          :class="
            activeTab === tab.key
              ? 'bg-primary text-white'
              : 'text-secondary-text hover:bg-background hover:text-primary-text'
          "
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div> -->
    </div>

    <!-- BODY -->
    <div class="flex flex-1 overflow-hidden">
      <!-- LEFT SIDEBAR -->
      <aside
        class="w-52 shrink-0 border-r border-primary-border overflow-y-auto no-scrollbar"
      >
        <div class="p-3 space-y-1">
          <template v-for="section in sidebarSections" :key="section.key">
            <!-- Section header (expandable) -->
            <button
              @click="toggleSection(section.key)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
            >
              <div class="flex items-center gap-2">
                <component :is="section.icon" class="w-4 h-4" />
                {{ section.label }}
              </div>
              <ChevronDown
                class="w-3.5 h-3.5 transition-transform"
                :class="expanded[section.key] ? 'rotate-180' : ''"
              />
            </button>

            <!-- Info fields -->
            <div
              v-if="section.isInfo && expanded[section.key]"
              class="ml-3 pl-3 border-l border-primary-border space-y-2 py-1"
            >
              <div
                v-for="item in section.fields"
                :key="item.label"
                class="text-xs"
              >
                <p
                  class="text-[10px] text-secondary-text uppercase tracking-widest mb-0.5"
                >
                  {{ item.label }}
                </p>
                <p class="text-primary-text break-all">
                  {{ item.value() || "—" }}
                </p>
              </div>
            </div>

            <!-- Child routes -->
            <div
              v-else-if="!section.isInfo && expanded[section.key]"
              class="ml-3 pl-3 border-l border-primary-border space-y-0.5"
            >
              <RouterLink
                v-for="child in section.children"
                :key="child.to"
                :to="child.to"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
                active-class="bg-primary/10 text-primary"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </template>
        </div>
      </aside>

      <!-- MAIN CONTENT (router-view) -->
      <main class="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        <div
          class="flex items-center gap-1 overflow-x-auto sticky top-0 z-20 bg-background border-b border-primary-border py-3"
        >
          <RouterLink
            v-for="tab in tabs"
            :key="tab.key"
            :to="tab.to"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            active-class="bg-primary text-white"
            exact-active-class="bg-primary text-white"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </RouterLink>
        </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  User,
  Info,
  MapPin,
  MoreHorizontal,
  BarChart2,
  CreditCard,
  Headphones,
  Megaphone,
  Activity,
  ChevronDown,
  Phone,
  Mail,
  FileText,
  FileCheck,
  MessageSquare,
} from "lucide-vue-next";
import { useRoute } from "vue-router";

// ─── User from localStorage ───────────────────────────────────────────────────
const user = ref({});

onMounted(() => {
  try {
    const raw = localStorage.getItem("active_client");
    if (raw) user.value = JSON.parse(raw);
  } catch {
    user.value = {};
  }
});

const initials = computed(() => {
  const n = user.value.name || "";
  return n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const whitelabel = computed(() => {
  const email = user.value.ib_email || "";
  const domain = email.split("@")[1] || "";
  return domain.split(".")[0] || "—";
});

const kycClass = computed(() => {
  const s = user.value.kyc_status;
  if (s === "approved") return "bg-primary-green/10 text-primary-green";
  if (s === "pending") return "bg-primary-yellow/10 text-primary-yellow";
  return "bg-primary-red/10 text-primary-red";
});

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  { label: "Call", icon: Phone },
  { label: "Email", icon: Mail },
  { label: "Message", icon: MessageSquare },
  { label: "Documents", icon: FileText },
  { label: "More", icon: MoreHorizontal },
];

// ─── Top Tabs ─────────────────────────────────────────────────────────────────
const activeTab = ref("overview");
const route = useRoute();

const tabs = [
  {
    key: "overview",
    label: "Overview",
    to: `/client/details/${route.params.id}/`,
    icon: Activity,
  },
  {
    key: "profile",
    label: "Profile & KYC",
    to: `/client/details/${route.params.id}/profile`,
    icon: FileCheck,
  },
  {
    key: "financials",
    label: "Financials",
    to: `/client/details/${route.params.id}/financials`,
    icon: CreditCard,
  },
  {
    key: "trading",
    label: "Trading",
    to: `/client/details/${route.params.id}/trading`,
    icon: BarChart2,
  },
  {
    key: "crm",
    label: "CRM & Support",
    to: `/client/details/${route.params.id}/crm`,
    icon: Headphones,
  },
  {
    key: "marketing",
    label: "Marketing",
    to: `/client/details/${route.params.id}/marketing`,
    icon: Megaphone,
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const expanded = ref({
  personal: true,
  info: false,
  address: false,
  other: false,
});

function toggleSection(key) {
  expanded.value[key] = !expanded.value[key];
}

const sidebarSections = computed(() => [
  {
    key: "personal",
    label: "Personal Details",
    icon: User,
    isInfo: true,
    fields: [
      { label: "Name", value: () => user.value.name },
      { label: "Email", value: () => user.value.email },
      { label: "Phone", value: () => user.value.phone_number },
      { label: "DOB", value: () => user.value.date_of_birth },
      { label: "Country", value: () => user.value.country },
      { label: "Role", value: () => user.value.role },
      { label: "State", value: () => user.value.state },
      {
        label: "Client ID",
        value: () => (user.value.id ? `#${user.value.id}` : null),
      },
    ],
  },
  {
    key: "info",
    label: "Personal Info",
    icon: Info,
    isInfo: true,
    fields: [
      { label: "KYC Status", value: () => user.value.kyc_status },
      { label: "KYC Verified At", value: () => user.value.kyc_verified_at },
      { label: "KYC Reject Reason", value: () => user.value.kyc_reject_reason },
      {
        label: "Verification Channel",
        value: () => user.value.verification_channel,
      },
      { label: "Docs Uploaded", value: () => user.value.docs_uploaded },
      { label: "Doc Approved", value: () => user.value.doc_approved },
      {
        label: "Sumsub Applicant ID",
        value: () => user.value.sumsub_applicant_id,
      },
    ],
  },
  {
    key: "address",
    label: "Address",
    icon: MapPin,
    isInfo: true,
    fields: [
      { label: "Address", value: () => user.value.address },
      { label: "City", value: () => user.value.city },
      { label: "Country", value: () => user.value.country },
      { label: "Zip Code", value: () => user.value.zip_code },
    ],
  },
  {
    key: "other",
    label: "Other",
    icon: MoreHorizontal,
    isInfo: true,
    fields: [
      { label: "IB Name", value: () => user.value.ib_name },
      { label: "IB Email", value: () => user.value.ib_email },
      { label: "IB Referral Code", value: () => user.value.ib_referral_code },
      { label: "Tracking ID", value: () => user.value.tracking_id },
      {
        label: "Account Numbers",
        value: () => user.value.account_numbers?.join(", "),
      },
      {
        label: "Account Types",
        value: () => user.value.account_types?.join(", "),
      },
      {
        label: "Total Accounts",
        value: () => user.value.total_accounts?.toString(),
      },
      {
        label: "Is IB",
        value: () =>
          user.value.is_ib != null ? (user.value.is_ib ? "Yes" : "No") : null,
      },
      { label: "Created At", value: () => user.value.created_at },
      { label: "Updated At", value: () => user.value.updated_at },
    ],
  },
]);
</script>
