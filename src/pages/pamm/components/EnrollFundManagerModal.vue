<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-card-background rounded-xl shadow-xl w-full max-w-lg border border-primary-border overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-primary-border flex justify-between items-center">
        <div>
          <h3 class="title-text text-primary-text font-semibold">Enroll Fund Manager into PAMM</h3>
          <p class="text-xs text-secondary-text mt-0.5">
            Provision a new PAMM pool for an existing Fund Manager
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text p-1 rounded-lg transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Search FM -->
        <div>
          <label class="block text-xs font-semibold text-secondary-text mb-1">
            Search Fund Manager
          </label>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-3 py-2 text-sm rounded-lg border border-primary-border bg-background text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary"
            placeholder="Search by name, email, or MT5 login..."
          />
        </div>

        <!-- FM Selector -->
        <div>
          <label class="block text-xs font-semibold text-secondary-text mb-1">
            Select Fund Manager <span class="text-primary-red">*</span>
          </label>
          <div v-if="loadingFms" class="flex items-center gap-2 py-3 text-xs text-secondary-text">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading fund managers...</span>
          </div>
          <div v-else-if="filteredFms.length === 0" class="py-3 text-xs text-secondary-text">
            No fund managers found matching your query.
          </div>
          <div v-else class="max-h-48 overflow-y-auto border border-primary-border rounded-lg divide-y divide-primary-border/60 bg-background/50">
            <div
              v-for="fm in filteredFms"
              :key="fm.id"
              @click="selectedFm = fm"
              class="p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs"
              :class="selectedFm?.id === fm.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-card-background'"
            >
              <div>
                <div class="font-semibold text-primary-text">
                  {{ fm.label_name || fm.user?.name || `FM #${fm.id}` }}
                </div>
                <div class="text-[11px] text-secondary-text">
                  {{ fm.user?.email || 'No email' }} · MT5: <span class="font-mono">{{ fm.master_account?.account_number || `#${fm.master_account_id}` }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span
                  v-if="fm.allow_pamm"
                  class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border bg-primary-green/10 text-primary-green border-primary-green/20"
                >
                  PAMM Ready
                </span>
                <span
                  v-else
                  class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-500 border-amber-500/20"
                >
                  PAMM Off
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected FM Details & Capability Gate -->
        <div v-if="selectedFm" class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3">
          <div class="text-xs font-semibold text-primary-text border-b border-primary-border/60 pb-2">
            Selected Fund Manager Summary
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-secondary-text text-[11px] block">FM Name / Label</span>
              <span class="font-bold text-primary-text">{{ selectedFm.label_name || selectedFm.user?.name }}</span>
            </div>
            <div>
              <span class="text-secondary-text text-[11px] block">Leaderboard ID</span>
              <span class="font-mono font-bold text-primary">#{{ selectedFm.id }}</span>
            </div>
            <div>
              <span class="text-secondary-text text-[11px] block">Email</span>
              <span class="text-primary-text truncate block">{{ selectedFm.user?.email }}</span>
            </div>
            <div>
              <span class="text-secondary-text text-[11px] block">Master MT5 Account</span>
              <span class="font-mono font-bold text-primary-text">
                {{ selectedFm.master_account?.account_number || `#${selectedFm.master_account_id}` }}
              </span>
            </div>
          </div>

          <!-- allow_pamm Gate Status Banner -->
          <div
            v-if="selectedFm.allow_pamm"
            class="flex items-start gap-2 p-2.5 rounded-lg border bg-primary-green/10 text-primary-green border-primary-green/20 text-xs"
          >
            <span class="text-base leading-none">✓</span>
            <div>
              <div class="font-semibold">PAMM Capability Enabled</div>
              <div class="text-[11px] opacity-90 mt-0.5">
                The FM profile has <code>allow_pamm: true</code>. Once enrolled, the FM can immediately activate this pool from their portal.
              </div>
            </div>
          </div>
          <div
            v-else
            class="flex items-start gap-2 p-2.5 rounded-lg border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs"
          >
            <span class="text-base leading-none">⚠️</span>
            <div>
              <div class="font-semibold">PAMM Capability Disabled (allow_pamm: false)</div>
              <div class="text-[11px] opacity-90 mt-0.5">
                Enrollment will provision the pool in <code>draft</code> status, but the FM will be unable to activate it (returning HTTP 403) until PAMM is enabled in their Fund Manager profile.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex justify-end gap-2 bg-background/50">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-medium text-secondary-text hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="submitEnrollment"
          class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          :disabled="store.actionLoading || !selectedFm"
        >
          <span v-if="store.actionLoading" class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
          <span>{{ store.actionLoading ? 'Enrolling...' : 'Enroll into PAMM' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePAMMStore } from '@/stores/pamm/pamm';
import apiRequest from '@/api/request';
import urls from '@/api/urls';
import { useSnackbarStore } from '@/stores/snackbar/snackbar';

const emit = defineEmits(['close', 'enrolled']);
const store = usePAMMStore();
const snackbar = useSnackbarStore();

const fms = ref([]);
const loadingFms = ref(false);
const searchQuery = ref('');
const selectedFm = ref(null);

const fetchFundManagers = () => {
  loadingFms.value = true;
  apiRequest(urls.KEYS.GET, urls.fm.list, {
    params: { per_page: 100 },
    isTokenRequired: true,
    onSuccess: (res) => {
      fms.value = Array.isArray(res?.data) ? res.data : [];
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to fetch fund managers', 'error');
    },
    onFinally: () => {
      loadingFms.value = false;
    },
  });
};

onMounted(() => {
  fetchFundManagers();
});

const filteredFms = computed(() => {
  if (!searchQuery.value.trim()) return fms.value;
  const q = searchQuery.value.trim().toLowerCase();
  return fms.value.filter((fm) => {
    const nameMatch = fm.label_name?.toLowerCase().includes(q) || fm.user?.name?.toLowerCase().includes(q);
    const emailMatch = fm.user?.email?.toLowerCase().includes(q);
    const idMatch = String(fm.id).includes(q);
    const accountMatch = String(fm.master_account_id).includes(q) || fm.master_account?.account_number?.toLowerCase().includes(q);
    return nameMatch || emailMatch || idMatch || accountMatch;
  });
});

const submitEnrollment = async () => {
  if (!selectedFm.value) return;
  try {
    await store.enrollFundManager(selectedFm.value.id);
    emit('enrolled');
    emit('close');
  } catch (err) {
    // Error notification handled by store
  }
};
</script>
