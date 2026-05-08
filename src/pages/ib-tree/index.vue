<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1">
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="viewMode === 'table' ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
          @click="viewMode = 'table'"
        >
          Table
        </button>
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="viewMode === 'tree' ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
          @click="viewMode = 'tree'"
        >
          Tree
        </button>
      </div>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
        @click="openAdd"
      >
        <Plus class="w-3.5 h-3.5" /> Add IB
      </button>
    </div>

    <!-- Tree View -->
    <div v-if="viewMode === 'tree'">
      <div v-if="store.isLoading" class="space-y-2 animate-pulse">
        <div v-for="n in 4" :key="n" class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-card-background">
          <div class="flex items-center gap-2.5">
            <div class="w-3.5 h-3.5 bg-background rounded" />
            <div class="h-3 w-36 bg-background rounded" />
          </div>
          <div class="flex items-center gap-3">
            <div class="h-3 w-8 bg-background rounded" />
            <div class="h-5 w-8 bg-background rounded-full" />
          </div>
        </div>
      </div>
      <IbTree
        v-else
        :items="store.data"
        :expanded="expanded"
        @toggle="toggleRow"
        @edit="openEdit"
        @add-sub="openAddSub"
      />
    </div>

    <!-- Table View -->
    <div v-else class="w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">IB Name</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Referral Code</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Split</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Level</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Actions</th>
          </tr>
        </thead>

        <tbody v-if="store.isLoading">
          <tr v-for="n in 5" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="px-3 py-3.5 align-middle">
              <div class="flex items-center gap-2">
                <div class="w-3.5 h-3.5 bg-card-background rounded" />
                <div class="h-3 w-36 bg-card-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-24 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-5 w-8 bg-card-background rounded-full" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-5 w-16 bg-card-background rounded ml-auto" /></td>
          </tr>
        </tbody>

        <tbody v-else>
          <IbTreeRow
            :nodes="store.data"
            :expanded="expanded"
            @toggle="toggleRow"
            @add-sub="openAddSub"
            @edit="openEdit"
          />
        </tbody>
      </table>
    </div>

    <IbDialog
      :open="dialog.open"
      :edit-data="dialog.editData"
      :parent-ib-id="dialog.parentIbId"
      @close="dialog.open = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useIbTreeStore } from '@/stores/ibTree/ibTree'
import IbTreeRow from '@/components/ibTree/IbTreeRow.vue'
import IbTree from '@/components/ibTree/IbTree.vue'
import IbDialog from '@/components/ibTree/IbDialog.vue'

const store = useIbTreeStore()
const expanded = ref({})
const viewMode = ref('table')
const dialog = ref({ open: false, editData: null, parentIbId: null })

const openAdd = () => { dialog.value = { open: true, editData: null, parentIbId: null } }
const openAddSub = (id) => { dialog.value = { open: true, editData: null, parentIbId: id } }
const openEdit = (node) => { dialog.value = { open: true, editData: node, parentIbId: null } }
const toggleRow = (id) => { expanded.value[id] = !expanded.value[id] }

onMounted(() => { store.fetchIbTree() })
</script>
