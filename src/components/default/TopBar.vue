<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  Bell,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Check,
} from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile/profile'
import { useNotificationsStore } from '@/stores/notifications/notifications'
import ProfileDialog from '@/components/common/profileDialog.vue'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()
const notificationsStore = useNotificationsStore()

const isDark = ref(false)
const profileDialogOpen = ref(false)
const notifPopoverOpen = ref(false)
const popoverRef = ref(null)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  notificationsStore.fetchMyNotifications()
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  if (popoverRef.value && !popoverRef.value.contains(event.target)) {
    notifPopoverOpen.value = false
  }
}

function toggleDark() {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function toggleNotifPopover(e) {
  e.stopPropagation()
  notifPopoverOpen.value = !notifPopoverOpen.value
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Just now'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getPriorityBadge(priority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
  }
}

function openProfileDialog() {
  profileDialogOpen.value = true
}

function closeProfileDialog() {
  profileDialogOpen.value = false
}
</script>

<template>
  <header
    class="h-[60px] flex items-center justify-between
           px-4 lg:px-6
           bg-background border-b border-primary-border relative"
  >
    <!-- Left -->
    <div class="flex items-center gap-3">
      <!-- Hamburger -->
      <button
        @click="$emit('toggle-sidebar')"
        class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg
               text-secondary-text hover:bg-primary-border"
      >
        <Menu class="w-4 h-4" />
      </button>

      <!-- Back -->
      <button
        v-if="route.meta.showBackButton"
        @click="router.back()"
        class="w-8 h-8 flex items-center justify-center rounded-lg
               text-secondary-text hover:bg-primary-border"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <div>
        <h1 class="text-primary-text text-sm font-semibold">
          {{ route.meta.title || 'Dashboard' }}
        </h1>
        <p class="text-secondary-text text-xs hidden sm:block">
          {{ route.meta.description || 'Welcome' }}
        </p>
      </div>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-2">
      <!-- Notification Bell Popover Button -->
      <div class="relative" ref="popoverRef">
        <button
          @click="toggleNotifPopover"
          class="w-8 h-8 flex items-center justify-center rounded-lg
                 text-secondary-text hover:bg-primary-border hover:cursor-pointer relative transition-colors"
          title="Notifications"
        >
          <Bell class="w-4 h-4" />
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center shadow-sm shadow-primary/40"
          >
            {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
          </span>
        </button>

        <!-- Notification Popover Dropdown -->
        <Transition name="fade-slide">
          <div
            v-if="notifPopoverOpen"
            class="absolute right-0 top-11 z-50 w-80 sm:w-96 bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <!-- Dropdown Header -->
            <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/60">
              <div class="flex items-center gap-2">
                <Bell class="w-4 h-4 text-primary" />
                <span class="text-xs font-bold text-primary-text uppercase tracking-wider">
                  Notifications
                </span>
                <span
                  v-if="notificationsStore.unreadCount > 0"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30"
                >
                  {{ notificationsStore.unreadCount }} New
                </span>
              </div>

              <button
                v-if="notificationsStore.unreadCount > 0"
                @click="notificationsStore.markAllAsRead"
                class="flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover font-medium transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck class="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            </div>

            <!-- Notification Items List -->
            <div class="max-h-80 overflow-y-auto divide-y divide-primary-border/60 no-scrollbar">
              <div
                v-if="notificationsStore.myNotifications.length === 0"
                class="py-8 text-center text-xs text-secondary-text"
              >
                No notifications found
              </div>

              <div
                v-for="item in notificationsStore.myNotifications.slice(0, 6)"
                :key="item.id"
                :class="[
                  'p-3.5 transition-colors flex items-start gap-3 relative group',
                  item.is_read ? 'hover:bg-background/50' : 'bg-primary/5 hover:bg-primary/10'
                ]"
              >
                <!-- Read indicator dot -->
                <div
                  :class="[
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    item.is_read ? 'bg-primary-border' : 'bg-primary shadow-sm shadow-primary/50'
                  ]"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <h4 class="text-xs font-bold text-primary-text truncate">
                      {{ item.title }}
                    </h4>
                    <span :class="['text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0', getPriorityBadge(item.priority)]">
                      {{ item.priority }}
                    </span>
                  </div>

                  <p class="text-[11px] text-secondary-text leading-relaxed line-clamp-2">
                    {{ item.message }}
                  </p>

                  <div class="flex items-center justify-between mt-2 pt-1 border-t border-primary-border/30 text-[10px] text-secondary-text">
                    <span>{{ formatTimeAgo(item.created_at) }}</span>

                    <div class="flex items-center gap-2">
                      <a
                        v-if="item.action_url"
                        :href="item.action_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-0.5 text-primary hover:underline font-medium"
                      >
                        <span>Open Link</span>
                        <ExternalLink class="w-2.5 h-2.5" />
                      </a>

                      <button
                        v-if="!item.is_read"
                        @click.stop="notificationsStore.markAsRead(item.id)"
                        class="text-xs text-secondary-text hover:text-primary flex items-center gap-0.5 cursor-pointer"
                        title="Mark as read"
                      >
                        <Check class="w-3 h-3" />
                        <span>Read</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer View All -->
            <div class="p-2.5 border-t border-primary-border bg-background/60 text-center">
              <button
                @click="router.push('/notifications'); notifPopoverOpen = false"
                class="w-full text-xs font-semibold text-primary hover:text-primary-hover py-1 transition-colors cursor-pointer"
              >
                View All Notifications →
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Theme Toggle -->
      <button
        @click="toggleDark"
        class="w-8 h-8 flex items-center justify-center rounded-lg
               text-secondary-text hover:bg-primary-border hover:cursor-pointer"
      >
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>

      <!-- Avatar -->
      <div
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary-border cursor-pointer"
        @click="openProfileDialog"
      >
        <div class="w-7 h-7 rounded-full bg-card-background border border-primary-border text-primary flex items-center justify-center">
          <span class="text-xs font-bold">
            {{ profileStore.user?.name?.charAt(0).toUpperCase() || 'S' }}
          </span>
        </div>
        <span class="hidden text-primary-text sm:block text-xs font-medium">
          {{ profileStore.user?.name || 'Super Admin' }}
        </span>
      </div>
    </div>
  </header>

  <ProfileDialog
    :open="profileDialogOpen"
    @close="closeProfileDialog"
  />
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>