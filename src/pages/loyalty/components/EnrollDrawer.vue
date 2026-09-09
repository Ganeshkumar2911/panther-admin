<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <UserPlus class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                Enroll Trading Account
              </h3>
              <p class="text-[11px] text-secondary-text">
                Opt-in live client trading account to loyalty rewards
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="enroll-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Account Identification</span>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">User ID</label>
                <input
                  v-model.number="form.user_id"
                  type="number"
                  placeholder="e.g. 55"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
                <p class="text-[10px] text-secondary-text">The user who owns the trading account</p>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Live Trading Account ID</label>
                <input
                  v-model.number="form.trading_account_id"
                  type="number"
                  placeholder="e.g. 88"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
                <p class="text-[10px] text-secondary-text">Must be a live real account (Cent/Demo excluded)</p>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Program ID (Optional)</label>
                <input
                  v-model.number="form.program_id"
                  type="number"
                  placeholder="Defaults to active program"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Eligibility Guidelines Note -->
          <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-[11px] text-secondary-text leading-relaxed">
            <div class="flex items-center gap-1.5 font-bold text-primary text-xs">
              <ShieldCheck class="w-4 h-4" />
              <span>Eligibility & Policy Rules</span>
            </div>
            <ul class="space-y-1 list-disc list-inside">
              <li>Only <strong>Standard STP</strong> and <strong>RAW ECN</strong> accounts are eligible.</li>
              <li>Only 1 trading account per client entity may participate at any time.</li>
              <li>Points are earned on closed trades held for at least 2 minutes.</li>
            </ul>
          </div>
        </form>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="enroll-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ store.actionLoading ? 'Enrolling...' : 'Enroll Account' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { X, Loader2, UserPlus, ShieldCheck } from "lucide-vue-next";
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

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
