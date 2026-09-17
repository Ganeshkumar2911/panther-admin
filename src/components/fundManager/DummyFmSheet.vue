<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="closeSheet"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/60"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2.5 rounded-xl border bg-primary/10 border-primary/20 text-primary"
            >
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-primary-text text-base font-bold">
                  {{ isEdit ? 'Edit Dummy Fund Manager' : 'Create Dummy Fund Manager' }}
                </h2>
                <span
                  class="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1"
                >
                  <Sparkles class="w-3 h-3 text-primary" />
                  Dummy FM
                </span>
              </div>
              <p class="text-secondary-text text-xs mt-0.5">
                {{ isEdit ? 'Update leaderboard simulation metrics' : 'Configure dummy metrics for leaderboard simulation' }}
              </p>
            </div>
          </div>

          <button
            @click="closeSheet"
            class="p-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-all cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="px-6 py-5 flex flex-col gap-5 overflow-y-auto flex-1">
          <!-- Real FM Target Banner -->
          <div
            class="bg-background/80 border border-primary-border rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm bg-primary/10 border-primary/20 text-primary shrink-0"
              >
                <span>{{ (item?.label_name || item?.fund_manager?.label_name || item?.user_name || item?.user?.name || 'FM')[0].toUpperCase() }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-primary-text truncate">
                  {{ item?.label_name || item?.fund_manager?.label_name || item?.user_name || item?.user?.name || 'Fund Manager' }}
                </p>
                <p class="text-xs text-secondary-text font-mono truncate">
                  {{ item?.user_email || item?.fund_manager?.user_email || item?.user?.email || 'No email' }}
                </p>
              </div>
            </div>
            <span
              class="text-[10px] font-mono font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 shrink-0"
            >
              FM ID: #{{ item?.fm_id || item?.fund_manager?.id || item?.id }}
            </span>
          </div>

          <!-- ENABLED STATUS SWITCH -->
          <div
            class="bg-background/40 border border-primary-border/70 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <label class="text-xs font-bold text-primary-text block">Dummy FM Status</label>
              <p class="text-[11px] text-secondary-text mt-0.5">
                Enable or disable dummy simulation display on the leaderboard
              </p>
            </div>
            <button
              type="button"
              @click="form.enabled = !form.enabled"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer select-none"
              :class="
                form.enabled
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/30'
                  : 'bg-background text-secondary-text border-primary-border'
              "
            >
              <span>{{ form.enabled ? 'Enabled' : 'Disabled' }}</span>
              <div
                class="w-7 h-4 rounded-full p-0.5 transition-colors relative flex items-center"
                :class="form.enabled ? 'bg-primary-green' : 'bg-zinc-600/50'"
              >
                <div
                  class="w-3 h-3 rounded-full bg-white transition-transform shadow-xs"
                  :class="form.enabled ? 'translate-x-3' : 'translate-x-0'"
                />
              </div>
            </button>
          </div>

          <!-- METRICS FORM FIELDS -->
          <div class="space-y-4 bg-background/40 border border-primary-border/60 rounded-xl p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
              <TrendingUp class="w-3.5 h-3.5 text-primary" />
              <span>Simulation Performance Metrics</span>
            </h3>

            <!-- Total Return & Win Rate -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Total Return <span class="text-primary-red">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.total_return"
                    type="number"
                    step="any"
                    placeholder="e.g. 4058.77"
                    class="w-full h-9 px-3 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
                  />
                </div>
                <span v-if="errors.total_return" class="text-[10px] text-primary-red">
                  {{ errors.total_return }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Win Rate (%) <span class="text-primary-red">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.win_rate"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    placeholder="e.g. 75.0"
                    class="w-full h-9 px-3 pr-8 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary-text font-bold">%</span>
                </div>
                <span v-if="errors.win_rate" class="text-[10px] text-primary-red">
                  {{ errors.win_rate }}
                </span>
              </div>
            </div>

            <!-- Profit Sharing & Max Drawdown -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Profit Sharing (%) <span class="text-primary-red">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.profit_sharing"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    placeholder="e.g. 30.0"
                    class="w-full h-9 px-3 pr-8 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary-text font-bold">%</span>
                </div>
                <span v-if="errors.profit_sharing" class="text-[10px] text-primary-red">
                  {{ errors.profit_sharing }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Max Drawdown (%) <span class="text-primary-red">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.max_drawdown"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    placeholder="e.g. 100.0"
                    class="w-full h-9 px-3 pr-8 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary-text font-bold">%</span>
                </div>
                <span v-if="errors.max_drawdown" class="text-[10px] text-primary-red">
                  {{ errors.max_drawdown }}
                </span>
              </div>
            </div>

            <!-- Copiers & Active Since -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Copiers Count <span class="text-primary-red">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.copiers"
                    type="number"
                    min="0"
                    placeholder="e.g. 120"
                    class="w-full h-9 px-3 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
                  />
                </div>
                <span v-if="errors.copiers" class="text-[10px] text-primary-red">
                  {{ errors.copiers }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Active Since <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.active_since_date"
                  type="date"
                  class="w-full h-9 px-3 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors cursor-pointer"
                />
                <span v-if="errors.active_since" class="text-[10px] text-primary-red">
                  {{ errors.active_since }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 bg-background/60 shrink-0"
        >
          <button
            type="button"
            @click="closeSheet"
            :disabled="store.isSubmitting"
            class="px-4 py-2 rounded-lg text-xs font-semibold border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="store.isSubmitting"
            class="px-5 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="store.isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <Sparkles v-else class="w-3.5 h-3.5" />
            <span>{{ store.isSubmitting ? 'Saving...' : isEdit ? 'Update Dummy FM' : 'Create Dummy FM' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Sparkles, X, TrendingUp, Loader2 } from 'lucide-vue-next'
import { useFmLeaderboardStore } from '@/stores/fmLeaderboard/fmLeaderboard'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'success'])
const store = useFmLeaderboardStore()

const form = ref({
  enabled: true,
  total_return: 0,
  win_rate: 0,
  profit_sharing: 0,
  max_drawdown: 0,
  copiers: 0,
  active_since_date: new Date().toISOString().split('T')[0],
})

const errors = ref({})

const resetForm = () => {
  errors.value = {}
  if (props.item) {
    const dFm = props.item.dummy_fm
    const fManager = props.item.fund_manager
    const rawDate = dFm?.active_since || props.item.active_since || fManager?.created_at || props.item.created_at
    let parsedDate = new Date().toISOString().split('T')[0]
    if (rawDate) {
      try {
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          parsedDate = d.toISOString().split('T')[0]
        }
      } catch (_) {}
    }

    const enabledVal = dFm?.enabled !== undefined
      ? dFm.enabled
      : (props.item.enabled !== undefined ? props.item.enabled : true)

    const returnVal = dFm?.total_return ?? props.item.total_return ?? (Number(fManager?.min_capital || props.item.min_capital) || 4058.77)
    const winRateVal = dFm?.win_rate ?? props.item.win_rate ?? 75.0
    const profitShareVal = dFm?.profit_sharing ?? props.item.profit_sharing ?? (Number(fManager?.performance_fee || props.item.performance_fee) || 30.0)
    const maxDdVal = dFm?.max_drawdown ?? props.item.max_drawdown ?? 100.0
    const copiersVal = dFm?.copiers ?? dFm?.active_copiers ?? props.item.copiers ?? 120

    form.value = {
      enabled: Boolean(enabledVal),
      total_return: Number(returnVal),
      win_rate: Number(winRateVal),
      profit_sharing: Number(profitShareVal),
      max_drawdown: Number(maxDdVal),
      copiers: Number(copiersVal),
      active_since_date: parsedDate,
    }
  } else {
    form.value = {
      enabled: true,
      total_return: 4058.77,
      win_rate: 75.0,
      profit_sharing: 30.0,
      max_drawdown: 100.0,
      copiers: 120,
      active_since_date: new Date().toISOString().split('T')[0],
    }
  }
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      resetForm()
    }
  }
)

const validate = () => {
  const errs = {}
  if (form.value.total_return === '' || form.value.total_return == null || isNaN(form.value.total_return)) {
    errs.total_return = 'Total return is required'
  }
  if (form.value.win_rate === '' || form.value.win_rate == null || isNaN(form.value.win_rate)) {
    errs.win_rate = 'Win rate is required'
  } else if (form.value.win_rate < 0 || form.value.win_rate > 100) {
    errs.win_rate = 'Must be between 0 and 100'
  }
  if (form.value.profit_sharing === '' || form.value.profit_sharing == null || isNaN(form.value.profit_sharing)) {
    errs.profit_sharing = 'Profit sharing is required'
  } else if (form.value.profit_sharing < 0 || form.value.profit_sharing > 100) {
    errs.profit_sharing = 'Must be between 0 and 100'
  }
  if (form.value.max_drawdown === '' || form.value.max_drawdown == null || isNaN(form.value.max_drawdown)) {
    errs.max_drawdown = 'Max drawdown is required'
  }
  if (form.value.copiers === '' || form.value.copiers == null || isNaN(form.value.copiers)) {
    errs.copiers = 'Copiers count is required'
  }
  if (!form.value.active_since_date) {
    errs.active_since = 'Active since date is required'
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  const fmId = props.item?.fm_id || props.item?.fund_manager?.id || props.item?.dummy_fm?.fm_id || props.item?.id
  if (!fmId) return

  // Format date into ISO timestamp e.g. "2026-08-12T00:00:00Z"
  const isoDate = new Date(`${form.value.active_since_date}T00:00:00Z`).toISOString()

  const payload = {
    enabled: Boolean(form.value.enabled),
    total_return: Number(form.value.total_return) || 0,
    win_rate: Number(form.value.win_rate) || 0,
    profit_sharing: Number(form.value.profit_sharing) || 0,
    max_drawdown: Number(form.value.max_drawdown) || 0,
    copiers: Number(form.value.copiers) || 0,
    active_since: isoDate,
  }

  try {
    if (props.isEdit) {
      await store.editDummyFundManager(fmId, payload)
    } else {
      await store.createDummyFundManager(fmId, payload)
    }
    closeSheet()
    emit('success')
  } catch (err) {
    console.error('Failed to save dummy FM:', err)
  }
}

const closeSheet = () => {
  if (store.isSubmitting) return
  emit('close')
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
