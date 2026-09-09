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
              <Gift class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{ isEditing ? 'Edit Reward Item' : 'Add New Reward Item' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ isEditing ? 'Update redemption cost, stock, and tier constraints' : 'Configure catalog reward available for point redemption' }}
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
        <form id="reward-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <!-- Item Info Card -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Item Details</span>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Reward Type</label>
                <BaseSelect
                  v-model="form.type"
                  :options="rewardTypeOptions"
                  placeholder="Select reward type..."
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Reward Title</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Free VPS Hosting"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Describe the reward benefits, fulfillment process, or terms..."
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition resize-none"
                />
              </div>
            </div>
          </div>

          <!-- Cost & Eligibility Card -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Redemption & Limits</span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Points Cost</label>
                  <input
                    v-model="form.points_cost"
                    type="number"
                    step="any"
                    placeholder="Variable (blank)"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Min Tier Required</label>
                  <BaseSelect
                    v-model="form.min_tier_id"
                    :options="tierOptions"
                    placeholder="All Tiers (No Limit)"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Max Per User</label>
                  <input
                    v-model="form.max_per_user"
                    type="number"
                    placeholder="Unlimited"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Stock Qty</label>
                  <input
                    v-model="form.stock_qty"
                    type="number"
                    placeholder="Unlimited"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Sort Order</label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
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
            form="reward-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'Save Reward' : 'Create Reward' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { X, Loader2, Gift } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  reward: { type: Object, default: null },
  tiers: { type: Array, default: () => [] },
  programId: { type: [Number, String], required: true },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const isEditing = computed(() => Boolean(props.reward && props.reward.id));

const rewardTypeOptions = [
  { label: "Cash Credit", value: "cash" },
  { label: "Bonus Trading Funds", value: "bonus_funds" },
  { label: "Free VPS Hosting", value: "vps" },
  { label: "Merchandise & Lifestyle", value: "merchandise" },
  { label: "Tier Upgrade Boost", value: "tier_boost" },
];

const tierOptions = computed(() => [
  { label: "All Tiers (No Limit)", value: null },
  ...(props.tiers || []).map((t) => ({
    label: `${t.name} (${t.code})`,
    value: t.id,
  })),
]);

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const form = reactive({
  type: "cash",
  title: "",
  description: "",
  points_cost: "",
  min_tier_id: null,
  max_per_user: "",
  stock_qty: "",
  sort_order: 1,
  is_active: true,
});

watch(
  () => props.reward,
  (r) => {
    if (r) {
      form.type = r.type ?? "cash";
      form.title = r.title ?? "";
      form.description = r.description ?? "";
      form.points_cost = r.points_cost !== null && r.points_cost !== undefined ? r.points_cost : "";
      form.min_tier_id = r.min_tier_id ?? null;
      form.max_per_user = r.max_per_user !== null && r.max_per_user !== undefined ? r.max_per_user : "";
      form.stock_qty = r.stock_qty !== null && r.stock_qty !== undefined ? r.stock_qty : "";
      form.sort_order = r.sort_order ?? 1;
      form.is_active = r.is_active !== undefined ? Boolean(r.is_active) : true;
    } else {
      form.type = "cash";
      form.title = "";
      form.description = "";
      form.points_cost = "";
      form.min_tier_id = null;
      form.max_per_user = "";
      form.stock_qty = "";
      form.sort_order = 1;
      form.is_active = true;
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  const payload = {
    type: form.type,
    title: form.title,
    description: form.description || null,
    points_cost: form.points_cost === "" || form.points_cost === null ? null : Number(form.points_cost),
    min_tier_id: form.min_tier_id ? Number(form.min_tier_id) : null,
    max_per_user: form.max_per_user === "" || form.max_per_user === null ? null : Number(form.max_per_user),
    stock_qty: form.stock_qty === "" || form.stock_qty === null ? null : Number(form.stock_qty),
    sort_order: Number(form.sort_order),
    is_active: Boolean(form.is_active),
  };

  if (isEditing.value) {
    await store.updateReward(props.reward.id, payload, props.programId);
  } else {
    await store.createReward(props.programId, payload);
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
