<template>
  <div class="space-y-2">
    <div v-for="node in items" :key="node.ib_id" class="relative">

      <div
        class="flex items-center gap-3 p-3 rounded-xl border border-primary-border bg-card-background hover:bg-background transition-colors group cursor-pointer"
        @click="toggle(node.ib_id)"
      >
        <!-- Left: expand indicator -->
        <div class="shrink-0 flex flex-col items-center gap-0.5">
          <div class="w-7 h-7 rounded-lg bg-background border border-primary-border flex items-center justify-center">
            <ChevronRight
              v-if="node.children?.length"
              class="w-3.5 h-3.5 text-secondary-text transition-transform duration-200"
              :class="{ 'rotate-90': expanded[node.ib_id] }"
            />
            <Minus v-else class="w-3 h-3 text-secondary-text opacity-30" />
          </div>
        </div>

        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-medium text-black shrink-0">
          {{ node.name?.charAt(0).toUpperCase() }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-primary-text truncate">{{ node.name }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-secondary-text">{{ node.referral_code || 'No referral' }}</span>
            <span class="text-[10px] text-secondary-text opacity-40">·</span>
            <span class="text-[10px] text-secondary-text">{{ node.children?.length ?? 0 }} sub-IB{{ node.children?.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="text-center">
            <p class="text-[10px] text-secondary-text uppercase tracking-wide leading-none mb-0.5">Split</p>
            <p class="text-xs font-medium text-primary-text">{{ node.split }}%</p>
          </div>
          <div class="w-px h-6 bg-primary-border" />
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text">
            L{{ node.level }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors"
            @click.stop="emit('edit', node)"
          >
            <Pencil class="w-3.5 h-3.5 text-secondary-text" />
          </button>
          <button
            
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors"
            @click.stop="emit('add-sub', node.ib_id)"
          >
            <Plus class="w-3.5 h-3.5 text-secondary-text" />
          </button>
        </div>
      </div>

      <!-- Children -->
      <div
        v-if="node.children?.length && expanded[node.ib_id]"
        class="mt-2 ml-6 pl-4 border-l-2 border-primary-border space-y-2"
      >
        <IbTree
          :items="node.children"
          :expanded="expanded"
          @toggle="emit('toggle', $event)"
          @edit="emit('edit', $event)"
          @add-sub="emit('add-sub', $event)"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ChevronRight, Minus, Pencil, Plus } from 'lucide-vue-next'

defineProps({
  items: { type: Array, default: () => [] },
  expanded: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['toggle', 'edit', 'add-sub'])
const toggle = (id) => emit('toggle', id)
</script>