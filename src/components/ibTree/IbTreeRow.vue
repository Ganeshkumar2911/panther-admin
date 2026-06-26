<script setup>
import { computed } from 'vue'
import { Pencil, Plus, ArrowLeftRight, Users } from 'lucide-vue-next'
import Tooltip from '@/components/common/Tooltip.vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
})

const emit = defineEmits(['add-sub', 'edit', 'transfer-parent', 'view-clients'])

// Flatten the nested tree into a flat list for table display
function flattenTree(nodes, result = []) {
  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) {
      flattenTree(node.children, result)
    }
  }
  return result
}

const flatRows = computed(() => flattenTree(props.nodes))
</script>

<template>
  <div class="w-full overflow-x-auto rounded-xl border border-primary-border">
    <table class="w-full text-xs border-collapse">
      <!-- Header -->
      <thead>
        <tr class="bg-card-background border-b border-primary-border">
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            IB ID
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Name / Email
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Referral Code
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Parent IB
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Split
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Level
          </th>
          <th class="px-4 py-3 text-right font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Actions
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <tr
          v-for="node in flatRows"
          :key="node.ib_id"
          :class="[
            'border-b border-primary-border transition-colors',
            node.level > 0 ? 'bg-child-row hover:bg-child-row-hover' : 'hover:bg-card-background'
          ]"
        >
          <!-- IB ID -->
          <td class="px-4 py-3 align-middle font-medium text-primary-text whitespace-nowrap">
            {{ node.ib_id }}
          </td>

          <!-- Name / Email -->
          <td class="px-4 py-3 align-middle">
            <div class="text-primary-text font-medium">{{ node.name || '—' }}</div>
            <div class="text-secondary-text mt-0.5">{{ node.email || '—' }}</div>
          </td>

          <!-- Referral Code -->
          <td class="px-4 py-3 align-middle text-primary-text">
            {{ node.referral_code || '—' }}
          </td>

          <!-- Parent IB -->
          <td class="px-4 py-3 align-middle text-primary-text">
            {{ node.parent_ib_id ?? '—' }}
          </td>

          <!-- Split -->
          <td class="px-4 py-3 align-middle text-primary-text">
            {{ node.split }}%
          </td>

          <!-- Level badge -->
          <td class="px-4 py-3 align-middle">
            <span
              class="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text"
            >
              L{{ node.level }}
            </span>
          </td>

          <!-- Actions -->
          <td class="px-4 py-3 align-middle text-right">
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
                  @click="emit('transfer-parent', node)"
                >
                  <ArrowLeftRight class="w-3.5 h-3.5 text-secondary-text" />
                </button>
              </Tooltip>

              <Tooltip text="Edit IB">
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                  @click="emit('edit', node)"
                >
                  <Pencil class="w-3.5 h-3.5 text-secondary-text" />
                </button>
              </Tooltip>

              <Tooltip text="Add Sub-IB" position="end">
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                  @click="emit('add-sub', node.ib_id)"
                >
                  <Plus class="w-3.5 h-3.5 text-secondary-text" />
                </button>
              </Tooltip>
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="flatRows.length === 0">
          <td colspan="7" class="px-4 py-10 text-center text-secondary-text">
            No IB records found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
