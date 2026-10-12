<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="title-text text-primary-text">Accounting Entries</h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Audit ledger of deposits, withdrawals, master contributions, and pool valuations
        </p>
      </div>
      <button
        class="btn-refresh"
        @click="fetchData(true)"
        :disabled="store.loading"
        title="Refresh Accounting Entries"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
      </button>
    </div>
    
    <DataTable
      :columns="columns"
      :data="store.accountingEntries"
      :loading="store.loading"
    >
      <template #cell-entry_type="{ row }">
        <div class="flex flex-col items-start min-w-[175px]">
          <span
            class="text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize whitespace-nowrap"
            :class="getEntryTypeConfig(row.entry_type).class"
          >
            {{ getEntryTypeConfig(row.entry_type).label }}
          </span>
          <span
            v-if="row.capital_operation_id"
            class="text-[11px] font-mono text-secondary-text mt-0.5"
          >
            Op #{{ row.capital_operation_id }}
          </span>
        </div>
      </template>

      <template #cell-participant_id="{ row }">
        <div v-if="row.participant_id" class="font-medium text-primary-text text-xs whitespace-nowrap">
          Participant #{{ row.participant_id }}
        </div>
        <div v-else class="text-xs text-secondary-text italic whitespace-nowrap">
          Pool / Valuation
        </div>
      </template>
      
      <template #cell-amount="{ row }">
        <span class="font-mono font-medium text-primary-text whitespace-nowrap">
          {{ store.activePAMM?.currency || 'USD' }} {{ Number(row.amount || 0).toFixed(2) }}
        </span>
      </template>

      <template #cell-unit_value="{ row }">
        <span class="font-mono text-primary-text whitespace-nowrap">
          {{ Number(row.unit_value || 1).toFixed(4) }}
        </span>
      </template>

      <template #cell-units_delta="{ row }">
        <span
          v-if="row.units_delta !== null && row.units_delta !== undefined"
          class="font-mono font-medium whitespace-nowrap"
          :class="{
            'text-primary-green': Number(row.units_delta) > 0,
            'text-primary-red': Number(row.units_delta) < 0,
            'text-secondary-text': Number(row.units_delta) === 0,
          }"
        >
          {{ Number(row.units_delta) > 0 ? '+' : '' }}{{ Number(row.units_delta).toFixed(4) }}
        </span>
        <span v-else class="text-secondary-text">—</span>
      </template>

      <template #cell-units_flow="{ row }">
        <div
          v-if="row.units_before !== null && row.units_after !== null && row.units_before !== undefined && row.units_after !== undefined"
          class="font-mono text-xs text-secondary-text whitespace-nowrap"
        >
          <span>{{ Number(row.units_before).toFixed(4) }}</span>
          <span class="mx-1 text-secondary-text/60">→</span>
          <span class="font-medium text-primary-text">{{ Number(row.units_after).toFixed(4) }}</span>
        </div>
        <span v-else class="text-secondary-text">—</span>
      </template>

      <template #cell-description="{ row }">
        <div
          class="text-xs text-secondary-text max-w-sm truncate"
          :title="row.description"
        >
          {{ row.description || '—' }}
        </div>
      </template>
      
      <template #cell-created_at="{ row }">
        <span class="text-xs text-secondary-text whitespace-nowrap" :title="formatDate(row.created_at)">
          {{ formatDateDisplay(row.created_at) }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { RefreshCw } from 'lucide-vue-next';
import { usePAMMStore } from '@/stores/pamm/pamm';
import { formatDate } from '@/utils/timeFormatter';
import DataTable from '@/components/common/DataTable/DataTable.vue';

const route = useRoute();
const store = usePAMMStore();
const pammId = route.params.id;

const columns = [
  { key: 'entry_type', label: 'Entry Type', width: 210, minWidth: 185 },
  { key: 'participant_id', label: 'Participant', width: 140, minWidth: 120 },
  { key: 'amount', label: 'Amount', width: 130, minWidth: 110 },
  { key: 'unit_value', label: 'Unit Value', width: 110, minWidth: 100 },
  { key: 'units_delta', label: 'Units Delta', width: 130, minWidth: 110 },
  { key: 'units_flow', label: 'Units (Before → After)', width: 190, minWidth: 170 },
  { key: 'description', label: 'Description', minWidth: 260 },
  { key: 'created_at', label: 'Date', width: 160, minWidth: 140 },
];

const getEntryTypeConfig = (type) => {
  switch (type?.toUpperCase()) {
    case 'DEPOSIT':
      return {
        label: 'Deposit',
        class: 'text-primary-green border-primary-green/30 bg-primary-green/10',
      };
    case 'MASTER_CONTRIBUTION':
      return {
        label: 'Master Contribution',
        class: 'text-primary-blue border-primary-blue/30 bg-primary-blue/10',
      };
    case 'WITHDRAWAL':
      return {
        label: 'Withdrawal',
        class: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      };
    case 'UNFOLLOW':
      return {
        label: 'Unfollow Exit',
        class: 'text-primary-red border-primary-red/30 bg-primary-red/10',
      };
    case 'VALUATION':
      return {
        label: 'Valuation',
        class: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
      };
    default:
      return {
        label: type ? String(type).replace(/_/g, ' ') : 'Entry',
        class: 'text-secondary-text border-primary-border bg-primary-border/10',
      };
  }
};

const formatDateDisplay = (val) => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return val;
  }
};

const fetchData = (force = false) => {
  store.fetchAccountingEntries(pammId, force);
};

defineExpose({ fetchData });

onMounted(() => {
  fetchData();
});
</script>
