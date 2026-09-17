<template>
  <div>
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-card-background border-l border-primary-border shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-primary-border flex items-center justify-between gap-4 bg-background/50 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 bg-primary/10 border-primary/20 text-primary"
            >
              <Sparkles class="w-5 h-5 text-primary" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  {{ labelName }}
                </h3>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles class="w-3 h-3" />
                  Dummy FM
                </span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-2xs"
                  :class="isEnabled
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-background text-secondary-text border-primary-border'"
                >
                  <span class="inline-block w-1.5 h-1.5 rounded-full mr-1" :class="isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'" />
                  {{ isEnabled ? 'Simulation Enabled' : 'Disabled' }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5 flex items-center gap-1.5">
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                <span class="font-medium text-primary-text font-mono select-all">{{ userEmail }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Import Dummy Trades Button -->
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white transition cursor-pointer shadow-2xs"
              title="Import Dummy Trades"
              @click="handleImportTrades"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" />
              <span>Import Trades</span>
            </button>

            <!-- Edit Dummy FM Button -->
            <button
              type="button"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-hover transition cursor-pointer shadow-sm"
              title="Edit Dummy Simulation Metrics"
              @click="handleEdit"
            >
              <Pencil class="w-3.5 h-3.5" />
              <span>Edit Dummy FM</span>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Drawer Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- HERO SIMULATION PERFORMANCE BANNER -->
          <div class="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div class="flex items-center justify-between border-b border-primary/20 pb-3">
              <div class="flex items-center gap-2">
                <TrendingUp class="w-4 h-4 text-primary" />
                <h4 class="text-xs font-bold uppercase tracking-wider text-primary">
                  Leaderboard Simulation Metrics
                </h4>
              </div>
              <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                FM ID: #{{ fmId }}
              </span>
            </div>

            <!-- Return & Win Rate Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-background/80 border border-primary-border/60 rounded-xl p-3.5">
                <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">Total Return</span>
                <span class="text-xl font-extrabold text-emerald-500 tracking-tight mt-1 block">
                  +{{ formatMoney(totalReturn, currency) }}
                </span>
              </div>
              <div class="bg-background/80 border border-primary-border/60 rounded-xl p-3.5">
                <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">Win Rate</span>
                <span class="text-xl font-extrabold text-primary tracking-tight mt-1 block">
                  {{ formatPercent(winRate) }}
                </span>
              </div>
            </div>

            <!-- Simulation Parameters Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div class="bg-background/50 border border-primary-border/40 rounded-xl p-3">
                <span class="text-secondary-text text-[10px] uppercase font-semibold block">Profit Sharing</span>
                <span class="font-bold text-primary-text text-sm mt-0.5 block">{{ formatPercent(profitSharing) }}</span>
              </div>
              <div class="bg-background/50 border border-primary-border/40 rounded-xl p-3">
                <span class="text-secondary-text text-[10px] uppercase font-semibold block">Max Drawdown</span>
                <span class="font-bold text-rose-500 text-sm mt-0.5 block">{{ formatPercent(maxDrawdown) }}</span>
              </div>
              <div class="bg-background/50 border border-primary-border/40 rounded-xl p-3">
                <span class="text-secondary-text text-[10px] uppercase font-semibold block">Copiers</span>
                <span class="font-bold text-primary text-sm mt-0.5 block">{{ copiersCount }} users</span>
              </div>
            </div>

            <!-- Active Since -->
            <div class="bg-background/60 border border-primary-border/60 rounded-xl p-3 flex items-center justify-between text-xs">
              <span class="text-secondary-text font-semibold flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-primary" />
                Active Since Date
              </span>
              <span class="font-mono font-bold text-primary-text text-xs">{{ formatDate(activeSince) }}</span>
            </div>
          </div>

          <!-- ASSOCIATED REAL FUND MANAGER PROFILE -->
          <div class="bg-background/50 border border-primary-border rounded-2xl p-5 space-y-4 shadow-xs">
            <div class="flex items-center justify-between border-b border-primary-border/60 pb-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-secondary-text flex items-center gap-2">
                <User class="w-4 h-4 text-primary" />
                <span>Fund Manager Profile</span>
              </h4>
              <span
                v-if="kycStatus"
                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                :class="getKycBadgeClass(kycStatus)"
              >
                KYC: {{ kycStatus }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <span class="text-secondary-text text-[11px] block">Full Name</span>
                <span class="font-bold text-primary-text">{{ userName || '—' }}</span>
              </div>
              <div>
                <span class="text-secondary-text text-[11px] block">Email Address</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-primary-text font-mono select-all">{{ userEmail }}</span>
                  <button
                    v-if="userEmail"
                    type="button"
                    @click="copyText(userEmail)"
                    class="text-secondary-text hover:text-primary transition p-1 rounded hover:bg-background cursor-pointer"
                    title="Copy Email"
                  >
                    <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-500" />
                    <Copy v-else class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <span class="text-secondary-text text-[11px] block">Min Capital</span>
                <span class="font-bold text-primary-text font-mono">{{ formatMoney(minCapital, currency) }}</span>
              </div>
              <div>
                <span class="text-secondary-text text-[11px] block">Performance Fee</span>
                <span class="font-bold text-primary">{{ formatPercent(performanceFee) }}</span>
              </div>
              <div>
                <span class="text-secondary-text text-[11px] block">Broker Currency & Leverage</span>
                <span class="font-bold text-primary-text font-mono">{{ currency }} · 1:{{ leverage }}</span>
              </div>
              <div>
                <span class="text-secondary-text text-[11px] block">Follower Account Type</span>
                <span class="font-semibold text-primary-text">{{ followerAccountTypeLabel }}</span>
              </div>
              <div v-if="brokerGroup" class="sm:col-span-2">
                <span class="text-secondary-text text-[11px] block">Broker Group</span>
                <span class="font-mono font-medium text-primary-text select-all break-all bg-background p-2 rounded-lg border border-primary-border/60 block mt-0.5">
                  {{ brokerGroup }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            class="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            @click="isDeleteModalOpen = true"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete Simulation</span>
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-card-background border border-primary-border text-primary-text hover:bg-background text-xs font-semibold transition cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>

    <!-- DELETE CONFIRMATION DIALOG -->
    <ConfirmationDialog
      :open="isDeleteModalOpen"
      title="Delete Dummy Fund Manager"
      :message="`Are you sure you want to delete the dummy simulation for '${labelName}'? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      :loading="isDeleting"
      @confirm="handleDeleteConfirm"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  X,
  Sparkles,
  TrendingUp,
  User,
  Mail,
  Calendar,
  Pencil,
  Trash2,
  FileSpreadsheet,
  Copy,
  Check,
} from 'lucide-vue-next'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import { useFmLeaderboardStore } from '@/stores/fmLeaderboard/fmLeaderboard'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
})

const emit = defineEmits(['close', 'edit-dummy', 'import-trades'])

const permissionsStore = useMyPermissionsStore()
const hasPermission = (perm) => permissionsStore.hasPermission(perm)

const store = useFmLeaderboardStore()

const copied = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

const handleEdit = () => {
  emit('close')
  emit('edit-dummy', props.item)
}

const handleImportTrades = () => {
  emit('close')
  emit('import-trades', props.item)
}

const handleDeleteConfirm = async () => {
  const targetId = fmId.value
  if (!targetId || targetId === '—') return
  isDeleting.value = true
  try {
    await store.deleteDummyFundManager(targetId)
    isDeleteModalOpen.value = false
    emit('close')
  } catch (_) {
    // Errors handled by store snackbar
  } finally {
    isDeleting.value = false
  }
}

const dummyData = computed(() => {
  return props.item?.dummy_fm || props.item || {}
})

const fmData = computed(() => {
  return props.item?.fund_manager || props.item || {}
})

const fmId = computed(() => {
  return props.item?.fm_id || dummyData.value?.fm_id || fmData.value?.id || props.item?.id || '—'
})

const labelName = computed(() => {
  return fmData.value?.label_name || props.item?.label_name || fmData.value?.user_name || 'Dummy Fund Manager'
})

const userName = computed(() => {
  return fmData.value?.user_name || props.item?.user_name || fmData.value?.user?.name || ''
})

const userEmail = computed(() => {
  return fmData.value?.user_email || props.item?.user_email || fmData.value?.user?.email || '—'
})

const isEnabled = computed(() => {
  if (dummyData.value?.enabled !== undefined) return Boolean(dummyData.value.enabled)
  if (props.item?.enabled !== undefined) return Boolean(props.item.enabled)
  return true
})

const totalReturn = computed(() => {
  return dummyData.value?.total_return ?? props.item?.total_return ?? 0
})

const winRate = computed(() => {
  return dummyData.value?.win_rate ?? props.item?.win_rate ?? 0
})

const profitSharing = computed(() => {
  return dummyData.value?.profit_sharing ?? props.item?.profit_sharing ?? 0
})

const maxDrawdown = computed(() => {
  return dummyData.value?.max_drawdown ?? props.item?.max_drawdown ?? 0
})

const copiersCount = computed(() => {
  return dummyData.value?.active_copiers ?? dummyData.value?.copiers ?? props.item?.copiers ?? 0
})

const activeSince = computed(() => {
  return dummyData.value?.active_since ?? props.item?.active_since ?? fmData.value?.created_at ?? ''
})

const minCapital = computed(() => {
  return fmData.value?.min_capital ?? props.item?.min_capital ?? 0
})

const performanceFee = computed(() => {
  return fmData.value?.performance_fee ?? props.item?.performance_fee ?? 0
})

const currency = computed(() => {
  return fmData.value?.broker_currency || props.item?.broker_currency || 'USD'
})

const leverage = computed(() => {
  return fmData.value?.broker_leverage || props.item?.broker_leverage || 100
})

const brokerGroup = computed(() => {
  return fmData.value?.broker_group || props.item?.broker_group || ''
})

const kycStatus = computed(() => {
  return fmData.value?.kyc_status || fmData.value?.user?.kyc_status || props.item?.kyc_status || ''
})

const followerAccountTypeLabel = computed(() => {
  const t = Number(fmData.value?.follower_account_type ?? props.item?.follower_account_type ?? 1)
  if (t === 2) return 'Real account only'
  if (t === 3) return 'Both options'
  return 'Copy trading only'
})

const formatMoney = (val, cur = 'USD') => {
  const num = Number(val) || 0
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${cur}`
}

const formatPercent = (val) => {
  const num = Number(val) || 0
  return `${num.toFixed(1)}%`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (_) {
    return String(dateStr)
  }
}

const getKycBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'approved' || s === 'verified') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (s === 'pending' || s === 'submitted') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (s === 'rejected') return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  return 'bg-background text-secondary-text border-primary-border'
}

const copyText = (text) => {
  if (!text) return
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(String(text))
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
