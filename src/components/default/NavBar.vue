<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  LineChart,
  ListTree,
  Trophy,
  GitPullRequestArrow,
  Wallet,
  Coins,
  TrendingUp,
  DollarSign,
  CreditCard,
  Handshake,
  RefreshCcw,
  Settings,
  Tickets,
  ChevronLeft,
  ChevronRight,
  Mail,
  Cpu,
  ClipboardList,
  ShieldCheck
} from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile/profile'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import Tooltip from '@/components/common/Tooltip.vue'
import { navItems } from '@/config/navItems'

const store = useProfileStore()
const myPermissionsStore = useMyPermissionsStore()

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'toggle-collapse'])

const route = useRoute()

// ✅ Filter navigation items dynamically based on user permission codes
const filteredNavItems = computed(() => {
  return navItems.filter((item) => {
    if (item.permission) {
      return myPermissionsStore.hasPermission(item.permission)
    }
    return true
  })
})

// ✅ Active Route Check
const isActive = (path) => {
  if (route.path === path) return true
  return route.path.startsWith(path + '/')
}
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
    class="fixed top-0 left-0 z-40 h-full
           bg-navbar text-white border-r border-white/10
           flex flex-col
           transition-all duration-300 ease-in-out
           -translate-x-full md:translate-x-0"
    :class="[
      { 'translate-x-0': isOpen },
      isCollapsed ? 'w-[80px]' : 'w-[240px]'
    ]"
  >
    <!-- Header -->
    <div class="h-[60px] flex items-center justify-between px-4 border-b border-white/10">
      <div v-if="!isCollapsed" class="flex items-center gap-2.5">
        <div class="w-48 h-28 flex items-center justify-center">
         <img src="/panther-logo.svg" alt="Logo">
        </div>
      </div>
      <div v-else class="flex items-center justify-center w-full">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center">
         <img src="/panther-fav.svg" alt="Logo">
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
      <Tooltip
        v-for="item in filteredNavItems"
        :key="item.to"
        :text="item.label"
        position="right"
        :disabled="!isCollapsed"
        :block="true"
      >
        <RouterLink
          :to="item.to"
          @click="$emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                 transition-all duration-200 group"
          :class="[
            isActive(item.to)
              ? 'bg-primary text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10',
            isCollapsed ? 'justify-center' : ''
          ]"
        >
          <component
            :is="item.icon"
            class="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0"
          />
          <span v-if="!isCollapsed">{{ item.label }}</span>

          <!-- Active dot -->
          <span
            v-if="isActive(item.to) && !isCollapsed"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-white"
          />
        </RouterLink>
      </Tooltip>
    </nav>

    <!-- Footer -->
    <div class="border-t border-white/10">
      <!-- User Info -->
      <div class="p-4">
        <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'gap-3'">
          <div class="flex items-center min-w-0" :class="isCollapsed ? 'hidden' : 'gap-3'">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs font-bold">{{ store.user?.name?.charAt(0).toUpperCase() || 'S'}}</span>
            </div>
            <div class="min-w-0">
              <p class="text-white text-xs font-semibold truncate">{{ store.user?.name }}</p>
              <p class="text-white text-[11px] capitalize truncate">{{ store.user?.role }}</p>
            </div>
          </div>

          <Tooltip
            v-if="isCollapsed"
            text="Expand"
            position="right"
          >
            <button
              @click="emit('toggle-collapse')"
              class="flex items-center justify-center w-10 h-10 rounded-lg
                     text-white/70 hover:text-white hover:bg-white/10
                     transition-all duration-200"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </Tooltip>
          <button
            v-else
            @click="emit('toggle-collapse')"
            class="flex items-center justify-center w-10 h-10 rounded-lg
                   text-white/70 hover:text-white hover:bg-white/10
                   transition-all duration-200 ml-auto"
            title="Collapse"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
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
