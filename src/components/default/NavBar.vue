<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  User,
  Users,
  Wallet,
  Trophy,
  GitPullRequestArrow,
  ListTree,
  RefreshCcw,
  Ticket,
  CreditCard,
  TrendingUp,
  DollarSign,
} from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile/profile'

const store = useProfileStore()

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const route = useRoute()

// ✅ Fetch profile on mount
// onMounted(() => {
//   if (!store.user) {
//     store.fetchUserProfile()
//   }
// })

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    to: '/clients',
    icon: Users,
  },
  {
    label: 'Trading Accounts',
    to: '/trading-accounts',
    icon: User,
  },
  {
    label: 'Fund Manager',
    to: '/fm-leaderboard',
    icon: Trophy,
  },
  {
    label: 'IB Network',
    to: '/ib-tree',
    icon: ListTree,
  },
  {
    label: 'FM Requests',
    to: '/fm-request',
    icon: GitPullRequestArrow,
  },
  {
    label: 'Client Wallet',
    to: '/client-wallet',
    icon: CreditCard,
  },
  {
    label: 'My Wallet',
    to: '/my-wallet',
    icon: Wallet,
  },
  {
    label: 'FM Wallet',
    to: '/fm-wallet',
    icon: TrendingUp,
  },
  {
    label: 'IB Wallet',
    to: '/ib-wallet',
    icon: DollarSign,
  },
  {
    label: 'Settlements',
    to: '/settlements',
    icon: RefreshCcw,
  },
  {
    label: 'Tickets',
    to: '/tickets',
    icon: Ticket,
  }
]

// ✅ Active Route Check
const isActive = (path) => route.path.startsWith(path)
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 z-40 h-full w-[240px]
           bg-navbar text-white border-r border-white/10
           flex flex-col
           transition-transform duration-300 ease-in-out
           -translate-x-full md:translate-x-0"
    :class="{ 'translate-x-0': isOpen }"
  >
    <!-- Header -->
    <div class="h-[60px] flex items-center justify-between px-4 border-b border-white/10">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center">
         <img class="rounded-full" src="/logo.png" alt="Logo">
        </div>
        <span class="text-white font-semibold text-sm">
          Welcome
        </span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="$emit('close')"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200 group"
        :class="
          isActive(item.to)
            ? 'bg-primary text-white'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        "
      >
        <component
          :is="item.icon"
          class="w-4 h-4 transition-transform group-hover:scale-110"
        />
        <span>{{ item.label }}</span>

        <!-- Active dot -->
        <span
          v-if="isActive(item.to)"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-white"
        />
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-2">
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span class="text-black text-xs font-bold">{{ store.user?.name?.charAt(0).toUpperCase() }}</span>
        </div>
        <div>
          <p class="text-white text-xs font-semibold">{{ store.user?.name }}</p>
          <p class="text-white/60 text-[11px]">{{ store.user?.role }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
