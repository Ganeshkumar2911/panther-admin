<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-card-background border border-primary-border rounded-xl shadow-lg w-full max-w-sm overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-5 border-b border-primary-border">
        <h3 class="text-lg font-semibold text-primary-text">Enroll Account</h3>
        <button @click="$emit('close')" class="text-secondary-text hover:text-primary-text">
          <HugeIcon :icon="Cancel01Icon" :size="20" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">User ID</label>
          <input v-model="formData.user_id" type="number" class="input-field px-3 py-2 text-sm w-full" placeholder="e.g. 42" />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Trading Account ID</label>
          <input v-model="formData.trading_account_id" type="number" class="input-field px-3 py-2 text-sm w-full" placeholder="e.g. 670227" />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Plan</label>
          <select v-model="formData.plan_id" class="input-field px-3 py-2 text-sm w-full">
            <option disabled value="">Select a plan...</option>
            <option v-for="plan in store.plans" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-5 border-t border-primary-border bg-background/50">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-primary-border rounded-lg"
          @click="$emit('close')"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2"
          @click="handleSubmit"
          :disabled="store.actionLoading || !formData.user_id || !formData.trading_account_id || !formData.plan_id"
        >
          <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="16" class="animate-spin" />
          Enroll
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { useCashbackStore } from "@/stores/cashback/cashback";

const emit = defineEmits(["close"]);
const store = useCashbackStore();

const formData = ref({
  user_id: "",
  trading_account_id: "",
  plan_id: "",
});

const handleSubmit = async () => {
  await store.enrollAccount({
    user_id: parseInt(formData.value.user_id),
    trading_account_id: parseInt(formData.value.trading_account_id),
    plan_id: formData.value.plan_id,
  });
  if (!store.error) {
    emit("close");
  }
};
</script>
