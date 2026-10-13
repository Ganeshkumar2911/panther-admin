<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card-background rounded-xl shadow-xl w-full max-w-lg border border-primary-border flex flex-col overflow-hidden max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex justify-between items-center shrink-0">
        <h3 class="title-text text-primary-text font-semibold">Run All Settlements</h3>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text p-1 rounded-lg transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>
      
      <!-- Body -->
      <div v-if="!resultSummary" class="flex-1 overflow-y-auto p-6">
        <p class="sub-text text-secondary-text mb-4">
          Run checkpoint for every <span class="font-bold text-primary-text">active</span> PAMM. Continues on errors.
        </p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-secondary-text mb-1">Settlement Key Prefix (Optional)</label>
          <input 
            v-model="prefix"
            type="text"
            class="input-field w-full px-3 py-2 text-sm rounded border border-primary-border"
            placeholder="e.g. daily-run"
          />
          <p class="text-xs text-secondary-text mt-1">If provided, keys will be generated as <code>{prefix}-{pamm_id}-{utc}</code>.</p>
        </div>
      </div>

      <!-- Result Summary -->
      <div v-else class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="bg-card-background border border-primary-border rounded p-3 text-sm">
          <div><span class="text-secondary-text">Active PAMMs Processed:</span> <span class="font-medium text-primary-text">{{ resultSummary.active_pamm_count || 0 }}</span></div>
          <div><span class="text-secondary-text">Successful:</span> <span class="font-medium text-primary-green">{{ (resultSummary.ran || []).length }}</span></div>
          <div><span class="text-secondary-text">Failed:</span> <span class="font-medium text-primary-red">{{ (resultSummary.failed || []).length }}</span></div>
        </div>

        <div v-if="resultSummary.ran && resultSummary.ran.length > 0">
          <h4 class="font-medium text-primary-text mb-2 text-sm">Successful Runs</h4>
          <div class="border border-primary-border rounded overflow-hidden max-h-40 overflow-y-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-background/50 border-b border-primary-border text-secondary-text">
                <tr>
                  <th class="px-3 py-2 font-medium">PAMM ID</th>
                  <th class="px-3 py-2 font-medium">Status</th>
                  <th class="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in resultSummary.ran" :key="item.pamm_id" class="border-b border-primary-border last:border-0 hover:bg-background/30">
                  <td class="px-3 py-2 font-mono">#{{ item.pamm_id }}</td>
                  <td class="px-3 py-2"><StatusBadge :status="item.status" /></td>
                  <td class="px-3 py-2">
                    <router-link :to="`/pamm/${item.pamm_id}`" class="text-xs text-primary hover:underline">View PAMM</router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="resultSummary.failed && resultSummary.failed.length > 0">
          <h4 class="font-medium text-primary-text mb-2 text-sm text-primary-red">Failures</h4>
          <div class="border border-primary-border rounded overflow-hidden max-h-40 overflow-y-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-background/50 border-b border-primary-border text-secondary-text">
                <tr>
                  <th class="px-3 py-2 font-medium">PAMM ID</th>
                  <th class="px-3 py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in resultSummary.failed" :key="item.pamm_id" class="border-b border-primary-border last:border-0 hover:bg-background/30">
                  <td class="px-3 py-2 font-mono">#{{ item.pamm_id }}</td>
                  <td class="px-3 py-2 text-xs text-primary-red select-all">{{ item.error }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex justify-end gap-2 bg-background/50 shrink-0">
        <button 
          v-if="!resultSummary"
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-medium text-secondary-text hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button 
          v-if="!resultSummary"
          @click="submit"
          class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          :disabled="store.actionLoading"
        >
          <span v-if="store.actionLoading" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            Running...
          </span>
          <span v-else>Run All</span>
        </button>
        <button 
          v-if="resultSummary"
          @click="$emit('close')"
          class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePAMMSettlementStore } from '@/stores/pamm/pammSettlement';
import StatusBadge from '@/components/common/StatusBadge.vue';

const emit = defineEmits(['close']);
const store = usePAMMSettlementStore();

const prefix = ref('');
const resultSummary = ref(null);

const submit = async () => {
  try {
    const res = await store.runAllSettlements(prefix.value.trim() || null);
    if (res && res.data) {
      resultSummary.value = res.data;
    } else {
      emit('close'); // fallback if no data summary provided
    }
  } catch (err) {
    // If global run fails completely
    console.error(err);
  }
};
</script>
