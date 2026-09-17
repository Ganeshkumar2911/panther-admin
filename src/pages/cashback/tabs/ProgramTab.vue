<template>
  <div class="space-y-6">
    <div v-if="store.loading && !store.activeProgram" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <SkeletonCard class="h-32" />
      <SkeletonCard class="h-32" />
    </div>

    <div v-else-if="store.activeProgram" class="space-y-6">
      <!-- Title & Actions -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="title-text">{{ store.activeProgram.name }}</h2>
          <p class="sub-text text-secondary-text">{{ store.activeProgram.description }}</p>
        </div>
        <button
          class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
          @click="isEditModalOpen = true"
        >
          Edit Settings
        </button>
      </div>

      <!-- Settings Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div class="bg-card-background border border-primary-border rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-primary-text">Program Status</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Status</span>
              <StatusBadge :status="store.activeProgram.status" />
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Code</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.code }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Start Date</span>
              <span class="font-medium text-primary-text">{{ formatDate(store.activeProgram.start_at) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-primary-text">Financial Settings</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Currency</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.currency }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Min Redemption</span>
              <span class="font-medium text-primary-text">{{ formatCurrency(store.activeProgram.min_redemption_amount) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Terms Version</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.terms_version }}</span>
            </div>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-primary-text">Eligibility Rules</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Require Live</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.eligibility_rules?.require_live ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Require KYC</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.eligibility_rules?.require_kyc ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Trading Types</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.eligibility_rules?.trading_types?.join(', ') || 'Any' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-secondary-text">Exclude Copy Accounts</span>
              <span class="font-medium text-primary-text">{{ store.activeProgram.eligibility_rules?.exclude_copy_accounts ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12 text-secondary-text">
      No Cashback Program Found.
    </div>

    <EditProgramModal
      v-if="isEditModalOpen"
      :program="store.activeProgram"
      @close="isEditModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import SkeletonCard from "@/components/common/SkeletonCard.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import EditProgramModal from "../components/EditProgramModal.vue";

const store = useCashbackStore();
const isEditModalOpen = ref(false);

const formatCurrency = (val) => {
  if (!val) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: store.activeProgram?.currency || "USD" }).format(val);
};

const formatDate = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleDateString();
};
</script>
