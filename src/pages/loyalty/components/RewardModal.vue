<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border">
        <div>
          <h3 class="text-base font-bold text-primary-text">
            {{ isEditing ? 'Edit Reward' : 'Create New Reward' }}
          </h3>
          <p class="text-xs text-secondary-text">Configure catalog items, redemption cost, and constraints.</p>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Type -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Reward Type</label>
            <select
              v-model="form.type"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="cash">Cash Credit</option>
              <option value="bonus_funds">Bonus Trading Funds</option>
              <option value="vps">Free VPS Hosting</option>
              <option value="merchandise">Merchandise & Lifestyle</option>
              <option value="tier_boost">Tier Upgrade Boost</option>
            </select>
          </div>

          <!-- Title -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Reward Title</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. Free VPS Hosting"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
            />
          </div>

          <!-- Description -->
          <div class="sm:col-span-2 space-y-1">
            <label class="font-semibold text-primary-text">Description</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Describe what the client receives upon redemption..."
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition resize-none"
            />
          </div>

          <!-- Points Cost -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Points Cost (Blank for Variable)</label>
            <input
              v-model="form.points_cost"
              type="number"
              step="any"
              placeholder="e.g. 500"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Min Tier ID -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Minimum Tier</label>
            <select
              v-model="form.min_tier_id"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition cursor-pointer"
            >
              <option :value="null">All Tiers (No Restriction)</option>
              <option v-for="t in tiers" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.code }})
              </option>
            </select>
          </div>

          <!-- Max Per User -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Max Claims Per User</label>
            <input
              v-model="form.max_per_user"
              type="number"
              placeholder="Unlimited if blank"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Stock Qty -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Stock Quantity</label>
            <input
              v-model="form.stock_qty"
              type="number"
              placeholder="Unlimited if blank"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Sort Order -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Sort Order</label>
            <input
              v-model.number="form.sort_order"
              type="number"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Active Status -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Active Status</label>
            <select
              v-model="form.is_active"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition cursor-pointer"
            >
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
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
            <span>{{ isEditing ? 'Save Reward' : 'Create Reward' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { X, Loader2 } from "lucide-vue-next";
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
