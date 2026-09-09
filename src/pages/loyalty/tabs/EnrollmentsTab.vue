<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-primary-text">Member Enrollments</h2>
        <p class="text-xs text-secondary-text">
          Active accounts enrolled in the loyalty program, current tier progress, and points balance.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="hasPermission('loyalty.enroll')"
          type="button"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
          @click="isEnrollModalOpen = true"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>Enroll Account</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer shadow-2xs"
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
        <input
          v-model="filters.user_id"
          type="number"
          placeholder="Filter by User ID..."
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-48">
        <input
          v-model="filters.trading_account_id"
          type="number"
          placeholder="Filter by Account ID..."
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-36">
        <select
          v-model="filters.status"
          class="w-full px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition cursor-pointer"
          @change="fetchData"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="dormant">Dormant</option>
        </select>
      </div>

      <button
        type="button"
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer"
        @click="fetchData"
      >
        <Search class="w-3.5 h-3.5" />
        <span>Filter</span>
      </button>

      <button
        v-if="filters.user_id || filters.trading_account_id || filters.status"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading && enrollments.length === 0" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-14 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="enrollments.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Users class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-primary-text">No enrollments found</p>
      <p class="text-xs text-secondary-text max-w-sm">
        {{ (filters.user_id || filters.trading_account_id || filters.status) ? 'No enrollments match your filter criteria.' : 'Enroll trading accounts to begin tracking volume and awarding loyalty points.' }}
      </p>
    </div>

    <!-- Enrollments Table -->
    <div v-else class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-background/80 text-secondary-text font-semibold border-b border-primary-border">
            <tr>
              <th class="py-3 px-4">ID</th>
              <th class="py-3 px-4">User ID</th>
              <th class="py-3 px-4">Trading Account</th>
              <th class="py-3 px-4">Current Tier</th>
              <th class="py-3 px-4">Available Points</th>
              <th class="py-3 px-4">Lifetime Earned</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Abuse Status</th>
              <th class="py-3 px-4">Opted-in</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border">
            <tr
              v-for="item in enrollments"
              :key="item.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td class="py-3 px-4 font-mono font-bold text-secondary-text">#{{ item.id }}</td>
              <td class="py-3 px-4 font-mono font-medium text-primary-text">#{{ item.user_id }}</td>
              <td class="py-3 px-4 font-mono font-bold text-primary">#{{ item.trading_account_id }}</td>
              <td class="py-3 px-4">
                <span class="font-bold text-primary-text font-mono">
                  {{ item.current_tier?.name || item.current_tier?.code || '—' }}
                </span>
              </td>
              <td class="py-3 px-4 font-mono font-bold text-primary">{{ item.available_points ?? '0.00' }}</td>
              <td class="py-3 px-4 font-mono text-primary-text">{{ item.lifetime_earned_points ?? '0.00' }}</td>
              <td class="py-3 px-4">
                <StatusBadge :status="item.status" />
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                  :class="item.abuse_status === 'flagged' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-green/10 text-primary-green'"
                >
                  {{ item.abuse_status || 'clear' }}
                </span>
              </td>
              <td class="py-3 px-4 text-secondary-text">{{ formatDate(item.opted_in_at) }}</td>
              <td class="py-3 px-4 text-right">
                <button
                  type="button"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-primary-border hover:border-primary/40 text-primary-text hover:text-primary transition cursor-pointer text-xs ml-auto shadow-2xs"
                  title="View Details"
                  @click="handleViewDetail(item.id)"
                >
                  <Eye class="w-3 h-3" />
                  <span>Details</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enroll Modal -->
    <EnrollModal
      :open="isEnrollModalOpen"
      :programId="store.program?.id"
      @close="isEnrollModalOpen = false"
      @enrolled="fetchData"
    />

    <!-- Detail Modal -->
    <EnrollmentDetailModal
      :open="isDetailModalOpen"
      @close="isDetailModalOpen = false"
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
import EnrollModal from "../components/EnrollModal.vue";
import EnrollmentDetailModal from "../components/EnrollmentDetailModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isEnrollModalOpen = ref(false);
const isDetailModalOpen = ref(false);

const filters = reactive({
  user_id: "",
  trading_account_id: "",
  status: "",
});

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
  isDetailModalOpen.value = true;
  await store.fetchEnrollmentDetail(enrollmentId);
};

onMounted(() => {
  fetchData();
});
</script>
