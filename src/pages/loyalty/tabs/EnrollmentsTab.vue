<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">Member Enrollments</h2>
        <p class="text-xs text-secondary-text">
          Accounts participating in the loyalty program, tier progress, and points ledger.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty.enroll')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="isEnrollDrawerOpen = true"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>Enroll Account</span>
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
      <div class="relative w-full sm:w-44">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
        <input
          v-model="filters.user_id"
          type="number"
          placeholder="User ID..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-48">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
        <input
          v-model="filters.trading_account_id"
          type="number"
          placeholder="Trading A/C..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="w-full sm:w-40">
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          variant="surface"
          @update:modelValue="fetchData"
        />
      </div>

      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer text-xs"
        @click="fetchData"
      >
        <Search class="w-3 h-3" />
        <span>Filter</span>
      </button>

      <button
        v-if="filters.user_id || filters.trading_account_id || filters.status"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && enrollments.length === 0" class="space-y-3">
      <div v-for="n in 6" :key="n" class="h-12 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="enrollments.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Users class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Enrollments Found</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          {{ (filters.user_id || filters.trading_account_id || filters.status) ? 'No enrollments match your filter criteria.' : 'Enroll client trading accounts to begin tracking points and tier upgrades.' }}
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty.enroll')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="isEnrollDrawerOpen = true"
      >
        <UserPlus class="w-3.5 h-3.5" />
        <span>Enroll First Account</span>
      </button>
    </div>

    <!-- Enrollments Table -->
    <div v-else class="bg-card-background border border-primary-border rounded-xl overflow-hidden shadow-2xs">
      <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/50">
        <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
          Enrolled Members ({{ enrollments.length }})
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-background/60 text-secondary-text border-b border-primary-border">
            <tr>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Enroll ID</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">User ID</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Trading Account</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Current Tier</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Available Points</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Lifetime Points</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Status</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Abuse Status</th>
              <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Opted-In</th>
              <th class="py-2.5 px-4 text-right text-[11px] font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border">
            <tr
              v-for="item in enrollments"
              :key="item.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td class="py-2.5 px-4 text-secondary-text font-mono">#{{ item.id }}</td>
              <td class="py-2.5 px-4 text-primary-text font-mono">#{{ item.user_id }}</td>
              <td class="py-2.5 px-4 font-mono font-medium text-primary">#{{ item.trading_account_id }}</td>
              <td class="py-2.5 px-4">
                <span class="inline-block px-2 py-0.5 rounded font-mono text-[10px] uppercase bg-primary/10 text-primary border border-primary/20">
                  {{ item.current_tier?.name || item.current_tier?.code || '—' }}
                </span>
              </td>
              <td class="py-2.5 px-4 font-mono font-medium text-primary-green">{{ item.available_points ?? '0.00' }}</td>
              <td class="py-2.5 px-4 font-mono text-primary-text">{{ item.lifetime_earned_points ?? '0.00' }}</td>
              <td class="py-2.5 px-4">
                <StatusBadge :status="item.status" />
              </td>
              <td class="py-2.5 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
                  :class="item.abuse_status === 'flagged' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-primary-green/10 text-primary-green border border-primary-green/20'"
                >
                  {{ item.abuse_status || 'clear' }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-secondary-text">{{ formatDate(item.opted_in_at) }}</td>
              <td class="py-2.5 px-4 text-right">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer text-xs"
                  title="Inspect Enrollment Details"
                  @click="handleViewDetail(item.id)"
                >
                  <Eye class="w-3 h-3" />
                  <span>Inspect</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enroll Slide-Over Drawer -->
    <EnrollDrawer
      :open="isEnrollDrawerOpen"
      :programId="store.program?.id"
      @close="isEnrollDrawerOpen = false"
      @enrolled="fetchData"
    />

    <!-- Detail Slide-Over Drawer -->
    <EnrollmentDetailDrawer
      :open="isDetailDrawerOpen"
      @close="isDetailDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { UserPlus, RefreshCw, Users, Search, Eye } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import StatusBadge from "@/components/common/StatusBadge.vue";
import EnrollDrawer from "../components/EnrollDrawer.vue";
import EnrollmentDetailDrawer from "../components/EnrollmentDetailDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isEnrollDrawerOpen = ref(false);
const isDetailDrawerOpen = ref(false);

const filters = reactive({
  user_id: "",
  trading_account_id: "",
  status: "",
});

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Dormant", value: "dormant" },
];

const enrollments = computed(() => store.enrollments || []);

const fetchData = () => {
  const params = {};
  if (filters.user_id) params.user_id = Number(filters.user_id);
  if (filters.trading_account_id) params.trading_account_id = Number(filters.trading_account_id);
  if (filters.status) params.status = filters.status;
  store.fetchEnrollments(params);
};

const resetFilters = () => {
  filters.user_id = "";
  filters.trading_account_id = "";
  filters.status = "";
  fetchData();
};

const handleViewDetail = async (enrollmentId) => {
  isDetailDrawerOpen.value = true;
  await store.fetchEnrollmentDetail(enrollmentId);
};

onMounted(() => {
  fetchData();
});
</script>
