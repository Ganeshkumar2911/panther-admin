<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border">
        <div>
          <h3 class="text-base font-bold text-primary-text">Enroll Trading Account</h3>
          <p class="text-xs text-secondary-text">Opt-in a client trading account to the Loyalty Program.</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Content -->
      <form class="p-6 space-y-4 text-xs" @submit.prevent="handleSubmit">
        <!-- User ID -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">User ID</label>
          <input
            v-model.number="form.user_id"
            type="number"
            placeholder="e.g. 55"
            required
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
          />
        </div>

        <!-- Trading Account ID -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">Trading Account ID (Live Real Account)</label>
          <input
            v-model.number="form.trading_account_id"
            type="number"
            placeholder="e.g. 88"
            required
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
          />
        </div>

        <!-- Program ID (optional) -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">Program ID (Optional)</label>
          <input
            v-model.number="form.program_id"
            type="number"
            placeholder="Defaults to active program"
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
          />
        </div>

        <div class="p-3 bg-background/50 border border-primary-border rounded-xl text-secondary-text text-[11px] leading-relaxed">
          <p>📌 Only live <strong>Standard STP</strong> or <strong>RAW ECN</strong> accounts can participate. One enrolled account per client entity.</p>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-primary-border">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="store.actionLoading"
            class="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>Enroll Account</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { X, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  programId: { type: [Number, String], default: null },
});

const emit = defineEmits(["close", "enrolled"]);
const store = useLoyaltyStore();

const form = reactive({
  user_id: "",
  trading_account_id: "",
  program_id: "",
});

watch(
  () => props.programId,
  (pid) => {
    if (pid) form.program_id = pid;
  },
  { immediate: true },
);

const handleSubmit = async () => {
  const payload = {
    user_id: Number(form.user_id),
    trading_account_id: Number(form.trading_account_id),
  };
  if (form.program_id) {
    payload.program_id = Number(form.program_id);
  }

  await store.createEnrollment(payload);
  form.user_id = "";
  form.trading_account_id = "";
  emit("enrolled");
  emit("close");
};
</script>
