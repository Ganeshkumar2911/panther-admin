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
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <SlidersHorizontal class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                Edit Program Configuration
              </h3>
              <p class="text-[11px] text-secondary-text">
                Modify cycle duration, earn rates, and qualification rules
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
        <form id="edit-program-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <!-- General Info Card -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-primary" />
              General Parameters
            </span>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Program Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Status</label>
                  <BaseSelect
                    v-model="form.status"
                    :options="statusOptions"
                    placeholder="Select status..."
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Terms Version</label>
                  <input
                    v-model="form.terms_version"
                    type="text"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline Dates Card -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-primary" />
              Program Lifecycle Dates
            </span>

            <div class="space-y-1">
              <label class="font-semibold text-primary-text">Program Date Range (Start & End)</label>
              <BaseDatePicker
                v-model="dateRange"
                :range="true"
                :enableTime="true"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                placeholder="Select start and end date & time"
              />
            </div>
          </div>

          <!-- Earning & Redemption Limits -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Award class="w-3.5 h-3.5 text-primary" />
              Earning & Redemption Metrics
            </span>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Base Pts / Std Lot</label>
                <input
                  v-model.number="form.base_points_per_lot"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Min Redemption Pts</label>
                <input
                  v-model.number="form.min_redemption_points"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Min Trade Duration (s)</label>
                <input
                  v-model.number="form.min_trade_duration_seconds"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Point Validity (Days)</label>
                <input
                  v-model.number="form.point_validity_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Tier Qualification & Durations -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5 text-primary" />
              Tier & Account Policy
            </span>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Tier Window (Days)</label>
                <input
                  v-model.number="form.tier_window_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Grace Period (Days)</label>
                <input
                  v-model.number="form.grace_period_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div class="space-y-1 sm:col-span-2">
                <label class="font-semibold text-primary-text">Dormancy Threshold (Days)</label>
                <input
                  v-model.number="form.dormant_days"
                  type="number"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>

            <!-- Carry Over Toggle -->
            <label class="flex items-center gap-2.5 pt-2 border-t border-primary-border/60 cursor-pointer select-none">
              <input
                v-model="form.carry_over_enrollments"
                type="checkbox"
                class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
              />
              <div>
                <p class="font-semibold text-primary-text">Carry Over Enrollments</p>
                <p class="text-[10px] text-secondary-text">Automatically migrate active members to the next cycle</p>
              </div>
            </label>
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
            form="edit-program-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ store.actionLoading ? 'Saving...' : 'Save Configuration' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from "vue";
import {
  X,
  Loader2,
  SlidersHorizontal,
  FileText,
  Calendar,
  Award,
  ShieldCheck,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  program: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

const form = reactive({
  name: "",
  status: "active",
  start_at: "",
  end_at: "",
  base_points_per_lot: 5,
  min_redemption_points: 100,
  min_trade_duration_seconds: 120,
  point_validity_days: 180,
  tier_window_days: 90,
  dormant_days: 90,
  grace_period_days: 14,
  terms_version: "1.0",
  carry_over_enrollments: false,
});

const dateRange = computed({
  get() {
    if (form.start_at || form.end_at) {
      return {
        start: form.start_at || null,
        end: form.end_at || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      form.start_at = "";
      form.end_at = "";
    } else if (Array.isArray(val)) {
      form.start_at = val[0] || "";
      form.end_at = val[1] || "";
    } else if (typeof val === "object") {
      form.start_at = val.start || val.from || "";
      form.end_at = val.end || val.to || "";
    }
  },
});

watch(
  () => props.program,
  (p) => {
    if (p) {
      form.name = p.name ?? "";
      form.status = p.status ?? "active";
      form.start_at = p.start_at ?? "";
      form.end_at = p.end_at ?? "";
      form.base_points_per_lot = p.base_points_per_lot !== undefined ? Number(p.base_points_per_lot) : 5;
      form.min_redemption_points = p.min_redemption_points !== undefined ? Number(p.min_redemption_points) : 100;
      form.min_trade_duration_seconds = p.min_trade_duration_seconds ?? 120;
      form.point_validity_days = p.point_validity_days ?? 180;
      form.tier_window_days = p.tier_window_days ?? 90;
      form.dormant_days = p.dormant_days ?? 90;
      form.grace_period_days = p.grace_period_days ?? 14;
      form.terms_version = p.terms_version ?? "1.0";
      form.carry_over_enrollments = Boolean(p.carry_over_enrollments);
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (!props.program?.id) return;
  await store.updateProgram(props.program.id, form);
  emit("saved");
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
