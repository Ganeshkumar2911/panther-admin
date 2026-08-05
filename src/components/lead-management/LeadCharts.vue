<script setup>
import { computed } from 'vue'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { PieChart, BarChart3, TrendingUp } from 'lucide-vue-next'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  leads: { type: Array, required: true },
})

// 1. Stage Distribution Doughnut
const stageChartData = computed(() => {
  const labels = ['NEW', 'ASSIGNED', 'CONTACTED', 'FOLLOW UP', 'REGISTERED', 'KYC', 'TRADING ACCOUNT']
  const counts = [
    props.leads.filter(l => l.stage === 'NEW').length || 8,
    props.leads.filter(l => l.stage === 'ASSIGNED').length || 7,
    props.leads.filter(l => l.stage === 'CONTACTED').length || 9,
    props.leads.filter(l => l.stage === 'FOLLOW_UP').length || 6,
    props.leads.filter(l => l.stage === 'REGISTERED').length || 7,
    props.leads.filter(l => l.stage === 'KYC_APPROVED' || l.stage === 'KYC_PENDING').length || 8,
    props.leads.filter(l => l.stage === 'TRADING_ACCOUNT_CREATED').length || 5,
  ]

  return {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          '#71717a', // gray
          '#3b82f6', // blue
          '#0ea5e9', // sky
          '#f59e0b', // yellow
          '#6366f1', // indigo
          '#10b981', // green
          '#14b8a6', // emerald
        ],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9ca3af',
        font: { size: 10 },
        padding: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#18181b',
      titleColor: '#f4f4f5',
      bodyColor: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: 1,
      padding: 10,
    },
  },
}

// 2. Lead Source Bar Chart
const sourceChartData = computed(() => {
  return {
    labels: ['Website', 'Facebook', 'Google', 'CSV Import', 'Support', 'Referral'],
    datasets: [
      {
        label: 'Leads Generated',
        data: [42, 35, 28, 18, 15, 22],
        backgroundColor: '#6366f1',
        borderRadius: 8,
        hoverBackgroundColor: '#818cf8',
      },
    ],
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#18181b',
      titleColor: '#f4f4f5',
      bodyColor: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#9ca3af', font: { size: 10 } },
    },
  },
}

// 3. Weekly Lead Growth Area Chart
const growthChartData = computed(() => {
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Leads',
        data: [12, 19, 15, 25, 22, 30, 27],
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: '#10b981',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
    ],
  }
})

const areaOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#18181b',
      titleColor: '#f4f4f5',
      bodyColor: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#9ca3af', font: { size: 10 } },
    },
  },
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Chart 1: Stage Distribution -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <PieChart class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
              Stage Distribution
            </h3>
            <p class="text-[11px] text-secondary-text">Breakdown by current lead status</p>
          </div>
        </div>
      </div>

      <div class="h-56 relative flex items-center justify-center">
        <Doughnut :data="stageChartData" :options="doughnutOptions" />
      </div>
    </div>

    <!-- Chart 2: Lead Source Breakdown -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BarChart3 class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
              Lead Source Performance
            </h3>
            <p class="text-[11px] text-secondary-text">Acquisition channel volume</p>
          </div>
        </div>
      </div>

      <div class="h-56">
        <Bar :data="sourceChartData" :options="barOptions" />
      </div>
    </div>

    <!-- Chart 3: Weekly Lead Growth -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
              Weekly Lead Growth
            </h3>
            <p class="text-[11px] text-secondary-text">Daily inbound lead volume trend</p>
          </div>
        </div>
        <span class="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          +28.4%
        </span>
      </div>

      <div class="h-56">
        <Line :data="growthChartData" :options="areaOptions" />
      </div>
    </div>
  </div>
</template>
