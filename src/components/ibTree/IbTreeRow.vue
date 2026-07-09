<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Plus, ArrowLeftRight, Users } from 'lucide-vue-next'
import DropdownMenu from '@/components/common/DropdownMenu.vue'

const router = useRouter()

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

const getActions = (node) => [
  {
    label: 'View Clients',
    icon: Users,
    handler: () => router.push(`/ib-clients/${node.ib_id}`),
  },
  {
    label: 'Transfer Parent',
    icon: ArrowLeftRight,
    handler: () => emit('transfer-parent', node),
  },
  {
    label: 'Edit IB',
    icon: Pencil,
    handler: () => emit('edit', node),
  },
  {
    label: 'Add Sub-IB',
    icon: Plus,
    handler: () => emit('add-sub', node.ib_id),
  },
]
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
            <div v-if="node.level > 0 && node.parent_ib_id">
              <div class="font-medium text-primary-text">{{ node.parent_name || '—' }}</div>
              <div class="text-[10px] text-secondary-text mt-0.5">{{ node.parent_email || '—' }}</div>
              <div class="text-[10px] font-mono text-secondary-text uppercase mt-0.5">ID: {{ node.parent_ib_id }}</div>
            </div>
            <div v-else class="text-secondary-text">—</div>
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
            <div class="flex items-center justify-end">
              <DropdownMenu :items="getActions(node)" position="bottom-end" />
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
