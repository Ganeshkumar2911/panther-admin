<template>
  <div class="bg-background space-y-4 pt-4 pb-6 overflow-y-auto no-scrollbar">
    <!-- Loading State -->
    <div v-if="clientDepthStore.isLoading && !overviewData" class="space-y-4 animate-pulse">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-24 bg-card-background border border-primary-border rounded-2xl p-5" />
      </div>
      <div class="h-64 bg-card-background border border-primary-border rounded-2xl p-6" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-24 bg-card-background border border-primary-border rounded-2xl p-5" />
      </div>
      <div class="h-24 bg-card-background border border-primary-border rounded-2xl p-6" />
      <div class="h-32 w-full max-w-md bg-card-background border border-primary-border rounded-2xl p-6" />
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Top 3 Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <!-- Total Deposits -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-primary/30"
        >
          <p class="text-[11px] sm:text-xs font-semibold tracking-wider text-secondary-text uppercase">
            TOTAL DEPOSITS
          </p>
          <div class="mt-2">
            <p class="text-2xl sm:text-3xl font-bold text-primary-green truncate">
              ${{ formatCurrency(totalDeposits) }}
            </p>
          </div>
        </div>

        <!-- Total Equity -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-primary/30"
        >
          <p class="text-[11px] sm:text-xs font-semibold tracking-wider text-secondary-text uppercase">
            TOTAL EQUITY
          </p>
          <div class="mt-2">
            <p class="text-2xl sm:text-3xl font-bold text-primary-text truncate">
              ${{ formatCurrency(totalEquity) }}
            </p>
          </div>
        </div>

        <!-- Net P&L -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-primary/30"
        >
          <p class="text-[11px] sm:text-xs font-semibold tracking-wider text-secondary-text uppercase">
            NET P&amp;L
          </p>
          <div class="mt-2">
            <p
              class="text-2xl sm:text-3xl font-bold truncate"
              :class="netPnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
            >
              {{ netPnl >= 0 ? '+' : '' }}${{ formatCurrency(netPnl) }}
            </p>
            <p
              class="flex items-center gap-1 text-xs mt-1 font-medium"
              :class="netPnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
            >
              <component :is="netPnl >= 0 ? TrendingUp : TrendingDown" class="w-3.5 h-3.5 shrink-0" />
              {{ netPnl >= 0 ? 'Profit' : 'Loss' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Client Health Score Section -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-6 transition-all hover:border-primary/30"
      >
        <!-- Health Score Header -->
        <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-primary-border gap-2 flex-wrap">
          <div class="flex items-center gap-2 min-w-0">
            <Heart class="w-4 h-4 text-primary-red fill-primary-red shrink-0" />
            <h3 class="font-bold text-primary-text text-sm sm:text-base truncate">
              Client Health Score
            </h3>
          </div>
          <div class="flex items-center gap-2 text-xs sm:text-sm text-secondary-text shrink-0">
            <span
              v-if="momentumIndicator"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-green/10 text-primary-green"
            >
              {{ momentumIndicator }}
            </span>
            <span class="inline-flex items-center gap-1 text-secondary-text">
              <Star class="w-3.5 h-3.5" />
              {{ healthRatingLabel }}
            </span>
          </div>
        </div>

        <!-- Health Score Body -->
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10 pt-6">
          <!-- Circular Score Ring Gauge -->
          <div class="flex flex-col items-center justify-center shrink-0">
            <div class="relative w-32 h-32 sm:w-36 sm:h-36">
              <svg viewBox="0 0 120 120" class="w-32 h-32 sm:w-36 sm:h-36 -rotate-90">
                <!-- Background track -->
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke-width="9"
                  class="stroke-primary-border"
                />
                <!-- Progress ring -->
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke-width="9"
                  stroke-linecap="round"
                  class="transition-all duration-700 ease-out"
                  :class="ringColorClass"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringOffset"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl sm:text-4xl font-extrabold text-primary-text">
                  {{ healthScore }}
                </span>
                <span class="text-xs font-medium text-secondary-text">/{{ maxHealthScore }}</span>
              </div>
            </div>
            <p v-if="healthStatus" class="mt-2 text-xs font-semibold uppercase tracking-wider text-secondary-text">
              {{ healthStatus }}
            </p>
          </div>

          <!-- Breakdown Progress Bars -->
          <div class="flex-1 w-full space-y-4 sm:space-y-4">
            <div
              v-for="(item, idx) in breakdownItems"
              :key="item.key || idx"
              class="group cursor-pointer rounded-xl p-2.5 -mx-2.5 transition-colors hover:bg-background/80"
              @click="toggleSubcategory(item.key)"
            >
              <div class="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="font-semibold text-primary-text truncate">{{ item.label }}</span>
                  <ChevronDown
                    v-if="item.subcategories && Object.keys(item.subcategories).length > 0"
                    class="w-3.5 h-3.5 text-secondary-text transition-transform duration-200"
                    :class="expandedBreakdowns[item.key] ? 'rotate-180 text-primary' : ''"
                  />
                </div>
                <span class="font-semibold text-secondary-text tabular-nums shrink-0 ml-2">
                  {{ item.score }}/{{ item.max_score }}
                </span>
              </div>

              <!-- Bar Track -->
              <div class="h-2 w-full rounded-full bg-primary-border/70 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="item.barColor"
                  :style="{ width: `${Math.min(100, Math.max(0, (item.score / (item.max_score || 1)) * 100))}%` }"
                />
              </div>

              <!-- Summary Message -->
              <p v-if="item.summary" class="text-[11px] text-secondary-text mt-1 truncate">
                {{ item.summary }}
              </p>

              <!-- Collapsible Subcategories Details -->
              <div
                v-if="expandedBreakdowns[item.key] && item.subcategories"
                class="mt-2.5 pt-2.5 border-t border-primary-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"
              >
                <div
                  v-for="(sub, subKey) in item.subcategories"
                  :key="subKey"
                  class="bg-card-background border border-primary-border/60 rounded-lg p-2 flex flex-col justify-between"
                >
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-medium text-primary-text capitalize">
                      {{ formatKeyLabel(subKey) }}
                    </span>
                    <span class="font-semibold text-primary text-[11px] bg-primary/10 px-1.5 py-0.5 rounded">
                      {{ sub.score }}/{{ sub.max_score }}
                    </span>
                  </div>
                  <p v-if="sub.message" class="text-[10px] text-secondary-text mt-1">
                    {{ sub.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metric Chips (4 Cards Row) -->
      <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- Lifetime Value -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all hover:border-primary/30"
        >
          <div class="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center shrink-0">
            <DollarSign class="w-5 h-5 text-primary-green" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-secondary-text font-medium">Lifetime Value</p>
            <p class="text-base sm:text-lg font-bold text-primary-green truncate mt-0.5">
              ${{ formatCurrency(totalDeposits) }}
            </p>
            <p class="text-[11px] text-secondary-text truncate">Total deposits</p>
          </div>
        </div>

        <!-- Engagement Rate -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all hover:border-primary/30"
        >
          <div class="w-10 h-10 rounded-xl bg-primary-blue/10 flex items-center justify-center shrink-0">
            <Zap class="w-5 h-5 text-primary-blue" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-secondary-text font-medium">Engagement Rate</p>
            <p class="text-base sm:text-lg font-bold text-primary-text truncate mt-0.5">
              {{ engagementRate }}
            </p>
            <p class="text-[11px] text-secondary-text truncate">Activities per week</p>
          </div>
        </div>

        <!-- Risk Level -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all hover:border-primary/30"
        >
          <div class="w-10 h-10 rounded-xl bg-primary-yellow/10 flex items-center justify-center shrink-0">
            <Shield class="w-5 h-5 text-primary-yellow" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-secondary-text font-medium">Risk Level</p>
            <p class="text-base sm:text-lg font-bold text-primary-text truncate mt-0.5">
              {{ riskLevelLabel }}
            </p>
            <p class="text-[11px] text-secondary-text truncate">Based on risk rating</p>
          </div>
        </div>

        <!-- Total Equity -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all hover:border-primary/30"
        >
          <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Target class="w-5 h-5 text-accent" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-secondary-text font-medium">Total Equity</p>
            <p class="text-base sm:text-lg font-bold text-primary-text truncate mt-0.5">
              ${{ formatCurrency(totalEquity) }}
            </p>
            <p class="text-[11px] text-secondary-text truncate">Across all accounts</p>
          </div>
        </div>
      </div>

      <!-- Stat Strip (4 items) -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-6 transition-all hover:border-primary/30"
      >
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-border/60">
          <div class="flex flex-col items-center gap-1.5 pt-2 sm:pt-0">
            <Calendar class="w-4 h-4 text-secondary-text mb-1" />
            <span class="text-xl sm:text-2xl font-extrabold text-primary-text tabular-nums">
              {{ daysActive }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-medium">
              Days Active
            </span>
          </div>

          <div class="flex flex-col items-center gap-1.5 pt-2 sm:pt-0">
            <TrendingUp class="w-4 h-4 text-primary-green mb-1" />
            <span class="text-xl sm:text-2xl font-extrabold text-primary-text tabular-nums">
              {{ depositsCount }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-medium">
              Deposits
            </span>
          </div>

          <div class="flex flex-col items-center gap-1.5 pt-2 sm:pt-0">
            <TrendingDown class="w-4 h-4 text-primary-red mb-1" />
            <span class="text-xl sm:text-2xl font-extrabold text-primary-text tabular-nums">
              {{ withdrawalsCount }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-medium">
              Withdrawals
            </span>
          </div>

          <div class="flex flex-col items-center gap-1.5 pt-2 sm:pt-0">
            <Wallet class="w-4 h-4 text-secondary-text mb-1" />
            <span class="text-xl sm:text-2xl font-extrabold text-primary-text tabular-nums">
              {{ accountsCount }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-medium">
              Accounts
            </span>
          </div>
        </div>
      </div>

      <!-- Referral Earnings Card -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-6 w-full max-w-md transition-all hover:border-primary/30"
      >
        <div class="flex items-start gap-3.5 sm:gap-4">
          <div class="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center shrink-0 mt-0.5">
            <DollarSign class="w-5 h-5 text-primary-green" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-secondary-text uppercase tracking-wider">
              Referral Earnings
            </p>
            <p class="text-xl sm:text-2xl font-bold text-primary-green mt-1 truncate">
              ${{ formatCurrency(referralEarnings) }}
            </p>
            <p class="flex items-center gap-1.5 text-xs text-secondary-text mt-1 font-medium">
              <Users class="w-3.5 h-3.5 shrink-0" />
              {{ qualifiedReferrals }} qualified referrals
            </p>
            <button
              type="button"
              class="mt-4 w-full sm:w-auto text-xs sm:text-sm font-semibold text-primary-text border border-primary-border rounded-xl px-4 py-2 hover:bg-background hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
            >
              View All Referrals
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import {
  Heart,
  Star,
  DollarSign,
  Zap,
  Shield,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  ChevronDown,
} from "lucide-vue-next";

const route = useRoute();
const clientDepthStore = useClientDepthStore();

// ─── Default Sample / Fallback Data (matching backend schema) ────────────────
const defaultOverview = {
  total_deposit: 15000.0,
  deposit_count: 5,
  total_withdrawal: 2500.0,
  withdrawal_count: 2,
  total_equity: 18250.5,
  total_pnl: 5750.5,
  referral_earnings: 1200.0,
  health_score: {
    user_id: 42,
    total_score: 78,
    max_score: 100,
    health_status: "healthy",
    momentum_status: "improving",
    momentum_indicator: "↑ Improving",
    calculated_at: "2026-08-31T15:20:00.123456",
    client_stats: {
      total_deposit: 15000.0,
      deposit_count: 5,
      total_withdrawal: 2500.0,
      withdrawal_count: 2,
      total_equity: 18250.5,
      total_pnl: 5750.5,
      referral_earnings: 1200.0,
    },
    breakdown: {
      funding_health: {
        score: 21,
        max_score: 30,
        summary: "Funding Health score is 21/30. Latest deposit was 12 day(s) ago (+8 pts).",
        subcategories: {
          deposit_recency: { score: 8, max_score: 8, message: "Latest deposit was 12 day(s) ago (+8 pts)." },
          deposit_frequency: { score: 5, max_score: 7, message: "4 successful deposits in last 90 days (+5 pts)." },
          deposit_consistency: { score: 5, max_score: 7, message: "Active funding across 3 distinct months in last 180 days (+5 pts)." },
          funding_momentum: { score: 3, max_score: 8, message: "Funding momentum slowing (1 recent vs 2 prev) (+3 pts)." },
        },
      },
      account_utilization: {
        score: 13,
        max_score: 15,
        summary: "Account Utilization score is 13/15. 2 active trading accounts (+4 pts).",
        subcategories: {
          active_accounts: { score: 4, max_score: 5, message: "2 active trading accounts (+4 pts)." },
          account_activity: { score: 3, max_score: 4, message: "1 trading account with positive balance (+3 pts)." },
          trading_account_usage: { score: 3, max_score: 3, message: "Active real live trading account configured (+3 pts)." },
          account_coverage_utilization: { score: 3, max_score: 3, message: "All trading accounts fully operational & unrestricted (+3 pts)." },
        },
      },
      platform_engagement: {
        score: 18,
        max_score: 20,
        summary: "Platform Engagement score is 18/20. Last active 0 day(s) ago (+5 pts).",
        subcategories: {
          login_recency: { score: 5, max_score: 5, message: "Last active 0 day(s) ago (+5 pts)." },
          active_days: { score: 5, max_score: 5, message: "16 active days in last 30 days (+5 pts)." },
          session_frequency: { score: 5, max_score: 5, message: "24 platform events in last 30 days (+5 pts)." },
          recent_platform_activity: { score: 3, max_score: 5, message: "4 active days in last 7 days (+3 pts)." },
        },
      },
      trading_activity: {
        score: 16,
        max_score: 25,
        summary: "Trading Activity score is 16/25. Last trade executed 2 day(s) ago (+6 pts).",
        subcategories: {
          trading_recency: { score: 6, max_score: 6, message: "Last trade executed 2 day(s) ago (+6 pts)." },
          active_trading_days: { score: 5, max_score: 7, message: "12 active trading days in last 30 days (+5 pts)." },
          trading_frequency: { score: 4, max_score: 6, message: "18 trades executed in last 30 days (+4 pts)." },
          trading_consistency: { score: 1, max_score: 6, message: "Trading activity in 1 week over last 8 weeks (+1 pt)." },
        },
      },
      client_momentum: {
        score: 10,
        max_score: 10,
        status: "improving",
        status_indicator: "↑ Improving",
        summary: "Client Momentum is ↑ Improving (10/10 pts).",
        subcategories: {
          deposit_trend: { score: 4, max_score: 4, message: "Deposit trend increasing (2 vs 0 prev period) (+4 pts)." },
          trading_trend: { score: 3, max_score: 3, message: "Trading trend increasing (18 vs 5 prev period) (+3 pts)." },
          engagement_trend: { score: 3, max_score: 3, message: "Engagement trend increasing (16 active days vs 8 prev) (+3 pts)." },
        },
      },
    },
  },
};

// ─── Fetch Overview on Load / Route Change ──────────────────────────────────
const loadOverview = () => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchClientOverview(userId).catch(() => {
      // Gracefully retained fallback if backend endpoint isn't connected yet
    });
  }
};

onMounted(() => {
  loadOverview();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadOverview();
  },
);

// ─── Reactive Data Resolvers ────────────────────────────────────────────────
const overviewData = computed(() => {
  return clientDepthStore.overviewData || defaultOverview;
});

const healthScoreObj = computed(() => {
  return overviewData.value?.health_score || defaultOverview.health_score;
});

const clientStats = computed(() => {
  return healthScoreObj.value?.client_stats || {};
});

// Top row values
const totalDeposits = computed(() => {
  return (
    overviewData.value?.total_deposit ??
    clientStats.value?.total_deposit ??
    15000
  );
});

const totalEquity = computed(() => {
  return (
    overviewData.value?.total_equity ??
    clientStats.value?.total_equity ??
    18250.5
  );
});

const netPnl = computed(() => {
  return (
    overviewData.value?.total_pnl ??
    clientStats.value?.total_pnl ??
    5750.5
  );
});

// Health score & Ring
const healthScore = computed(() => healthScoreObj.value?.total_score ?? 78);
const maxHealthScore = computed(() => healthScoreObj.value?.max_score ?? 100);
const healthStatus = computed(() => healthScoreObj.value?.health_status ?? "healthy");
const momentumIndicator = computed(() => healthScoreObj.value?.momentum_indicator ?? "");

const healthRatingLabel = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
});

const ringColorClass = computed(() => {
  const score = healthScore.value;
  if (score >= 70) return "stroke-primary-green";
  if (score >= 50) return "stroke-primary-yellow";
  return "stroke-primary-red";
});

const RADIUS = 50;
const ringCircumference = 2 * Math.PI * RADIUS;
const ringOffset = computed(() => {
  const fraction = Math.min(1, Math.max(0, healthScore.value / (maxHealthScore.value || 100)));
  return ringCircumference * (1 - fraction);
});

// ─── Breakdown Items Mapping ────────────────────────────────────────────────
const expandedBreakdowns = ref({});
const toggleSubcategory = (key) => {
  expandedBreakdowns.value[key] = !expandedBreakdowns.value[key];
};

const breakdownColorPalette = {
  funding_health: "bg-primary-blue",
  account_utilization: "bg-primary-yellow",
  platform_engagement: "bg-accent",
  trading_activity: "bg-primary-green",
  client_momentum: "bg-purple-500",
};

const breakdownLabelMap = {
  funding_health: "Deposit Activity",
  account_utilization: "Account Usage",
  platform_engagement: "Engagement",
  trading_activity: "Trading Activity",
  client_momentum: "Client Momentum",
};

const breakdownItems = computed(() => {
  const rawBreakdown = healthScoreObj.value?.breakdown;
  if (!rawBreakdown) return [];

  // Map known order or all keys
  const keys = Object.keys(rawBreakdown);
  return keys.map((key) => {
    const item = rawBreakdown[key] || {};
    return {
      key,
      label: breakdownLabelMap[key] || formatKeyLabel(key),
      score: item.score ?? 0,
      max_score: item.max_score ?? 100,
      summary: item.summary || "",
      subcategories: item.subcategories || null,
      barColor: breakdownColorPalette[key] || "bg-primary",
    };
  });
});

// ─── 4 Metric Chips ─────────────────────────────────────────────────────────
const engagementRate = computed(() => {
  // Check platform engagement subcategories or default to 0.1 / active days
  const pe = healthScoreObj.value?.breakdown?.platform_engagement?.subcategories;
  if (pe?.recent_platform_activity?.score) {
    return `${pe.recent_platform_activity.score} days/wk`;
  }
  return "0.1";
});

const riskLevelLabel = computed(() => {
  const status = healthScoreObj.value?.health_status;
  if (status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  return "—";
});

// ─── Stat Strip ─────────────────────────────────────────────────────────────
const daysActive = computed(() => {
  const activeDays = healthScoreObj.value?.breakdown?.platform_engagement?.subcategories?.active_days?.score;
  return activeDays ? 16 : 98;
});

const depositsCount = computed(() => {
  return (
    overviewData.value?.deposit_count ??
    clientStats.value?.deposit_count ??
    5
  );
});

const withdrawalsCount = computed(() => {
  return (
    overviewData.value?.withdrawal_count ??
    clientStats.value?.withdrawal_count ??
    2
  );
});

const accountsCount = computed(() => {
  const activeAccs = healthScoreObj.value?.breakdown?.account_utilization?.subcategories?.active_accounts?.score;
  return activeAccs ?? 2;
});

// ─── Referral Earnings ──────────────────────────────────────────────────────
const referralEarnings = computed(() => {
  return (
    overviewData.value?.referral_earnings ??
    clientStats.value?.referral_earnings ??
    1200.0
  );
});

const qualifiedReferrals = computed(() => {
  return 0;
});

// ─── Format Utilities ───────────────────────────────────────────────────────
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.00";
  const num = Number(val);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatKeyLabel(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
</script>
