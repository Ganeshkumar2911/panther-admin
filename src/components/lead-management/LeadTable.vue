<script setup>
import { ref, computed } from 'vue'
import { STAGES, SOURCES } from '@/pages/lead-management/mockLeadData'
import {
  Eye,
  Edit,
  ArrowRightLeft,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserX,
  Phone,
  Mail,
  User,
  Plus,
} from 'lucide-vue-next'

const props = defineProps({
  leads: { type: Array, required: true },
})

const emit = defineEmits(['open-drawer', 'edit-lead', 'move-stage', 'add-lead'])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalPages = computed(() => Math.ceil(props.leads.length / itemsPerPage.value) || 1)

const paginatedLeads = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return props.leads.slice(start, start + itemsPerPage.value)
})

function getStageBadge(stageKey) {
  const found = STAGES.find(s => s.key === stageKey)
  return found || { label: stageKey, bgClass: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30' }
}

function getSourceChip(sourceLabel) {
  const found = SOURCES.find(s => s.label === sourceLabel)
  return found?.color || 'bg-primary-border/20 text-secondary-text border-primary-border'
}

function getPriorityBadge(priority) {
  switch (priority) {
    case 'High':
      return 'bg-red-500/10 text-red-400 border-red-500/30'
    case 'Medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'Low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
  }
}

// Active action dropdown index
const activeActionMenu = ref(null)

function toggleMenu(leadId) {
  if (activeActionMenu.value === leadId) {
    activeActionMenu.value = null
  } else {
    activeActionMenu.value = leadId
  }
}
</script>

<template>
  <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden">
    <!-- Table Header Info -->
    <div class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-primary-text uppercase tracking-wider">
          Lead Records
        </span>
        <span class="text-[11px] text-secondary-text bg-background border border-primary-border px-2.5 py-0.5 rounded-full font-medium">
          Showing {{ paginatedLeads.length }} of {{ leads.length }} Leads
        </span>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-[11px] text-secondary-text">Per Page:</label>
        <select
          v-model="itemsPerPage"
          @change="currentPage = 1"
          class="bg-background border border-primary-border rounded-lg text-xs text-primary-text px-2 py-1 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="leads.length === 0" class="py-16 text-center space-y-3 px-4">
      <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
        <UserX class="w-6 h-6" />
      </div>
      <div class="max-w-md mx-auto">
        <h3 class="text-sm font-semibold text-primary-text">No Leads Found</h3>
        <p class="text-xs text-secondary-text mt-1">
          No lead records match your search or filter parameters. Try resetting your filters or create a new lead.
        </p>
      </div>
      <button
        @click="emit('add-lead')"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-medium transition-colors cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Lead</span>
      </button>
    </div>

    <!-- Table Container -->
    <div v-else class="overflow-x-auto no-scrollbar">
      <table class="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr class="border-b border-primary-border bg-background/50 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
            <th class="px-5 py-3">Lead</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Country</th>
            <th class="px-4 py-3">Source</th>
            <th class="px-4 py-3">Assigned Staff</th>
            <th class="px-4 py-3">Current Stage</th>
            <th class="px-4 py-3">Priority</th>
            <th class="px-4 py-3">Created Date</th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-border/60 text-xs">
          <tr
            v-for="lead in paginatedLeads"
            :key="lead.id"
            @click="emit('open-drawer', lead)"
            class="hover:bg-background/80 transition-colors group cursor-pointer"
          >
            <!-- Lead Name & Email -->
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {{ lead.name.charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-primary-text truncate group-hover:text-primary transition-colors">
                    {{ lead.name }}
                  </p>
                  <p class="text-[11px] text-secondary-text truncate flex items-center gap-1">
                    <Mail class="w-2.5 h-2.5 shrink-0" />
                    {{ lead.email }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Phone -->
            <td class="px-4 py-3.5 text-secondary-text whitespace-nowrap">
              <span class="flex items-center gap-1">
                <Phone class="w-3 h-3 text-secondary-text/70 shrink-0" />
                {{ lead.phone }}
              </span>
            </td>

            <!-- Country -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-primary-border text-[11px] text-primary-text font-medium">
                <span>{{ lead.flag }}</span>
                <span>{{ lead.country }}</span>
              </span>
            </td>

            <!-- Source -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-md border', getSourceChip(lead.source)]">
                {{ lead.source }}
              </span>
            </td>

            <!-- Assigned Staff -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div :class="['w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0', lead.staffAvatar]">
                  {{ lead.assignedStaff.charAt(0) }}
                </div>
                <span class="text-primary-text font-medium text-xs">{{ lead.assignedStaff }}</span>
              </div>
            </td>

            <!-- Stage Badge -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span :class="['text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase', getStageBadge(lead.stage).bgClass]">
                {{ getStageBadge(lead.stage).label }}
              </span>
            </td>

            <!-- Priority -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-md border', getPriorityBadge(lead.priority)]">
                {{ lead.priority }}
              </span>
            </td>

            <!-- Created Date -->
            <td class="px-4 py-3.5 text-secondary-text whitespace-nowrap text-[11px]">
              {{ lead.createdAt }}
            </td>

            <!-- Actions -->
            <td class="px-5 py-3.5 text-right whitespace-nowrap" @click.stop>
              <div class="flex items-center justify-end gap-1.5">
                <button
                  @click="emit('open-drawer', lead)"
                  class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="View Lead Details"
                >
                  <Eye class="w-3.5 h-3.5" />
                </button>

                <button
                  @click="emit('move-stage', lead)"
                  class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Move Stage"
                >
                  <ArrowRightLeft class="w-3.5 h-3.5" />
                </button>

                <button
                  @click="emit('edit-lead', lead)"
                  class="p-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Edit Lead"
                >
                  <Edit class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="leads.length > 0" class="px-5 py-3.5 border-t border-primary-border flex items-center justify-between bg-background/30">
      <p class="text-xs text-secondary-text">
        Page <strong class="text-primary-text font-semibold">{{ currentPage }}</strong> of <strong class="text-primary-text font-semibold">{{ totalPages }}</strong>
      </p>

      <div class="flex items-center gap-1.5">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="p-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="p-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
