<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-card-background border border-primary-border rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
      <div class="flex justify-between items-center p-5 border-b border-primary-border">
        <h3 class="text-lg font-semibold text-primary-text">Edit Program Settings</h3>
        <button @click="$emit('close')" class="text-secondary-text hover:text-primary-text cursor-pointer">
          <HugeIcon :icon="Cancel01Icon" :size="20" />
        </button>
      </div>

      <div class="p-5 overflow-y-auto space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Status</label>
          <BaseSelect
            v-model="formData.status"
            :options="[
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
              { label: 'Ended', value: 'ended' }
            ]"
            placeholder="Select Status"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Name</label>
          <input v-model="formData.name" type="text" class="input-field px-3 py-2 text-sm w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Description</label>
          <textarea v-model="formData.description" rows="3" class="input-field px-3 py-2 text-sm w-full"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Min Redemption Amount</label>
          <input v-model="formData.min_redemption_amount" type="number" step="0.01" class="input-field px-3 py-2 text-sm w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Terms Version</label>
          <input v-model="formData.terms_version" type="text" class="input-field px-3 py-2 text-sm w-full" />
        </div>
      </div>

      <div class="flex justify-end gap-3 p-5 border-t border-primary-border bg-background/50">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-primary-border rounded-lg cursor-pointer"
          @click="$emit('close')"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2 cursor-pointer"
          @click="handleSubmit"
          :disabled="store.actionLoading"
        >
          <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="16" class="animate-spin" />
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useCashbackStore } from "@/stores/cashback/cashback";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const store = useCashbackStore();

const formData = ref({
  status: props.program.status,
  name: props.program.name,
  description: props.program.description,
  min_redemption_amount: props.program.min_redemption_amount,
  terms_version: props.program.terms_version,
});

const handleSubmit = async () => {
  await store.updateProgram(props.program.id, formData.value);
  if (!store.error) {
    emit("close");
  }
};
</script>
