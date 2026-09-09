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
              <Layers class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{ isEditing ? 'Edit Loyalty Tier' : 'Create New Tier' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ isEditing ? 'Update stage multiplier and point requirements' : 'Define new progression stage for active traders' }}
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
        <form id="tier-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <!-- Stage Identity -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Stage Details</span>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Tier Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="e.g. BRONZE"
                  required
                  :disabled="isEditing"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary uppercase font-mono transition disabled:opacity-50"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Display Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Bronze"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Sort Order</label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Status</label>
                  <BaseSelect
                    v-model="form.is_active"
                    :options="statusOptions"
                    placeholder="Select status..."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Thresholds & Rates -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Points & Multipliers</span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Min Points</label>
                  <input
                    v-model.number="form.min_points"
                    type="number"
                    step="any"
                    placeholder="0"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Max Points</label>
                  <input
                    v-model="form.max_points"
                    type="number"
                    step="any"
                    placeholder="Unlimited"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Point Multiplier</label>
                  <input
                    v-model.number="form.point_multiplier"
                    type="number"
                    step="any"
                    placeholder="1.0"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Cash Conversion ($/pt)</label>
                  <input
                    v-model.number="form.cash_conversion_rate"
                    type="number"
                    step="any"
                    placeholder="0.01"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>
            </div>
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
            form="tier-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'Save Tier' : 'Create Tier' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { X, Loader2, Layers } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  tier: { type: Object, default: null },
  programId: { type: [Number, String], required: true },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const isEditing = computed(() => Boolean(props.tier && props.tier.id));

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const form = reactive({
  code: "",
  name: "",
  sort_order: 1,
  min_points: 0,
  max_points: "",
  point_multiplier: 1.0,
  cash_conversion_rate: 0.01,
  is_active: true,
});

watch(
  () => props.tier,
  (t) => {
    if (t) {
      form.code = t.code ?? "";
      form.name = t.name ?? "";
      form.sort_order = t.sort_order ?? 1;
      form.min_points = t.min_points !== null && t.min_points !== undefined ? Number(t.min_points) : 0;
      form.max_points = t.max_points !== null && t.max_points !== undefined ? Number(t.max_points) : "";
      form.point_multiplier = t.point_multiplier !== null && t.point_multiplier !== undefined ? Number(t.point_multiplier) : 1.0;
      form.cash_conversion_rate = t.cash_conversion_rate !== null && t.cash_conversion_rate !== undefined ? Number(t.cash_conversion_rate) : 0.01;
      form.is_active = t.is_active !== undefined ? Boolean(t.is_active) : true;
    } else {
      form.code = "";
      form.name = "";
      form.sort_order = 1;
      form.min_points = 0;
      form.max_points = "";
      form.point_multiplier = 1.0;
      form.cash_conversion_rate = 0.01;
      form.is_active = true;
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  const payload = {
    code: form.code,
    name: form.name,
    sort_order: form.sort_order,
    min_points: Number(form.min_points),
    max_points: form.max_points === "" || form.max_points === null ? null : Number(form.max_points),
    point_multiplier: Number(form.point_multiplier),
    cash_conversion_rate: Number(form.cash_conversion_rate),
    is_active: Boolean(form.is_active),
  };

  if (isEditing.value) {
    await store.updateTier(props.tier.id, payload, props.programId);
  } else {
    await store.createTier(props.programId, payload);
  }

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
