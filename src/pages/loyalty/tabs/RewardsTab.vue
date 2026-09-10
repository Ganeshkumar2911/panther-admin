<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">Store Products & Catalogue</h2>
        <p class="text-xs text-secondary-text">
          Client rewards store inventory including digital gift cards, merchandise, VPS hosting, and bonus trading credits.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty_store.create') || hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="handleCreate"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Store Product</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="fetchData"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center gap-2.5 p-3 bg-card-background border border-primary-border rounded-xl text-xs">
      <div class="w-full sm:w-44">
        <BaseSelect
          v-model="filters.product_type"
          :options="productTypeFilterOptions"
          placeholder="All Product Types"
          variant="surface"
          @update:modelValue="fetchData"
        />
      </div>

      <div class="w-full sm:w-36">
        <BaseSelect
          v-model="filters.status"
          :options="statusFilterOptions"
          placeholder="All Statuses"
          variant="surface"
          @update:modelValue="fetchData"
        />
      </div>

      <button
        v-if="filters.product_type || filters.status"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
        @click="resetFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && products.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-48 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="products.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShoppingBag class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Store Products Found</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          {{ (filters.product_type || filters.status) ? 'No products match your filter parameters.' : 'Publish store products to allow active traders to browse and redeem points.' }}
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty_store.create') || hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Product</span>
      </button>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-card-background border border-primary-border rounded-xl p-4 flex flex-col justify-between gap-3.5 shadow-2xs hover:border-primary/40 transition-colors"
      >
        <div class="space-y-3">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                class="text-[10px] font-medium font-mono px-2 py-0.5 rounded border uppercase"
                :class="getProductTypeBadgeClass(product.product_type || product.type)"
              >
                {{ formatTypeLabel(product.product_type || product.type) }}
              </span>
              <span
                class="text-[10px] font-medium px-2 py-0.5 rounded border"
                :class="(product.status === 'ACTIVE' || product.is_active) ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-background text-secondary-text border-primary-border'"
              >
                {{ product.status || (product.is_active ? 'ACTIVE' : 'INACTIVE') }}
              </span>
            </div>

            <!-- Action Edit & Deactivate -->
            <div class="flex items-center gap-1">
              <button
                v-if="hasPermission('loyalty_store.update') || hasPermission('loyalty.update')"
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer shrink-0"
                title="Edit Product"
                @click="handleEdit(product)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="(hasPermission('loyalty_store.delete') || hasPermission('loyalty.update')) && (product.status === 'ACTIVE' || product.is_active)"
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border hover:bg-rose-500/10 text-secondary-text hover:text-rose-400 transition cursor-pointer shrink-0"
                title="Deactivate Product"
                @click="handleDeactivate(product)"
              >
                <Power class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Title & Description -->
          <div class="space-y-1">
            <h3 class="text-xs font-semibold text-primary-text leading-snug">{{ product.name || product.title }}</h3>
            <p class="text-xs text-secondary-text line-clamp-2 leading-relaxed">
              {{ product.description || '—' }}
            </p>
          </div>

          <!-- Specs Matrix -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-primary-border text-xs">
            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Points Cost</span>
              <p class="font-bold text-primary-green font-mono text-xs">
                {{ product.points_required || product.points_cost || '0' }} pts
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Cash Value</span>
              <p class="font-medium text-primary-text font-mono text-xs">
                ${{ product.cash_value || '—' }} USD
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Stock Qty</span>
              <p class="font-medium text-primary-text text-xs font-mono">
                {{ product.stock ?? product.stock_qty ?? 'Unlimited' }}
              </p>
            </div>

            <div class="p-2 bg-background/50 border border-primary-border rounded-lg space-y-0.5">
              <span class="text-[10px] uppercase text-secondary-text font-medium">Fulfillment</span>
              <p class="font-medium text-primary-text text-xs capitalize truncate">
                {{ product.fulfillment_type || 'manual' }}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-primary-border flex items-center justify-between text-[10px] text-secondary-text">
          <span>Sort Order #{{ product.sort_order }}</span>
          <span>ID #{{ product.id }}</span>
        </div>
      </div>
    </div>

    <!-- Store Product Drawer -->
    <RewardDrawer
      :open="isDrawerOpen"
      :reward="selectedProduct"
      :tiers="tiers"
      :programId="programId"
      @close="isDrawerOpen = false"
      @saved="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { Plus, RefreshCw, ShoppingBag, Pencil, Power } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import RewardDrawer from "../components/RewardDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isDrawerOpen = ref(false);
const selectedProduct = ref(null);

const filters = reactive({
  product_type: "",
  status: "",
});

const productTypeFilterOptions = [
  { label: "All Types", value: "" },
  { label: "Merchandise", value: "merchandise" },
  { label: "Gift Card", value: "gift_card" },
  { label: "VPS Hosting", value: "vps" },
  { label: "Bonus Funds", value: "bonus_funds" },
  { label: "Tier Boost", value: "tier_boost" },
  { label: "Cash", value: "cash" },
];

const statusFilterOptions = [
  { label: "All Statuses", value: "" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const products = computed(() => {
  if (store.storeProducts && store.storeProducts.length > 0) {
    return store.storeProducts;
  }
  return store.rewards || [];
});

const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || 1);

const fetchData = (force = false) => {
  const params = {};
  if (filters.product_type) params.product_type = filters.product_type;
  if (filters.status) params.status = filters.status;
  if (programId.value) params.program_id = programId.value;

  store.fetchStoreProducts(params, force);
};

const handleRefresh = () => {
  fetchData(true);
};

const resetFilters = () => {
  filters.product_type = "";
  filters.status = "";
  fetchData(true);
};

const handleCreate = () => {
  selectedProduct.value = null;
  isDrawerOpen.value = true;
};

const handleEdit = (product) => {
  selectedProduct.value = product;
  isDrawerOpen.value = true;
};

const handleDeactivate = async (product) => {
  if (!product?.id) return;
  await store.deleteStoreProduct(product.id, programId.value);
};

const formatTypeLabel = (type) => {
  switch (type?.toLowerCase()) {
    case "merchandise":
      return "Merchandise";
    case "gift_card":
      return "Gift Card";
    case "vps":
      return "VPS Hosting";
    case "bonus_funds":
      return "Bonus Funds";
    case "tier_boost":
      return "Tier Boost";
    case "cash":
      return "Cash Credit";
    default:
      return type || "Product";
  }
};

const getProductTypeBadgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "merchandise":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "gift_card":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "vps":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "bonus_funds":
      return "bg-primary/10 text-primary border-primary/20";
    case "tier_boost":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "cash":
      return "bg-primary-green/10 text-primary-green border-primary-green/20";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};

onMounted(() => {
  fetchData();
});
</script>
