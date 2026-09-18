<template>
  <div class="space-y-4">

    <!-- Cards Grid -->
    <div v-if="!store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="(plan, index) in store.plans"
        :key="plan.id || plan.code"
        class="relative w-full flex flex-col rounded-2xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-300 hover:border-white/30 hover:-translate-y-1 shadow-lg"
        :style="{ backgroundColor: getPlanColor(index) }"
        @click="openEditModal(plan)"
      >
        <div class="absolute inset-0 bg-black/30 pointer-events-none" />
        <div class="absolute inset-0 bg-linear-to-br from-white/12 to-transparent pointer-events-none" />
        
        <!-- Brand Logo Watermark Background with shine effect strictly inside logo vector paths -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <svg
            viewBox="0 0 561.49 388.8"
            class="w-32 sm:w-36 h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask :id="`plan-logo-mask-${plan.id || plan.code}`">
                <g fill="#ffffff">
                  <path d="M276.33,178.03l.12-28.66c.11-27.43-17.74-51.69-43.95-59.76L96.14,47.68h-.02s-62.81-19.32-62.81-19.32l.04.08L0,18.22s38.12,20.1,52.99,52.6c5.63,12.14,16.05,21.39,28.78,25.53,89.8,29.18,167.67,51.25,194.56,81.68Z"/>
                  <path d="M250.78,169.67c-11.81-9.48-14.62-10.26-33.74-17.42,6.3,8.29,10.73,22.25,12.32,50.48l-67.09-21.36-14.66-38.05c-3.26-8.46-10.28-14.91-18.99-17.44l-56.95-16.53,77.75,164.12c6.15,15.02,35.98,40.23,75.09,69.43l-38.93-101.04,91.74,28.66v-51.96c0-19.73-4.48-31.17-26.53-48.88Z"/>
                  <path d="M342.11,285.66l9.67-133.41c-5.99,2.95-17.08,9.2-34.85,19.78-22.45,16.52-25.12,23.34-25.12,40.53v176.24l90.35-71.64c20.35-16.14,36.43-37.01,46.84-60.81l13.05-29.83c-23.1,6.44-44.97,12.76-59.36,18.3-6.41,15.34-15.76,28.47-40.58,40.83Z"/>
                  <path d="M496.26,42.04l-152.92,46.76c-30.74,9.4-51.6,37.95-51.22,70.1l.24,20.19c24.13-25.38,71.02-47.8,150.99-65.91l-25.39,57,53.54-16.33c3.26-.99,5.96-3.31,7.43-6.39l31.15-65.29c22.5-47.16,51.42-60.54,51.42-60.54l-65.24,20.42Z"/>
                  <path d="M122.54,25.42s123.47,46.95,150.82,56.02c4.49,1.49,9.33,1.54,13.86.16l144.9-54.68C341.87-7.27,217.78-10.11,122.54,25.42Z"/>
                </g>
              </mask>
              <linearGradient :id="`shine-gradient-${plan.id || plan.code}`" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
                <stop offset="35%" stop-color="#ffffff" stop-opacity="0.08" />
                <stop offset="50%" stop-color="#ffffff" stop-opacity="0.6" />
                <stop offset="65%" stop-color="#ffffff" stop-opacity="0.08" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
            </defs>

            <!-- Base subtle watermark -->
            <g fill="#ffffff" opacity="0.08">
              <path d="M276.33,178.03l.12-28.66c.11-27.43-17.74-51.69-43.95-59.76L96.14,47.68h-.02s-62.81-19.32-62.81-19.32l.04.08L0,18.22s38.12,20.1,52.99,52.6c5.63,12.14,16.05,21.39,28.78,25.53,89.8,29.18,167.67,51.25,194.56,81.68Z"/>
              <path d="M250.78,169.67c-11.81-9.48-14.62-10.26-33.74-17.42,6.3,8.29,10.73,22.25,12.32,50.48l-67.09-21.36-14.66-38.05c-3.26-8.46-10.28-14.91-18.99-17.44l-56.95-16.53,77.75,164.12c6.15,15.02,35.98,40.23,75.09,69.43l-38.93-101.04,91.74,28.66v-51.96c0-19.73-4.48-31.17-26.53-48.88Z"/>
              <path d="M342.11,285.66l9.67-133.41c-5.99,2.95-17.08,9.2-34.85,19.78-22.45,16.52-25.12,23.34-25.12,40.53v176.24l90.35-71.64c20.35-16.14,36.43-37.01,46.84-60.81l13.05-29.83c-23.1,6.44-44.97,12.76-59.36,18.3-6.41,15.34-15.76,28.47-40.58,40.83Z"/>
              <path d="M496.26,42.04l-152.92,46.76c-30.74,9.4-51.6,37.95-51.22,70.1l.24,20.19c24.13-25.38,71.02-47.8,150.99-65.91l-25.39,57,53.54-16.33c3.26-.99,5.96-3.31,7.43-6.39l31.15-65.29c22.5-47.16,51.42-60.54,51.42-60.54l-65.24,20.42Z"/>
              <path d="M122.54,25.42s123.47,46.95,150.82,56.02c4.49,1.49,9.33,1.54,13.86.16l144.9-54.68C341.87-7.27,217.78-10.11,122.54,25.42Z"/>
            </g>

            <!-- Shine effect strictly masked to the logo paths -->
            <g :mask="`url(#plan-logo-mask-${plan.id || plan.code})`">
              <rect
                x="-350"
                y="-200"
                width="350"
                height="800"
                :fill="`url(#shine-gradient-${plan.id || plan.code})`"
                class="svg-shine-rect"
              />
            </g>
          </svg>
        </div>

        <div class="relative z-10 p-5 flex flex-col h-full min-h-35 gap-4">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-white/50 font-mono">
                Code: {{ plan.code }}
              </span>
              <h3 class="text-xl font-bold text-white leading-tight tracking-tight">{{ plan.name }}</h3>
            </div>
            
            <!-- Custom Status Badge for Cards -->
            <span
              v-if="plan.status?.toLowerCase() === 'active'"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/20 border border-green-500/30 text-green-300 backdrop-blur-sm"
            >
              Active
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm"
            >
              {{ plan.status || 'Unknown' }}
            </span>
          </div>

          <div class="mt-auto pt-4 flex flex-col gap-2.5">
            <div class="flex justify-between items-end border-b border-white/5 pb-2">
              <span class="text-xs font-medium text-white/60">Qualifies On</span>
              <span class="text-sm font-semibold text-white/90 capitalize">{{ plan.qualify_on?.replace(/_/g, ' ') || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-end">
              <span class="text-xs font-medium text-white/60">Rate / Lot</span>
              <span class="text-lg font-black text-white tracking-tight">{{ formatCurrency(plan.rate_per_lot) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else-if="store.loading" class="flex justify-center items-center py-12">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.plans?.length" class="flex flex-col items-center justify-center py-12 bg-card-background border border-primary-border rounded-xl">
      <span class="text-secondary-text mb-2">No plans available</span>
    </div>

    <EditPlanModal
      v-if="selectedPlan"
      :plan="selectedPlan"
      @close="closeEditModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import StatusBadge from "@/components/common/StatusBadge.vue";
import EditPlanModal from "../components/EditPlanModal.vue";

const store = useCashbackStore();
const selectedPlan = ref(null);

const planColors = [
  '#0f172a', // slate-900
  '#1e1b4b', // indigo-950
  '#022c22', // emerald-950
  '#4a044e', // fuchsia-900
  '#450a0a', // red-950
  '#422006', // orange-950
  '#083344', // cyan-950
  '#312e81', // indigo-900
];

const getPlanColor = (index) => {
  return planColors[index % planColors.length];
};

const formatCurrency = (val) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: store.activeProgram?.currency || "USD" }).format(val);
};

const openEditModal = (plan) => {
  selectedPlan.value = plan;
};

const closeEditModal = () => {
  selectedPlan.value = null;
};

onMounted(() => {
  if (store.activeProgram && (!store.isFetched.plans || store.plans.length === 0)) {
    store.fetchPlans(store.activeProgram.id);
  }
});
</script>
