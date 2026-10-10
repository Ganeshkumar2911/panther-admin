<script setup>
import { ref, computed } from "vue";
import {
  Cloud,
  Copy,
  Check,
  X,
  Code,
  Globe,
  Terminal,
  FileJson,
  ExternalLink,
} from "lucide-vue-next";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  reportType: {
    type: String,
    default: "daily_performance",
  },
  endpointUrl: {
    type: String,
    default: "/ib-commission/reports/performance",
  },
  queryParams: {
    type: Object,
    default: () => ({}),
  },
  responsePayload: {
    type: [Object, Array, null],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);
const snackbar = useSnackbarStore();

const activeTab = ref("curl"); // 'curl' | 'json' | 'params'
const isCopied = ref(false);

const fullUrl = computed(() => {
  const base = "https://admin.panthercapitals.com/admin" + (props.endpointUrl.startsWith("/") ? props.endpointUrl : `/${props.endpointUrl}`);
  const cleanParams = Object.entries(props.queryParams || {}).filter(
    ([_, v]) => v !== "" && v !== null && v !== undefined
  );
  if (cleanParams.length === 0) return base;
  const qs = cleanParams
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${base}?${qs}`;
});

const curlCommand = computed(() => {
  return `curl -X GET "${fullUrl.value}" \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
  -H "Accept: application/json"`;
});

const formattedJson = computed(() => {
  try {
    return JSON.stringify(props.responsePayload || {}, null, 2);
  } catch (e) {
    return String(props.responsePayload);
  }
});

const copyToClipboard = (text, label = "Content") => {
  navigator.clipboard.writeText(text);
  isCopied.value = true;
  snackbar.show(`${label} copied to clipboard`, "success");
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full max-w-2xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[620px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-3.5 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-2xs"
              >
                <Cloud :size="18" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-primary-text flex items-center gap-2">
                  <span>API Request Inspector</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-green/10 text-primary-green border border-primary-green/20"
                  >
                    GET 200 OK
                  </span>
                </h3>
                <p class="text-xs text-secondary-text font-mono truncate max-w-sm sm:max-w-md">
                  {{ endpointUrl }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="btn-icon"
              @click="emit('update:modelValue', false)"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Tabs -->
          <div
            class="flex items-center justify-between px-5 py-2 bg-background border-b border-primary-border"
          >
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="
                  activeTab === 'curl'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
                "
                @click="activeTab = 'curl'"
              >
                <Terminal :size="13" />
                <span>cURL Command</span>
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="
                  activeTab === 'json'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
                "
                @click="activeTab = 'json'"
              >
                <FileJson :size="13" />
                <span>Response JSON</span>
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="
                  activeTab === 'params'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
                "
                @click="activeTab = 'params'"
              >
                <Globe :size="13" />
                <span>Query Parameters</span>
              </button>
            </div>

            <button
              type="button"
              class="btn-secondary py-1 text-xs gap-1"
              @click="
                copyToClipboard(
                  activeTab === 'curl'
                    ? curlCommand
                    : activeTab === 'json'
                    ? formattedJson
                    : JSON.stringify(queryParams, null, 2),
                  activeTab.toUpperCase()
                )
              "
            >
              <Check v-if="isCopied" :size="12" class="text-primary-green" />
              <Copy v-else :size="12" />
              <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>

          <!-- Content Body -->
          <div class="flex-1 overflow-y-auto p-5 bg-background/50">
            <!-- cURL Tab -->
            <div v-if="activeTab === 'curl'" class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-secondary-text uppercase tracking-wider block mb-1.5">
                  HTTP Request Endpoint
                </label>
                <div class="bg-card-background border border-primary-border rounded-xl p-3 text-xs font-mono break-all text-primary-text flex items-center justify-between gap-2">
                  <span>{{ fullUrl }}</span>
                </div>
              </div>

              <div>
                <label class="text-xs font-semibold text-secondary-text uppercase tracking-wider block mb-1.5">
                  cURL Shell Command
                </label>
                <div class="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                  <pre>{{ curlCommand }}</pre>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-secondary-text space-y-1">
                <p class="font-semibold text-primary-text">Authentication & Permissions:</p>
                <p>• Requires <code class="font-mono text-primary font-semibold">ib_commission_reports.view</code> or <code class="font-mono text-primary font-semibold">ib_commission.view</code> admin permission.</p>
                <p>• Responses are wrapped inside standardized envelope <code class="font-mono text-primary font-semibold">{ "status": "success", "data": { ... } }</code>.</p>
              </div>
            </div>

            <!-- Response JSON Tab -->
            <div v-else-if="activeTab === 'json'" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-secondary-text uppercase tracking-wider">
                  Live Response Data Payload
                </label>
                <span class="text-[11px] font-mono text-secondary-text">
                  {{ Array.isArray(props.responsePayload?.items) ? `${props.responsePayload.items.length} items` : '' }}
                </span>
              </div>
              <div class="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-[420px] leading-relaxed border border-slate-800 shadow-inner">
                <pre>{{ formattedJson }}</pre>
              </div>
            </div>

            <!-- Query Parameters Tab -->
            <div v-else class="space-y-3">
              <label class="text-xs font-semibold text-secondary-text uppercase tracking-wider block">
                Active Filter Parameters
              </label>

              <div class="bg-card-background border border-primary-border rounded-xl overflow-hidden shadow-2xs">
                <table class="w-full text-left text-xs">
                  <thead class="bg-background border-b border-primary-border text-[11px] font-semibold text-secondary-text uppercase">
                    <tr>
                      <th class="px-4 py-2.5">Parameter</th>
                      <th class="px-4 py-2.5">Value</th>
                      <th class="px-4 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-primary-border/60">
                    <tr
                      v-for="(val, key) in queryParams"
                      :key="key"
                      class="hover:bg-background/60 transition-colors"
                    >
                      <td class="px-4 py-2.5 font-mono font-semibold text-primary">
                        {{ key }}
                      </td>
                      <td class="px-4 py-2.5 font-mono text-primary-text">
                        {{ val !== null && val !== "" ? val : "<empty/default>" }}
                      </td>
                      <td class="px-4 py-2.5 text-secondary-text text-[11px]">
                        {{
                          key === 'frequency' ? 'Period frequency (daily, weekly, monthly)' :
                          key === 'period_key' ? 'Selected settlement cycle key' :
                          key === 'date_from' ? 'Start date filter (YYYY-MM-DD)' :
                          key === 'date_to' ? 'End date filter (YYYY-MM-DD)' :
                          key === 'status' ? 'Commission status filter (all, pending, approved, rejected)' :
                          key === 'wallet_target' ? 'Wallet ledger target (main, demo)' :
                          key === 'ib_id' ? 'Network root partner ID' :
                          key === 'parent_ib_id' ? 'Parent IB filter for sub-affiliates' :
                          key === 'page' ? 'Pagination page number' :
                          key === 'per_page' ? 'Items per page (max 200)' : 'Query parameter'
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
