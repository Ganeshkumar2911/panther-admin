<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="title-text text-primary-text">{{ store.activePAMM?.name || 'PAMM Details' }}</h1>
        <p class="sub-text text-secondary-text">
          Master MT5: {{ store.activePAMM?.master_trading_account_id }} | 
          Status: <StatusBadge :status="store.activePAMM?.status || 'draft'" class="ml-1 inline-block" />
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          class="btn-refresh" 
          @click="fetchData(true)"
          :disabled="store.detailLoading"
          title="Refresh Data"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.detailLoading }" />
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex border-b border-primary-border mb-6 no-scrollbar overflow-x-auto">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
        :class="activeTab === tab.id ? 'text-primary-blue border-b-2 border-primary-blue' : 'text-secondary-text hover:text-primary-text'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="store.detailLoading && !store.activePAMM" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    <div v-else>
      <OverviewTab v-if="activeTab === 'overview'" />
      <WithdrawalsTab v-if="activeTab === 'withdrawals'" ref="withdrawalsTabRef" />
      <AccountingTab v-if="activeTab === 'accounting'" ref="accountingTabRef" />
      <TradesTab v-if="activeTab === 'trades'" ref="tradesTabRef" />
      <SettlementsTab v-if="activeTab === 'settlements'" ref="settlementsTabRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { RefreshCw } from 'lucide-vue-next';
import { usePAMMStore } from '@/stores/pamm/pamm';
import StatusBadge from '@/components/common/StatusBadge.vue';
import OverviewTab from './tabs/OverviewTab.vue';
import WithdrawalsTab from './tabs/WithdrawalsTab.vue';
import AccountingTab from './tabs/AccountingTab.vue';
import TradesTab from './tabs/TradesTab.vue';
import SettlementsTab from './tabs/SettlementsTab.vue';

const route = useRoute();
const store = usePAMMStore();

const activeTab = ref('overview');
const pammId = route.params.id;

const tabs = [
  { id: 'overview', label: 'Overview & Participants' },
  { id: 'withdrawals', label: 'Withdrawals' },
  { id: 'accounting', label: 'Accounting Entries' },
  { id: 'trades', label: 'Pool Trades' },
  { id: 'settlements', label: 'Settlements' },
];

const withdrawalsTabRef = ref(null);
const accountingTabRef = ref(null);
const tradesTabRef = ref(null);
const settlementsTabRef = ref(null);

const fetchData = (force = false) => {
  store.fetchPAMMDetail(pammId, force);
  
  if (activeTab.value === 'withdrawals' && withdrawalsTabRef.value) {
    withdrawalsTabRef.value.fetchData(force);
  } else if (activeTab.value === 'accounting' && accountingTabRef.value) {
    accountingTabRef.value.fetchData(force);
  } else if (activeTab.value === 'trades' && tradesTabRef.value) {
    tradesTabRef.value.fetchData(force);
  } else if (activeTab.value === 'settlements' && settlementsTabRef.value) {
    settlementsTabRef.value.fetchData(force);
  }
};

onMounted(() => {
  fetchData();
});
</script>
