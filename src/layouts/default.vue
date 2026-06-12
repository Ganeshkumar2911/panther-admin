<script setup>
import { ref, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile/profile'
import NavBar from '@/components/default/NavBar.vue'
import TopBar from '@/components/default/TopBar.vue'
import { useTickerStore } from '@/stores/ws/ticker'

const SIDEBAR_COLLAPSED_KEY = 'panther_sidebar_collapsed'
const storedSidebarCollapsed =
  typeof window !== 'undefined' ? localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true' : false

const sidebarOpen = ref(false)
const isSidebarCollapsed = ref(storedSidebarCollapsed)
const profileStore = useProfileStore()
// const kycStore = useKycStore()
const tickerStore = useTickerStore()

const setSidebarCollapsed = (value) => {
  isSidebarCollapsed.value = value
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
}

const toggleSidebarCollapsed = () => {
  setSidebarCollapsed(!isSidebarCollapsed.value)
}

onMounted(async () => {
  await tickerStore.startWebSocket()

  tickerStore.updateTickerList(['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'XAUUSD'])

  profileStore.fetchUserProfile()
})
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-background">

    <!-- NavBar Sidebar -->
    <NavBar
      :is-open="sidebarOpen"
      :is-collapsed="isSidebarCollapsed"
      @close="sidebarOpen = false"
      @toggle-collapse="toggleSidebarCollapsed"
    />

    <!-- Main column — offset by sidebar width on md+ -->
    <div
      class="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
      :class="isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[240px]'"
    >

      <!-- Top Bar -->
      <TopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Router View Area -->
      <main class="flex-1 overflow-y-auto no-scrollbar bg-background p-4 lg:p-6">
        <router-view />
      </main>

    </div>
  </div>
</template>
