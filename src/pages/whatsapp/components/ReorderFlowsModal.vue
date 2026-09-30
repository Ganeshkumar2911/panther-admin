<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  X,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Clock,
  Save,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from 'lucide-vue-next'
import { useWhatsAppFlowsStore } from '@/stores/whatsapp/flows'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'reordered'])

const flowsStore = useWhatsAppFlowsStore()
const localList = ref([])

watch(
  () => props.open,
  (val) => {
    if (val) {
      // Clone flows store data ordered by execution_order
      localList.value = [...(flowsStore.flows || [])]
        .sort((a, b) => (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0))
        .map((item, index) => ({
          id: item.id,
          stage: item.stage || 'KYC',
          template_name: item.template_name || '',
          execution_order: index + 1,
          interval_hours: Number(item.interval_hours) || 24,
          is_active: item.is_active !== false,
        }))
    }
  }
)

const moveUp = (index) => {
  if (index <= 0) return
  const item = localList.value[index]
  localList.value.splice(index, 1)
  localList.value.splice(index - 1, 0, item)
  // Re-index execution_order
  localList.value.forEach((it, idx) => {
    it.execution_order = idx + 1
  })
}

const moveDown = (index) => {
  if (index >= localList.value.length - 1) return
  const item = localList.value[index]
  localList.value.splice(index, 1)
  localList.value.splice(index + 1, 0, item)
  // Re-index execution_order
  localList.value.forEach((it, idx) => {
    it.execution_order = idx + 1
  })
}

const getStageBadgeClass = (stage) => {
  const s = (stage || '').toUpperCase()
  if (s === 'KYC') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (s === 'DEPOSIT') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (s === 'TRADING') return 'bg-sky-500/10 text-sky-500 border-sky-500/20'
  return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
}

const handleSave = async () => {
  const orders = localList.value.map((item, index) => ({
    id: item.id,
    execution_order: index + 1,
    interval_hours: Number(item.interval_hours) || 24,
    stage: item.stage,
  }))

  try {
    await flowsStore.reorderFlows(orders)
    emit('reordered')
    emit('close')
  } catch (err) {
    // Error handled in store
  }
}
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      @click.self="emit('close')"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/40">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ArrowUpDown class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-primary-text">Reorder Flow Sequence</h2>
              <p class="text-xs text-secondary-text">
                Adjust step sequence order and intervals across the drip journey
              </p>
            </div>
          </div>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body: Reorderable Step List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-3">
          <div
            v-if="localList.length === 0"
            class="text-center py-12 text-secondary-text text-xs"
          >
            No template flow steps to reorder.
          </div>

          <div
            v-for="(item, index) in localList"
            :key="item.id"
            class="p-3.5 rounded-xl border border-primary-border bg-card-background hover:bg-background/40 transition-colors flex items-center justify-between gap-3"
          >
            <!-- Left: Order Badge & Move Buttons -->
            <div class="flex items-center gap-2">
              <span
                class="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-xs flex items-center justify-center shrink-0"
              >
                #{{ index + 1 }}
              </span>

              <div class="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  :disabled="index === 0"
                  class="w-6 h-5 rounded flex items-center justify-center text-secondary-text hover:text-primary hover:bg-background border border-primary-border disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  @click="moveUp(index)"
                >
                  <MoveUp class="w-3 h-3" />
                </button>
                <button
                  type="button"
                  :disabled="index === localList.length - 1"
                  class="w-6 h-5 rounded flex items-center justify-center text-secondary-text hover:text-primary hover:bg-background border border-primary-border disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  @click="moveDown(index)"
                >
                  <MoveDown class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Middle: Stage, Template Name -->
            <div class="flex-1 min-w-0 flex flex-wrap items-center gap-2">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                :class="getStageBadgeClass(item.stage)"
              >
                {{ item.stage }}
              </span>

              <span class="font-mono text-xs font-bold text-primary-text truncate max-w-[200px] sm:max-w-xs">
                {{ item.template_name }}
              </span>
            </div>

            <!-- Right: Interval Delay Input -->
            <div class="flex items-center gap-2 shrink-0">
              <div class="flex items-center gap-1.5 text-xs text-secondary-text">
                <Clock class="w-3.5 h-3.5 text-secondary-text" />
                <span class="hidden sm:inline">Wait:</span>
              </div>
              <div class="w-20">
                <input
                  v-model.number="item.interval_hours"
                  type="number"
                  min="0"
                  class="input-field px-2 py-1 text-xs text-center font-mono font-bold"
                />
              </div>
              <span class="text-[11px] text-secondary-text">hrs</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            :disabled="flowsStore.actionLoading"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="flowsStore.actionLoading || localList.length === 0"
            @click="handleSave"
          >
            <Save v-if="!flowsStore.actionLoading" class="w-4 h-4" />
            <div
              v-else
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            <span>{{ flowsStore.actionLoading ? 'Saving Order...' : 'Save Reordered Sequence' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
