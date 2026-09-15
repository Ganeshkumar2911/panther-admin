<template>
  <div class="space-y-4 pt-2 pb-12 overflow-y-auto no-scrollbar">
    <!-- ─── SKELETON SHIMMER LOADER (TABLE) ─────────────────────────────── -->
    <div
      v-if="loading"
      class="rounded-2xl border border-primary-border bg-card-background/60 overflow-hidden shadow-2xs p-4 space-y-3 animate-pulse"
    >
      <div class="h-8 bg-primary-border/30 rounded-lg w-full mb-2" />
      <div v-for="n in 4" :key="n" class="h-12 bg-primary-border/20 rounded-lg w-full" />
    </div>

    <!-- ─── ERROR STATE ──────────────────────────────────────────── -->
    <div
      v-else-if="error"
      class="p-6 rounded-2xl border border-primary-red/30 bg-primary-red/5 flex flex-col items-center justify-center text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-2xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center text-primary-red">
        <AlertCircle class="w-6 h-6" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-primary-text">Failed to Load Bank Details</h4>
        <p class="text-xs text-secondary-text mt-1 max-w-md">
          {{ error }}
        </p>
      </div>
      <button
        type="button"
        @click="fetchBankAccounts(true)"
        class="px-4 py-1.5 rounded-lg bg-primary text-btn-text-primary text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>

    <!-- ─── EMPTY STATE ──────────────────────────────────────────── -->
    <div
      v-else-if="!bankAccounts || bankAccounts.length === 0"
      class="bg-card-background/40 border border-primary-border rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[260px] space-y-3"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
      >
        <Landmark class="w-7 h-7" />
      </div>
      <div class="space-y-1">
        <h4 class="text-base font-bold text-primary-text">
          No Bank Accounts Saved
        </h4>
        <p class="text-xs text-secondary-text max-w-sm">
          This client has not added or verified any bank accounts yet.
        </p>
      </div>
    </div>

    <!-- ─── TABLE VIEW ──────────────────────────────────────────── -->
    <div
      v-else
      class="rounded-2xl border border-primary-border bg-card-background/60 overflow-hidden shadow-2xs"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-primary-border bg-background/60 text-secondary-text uppercase font-semibold text-[10px] tracking-wider whitespace-nowrap">
              <th class="py-3 px-4"># ID</th>
              <th class="py-3 px-4">Bank Name</th>
              <th class="py-3 px-4">Account Holder</th>
              <th class="py-3 px-4">Account Number</th>
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4">IFSC / Branch Code</th>
              <th class="py-3 px-4">Branch</th>
              <th class="py-3 px-4">Created Date</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center">Default</th>
              <th class="py-3 px-4 text-center">Proof</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="account in bankAccounts"
              :key="account.id"
              class="hover:bg-background/40 transition-colors whitespace-nowrap"
            >
              <!-- ID -->
              <td class="py-3.5 px-4 font-mono font-bold text-primary-text">
                #{{ account.id }}
              </td>

              <!-- Bank Name & Label -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-primary-text flex items-center gap-1.5">
                  <Landmark class="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{{ account.bank || '—' }}</span>
                </div>
                <div v-if="account.label || account.bank_code" class="text-[11px] text-secondary-text flex items-center gap-1 mt-0.5">
                  <span v-if="account.label">{{ account.label }}</span>
                  <span v-if="account.label && account.bank_code">·</span>
                  <span v-if="account.bank_code" class="font-mono text-[10px]">Code: {{ account.bank_code }}</span>
                </div>
              </td>

              <!-- Account Holder -->
              <td class="py-3.5 px-4 font-semibold text-primary-text">
                {{ account.account_name || '—' }}
              </td>

              <!-- Account Number with Copy -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-1.5 font-mono font-bold text-primary-text">
                  <span>{{ account.account_number || '—' }}</span>
                  <button
                    v-if="account.account_number"
                    type="button"
                    @click="copyText(account.account_number, 'Account Number')"
                    class="text-secondary-text hover:text-primary transition-colors cursor-pointer"
                    title="Copy Account Number"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </td>

              <!-- Account Type -->
              <td class="py-3.5 px-4 uppercase font-medium text-secondary-text">
                <span class="px-2 py-0.5 rounded-md bg-background border border-primary-border text-[11px]">
                  {{ account.account_type || '—' }}
                </span>
              </td>

              <!-- IFSC Code with Copy -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-1.5 font-mono font-bold text-primary-text uppercase">
                  <span>{{ account.bank_branch_code || '—' }}</span>
                  <button
                    v-if="account.bank_branch_code"
                    type="button"
                    @click="copyText(account.bank_branch_code, 'IFSC Code')"
                    class="text-secondary-text hover:text-primary transition-colors cursor-pointer"
                    title="Copy IFSC Code"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </td>

              <!-- Branch -->
              <td class="py-3.5 px-4 text-primary-text">
                {{ account.bank_branch || '—' }}
              </td>

              <!-- Created Date -->
              <td class="py-3.5 px-4 text-secondary-text text-[11px]">
                {{ formatTimestamp(account.created_at) }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize"
                  :class="account.is_active ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                >
                  {{ account.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Default Badge -->
              <td class="py-3.5 px-4 text-center">
                <span
                  v-if="account.is_default"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 inline-flex items-center gap-1"
                >
                  <Star class="w-2.5 h-2.5 fill-primary text-primary" />
                  <span>Default</span>
                </span>
                <span v-else class="text-secondary-text text-[11px]">—</span>
              </td>

              <!-- Proof -->
              <td class="py-3.5 px-4 text-center">
                <button
                  v-if="account.document_proof_url || account.document_proof"
                  type="button"
                  @click="previewDocument(account)"
                  class="px-2 py-1 rounded-md border border-primary-border bg-background hover:bg-card-background text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs text-xs"
                >
                  <Paperclip class="w-3 h-3" />
                  <span>Proof</span>
                </button>
                <span v-else class="text-secondary-text text-[11px]">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── DOCUMENT PROOF LIGHTBOX / MODAL ──────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="previewDocModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          @click="previewDocModal = false"
        >
          <div
            class="bg-card-background rounded-2xl border border-primary-border w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-primary-border px-5 py-3.5 bg-card-background shrink-0">
              <div class="flex items-center gap-2">
                <Paperclip class="w-4 h-4 text-primary" />
                <h3 class="text-sm font-bold text-primary-text">
                  Document Proof — {{ selectedAccountForProof?.bank || 'Bank Account' }}
                </h3>
              </div>
              <button
                type="button"
                @click="previewDocModal = false"
                class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Image Body -->
            <div class="p-5 flex items-center justify-center bg-background/50 overflow-auto flex-1 max-h-[70vh]">
              <img
                v-if="selectedAccountForProof?.document_proof_url || selectedAccountForProof?.document_proof"
                :src="selectedAccountForProof.document_proof_url || selectedAccountForProof.document_proof"
                alt="Bank Proof Attachment"
                class="max-w-full max-h-[60vh] object-contain rounded-lg border border-primary-border shadow-lg"
              />
              <p v-else class="text-xs text-secondary-text">No document image available.</p>
            </div>

            <!-- Footer -->
            <div class="border-t border-primary-border px-5 py-3 bg-card-background flex items-center justify-between shrink-0">
              <span class="text-xs text-secondary-text font-mono truncate max-w-sm">
                {{ selectedAccountForProof?.account_name }} ({{ selectedAccountForProof?.account_number }})
              </span>
              <div class="flex items-center gap-2">
                <a
                  :href="selectedAccountForProof?.document_proof_url || selectedAccountForProof?.document_proof"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 rounded-lg bg-primary text-btn-text-primary text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Full Link</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  @click="previewDocModal = false"
                  class="px-3 py-1.5 rounded-lg border border-primary-border bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  Landmark,
  AlertCircle,
  Paperclip,
  ExternalLink,
  Copy,
  Star,
  X,
} from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import moment from "moment-timezone";

const route = useRoute();
const snackbar = useSnackbarStore();

const bankAccounts = ref([]);
const rawResponse = ref(null);
const loading = ref(false);
const error = ref(null);

const previewDocModal = ref(false);
const selectedAccountForProof = ref(null);

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  try {
    const m = moment.utc(ts);
    if (!m.isValid()) return String(ts);
    const tz = moment.tz.guess();
    return m.tz(tz).format("DD MMM YYYY, hh:mm A");
  } catch {
    return String(ts);
  }
};

const copyText = (text, label = "Value") => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  snackbar.show(`${label} copied to clipboard!`, "success");
};

const previewDocument = (account) => {
  selectedAccountForProof.value = account;
  previewDocModal.value = true;
};

const fetchBankAccounts = (force = false) => {
  const userId = route.params.id;
  if (!userId) return;

  loading.value = true;
  error.value = null;

  apiRequest(urls.KEYS.GET, urls.clientDepth.bankAccounts || "/users/bank-accounts", {
    look_up_key: userId,
    isTokenRequired: true,
    onSuccess: (res) => {
      rawResponse.value = res;

      // Extract array from standard payload: res.data, res.accounts, res.data.accounts, or array
      const extracted =
        res?.data?.accounts ||
        res?.data?.bank_accounts ||
        res?.data ||
        res?.accounts ||
        res?.bank_accounts ||
        (Array.isArray(res) ? res : []);

      bankAccounts.value = Array.isArray(extracted)
        ? extracted
        : typeof extracted === "object" && extracted !== null
        ? [extracted]
        : [];

      loading.value = false;
      if (force) {
        snackbar.show("Bank details refreshed successfully!", "success");
      }
    },
    onFailure: (err) => {
      loading.value = false;
      error.value =
        err?.message || err?.error || "Failed to fetch client bank accounts.";
      if (force) {
        snackbar.show(error.value, "error");
      }
    },
  });
};

const handleRefreshEvent = (e) => {
  if (e?.detail?.tab === "bank-details") {
    fetchBankAccounts(true);
  }
};

onMounted(() => {
  fetchBankAccounts();
  window.addEventListener("refresh-client-tab-data", handleRefreshEvent);
});

onUnmounted(() => {
  window.removeEventListener("refresh-client-tab-data", handleRefreshEvent);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchBankAccounts();
    }
  }
);
</script>

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

