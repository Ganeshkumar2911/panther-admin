<template>
  <div class="relative z-10 mb-4">
    <div
      class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center sm:flex-wrap overflow-visible"
    >
      <!-- Email Search -->
      <div class="relative sm:flex-1 sm:min-w-32 lg:max-w-64">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text"
        />
        <input
          v-model="store.filters.email"
          type="text"
          placeholder="Search by email..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          @input="debounceSearch"
        />
      </div>

      <!-- Event Filter -->
      <BaseSelect
        v-model="store.filters.event"
        :options="[{ label: 'All Events', value: null }, ...store.eventOptions]"
        placeholder="Events"
        class="w-full sm:w-48"
        @update:modelValue="store.applyFilters()"
      />

      <!-- Per Page -->
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="perPageOptions"
        placeholder="Per Page"
        class="w-full sm:w-48"
        @update:modelValue="store.updatePerPage"
      />

      <!-- Reset Filters (if active) -->
      <button
        v-if="store.hasActiveFilters"
        @click="store.resetFilters()"
        class="px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
      >
        Clear
      </button>

      <Tooltip text="Refresh Logs" placement="top">
        <button
          :disabled="store.loading"
          @click="store.fetchLogsDetails(route.params.tagId)"
          class="flex items-center gap-1 px-3 py-2 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap"
          :class="{ 'opacity-50 cursor-not-allowed': store.loading }"
        >
          <RefreshCcw size="16" />
        </button>
      </Tooltip>

      <button
        @click="handleResendData(store?.logDetails?.campaign_id)"
        class="cursor-pointer flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg border border-primary-border transition-colors whitespace-nowrap"
      >
        Resend
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div
    v-if="store.isLoadingEmailLogsDetails"
    class="h-full flex items-center justify-center bg-background border border-primary-border rounded-xl px-4 py-3"
  >
    <div class="flex flex-col items-center gap-2">
      <Loader2 class="w-6 h-6 animate-spin text-primary" />
      <span class="text-xs text-secondary-text">Loading Details...</span>
    </div>
  </div>

  <div v-else class="space-y-4 h-[75vh]">
    <div
      v-if="store.logDetails"
      class="grid grid-cols-[2fr_3fr] gap-4 h-full min-h-0"
    >
      <div class="">
        <RenderHTMLBody :htmlContent="store.logDetails?.body_html || ''" />
      </div>

      <div
        class="w-full border border-primary-border rounded-xl overflow-x-auto"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border">
              <th
                class="p-3 text-xs font-semibold text-primary-text text-start"
              >
                Date
              </th>
              <th
                class="p-3 text-xs font-semibold text-primary-text text-start"
              >
                Email
              </th>
              <th
                class="p-3 text-xs font-semibold text-primary-text text-start"
              >
                Subject
              </th>
              <!-- <th
                class="p-3 text-xs font-semibold text-primary-text text-start"
              >
                Message Id
              </th> -->
              <th
                class="p-3 text-xs font-semibold text-primary-text text-start"
              >
                Sync Status
              </th>
              <th
                class="p-3 text-xs font-semibold text-primary-text text-start"
              >
                Action
              </th>
            </tr>
          </thead>

          <!-- Skeleton Loading -->
          <tbody v-if="store.isLoadingEmailLogsDetails">
            <tr
              v-for="n in 5"
              :key="n"
              class="border-b border-primary-border animate-pulse"
            >
              <td class="p-3">
                <div class="h-3 w-24 bg-card-background rounded" />
              </td>
              <td class="p-3">
                <div class="h-3 w-16 bg-card-background rounded" />
              </td>
              <td class="p-3">
                <div class="h-3 w-40 bg-card-background rounded" />
              </td>
              <td class="p-3">
                <div class="h-3 w-32 bg-card-background rounded" />
              </td>
              <td class="p-3">
                <div class="h-3 w-36 bg-card-background rounded" />
              </td>
              <td class="p-3">
                <div class="h-3 w-20 bg-card-background rounded" />
              </td>
              <!-- <td class="p-3">
              <div class="h-3 w-32 bg-card-background rounded" />
            </td> -->
            </tr>
          </tbody>

          <!-- Empty State -->
          <tbody v-else-if="store.logDetails.records.length === 0">
            <tr>
              <td colspan="7" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center"
                  >
                    <Mail class="w-5 h-5 text-secondary-text" />
                  </div>
                  <p class="text-sm font-medium text-primary-text">
                    No email logs found
                  </p>
                  <p class="text-xs text-secondary-text">
                    {{
                      store.hasActiveFilters
                        ? "Try adjusting your filters"
                        : "Email logs will appear here"
                    }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Data Rows -->
          <tbody v-else>
            <tr
              v-for="log in store.logDetails.records"
              :key="log.messageId"
              class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
            >
              <td
                class="p-3 text-xs font-medium text-primary-text whitespace-nowrap"
              >
                {{ formatDate(log.created_at) }}sdsd
              </td>
              <!-- <td class="p-3 text-xs">
                <span
                  class="px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize"
                  :class="eventClass(log.event)"
                >
                  {{ log.event }}
                </span>
              </td> -->
              <td
                class="p-3 text-xs text-primary-text max-w-[250px] truncate"
                :title="log.subject"
              >
                {{ log.email }}
              </td>
              <td
                class="p-3 text-xs text-primary-text max-w-[250px] truncate"
                :title="log.subject"
              >
                {{ log.subject }}
              </td>
              <!-- <td
                class="p-3 text-xs text-secondary-text max-w-[200px] truncate"
                :title="log.from"
              >
                {{ log.message_id }}
              </td> -->
              <td
                class="p-3 text-xs text-secondary-text max-w-[200px] truncate"
                :title="log.email"
              >
                {{ log.sync_status }}
              </td>
              <td class="p-3 text-xs text-secondary-text">
                <button
                  @click="handleOpenDialog(log.message_id)"
                  class="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors"
                >
                  <Eye size="16" class="text-secondary-text" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <Pagination/> -->
      </div>
    </div>
    <div v-else class="text-xs text-secondary-text text-center py-4">
      No details found.
    </div>
  </div>

  <ViewEmailLogDetails
    :open="openDialog"
    :id="selectedLogsId"
    @close="openDialog = false"
  />

  <ResendEmailPannel
    :open="resendData.open"
    :campegin_id="resendData.campegin_id"
    @close="handleClose"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {
  X,
  Loader2,
  UserPlus,
  RefreshCcw,
  Search,
  Mail,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import RenderHTMLBody from "@/components/emails/RenderHTMLBody.vue";
import {
  Send,
  PackageCheck,
  MailOpen,
  MousePointerClick,
  ShieldAlert,
  CircleAlert,
  AlertTriangle,
  Ban,
  MailWarning,
  MailX,
  Clock3,
  UserX,
  ShieldX,
  Eye,
} from "lucide-vue-next";

import { formatDate } from "@/utils/timeFormatter";
import { useRoute } from "vue-router";
import ViewEmailLogDetails from "@/pages/e-mails/ViewEmailLogDetails.vue";
import ResendEmailPannel from "@/components/emails/ResendEmailPannel.vue";

const eventConfig = {
  sent: {
    label: "Sent",
    icon: Send,
    bg: "bg-gray-100",
    iconColor: "text-gray-700",
  },

  delivered: {
    label: "Delivered",
    icon: PackageCheck,
    bg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },

  open: {
    label: "Opened",
    icon: MailOpen,
    bg: "bg-green-100",
    iconColor: "text-green-600",
  },

  clicks: {
    label: "Clicks",
    icon: MousePointerClick,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },

  spam: {
    label: "Spam",
    icon: ShieldAlert,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },

  requests: {
    label: "Requests",
    icon: CircleAlert,
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
  },

  failed: {
    label: "Failed",
    icon: AlertTriangle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },

  soft_bounced: {
    label: "Soft Bounced",
    icon: MailWarning,
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
  },

  bounced: {
    label: "Bounced",
    icon: MailX,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },

  hard_bounced: {
    label: "Hard Bounced",
    icon: Ban,
    bg: "bg-red-200",
    iconColor: "text-red-700",
  },

  loaded_by_proxy: {
    label: "Loaded By Proxy",
    icon: Eye,
    bg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },

  error: {
    label: "Error",
    icon: AlertTriangle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },

  unsubscribed: {
    label: "Unsubscribed",
    icon: UserX,
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
  },

  blocked: {
    label: "Blocked",
    icon: ShieldX,
    bg: "bg-slate-200",
    iconColor: "text-slate-700",
  },

  deferred: {
    label: "Deferred",
    icon: Clock3,
    bg: "bg-amber-100",
    iconColor: "text-amber-600",
  },

  invalid_email: {
    label: "Invalid Email",
    icon: MailX,
    bg: "bg-pink-100",
    iconColor: "text-pink-600",
  },

  complaint: {
    label: "Complaint",
    icon: ShieldAlert,
    bg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
};

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const route = useRoute();
const store = useEmailLogsStore();
const isSubmitting = ref(false);
const openDialog = ref(false);
const selectedLogsId = ref(null);
let searchTimeout;

const resendData = reactive({
  open: false,
  campegin_id: null,
});

const handleOpenDialog = (id) => {
  openDialog.value = true;
  selectedLogsId.value = id;
};
const handleResendData = (id) => {
  resendData.open = true;
  resendData.campegin_id = id;
};

const handleClose = () => {
  ((resendData.campegin_id = null), (resendData.open = false));
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.applyFilters();
  }, 500);
};

watch(store, () => {
  console.log("isLoadingEmailLogsDetails:", store.isLoadingEmailLogsDetails);
});

// watch(
//   () => [route.params.tagId],
//   async ([newId]) => {
//     if (newId) {
//       await store.fetchLogsDetails(newId);
//       await store.fetchTags();
//     }
//   },
//   { immediate: true },
// );

watch(
  () => [route.params.tagId],
  async ([newId]) => {
    if (newId) {
      store.setActiveFetcher(() => store.fetchLogsDetails(newId));
      await store.fetchLogsDetails(newId);
      // await store.fetchTags();
    }
  },
  { immediate: true },
);
</script>
