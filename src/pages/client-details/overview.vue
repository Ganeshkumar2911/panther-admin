<template>
  <div
    class="bg-background space-y-3 sm:space-y-4 overflow-y-auto pt-4 px-3 sm:px-0"
  >
    <!-- Top summary row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5"
      >
        <p
          class="text-[11px] sm:text-xs font-medium tracking-wide text-secondary-text uppercase"
        >
          Total Deposits
        </p>
        <p
          class="text-xl sm:text-2xl font-bold text-primary-text mt-2 truncate"
        >
          ${{ formatNumber(totalDeposits) }}
        </p>
      </div>

      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5"
      >
        <p
          class="text-[11px] sm:text-xs font-medium tracking-wide text-secondary-text uppercase"
        >
          Total Equity
        </p>
        <p
          class="text-xl sm:text-2xl font-bold text-primary-text mt-2 truncate"
        >
          ${{ formatNumber(totalEquity) }}
        </p>
      </div>

      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5"
      >
        <p
          class="text-[11px] sm:text-xs font-medium tracking-wide text-secondary-text uppercase"
        >
          Net P&amp;L
        </p>
        <p
          class="text-xl sm:text-2xl font-bold text-primary-green mt-2 truncate"
        >
          +${{ formatDecimal(netPnl) }}
        </p>
        <p class="flex items-center gap-1 text-xs text-primary-green mt-1">
          <TrendingUp class="w-3.5 h-3.5 shrink-0" />
          Profit
        </p>
      </div>
    </div>

    <!-- Client Health Score -->
    <div
      class="bg-background border border-primary-border rounded-2xl p-4 sm:p-6"
    >
      <div
        class="flex items-center justify-between pb-3 sm:pb-4 border-b border-primary-border gap-2"
      >
        <div class="flex items-center gap-2 min-w-0">
          <Heart class="w-4 h-4 text-primary-red fill-primary-red shrink-0" />
          <h3
            class="font-semibold text-primary-text text-sm sm:text-base truncate"
          >
            Client Health Score
          </h3>
        </div>
        <div
          class="flex items-center gap-1 text-xs sm:text-sm text-secondary-text shrink-0"
        >
          <Star class="w-4 h-4" />
          {{ healthLabel }}
        </div>
      </div>

      <div
        class="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 pt-6"
      >
        <!-- Ring -->
        <div class="flex justify-center shrink-0">
          <div class="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36">
            <svg
              viewBox="0 0 120 120"
              class="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 -rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke-width="10"
                class="stroke-primary-border"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke-width="10"
                stroke-linecap="round"
                class="stroke-primary-green"
                :stroke-dasharray="ringCircumference"
                :stroke-dashoffset="ringOffset"
              />
            </svg>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span class="text-2xl sm:text-3xl font-bold text-primary-text">{{
                healthScore
              }}</span>
              <span class="text-xs text-secondary-text">/100</span>
            </div>
          </div>
        </div>

        <!-- Bars -->
        <div class="flex-1 w-full space-y-4 sm:space-y-5">
          <div v-for="metric in metrics" :key="metric.label">
            <div
              class="flex items-center justify-between text-xs sm:text-sm mb-2"
            >
              <span class="text-primary-text">{{ metric.label }}</span>
              <span class="text-secondary-text"
                >{{ metric.value }}/{{ metric.max }}</span
              >
            </div>
            <div
              class="h-1.5 w-full rounded-full bg-primary-border overflow-hidden"
            >
              <div
                class="h-full rounded-full transition-all"
                :class="metric.barClass"
                :style="{ width: (metric.value / metric.max) * 100 + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric chip row -->
    <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-green/10 flex items-center justify-center shrink-0"
        >
          <DollarSign class="w-4 h-4 sm:w-5 sm:h-5 text-primary-green" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-secondary-text">Lifetime Value</p>
          <p class="text-base sm:text-lg font-bold text-primary-green truncate">
            ${{ formatNumber(totalDeposits) }}
          </p>
          <p class="text-xs text-secondary-text truncate">Total deposits</p>
        </div>
      </div>

      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-blue/10 flex items-center justify-center shrink-0"
        >
          <Zap class="w-4 h-4 sm:w-5 sm:h-5 text-primary-blue" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-secondary-text">Engagement Rate</p>
          <p class="text-base sm:text-lg font-bold text-primary-text truncate">
            {{ engagementRate }}
          </p>
          <p class="text-xs text-secondary-text truncate">
            Activities per week
          </p>
        </div>
      </div>

      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-yellow/10 flex items-center justify-center shrink-0"
        >
          <Shield class="w-4 h-4 sm:w-5 sm:h-5 text-primary-yellow" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-secondary-text">Risk Level</p>
          <p class="text-base sm:text-lg font-bold text-primary-text truncate">
            {{ riskLevel || "—" }}
          </p>
          <p class="text-xs text-secondary-text truncate">
            Based on risk rating
          </p>
        </div>
      </div>

      <div
        class="bg-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"
        >
          <Target class="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-secondary-text">Total Equity</p>
          <p class="text-base sm:text-lg font-bold text-primary-text truncate">
            ${{ formatNumber(totalEquity) }}
          </p>
          <p class="text-xs text-secondary-text truncate">
            Across all accounts
          </p>
        </div>
      </div>
    </div>

    <!-- Stat strip -->
    <div
      class="bg-background border border-primary-border rounded-2xl p-4 sm:p-6"
    >
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
        <div class="flex flex-col items-center gap-2">
          <Calendar class="w-4 h-4 text-secondary-text" />
          <span class="text-xl sm:text-2xl font-bold text-primary-text">{{
            daysActive
          }}</span>
          <span class="text-[11px] sm:text-xs text-secondary-text"
            >Days Active</span
          >
        </div>
        <div class="flex flex-col items-center gap-2">
          <TrendingUp class="w-4 h-4 text-primary-green" />
          <span class="text-xl sm:text-2xl font-bold text-primary-text">{{
            deposits
          }}</span>
          <span class="text-[11px] sm:text-xs text-secondary-text"
            >Deposits</span
          >
        </div>
        <div class="flex flex-col items-center gap-2">
          <TrendingDown class="w-4 h-4 text-primary-red" />
          <span class="text-xl sm:text-2xl font-bold text-primary-text">{{
            withdrawals
          }}</span>
          <span class="text-[11px] sm:text-xs text-secondary-text"
            >Withdrawals</span
          >
        </div>
        <div class="flex flex-col items-center gap-2">
          <Wallet class="w-4 h-4 text-secondary-text" />
          <span class="text-xl sm:text-2xl font-bold text-primary-text">{{
            accounts
          }}</span>
          <span class="text-[11px] sm:text-xs text-secondary-text"
            >Accounts</span
          >
        </div>
      </div>
    </div>

    <!-- Referral card -->
    <div
      class="bg-background border border-primary-border rounded-2xl p-4 sm:p-6 w-full max-w-md"
    >
      <div class="flex items-start gap-3 sm:gap-4">
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-green/10 flex items-center justify-center shrink-0"
        >
          <DollarSign class="w-4 h-4 sm:w-5 sm:h-5 text-primary-green" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-secondary-text">Referral Earnings</p>
          <p class="text-lg sm:text-xl font-bold text-primary-green mt-1">
            ${{ referralEarnings }}
          </p>
          <p class="flex items-center gap-1 text-xs text-secondary-text mt-1">
            <Users class="w-3.5 h-3.5 shrink-0" />
            {{ qualifiedReferrals }} qualified referrals
          </p>
          <button
            type="button"
            class="mt-4 w-full sm:w-auto text-sm font-medium text-primary-text border border-primary-border rounded-lg px-4 py-2 hover:bg-primary-border/30 transition-colors"
          >
            View All Referrals
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
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
} from "lucide-vue-next";

// ---- Replace these with real data (props / store / API) ----
const totalDeposits = 141184;
const totalEquity = 347529;
const netPnl = 84772.08;

const healthScore = 70;
const riskLevel = "";
const engagementRate = "0.1";

const daysActive = 98;
const deposits = 10;
const withdrawals = 0;
const accounts = 10;

const referralEarnings = 0;
const qualifiedReferrals = 0;
// ---------------------------------------------------------------

const healthLabel = computed(() => {
  if (healthScore >= 80) return "Excellent";
  if (healthScore >= 60) return "Good";
  if (healthScore >= 40) return "Fair";
  return "Needs Attention";
});

const metrics = [
  {
    label: "Deposit Activity",
    value: 0,
    max: 30,
    barClass: "bg-primary-border",
  },
  { label: "Account Usage", value: 25, max: 25, barClass: "bg-primary-blue" },
  { label: "Engagement", value: 25, max: 25, barClass: "bg-primary-yellow" },
  { label: "Verification", value: 20, max: 20, barClass: "bg-accent" },
];

const RADIUS = 52;
const ringCircumference = 2 * Math.PI * RADIUS;
const ringOffset = computed(() => ringCircumference * (1 - healthScore / 100));

function formatNumber(n) {
  return Math.round(n).toLocaleString("en-US");
}
function formatDecimal(n) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>
