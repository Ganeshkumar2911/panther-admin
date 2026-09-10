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
              <ShoppingBag class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{ isEditing ? 'Edit Store Product' : 'Add Store Product' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ isEditing ? 'Update catalogue item points cost, stock, cash value, and fulfillment' : 'Publish a new reward item to the client loyalty store' }}
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
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Package class="w-3.5 h-3.5 text-primary" />
              Item Details & Classification
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Product Type <span class="text-rose-400">*</span></label>
                  <BaseSelect
                    v-model="form.product_type"
                    :options="productTypeOptions"
                    placeholder="Select type..."
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Fulfillment Type <span class="text-rose-400">*</span></label>
                  <BaseSelect
                    v-model="form.fulfillment_type"
                    :options="fulfillmentTypeOptions"
                    placeholder="Select fulfillment..."
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Product Title / Name <span class="text-rose-400">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Amazon Gift Card $25 or Panther Merchandise Hoodie"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Describe the product specifications, voucher terms, or shipping guidelines..."
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Image URL (Optional)</label>
                <input
                  v-model="form.image_url"
                  type="url"
                  placeholder="https://..."
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <!-- Cost & Valuation Card -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <DollarSign class="w-3.5 h-3.5 text-primary" />
              Points Cost & Value Valuation
            </span>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Points Required <span class="text-rose-400">*</span></label>
                <input
                  v-model.number="form.points_required"
                  type="number"
                  step="any"
                  placeholder="e.g. 800"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono font-bold"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Cash Equivalent Value ($)</label>
                <input
                  v-model.number="form.cash_value"
                  type="number"
                  step="any"
                  placeholder="e.g. 50.00"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Inventory & Access Limits -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5 text-primary" />
              Inventory & Tier Eligibility
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Available Stock</label>
                  <input
                    v-model="form.stock"
                    type="number"
                    placeholder="Unlimited (Blank)"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                  <p class="text-[10px] text-secondary-text">Decremented on redemption</p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Max Per Client</label>
                  <input
                    v-model="form.max_redemptions_per_user"
                    type="number"
                    placeholder="Unlimited (Blank)"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Minimum Tier Requirement</label>
                <BaseSelect
                  v-model="form.min_tier_id"
                  :options="tierOptions"
                  placeholder="All Tiers (No Limit)"
                />
              </div>

              <div class="grid grid-cols-2 gap-3 pt-1">
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
                    v-model="form.status"
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
            <span>{{ isEditing ? 'Save Product' : 'Publish Product' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { X, Loader2, ShoppingBag, Package, DollarSign, ShieldCheck } from "lucide-vue-next";
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

const productTypeOptions = [
  { label: "Merchandise & Lifestyle", value: "merchandise" },
  { label: "Gift Card / Digital Voucher", value: "gift_card" },
  { label: "Free VPS Hosting", value: "vps" },
  { label: "Bonus Trading Funds", value: "bonus_funds" },
  { label: "Tier Boost", value: "tier_boost" },
  { label: "Cash Credit", value: "cash" },
  { label: "Other Perk", value: "other" },
];

const fulfillmentTypeOptions = [
  { label: "Manual Fulfillment (Ops queue)", value: "manual" },
  { label: "Wallet Credit (Instant)", value: "wallet" },
  { label: "MT5 Credit Deposit", value: "mt5_credit" },
  { label: "External Partner API", value: "external" },
];

const tierOptions = computed(() => [
  { label: "All Tiers (No Limit)", value: null },
  ...(props.tiers || []).map((t) => ({
    label: `${t.name} (${t.code})`,
    value: t.id,
  })),
]);

const statusOptions = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const form = reactive({
  name: "",
  description: "",
  product_type: "merchandise",
  fulfillment_type: "manual",
  points_required: 500,
  cash_value: "",
  stock: "",
  max_redemptions_per_user: "",
  min_tier_id: null,
  image_url: "",
  sort_order: 1,
  status: "ACTIVE",
});

watch(
  () => props.reward,
  (r) => {
    if (r) {
      form.name = r.name || r.title || "";
      form.description = r.description || "";
      form.product_type = r.product_type || r.type || "merchandise";
      form.fulfillment_type = r.fulfillment_type || "manual";
      form.points_required = r.points_required !== null && r.points_required !== undefined
        ? Number(r.points_required)
        : (r.points_cost !== null && r.points_cost !== undefined ? Number(r.points_cost) : 500);
      form.cash_value = r.cash_value !== null && r.cash_value !== undefined ? Number(r.cash_value) : "";
      form.stock = r.stock !== null && r.stock !== undefined ? r.stock : (r.stock_qty !== null && r.stock_qty !== undefined ? r.stock_qty : "");
      form.max_redemptions_per_user = r.max_redemptions_per_user !== null && r.max_redemptions_per_user !== undefined
        ? r.max_redemptions_per_user
        : (r.max_per_user !== null && r.max_per_user !== undefined ? r.max_per_user : "");
      form.min_tier_id = r.min_tier_id ?? null;
      form.image_url = r.image_url || "";
      form.sort_order = r.sort_order ?? 1;
      form.status = r.status || (r.is_active === false ? "INACTIVE" : "ACTIVE");
    } else {
      form.name = "";
      form.description = "";
      form.product_type = "merchandise";
      form.fulfillment_type = "manual";
      form.points_required = 500;
      form.cash_value = "";
      form.stock = "";
      form.max_redemptions_per_user = "";
      form.min_tier_id = null;
      form.image_url = "";
      form.sort_order = 1;
      form.status = "ACTIVE";
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (isEditing.value) {
    const r = props.reward;
    const patchPayload = {};

    const newName = form.name.trim();
    const oldName = r.name || r.title || "";
    if (newName !== oldName) {
      patchPayload.name = newName;
      patchPayload.title = newName;
    }

    const newDesc = form.description ? form.description.trim() : null;
    const oldDesc = r.description ? r.description.trim() : null;
    if (newDesc !== oldDesc) patchPayload.description = newDesc;

    const newType = form.product_type;
    const oldType = r.product_type || r.type || "merchandise";
    if (newType !== oldType) {
      patchPayload.product_type = newType;
      patchPayload.type = newType;
    }

    if (form.fulfillment_type !== (r.fulfillment_type || "manual")) {
      patchPayload.fulfillment_type = form.fulfillment_type;
    }

    const newPoints = Number(form.points_required);
    const oldPoints = Number(r.points_required ?? r.points_cost ?? 500);
    if (newPoints !== oldPoints) {
      patchPayload.points_required = newPoints;
      patchPayload.points_cost = newPoints;
    }

    const newCash = form.cash_value === "" || form.cash_value === null ? null : Number(form.cash_value);
    const oldCash = r.cash_value === "" || r.cash_value === null || r.cash_value === undefined ? null : Number(r.cash_value);
    if (newCash !== oldCash) patchPayload.cash_value = newCash;

    const newStock = form.stock === "" || form.stock === null ? null : Number(form.stock);
    const oldStock = (r.stock === "" || r.stock === null || r.stock === undefined) && (r.stock_qty === "" || r.stock_qty === null || r.stock_qty === undefined)
      ? null
      : Number(r.stock ?? r.stock_qty);
    if (newStock !== oldStock) {
      patchPayload.stock = newStock;
      patchPayload.stock_qty = newStock;
    }

    const newMaxPerUser = form.max_redemptions_per_user === "" || form.max_redemptions_per_user === null ? null : Number(form.max_redemptions_per_user);
    const oldMaxPerUser = (r.max_redemptions_per_user === "" || r.max_redemptions_per_user === null || r.max_redemptions_per_user === undefined) && (r.max_per_user === "" || r.max_per_user === null || r.max_per_user === undefined)
      ? null
      : Number(r.max_redemptions_per_user ?? r.max_per_user);
    if (newMaxPerUser !== oldMaxPerUser) {
      patchPayload.max_redemptions_per_user = newMaxPerUser;
      patchPayload.max_per_user = newMaxPerUser;
    }

    const newMinTier = form.min_tier_id ? Number(form.min_tier_id) : null;
    const oldMinTier = r.min_tier_id ? Number(r.min_tier_id) : null;
    if (newMinTier !== oldMinTier) patchPayload.min_tier_id = newMinTier;

    const newImg = form.image_url?.trim() || null;
    const oldImg = r.image_url?.trim() || null;
    if (newImg !== oldImg) patchPayload.image_url = newImg;

    if (Number(form.sort_order) !== Number(r.sort_order ?? 1)) {
      patchPayload.sort_order = Number(form.sort_order);
    }

    const oldStatus = r.status || (r.is_active === false ? "INACTIVE" : "ACTIVE");
    if (form.status !== oldStatus) {
      patchPayload.status = form.status;
      patchPayload.is_active = form.status === "ACTIVE";
    }

    if (Object.keys(patchPayload).length === 0) {
      emit("close");
      return;
    }

    await store.updateStoreProduct(props.reward.id, patchPayload, props.programId);
  } else {
    const payload = {
      program_id: Number(props.programId),
      name: form.name.trim(),
      title: form.name.trim(),
      description: form.description?.trim() || null,
      product_type: form.product_type,
      type: form.product_type,
      fulfillment_type: form.fulfillment_type,
      points_required: Number(form.points_required),
      points_cost: Number(form.points_required),
      cash_value: form.cash_value === "" || form.cash_value === null ? null : Number(form.cash_value),
      stock: form.stock === "" || form.stock === null ? null : Number(form.stock),
      stock_qty: form.stock === "" || form.stock === null ? null : Number(form.stock),
      max_redemptions_per_user: form.max_redemptions_per_user === "" || form.max_redemptions_per_user === null ? null : Number(form.max_redemptions_per_user),
      max_per_user: form.max_redemptions_per_user === "" || form.max_redemptions_per_user === null ? null : Number(form.max_redemptions_per_user),
      min_tier_id: form.min_tier_id ? Number(form.min_tier_id) : null,
      image_url: form.image_url?.trim() || null,
      sort_order: Number(form.sort_order),
      status: form.status,
      is_active: form.status === "ACTIVE",
    };
    await store.createStoreProduct(payload);
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
