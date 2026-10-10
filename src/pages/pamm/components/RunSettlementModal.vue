<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card-background rounded-xl shadow-xl w-full max-w-md border border-primary-border overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex justify-between items-center">
        <h3 class="title-text text-primary-text font-semibold">Run Settlement</h3>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text p-1 rounded-lg transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>
      
      <!-- Body -->
      <div class="p-6">
        <p class="sub-text text-secondary-text mb-4">
        Create a valuation checkpoint for this PAMM. Does not move funds or change units.
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

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex justify-end gap-2 bg-background/50">
        <button 
          @click="cancel"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button 
          @click="submit"
          class="btn-primary"
          :disabled="store.actionLoading"
        >
          <span v-if="store.actionLoading" class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
          <span>{{ store.actionLoading ? 'Running...' : 'Run Settlement' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePAMMSettlementStore } from '@/stores/pamm/pammSettlement';

const props = defineProps({
  pammId: {
    type: [Number, String],
    required: true,
  }
});

const emit = defineEmits(['close']);
const store = usePAMMSettlementStore();

const settlementKey = ref('');

const cancel = () => {
  if (store.actionLoading) {
    store.cancelRunSettlement();
  }
  emit('close');
};

const submit = async () => {
  await store.runSettlement(props.pammId, settlementKey.value.trim() || null);
  emit('close');
};
</script>
