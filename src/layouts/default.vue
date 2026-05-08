<script setup>
import { ref, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile/profile'
import NavBar from '@/components/default/NavBar.vue'
import TopBar from '@/components/default/TopBar.vue'

const sidebarOpen = ref(false)
const profileStore = useProfileStore()
// const kycStore = useKycStore()
// const tickerStore = useTickerStore()
onMounted(() => {
  profileStore.fetchUserProfile()
})
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-background">

    <!-- NavBar Sidebar -->
    <NavBar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main column — offset by sidebar width on md+ -->
    <div class="flex flex-1 flex-col overflow-hidden md:ml-[240px]">

      <!-- Top Bar -->
      <TopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Router View Area -->
      <main class="flex-1 overflow-y-auto no-scrollbar bg-background p-4 lg:p-6">
        <router-view />
      </main>

    </div>
  </div>
</template>