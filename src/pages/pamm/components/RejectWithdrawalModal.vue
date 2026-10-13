<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card-background rounded-xl shadow-xl w-full max-w-md border border-primary-border overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex justify-between items-center">
        <h3 class="title-text text-primary-text font-semibold">Reject Withdrawal</h3>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text p-1 rounded-lg transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>
      
      <!-- Body -->
      <div class="p-6">
        <div class="mb-4">
        <label class="block text-sm font-medium text-secondary-text mb-1">Reason for Rejection</label>
        <textarea 
          v-model="rejectReason"
          class="input-field w-full px-3 py-2 text-sm rounded border border-primary-border"
          rows="3"
          placeholder="Enter reason..."
        ></textarea>
      </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex justify-end gap-2 bg-background/50">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-medium text-secondary-text hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button 
          @click="submit"
          class="bg-primary-red hover:opacity-90 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          :disabled="store.actionLoading || !rejectReason.trim()"
        >
          <span v-if="store.actionLoading" class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
          <span>{{ store.actionLoading ? 'Rejecting...' : 'Reject Withdrawal' }}</span>
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
