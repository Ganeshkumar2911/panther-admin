<script setup>
import { ref } from 'vue'
import { STAGES, SOURCES } from '@/pages/lead-management/mockLeadData'
import {
  X,
  Phone,
  Mail,
  Globe,
  Tag,
  UserCheck,
  Calendar,
  Clock,
  Plus,
  Send,
  Bell,
  CheckCircle,
  FileText,
  ShieldCheck,
  PhoneCall,
  User,
  ArrowRightLeft,
  Edit,
} from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  lead: { type: Object, default: null },
})

const emit = defineEmits(['close', 'add-note', 'move-stage', 'edit-lead'])

const newNoteText = ref('')

function handleAddNote() {
  if (!newNoteText.value.trim()) return
  emit('add-note', {
    leadId: props.lead?.id,
    noteText: newNoteText.value.trim(),
  })
  newNoteText.value = ''
}

function getStageBadge(stageKey) {
  const found = STAGES.find((s) => s.key === stageKey)
  return (
    found || {
      label: stageKey,
      bgClass: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
    }
  )
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Slide-over Drawer Panel (38% screen width on desktop) -->
    <Transition name="slide-right">
      <div
        v-if="open && lead"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] lg:w-[38vw] bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Drawer Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-base shrink-0">
              {{ lead.name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-primary-text truncate">
                  {{ lead.name }}
                </h2>
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0', getStageBadge(lead.stage).bgClass]">
                  {{ getStageBadge(lead.stage).label }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                ID: {{ lead.id }} · Added {{ lead.createdAt }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="emit('move-stage', lead)"
              class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Move Stage"
            >
              <ArrowRightLeft class="w-4 h-4" />
            </button>

            <button
              @click="emit('edit-lead', lead)"
              class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Edit Lead"
            >
              <Edit class="w-4 h-4" />
            </button>

            <button
              @click="emit('close')"
              class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer ml-1"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Drawer Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">

          <!-- Section 1: Basic Information -->
          <div class="bg-background/80 border border-primary-border/80 rounded-2xl p-4 space-y-3">
            <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2">
              Basic Information
            </h3>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text text-[11px] block">Full Name</span>
                <span class="text-primary-text font-medium">{{ lead.name }}</span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Phone Number</span>
                <span class="text-primary-text font-medium flex items-center gap-1">
                  <Phone class="w-3 h-3 text-primary" />
                  {{ lead.phone }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Email Address</span>
                <span class="text-primary-text font-medium truncate block" :title="lead.email">
                  {{ lead.email }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Country</span>
                <span class="text-primary-text font-medium flex items-center gap-1">
                  <span>{{ lead.flag }}</span>
                  <span>{{ lead.country }}</span>
                </span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Lead Source</span>
                <span class="text-primary-text font-medium">{{ lead.source }}</span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Assigned Staff</span>
                <span class="text-primary-text font-medium flex items-center gap-1.5">
                  <span :class="['w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center', lead.staffAvatar]">
                    {{ lead.assignedStaff.charAt(0) }}
                  </span>
                  <span>{{ lead.assignedStaff }}</span>
                </span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Priority</span>
                <span class="text-primary-text font-medium">{{ lead.priority }}</span>
              </div>

              <div>
                <span class="text-secondary-text text-[11px] block">Current Stage</span>
                <span class="text-primary font-semibold">{{ lead.stage }}</span>
              </div>
            </div>
          </div>

          <!-- Section 2: Follow-Up Card -->
          <div class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-2xl p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Bell class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Next Scheduled Follow-up</p>
                <p class="text-xs font-bold text-primary-text mt-0.5">
                  {{ lead.followUp?.date }} at {{ lead.followUp?.time }}
                </p>
              </div>
            </div>

            <span
              v-if="lead.followUp?.reminder"
              class="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0"
            >
              Reminder Enabled
            </span>
          </div>

          <!-- Section 3: Journey Timeline -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">
                Onboarding Journey Timeline
              </h3>
              <span class="text-[10px] text-secondary-text font-mono">
                {{ lead.timeline?.length || 0 }} Events Logged
              </span>
            </div>

            <div class="relative pl-6 space-y-4 border-l-2 border-primary-border ml-2">
              <div
                v-for="event in lead.timeline"
                :key="event.id"
                class="relative group"
              >
                <!-- Dot marker -->
                <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-card-background border-2 border-primary flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>

                <div class="bg-background border border-primary-border/60 rounded-xl p-3 hover:border-primary/40 transition-colors">
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="text-xs font-bold text-primary-text">{{ event.title }}</h4>
                    <span class="text-[10px] text-secondary-text font-mono">{{ event.time }}</span>
                  </div>
                  <p class="text-[11px] text-secondary-text leading-relaxed">
                    {{ event.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Notes -->
          <div class="space-y-3">
            <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider">
              Staff Activity Notes
            </h3>

            <!-- Add Note Card -->
            <div class="bg-background border border-primary-border rounded-xl p-3 space-y-2">
              <textarea
                v-model="newNoteText"
                rows="2"
                placeholder="Add a new activity note for this lead..."
                class="w-full bg-card-background border border-primary-border/80 rounded-lg p-2 text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <div class="flex justify-end">
                <button
                  @click="handleAddNote"
                  :disabled="!newNoteText.trim()"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send class="w-3 h-3" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            <!-- Notes List -->
            <div v-if="lead.notes?.length === 0" class="text-center py-4 text-xs text-secondary-text">
              No notes added yet.
            </div>

            <div v-else class="space-y-2.5">
              <div
                v-for="note in lead.notes"
                :key="note.id"
                class="bg-background border border-primary-border/60 rounded-xl p-3 space-y-1.5"
              >
                <p class="text-xs text-primary-text leading-relaxed">
                  "{{ note.text }}"
                </p>
                <div class="flex items-center justify-between text-[10px] text-secondary-text pt-1 border-t border-primary-border/40">
                  <span class="font-medium text-primary">{{ note.author }}</span>
                  <span>{{ note.time }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Drawer Footer -->
        <div class="p-4 border-t border-primary-border bg-background/60 flex items-center justify-between shrink-0">
          <button
            @click="emit('move-stage', lead)"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer shadow-md"
          >
            <ArrowRightLeft class="w-4 h-4" />
            <span>Advance Lead Stage</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
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

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
