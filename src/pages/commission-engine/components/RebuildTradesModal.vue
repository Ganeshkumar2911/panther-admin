<script setup>
import { ref } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  RefreshCwIcon,
  DatabaseIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "rebuilt"]);

const store = useCommissionEngineStore();

const limit = ref(2000);
const rebuildResult = ref(null);

const closeModal = () => {
  rebuildResult.value = null;
  emit("update:modelValue", false);
};

const handleRebuild = async () => {
  try {
    const res = await store.rebuildTrades({ limit: Number(limit.value) || 2000 });
    if (res?.data) {
      rebuildResult.value = res.data;
    }
    emit("rebuilt");
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-md bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <HugeIcon :icon="DatabaseIcon" :size="20" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold">
                  Rebuild Trades Pipeline
                </h3>
                <p class="text-xs text-secondary-text">
                  Reconstruct position deals from raw report records
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="closeModal"
            >
              <HugeIcon :icon="Cancel01Icon" :size="16" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 overflow-y-auto">
            <!-- Rebuild Result Banner if Available -->
            <div
              v-if="rebuildResult"
              class="p-4 rounded-xl bg-primary-green/10 border border-primary-green/20 space-y-2 animate-in fade-in duration-200"
            >
              <div class="flex items-center gap-2 text-primary-green font-semibold text-xs">
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="16" />
                <span>Rebuild Completed</span>
              </div>
              <div class="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div class="p-2 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Positions</span>
                  <strong class="font-mono text-sm text-primary-text">{{ rebuildResult.positions ?? 0 }}</strong>
                </div>
                <div class="p-2 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Upserted</span>
                  <strong class="font-mono text-sm text-primary">{{ rebuildResult.upserted ?? 0 }}</strong>
                </div>
                <div class="p-2 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Closed</span>
                  <strong class="font-mono text-sm text-primary-green">{{ rebuildResult.closed ?? 0 }}</strong>
                </div>
              </div>
            </div>

            <!-- Notice -->
            <div
              v-else
              class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-secondary-text leading-relaxed"
            >
              Executes position reconstruction to associate entry (open) and exit (close) deals into unified trade records for commission computation.
            </div>

            <!-- Limit Input -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Batch Reconstruction Limit
              </label>
              <input
                v-model.number="limit"
                type="number"
                min="100"
                max="10000"
                step="500"
                class="input-field w-full px-3 py-2 text-xs font-mono"
              />
              <p class="text-[11px] text-secondary-text">
                Max positions to process in this ops batch (default 2,000).
              </p>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-primary-border">
              <button
                type="button"
                class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
                @click="closeModal"
              >
                {{ rebuildResult ? "Done" : "Cancel" }}
              </button>
              <button
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleRebuild"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="RefreshCwIcon" :size="14" />
                <span>{{ rebuildResult ? "Run Again" : "Rebuild Trades" }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
