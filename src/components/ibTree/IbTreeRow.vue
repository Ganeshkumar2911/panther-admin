<script setup>
import { ChevronRight, Minus, Pencil, Plus, ArrowLeftRight, Users } from 'lucide-vue-next'
import Tooltip from '@/components/common/Tooltip.vue'

defineProps({
  nodes: { type: Array, default: () => [] },
  expanded: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['toggle', 'add-sub', 'edit', 'transfer-parent', 'view-clients'])

const toggle = (id) => emit('toggle', id)
</script>

<template>
  <template v-for="node in nodes" :key="node.ib_id">
    <tr
      :class="[
        'border-b border-primary-border transition-colors cursor-pointer',
        node.level > 0 ? 'bg-child-row hover:bg-child-row-hover' : 'hover:bg-card-background'
      ]"
      @click="toggle(node.ib_id)"
    >
      <td class="px-3 py-3.5 align-middle" :style="{ paddingLeft: `${16 + node.level * 24}px` }">
        <div class="flex items-center gap-2">
          <ChevronRight
            v-if="node.children?.length"
            class="w-3.5 h-3.5 text-secondary-text transition-transform duration-300 ease-in-out shrink-0"
            :class="{ 'rotate-90': expanded[node.ib_id] }"
          />
          <Minus v-else class="w-3 h-3 text-secondary-text opacity-30 shrink-0" />
          <span class="text-xs text-primary-text">{{ node.name }}</span>
        </div>
      </td>
      <td class="px-3 py-3.5 align-middle text-xs text-primary-text">{{ node.referral_code || '-' }}</td>
      <td class="px-3 py-3.5 align-middle text-xs text-primary-text">{{ node.split }}%</td>
      <td class="px-3 py-3.5 align-middle">
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text">
          L{{ node.level }}
        </span>
      </td>
      <td class="px-3 py-3.5 align-middle text-right">
        <div class="flex items-center justify-end gap-1">
          <Tooltip text="View Clients">
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
              @click="$router.push(`/ib-clients/${node.ib_id}`)"
            >
              <Users class="w-3.5 h-3.5 text-secondary-text" />
            </button>
          </Tooltip>

          <Tooltip text="Transfer Parent">
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
              @click.stop="emit('transfer-parent', node)"
            >
              <ArrowLeftRight class="w-3.5 h-3.5 text-secondary-text" />
            </button>
          </Tooltip>

          <Tooltip text="Edit IB">
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
              @click.stop="emit('edit', node)"
            >
              <Pencil class="w-3.5 h-3.5 text-secondary-text" />
            </button>
          </Tooltip>

          <Tooltip text="Add Sub-IB" position="end">
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
              @click.stop="emit('add-sub', node.ib_id)"
            >
              <Plus class="w-3.5 h-3.5 text-secondary-text" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>

    <template v-if="node.children?.length && expanded[node.ib_id]">
      <IbTreeRow
        :nodes="node.children"
        :expanded="expanded"
        @toggle="emit('toggle', $event)"
        @add-sub="emit('add-sub', $event)"
        @edit="emit('edit', $event)"
        @transfer-parent="emit('transfer-parent', $event)"
        @view-clients="emit('view-clients', $event)"
        />
    </template>
  </template>
</template>
