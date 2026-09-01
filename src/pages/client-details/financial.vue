<template>
  <div class="bg-background space-y-5 pt-4 pb-8 overflow-y-auto no-scrollbar">
    <!-- ─── 1. FINANCIAL SUMMARY HEADER & DATE FILTER ────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-primary-text">
          Financial Summary
        </h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Overview of client's financial activity across all accounts.
        </p>
      </div>

      <!-- Date Range Filter -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <div
          class="flex items-center gap-2 bg-card-background border border-primary-border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-text shadow-2xs"
        >
          <Calendar class="w-3.5 h-3.5 text-secondary-text" />
          <span>{{ selectedDateRangeLabel }}</span>
        </div>

        <button
          type="button"
          @click="toggleFilterDropdown"
          class="border border-primary-border bg-card-background hover:bg-background rounded-xl p-2 text-secondary-text hover:text-primary-text transition-colors cursor-pointer shadow-2xs"
          title="Filter Options"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- ─── 2. TOP 5 KPI METRIC CARDS ────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- 1. Total Deposit -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-all hover:border-primary/30 shadow-xs"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total Deposit
          </p>
          <p class="text-xl sm:text-2xl font-extrabold text-primary-green truncate mt-1">
            ${{ formatCurrency(totalDeposits) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5">
            {{ depositCount }} Deposits
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center shrink-0 text-primary-green">
          <ArrowDownLeft class="w-5 h-5" />
        </div>
      </div>

      <!-- 2. Total Withdrawal -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-all hover:border-primary/30 shadow-xs"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total Withdrawal
          </p>
          <p class="text-xl sm:text-2xl font-extrabold text-primary-red truncate mt-1">
            ${{ formatCurrency(totalWithdrawals) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5">
            {{ withdrawalCount }} Withdrawals
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-primary-red/10 flex items-center justify-center shrink-0 text-primary-red">
          <ArrowUpRight class="w-5 h-5" />
        </div>
      </div>

      <!-- 3. Total Equity -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-all hover:border-primary/30 shadow-xs"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total Equity
          </p>
          <p class="text-xl sm:text-2xl font-extrabold text-primary-blue truncate mt-1">
            ${{ formatCurrency(totalEquity) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5">
            All Accounts
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-primary-blue/10 flex items-center justify-center shrink-0 text-primary-blue">
          <BarChart2 class="w-5 h-5" />
        </div>
      </div>

      <!-- 4. Total PnL -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-all hover:border-primary/30 shadow-xs"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total PnL
          </p>
          <p
            class="text-xl sm:text-2xl font-extrabold truncate mt-1"
            :class="totalPnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
          >
            ${{ formatCurrency(totalPnl) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5">
            Realized + Unrealized
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center shrink-0 text-primary-green">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>

      <!-- 5. Referral Earnings -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-all hover:border-primary/30 shadow-xs"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Referral Earnings
          </p>
          <p class="text-xl sm:text-2xl font-extrabold text-accent truncate mt-1">
            ${{ formatCurrency(referralEarnings) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5">
            Total Earnings
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
          <Users class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- ─── 3. MIDDLE SECTION: 2 TREND CHARTS ────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Chart 1: Deposit vs Withdrawal Trend -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/30"
      >
        <!-- Chart Header -->
        <div class="flex items-start justify-between gap-3 pb-3">
          <div>
            <h4 class="text-sm sm:text-base font-bold text-primary-text">
              Deposit vs Withdrawal Trend
            </h4>
            <p class="text-xs text-secondary-text mt-0.5">
              Track client's cash flow over time.
            </p>
          </div>

          <!-- Period Dropdown -->
          <div class="relative">
            <select
              v-model="depositTrendPeriod"
              class="appearance-none bg-card-background border border-primary-border rounded-xl pl-3 pr-8 py-1 text-xs font-semibold text-primary-text outline-none cursor-pointer hover:bg-background"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 text-secondary-text absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Chart Legend -->
        <div class="flex items-center gap-4 text-xs font-semibold pt-1 pb-3">
          <div class="flex items-center gap-1.5 text-secondary-text">
            <span class="w-3 h-3 rounded-xs bg-primary-green" />
            <span>Deposits</span>
          </div>
          <div class="flex items-center gap-1.5 text-secondary-text">
            <span class="w-3 h-3 rounded-xs bg-primary-red" />
            <span>Withdrawals</span>
          </div>
        </div>

        <!-- Bar Chart Container -->
        <div class="h-60 w-full pt-2">
          <Bar :data="depositWithdrawalChartData" :options="depositWithdrawalChartOptions" />
        </div>
      </div>

      <!-- Chart 2: Account Equity Trend -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/30"
      >
        <!-- Chart Header -->
        <div class="flex items-start justify-between gap-3 pb-3">
          <div>
            <h4 class="text-sm sm:text-base font-bold text-primary-text">
              Account Equity Trend
            </h4>
            <p class="text-xs text-secondary-text mt-0.5">
              Track total equity trend across all trading accounts.
            </p>
          </div>

          <!-- Period Dropdown -->
          <div class="relative">
            <select
              v-model="equityTrendPeriod"
              class="appearance-none bg-card-background border border-primary-border rounded-xl pl-3 pr-8 py-1 text-xs font-semibold text-primary-text outline-none cursor-pointer hover:bg-background"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 text-secondary-text absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Line Chart Container -->
        <div class="h-68 w-full pt-4">
          <Line :data="equityChartData" :options="equityChartOptions" />
        </div>
      </div>
    </div>

    <!-- ─── 4. BOTTOM SECTION: 2 TABLES ──────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Table 1: Account Overview -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/30"
      >
        <div>
          <!-- Header -->
          <div class="pb-4 border-b border-primary-border/60">
            <h4 class="text-sm sm:text-base font-bold text-primary-text">
              Account Overview
            </h4>
            <p class="text-xs text-secondary-text mt-0.5">
              Summary of all trading accounts.
            </p>
          </div>

          <!-- Accounts Table -->
          <div class="overflow-x-auto no-scrollbar pt-2">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-primary-border/80 text-[11px] font-bold text-secondary-text">
                  <th class="py-2.5 px-2">Account Number</th>
                  <th class="py-2.5 px-2">Account Type</th>
                  <th class="py-2.5 px-2">Currency</th>
                  <th class="py-2.5 px-2">Balance</th>
                  <th class="py-2.5 px-2">Equity</th>
                  <th class="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-border/50">
                <tr
                  v-for="acc in tradingAccounts"
                  :key="acc.account_number"
                  class="hover:bg-background/40 transition-colors"
                >
                  <td class="py-3 px-2 font-bold text-primary-text tabular-nums">
                    {{ acc.account_number }}
                  </td>
                  <td class="py-3 px-2">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md capitalize"
                      :class="getAccountTypeBadgeClass(acc.type)"
                    >
                      {{ acc.type }}
                    </span>
                  </td>
                  <td class="py-3 px-2 font-medium text-secondary-text">
                    {{ acc.currency }}
                  </td>
                  <td class="py-3 px-2 font-bold text-primary-text tabular-nums">
                    ${{ formatCurrency(acc.balance) }}
                  </td>
                  <td class="py-3 px-2 font-bold text-primary-text tabular-nums">
                    ${{ formatCurrency(acc.equity) }}
                  </td>
                  <td class="py-3 px-2 text-right">
                    <span class="text-xs font-semibold text-primary-green capitalize">
                      {{ acc.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer Action -->
        <div class="pt-4 border-t border-primary-border/60 mt-4">
          <button
            type="button"
            @click="viewAllAccounts"
            class="w-full sm:w-auto border border-primary-border rounded-xl px-4 py-2 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye class="w-3.5 h-3.5" />
            View All Accounts
          </button>
        </div>
      </div>

      <!-- Table 2: Recent Transactions -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/30"
      >
        <div>
          <!-- Header -->
          <div class="pb-4 border-b border-primary-border/60">
            <h4 class="text-sm sm:text-base font-bold text-primary-text">
              Recent Transactions
            </h4>
            <p class="text-xs text-secondary-text mt-0.5">
              Latest financial transactions.
            </p>
          </div>

          <!-- Transactions Table -->
          <div class="overflow-x-auto no-scrollbar pt-2">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-primary-border/80 text-[11px] font-bold text-secondary-text">
                  <th class="py-2.5 px-2">Date &amp; Time</th>
                  <th class="py-2.5 px-2">Type</th>
                  <th class="py-2.5 px-2">Amount</th>
                  <th class="py-2.5 px-2">Payment Method</th>
                  <th class="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-border/50">
                <tr
                  v-for="(tx, idx) in recentTransactions"
                  :key="idx"
                  class="hover:bg-background/40 transition-colors"
                >
                  <td class="py-3 px-2 text-secondary-text font-medium whitespace-nowrap">
                    {{ tx.datetime }}
                  </td>
                  <td class="py-3 px-2">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      :class="tx.type === 'Deposit' ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
                    >
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="py-3 px-2 font-bold text-primary-text tabular-nums whitespace-nowrap">
                    ${{ formatCurrency(tx.amount) }}
                  </td>
                  <td class="py-3 px-2 font-medium text-secondary-text">
                    {{ tx.method }}
                  </td>
                  <td class="py-3 px-2 text-right">
                    <span class="bg-primary-green/10 text-primary-green text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {{ tx.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer Action -->
        <div class="pt-4 border-t border-primary-border/60 mt-4">
          <button
            type="button"
            @click="viewAllTransactions"
            class="w-full sm:w-auto border border-primary-border rounded-xl px-4 py-2 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye class="w-3.5 h-3.5" />
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import {
  Calendar,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  DollarSign,
  Users,
  Eye,
  ChevronDown,
} from "lucide-vue-next";

// Chart.js imports
import { Bar, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const router = useRouter();
const route = useRoute();
const clientDepthStore = useClientDepthStore();
const snackbar = useSnackbarStore();

// ─── Filter State ─────────────────────────────────────────────────────────────
const selectedDateRangeLabel = ref("01 Aug 2026 - 31 Aug 2026");
const depositTrendPeriod = ref("6M");
const equityTrendPeriod = ref("6M");

const toggleFilterDropdown = () => {
  snackbar.show("Date range filter selected: 01 Aug 2026 - 31 Aug 2026", "info");
};

// ─── Overview Data from Store or Defaults ─────────────────────────────────────
const overviewData = computed(() => clientDepthStore.overviewData);
const clientStats = computed(() => overviewData.value?.health_score?.client_stats || {});

const totalDeposits = computed(() => {
  return overviewData.value?.total_deposit ?? clientStats.value?.total_deposit ?? 15000.0;
});

const depositCount = computed(() => {
  return overviewData.value?.deposit_count ?? clientStats.value?.deposit_count ?? 5;
});

const totalWithdrawals = computed(() => {
  return overviewData.value?.total_withdrawal ?? clientStats.value?.total_withdrawal ?? 2500.0;
});

const withdrawalCount = computed(() => {
  return overviewData.value?.withdrawal_count ?? clientStats.value?.withdrawal_count ?? 2;
});

const totalEquity = computed(() => {
  return overviewData.value?.total_equity ?? clientStats.value?.total_equity ?? 18250.5;
});

const totalPnl = computed(() => {
  return overviewData.value?.total_pnl ?? clientStats.value?.total_pnl ?? 5750.5;
});

const referralEarnings = computed(() => {
  return overviewData.value?.referral_earnings ?? clientStats.value?.referral_earnings ?? 1200.0;
});

// ─── Deposit vs Withdrawal Bar Chart Config ───────────────────────────────────
const depositWithdrawalChartData = computed(() => ({
  labels: ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"],
  datasets: [
    {
      label: "Deposits",
      data: [4200, 4300, 4300, 4200, 6200, 6100],
      backgroundColor: "#22c55e",
      borderRadius: 4,
      barThickness: 10,
      maxBarThickness: 14,
    },
    {
      label: "Withdrawals",
      data: [2000, 2000, 1300, 1300, 2200, 2100],
      backgroundColor: "#ef4444",
      borderRadius: 4,
      barThickness: 10,
      maxBarThickness: 14,
    },
  ],
}));

const depositWithdrawalChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context) => ` ${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
      },
    },
    y: {
      beginAtZero: true,
      max: 8000,
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        stepSize: 2000,
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
        callback: (value) => (value === 0 ? "$0" : `$${value / 1000}K`),
      },
    },
  },
};

// ─── Account Equity Line Chart Config ─────────────────────────────────────────
const equityChartData = computed(() => ({
  labels: ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"],
  datasets: [
    {
      label: "Account Equity",
      data: [7500, 11500, 14000, 15500, 18250, 17800],
      borderColor: "#3b82f6",
      borderWidth: 2.5,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
        return gradient;
      },
      fill: true,
      tension: 0.35,
      pointBackgroundColor: "#3b82f6",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}));

const equityChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context) => ` Total Equity: $${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
      },
    },
    y: {
      beginAtZero: true,
      max: 20000,
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        stepSize: 5000,
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
        callback: (value) => (value === 0 ? "$0" : `$${value / 1000}K`),
      },
    },
  },
};

// ─── Account Overview Mock List ───────────────────────────────────────────────
const tradingAccounts = ref([
  {
    account_number: "10012345",
    type: "Real",
    currency: "USD",
    balance: 9250.5,
    equity: 10120.3,
    status: "Active",
  },
  {
    account_number: "10012346",
    type: "Real",
    currency: "USD",
    balance: 5500.0,
    equity: 6250.2,
    status: "Active",
  },
  {
    account_number: "10012347",
    type: "Demo",
    currency: "USD",
    balance: 1000.0,
    equity: 1000.0,
    status: "Active",
  },
  {
    account_number: "10012348",
    type: "PAMM",
    currency: "USD",
    balance: 2000.0,
    equity: 2880.0,
    status: "Active",
  },
]);

const getAccountTypeBadgeClass = (type) => {
  if (type === "Real") return "bg-primary-green/10 text-primary-green";
  if (type === "Demo") return "bg-primary-blue/10 text-primary-blue";
  if (type === "PAMM") return "bg-primary-yellow/10 text-primary-yellow";
  return "bg-secondary-text/10 text-secondary-text";
};

const viewAllAccounts = () => {
  router.push(`/trading-accounts`);
};

// ─── Recent Transactions Mock List ────────────────────────────────────────────
const recentTransactions = ref([
  {
    datetime: "29 Aug 2026, 10:45 AM",
    type: "Deposit",
    amount: 3000.0,
    method: "Bank Transfer",
    status: "Completed",
  },
  {
    datetime: "22 Aug 2026, 02:30 PM",
    type: "Deposit",
    amount: 2500.0,
    method: "Crypto (USDT)",
    status: "Completed",
  },
  {
    datetime: "18 Aug 2026, 11:15 AM",
    type: "Withdrawal",
    amount: 1000.0,
    method: "Bank Transfer",
    status: "Completed",
  },
  {
    datetime: "10 Aug 2026, 09:20 AM",
    type: "Deposit",
    amount: 4000.0,
    method: "Credit Card",
    status: "Completed",
  },
  {
    datetime: "05 Aug 2026, 04:40 PM",
    type: "Withdrawal",
    amount: 1500.0,
    method: "Crypto (USDT)",
    status: "Completed",
  },
]);

const viewAllTransactions = () => {
  snackbar.show("Opening all client transactions...", "info");
};

// ─── Format Utilities ─────────────────────────────────────────────────────────
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.00";
  const num = Number(val);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>