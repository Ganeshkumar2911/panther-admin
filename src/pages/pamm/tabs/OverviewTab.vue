<template>
  <div>
    <!-- Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-card-background border border-primary-border rounded-lg p-4"
      >
        <div class="text-sm text-secondary-text mb-1">Total Pool Value</div>
        <div class="text-xl font-bold text-primary-text font-mono">
          {{ store.activePAMM?.currency || "USD" }}
          {{ Number(store.activePAMM?.total_pamm_value || 0).toFixed(2) }}
        </div>
      </div>

      <div
        class="bg-card-background border border-primary-border rounded-lg p-4"
      >
        <div class="text-sm text-secondary-text mb-1">Total PAMM Units</div>
        <div class="text-xl font-bold text-primary-text font-mono">
          {{ Number(store.activePAMM?.total_pamm_units || 0).toFixed(6) }}
        </div>
      </div>

      <div
        class="bg-card-background border border-primary-border rounded-lg p-4"
      >
        <div class="text-sm text-secondary-text mb-1">Current Unit Value</div>
        <div class="text-xl font-bold text-primary-text font-mono">
          {{ Number(store.activePAMM?.unit_value || 1).toFixed(6) }}
        </div>
      </div>

      <div
        class="bg-card-background border border-primary-border rounded-lg p-4 flex flex-col justify-center gap-2"
      >
        <!-- <button
          v-if="hasPermission('pamm.reconcile')"
          @click="isReconcileModalOpen = true"
          class="btn-secondary w-full"
        >
          Reconcile Pool
        </button> -->
        <button
          v-if="hasPermission('pamm.manage')"
          @click="isSettlementModalOpen = true"
          class="btn-primary w-full"
        >
          Run Settlement
        </button>
      </div>
    </div>

    <!-- Participants Table -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h3 class="title-text text-primary-text">Participants</h3>
        <span class="text-xs text-secondary-text">
          Total Participants: <span class="font-medium text-primary-text">{{ store.activeParticipants?.length || 0 }}</span>
        </span>
      </div>

      <DataTable
        :columns="columns"
        :data="store.activeParticipants"
        :loading="store.detailLoading"
      >
        <template #cell-participant="{ row }">
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-medium text-primary-text">
                {{ row.user?.name || row.name || 'Participant' }}
              </span>
              <span
                v-if="row.is_master_participant"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-blue/15 text-primary-blue border border-primary-blue/30 uppercase tracking-wider"
              >
                Master
              </span>
              <span
                v-else
                class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary-border/20 text-secondary-text"
              >
                Follower
              </span>
            </div>
            <div class="text-xs text-secondary-text flex items-center gap-1 mt-0.5">
              <span>{{ row.user?.email || row.email || '—' }}</span>
              <span v-if="row.user?.id || row.id" class="text-secondary-text/60">
                • #{{ row.user?.id || row.id }}
              </span>
            </div>
          </div>
        </template>

        <template #cell-trading_account="{ row }">
          <div v-if="row.trading_account" class="flex flex-col">
            <div class="font-mono text-xs font-medium text-primary-text flex items-center gap-1">
              <span>#{{ row.trading_account.account_number || row.trading_account_id }}</span>
              <span
                v-if="row.trading_account.broker"
                class="text-[10px] text-secondary-text font-normal px-1 py-0.2 bg-primary-border/15 rounded"
              >
                {{ row.trading_account.broker }}
              </span>
            </div>
            <div class="text-xs text-secondary-text mt-0.5 flex items-center gap-1.5">
              <span>Bal:</span>
              <span class="font-mono font-medium text-primary-text">
                {{ row.trading_account.currency || store.activePAMM?.currency || 'USD' }}
                {{ Number(row.trading_account.balance ?? 0).toFixed(2) }}
              </span>
              <span v-if="row.trading_account.server" class="text-secondary-text/70">
                • {{ row.trading_account.server }}
              </span>
            </div>
          </div>
          <div v-else class="text-xs text-secondary-text italic font-mono">
            #{{ row.trading_account_id || '—' }}
          </div>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>

        <template #cell-units="{ row }">
          <div class="flex flex-col">
            <span class="font-mono font-medium text-primary-text">
              {{ Number(row.units || 0).toFixed(4) }}
            </span>
            <span
              v-if="Number(row.reserved_units || 0) > 0"
              class="text-[11px] font-mono text-secondary-text"
            >
              Reserved: {{ Number(row.reserved_units).toFixed(4) }}
            </span>
          </div>
        </template>

        <template #cell-participant_value="{ row }">
          <span class="font-mono font-medium text-primary-text">
            {{ store.activePAMM?.currency || row.trading_account?.currency || "USD" }}
            {{ Number(row.participant_value || 0).toFixed(2) }}
          </span>
        </template>

        <template #cell-ownership_percentage="{ row }">
          <span class="font-mono font-medium text-primary-text">
            {{ Number(row.ownership_percentage || 0).toFixed(2) }}%
          </span>
        </template>

        <template #cell-fee_split="{ row }">
          <div v-if="row.is_master_participant" class="text-xs text-secondary-text italic">
            Master Account
          </div>
          <div v-else-if="row.performance_fee !== null && row.performance_fee !== undefined" class="flex flex-col text-xs font-mono">
            <span class="font-medium text-primary-text">
              {{ Number(row.performance_fee).toFixed(0) }}% Perf Fee
            </span>
            <span class="text-secondary-text text-[11px] mt-0.5">
              FM: {{ Number(row.fm_share || 0).toFixed(0) }}% / Broker: {{ Number(row.broker_share || 0).toFixed(0) }}%
            </span>
          </div>
          <div v-else class="text-xs text-secondary-text">
            —
          </div>
        </template>

        <template #cell-created_at="{ row }">
          <span class="text-xs text-secondary-text whitespace-nowrap" :title="formatDate(row.created_at)">
            {{ formatDateDisplay(row.created_at) }}
          </span>
        </template>
      </DataTable>
    </div>

    <ReconcileModal
      v-if="isReconcileModalOpen"
      :pammId="pammId"
      @close="isReconcileModalOpen = false"
    />

    <RunSettlementModal
      v-if="isSettlementModalOpen"
      :pammId="pammId"
      @close="isSettlementModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { usePAMMStore } from "@/stores/pamm/pamm";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ReconcileModal from "../components/ReconcileModal.vue";
import RunSettlementModal from "../components/RunSettlementModal.vue";

const route = useRoute();
const store = usePAMMStore();
const pammId = route.params.id;
const { hasPermission } = usePermissionCheck();

const isReconcileModalOpen = ref(false);
const isSettlementModalOpen = ref(false);

const columns = [
  { key: "participant", label: "Participant" },
  { key: "trading_account", label: "Trading Account" },
  { key: "status", label: "Status" },
  { key: "units", label: "Units" },
  { key: "participant_value", label: "Value" },
  { key: "ownership_percentage", label: "Ownership" },
  { key: "fee_split", label: "Fee Split" },
  { key: "created_at", label: "Joined" },
];

const formatDateDisplay = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return val;
  }
};
</script>
