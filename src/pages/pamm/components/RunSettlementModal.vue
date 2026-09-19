<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-card-background rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 class="title-text text-primary-text mb-2">Run Settlement</h3>
      <p class="sub-text text-secondary-text mb-4">
        Are you sure you want to run settlement for this PAMM pool? This will checkpoint the current valuation and process participant allocations.
      </p>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-secondary-text mb-1">Settlement Key (Optional)</label>
        <input 
          v-model="settlementKey"
          type="text"
          class="input-field w-full px-3 py-2 text-sm rounded border border-primary-border"
          placeholder="e.g. 20260919120000"
        />
        <p class="text-xs text-secondary-text mt-1">Leave empty to auto-generate based on timestamp.</p>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-sm text-secondary-text hover:bg-gray-100 rounded transition-colors"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button 
          @click="submit"
          class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          :disabled="store.actionLoading"
        >
          {{ store.actionLoading ? 'Running...' : 'Run Settlement' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePAMMStore } from '@/stores/pamm/pamm';

const props = defineProps({
  pammId: {
    type: [Number, String],
    required: true,
  }
});

const emit = defineEmits(['close']);
const store = usePAMMStore();

const settlementKey = ref('');

const submit = async () => {
  await store.runSettlement(props.pammId, settlementKey.value.trim() || null);
  emit('close');
};
</script>
