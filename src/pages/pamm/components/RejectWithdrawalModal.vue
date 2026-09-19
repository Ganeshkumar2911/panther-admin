<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-card-background rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 class="title-text text-primary-text mb-4">Reject Withdrawal</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-secondary-text mb-1">Reason for Rejection</label>
        <textarea 
          v-model="rejectReason"
          class="input-field w-full px-3 py-2 text-sm rounded border border-primary-border"
          rows="3"
          placeholder="Enter reason..."
        ></textarea>
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
          class="bg-primary-red hover:opacity-90 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          :disabled="store.actionLoading || !rejectReason.trim()"
        >
          {{ store.actionLoading ? 'Rejecting...' : 'Reject Withdrawal' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePAMMStore } from '@/stores/pamm/pamm';

const props = defineProps({
  operationId: {
    type: [Number, String],
    required: true,
  },
  pammId: {
    type: [Number, String],
    required: true,
  }
});

const emit = defineEmits(['close']);
const store = usePAMMStore();

const rejectReason = ref('');

const submit = async () => {
  if (!rejectReason.value.trim()) return;
  await store.rejectWithdrawal(props.operationId, props.pammId, rejectReason.value.trim());
  emit('close');
};
</script>
