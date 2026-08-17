<script setup>
import { computed } from "vue";
import { ShieldCheck, Users, Briefcase, Network } from "lucide-vue-next";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const cards = computed(() => [
  {
    title: "Admins",
    description: "Administrative users",
    value: props.data?.admins?.count ?? 0,
    icon: ShieldCheck,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    title: "Clients",
    description: "Active trader clients",
    value: props.data?.clients?.client ?? 0,
    icon: Users,
    iconClass: "bg-primary-green/10 text-primary-green",
  },
  {
    title: "Fund Managers",
    description: "Fund manager accounts",
    value: props.data?.clients?.fm ?? 0,
    icon: Briefcase,
    iconClass: "bg-primary-blue/10 text-primary-blue",
  },
  {
    title: "Introducing Broker (IB)",
    description: "Partner & IB network",
    value: props.data?.clients?.ib ?? 0,
    icon: Network,
    iconClass: "bg-primary-yellow/10 text-primary-yellow",
  },
]);
</script>

<template>
  <section>
    <!-- Section Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />

        <p
          class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text"
        >
          Live User Count
        </p>
      </div>

      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in cards"
        :key="card.title"
        class="group relative overflow-hidden rounded-2xl border border-primary-border bg-card-background p-4 sm:p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
      >
        <!-- Hover line -->
        <span
          class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <!-- Loading -->
        <template v-if="loading">
          <div class="flex items-center gap-4 animate-pulse">
            <div class="w-11 h-11 rounded-xl bg-primary-border" />

            <div class="flex-1 space-y-2">
              <div class="h-3 w-28 bg-primary-border rounded" />
              <div class="h-2.5 w-20 bg-primary-border rounded" />
            </div>

            <div class="h-8 w-10 bg-primary-border rounded" />
          </div>
        </template>

        <!-- Data -->
        <template v-else>
          <div class="flex items-center justify-between gap-4">
            <!-- Left -->
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                :class="card.iconClass"
              >
                <component :is="card.icon" class="w-5 h-5" />
              </div>

              <div class="min-w-0">
                <p class="text-sm font-semibold text-primary-text truncate">
                  {{ card.title }}
                </p>

                <p class="mt-0.5 text-[10px] text-secondary-text truncate">
                  {{ card.description }}
                </p>
              </div>
            </div>

            <!-- Count -->
            <div class="text-right shrink-0">
              <p
                class="text-2xl sm:text-3xl font-bold tracking-tight text-primary-text leading-none"
              >
                {{ card.value }}
              </p>

              <p
                class="mt-1 text-[9px] uppercase tracking-wider text-secondary-text"
              >
                Users
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
