<template>
  <div
    class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/30 min-h-[360px]"
  >
    <!-- ─── HEADER ────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText class="w-4 h-4" />
          </div>
          <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
            KYC Notes & Documents
          </h3>
          <span
            class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {{ totalItemsCount }}
          </span>
        </div>
        <p class="text-xs text-secondary-text mt-0.5">
          Internal remarks, verification logs and attached client reference files.
        </p>
      </div>

      <!-- Actions on Top Right -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Filter Tabs -->
        <div class="flex items-center bg-background p-0.5 rounded-xl border border-primary-border text-xs">
          <button
            type="button"
            @click="activeFilter = 'all'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            All ({{ totalItemsCount }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'notes'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'notes' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            Notes ({{ notesList.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'files'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'files' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            Docs ({{ filesList.length }})
          </button>
        </div>

        <!-- Refresh Button -->
        <button
          type="button"
          @click="refreshData"
          :disabled="clientDepthStore.userReferencesLoading"
          class="w-8 h-8 rounded-xl border border-primary-border flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          title="Refresh references"
        >
          <RefreshCw
            class="w-3.5 h-3.5"
            :class="clientDepthStore.userReferencesLoading ? 'animate-spin text-primary' : ''"
          />
        </button>

        <!-- Add Reference Button (Opens Side Drawer) -->
        <button
          type="button"
          @click="openAddDrawer('doc')"
          class="bg-primary hover:bg-primary-hover text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Note / Doc
        </button>
      </div>
    </div>

    <!-- ─── BODY / TABLE CONTENT ───────────────────────────────────── -->
    <div class="pt-4 flex-1 flex flex-col justify-start">
      <!-- Loading Skeleton -->
      <div v-if="clientDepthStore.userReferencesLoading && filteredItems.length === 0" class="space-y-3 py-2">
        <div v-for="i in 3" :key="i" class="h-14 rounded-xl bg-primary-border/40 animate-pulse" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredItems.length === 0"
        class="py-12 flex flex-col items-center justify-center text-center my-auto"
      >
        <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <FileText class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-primary-text">No KYC references yet</p>
        <p class="text-xs text-secondary-text mt-1 max-w-sm">
          No verification notes or reference documents have been uploaded for this client.
        </p>
        <div class="flex items-center gap-2 mt-4">
          <button
            type="button"
            @click="openAddDrawer('doc')"
            class="border border-primary text-primary hover:bg-primary/10 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Upload class="w-3.5 h-3.5" />
            Upload Document
          </button>
          <button
            type="button"
            @click="openAddDrawer('note')"
            class="border border-primary-border text-primary-text hover:bg-background rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <FileText class="w-3.5 h-3.5 text-secondary-text" />
            Add Note
          </button>
        </div>
      </div>

      <!-- Table of Notes & Documents -->
      <div v-else class="border border-primary-border/80 rounded-xl overflow-hidden overflow-x-auto no-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-background/80 border-b border-primary-border/80 text-[11px] font-bold text-secondary-text uppercase tracking-wider">
              <th class="py-2.5 px-3.5">Reference Details</th>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3">Author / Uploaded By</th>
              <th class="py-2.5 px-3">Date & Time</th>
              <th class="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="item in filteredItems"
              :key="item.uniqueKey"
              class="hover:bg-background/40 transition-colors group cursor-pointer"
              @click="openViewDrawer(item)"
            >
              <!-- Details / Title / Remarks -->
              <td class="py-3 px-3.5 max-w-xs">
                <div class="flex items-start gap-2.5">
                  <!-- Thumbnail Image / Icon -->
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border overflow-hidden bg-background"
                    :class="item.isDoc ? 'border-blue-500/30' : 'border-emerald-500/30'"
                  >
                    <!-- If image preview available -->
                    <img
                      v-if="item.isDoc && item.file_url && isImageFile(item.file_name || item.file_url)"
                      :src="item.file_url"
                      :alt="item.file_name"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <component
                      v-else
                      :is="item.isDoc ? FileImage : FileText"
                      class="w-4 h-4"
                      :class="item.isDoc ? 'text-blue-500' : 'text-emerald-500'"
                    />
                  </div>

                  <!-- Text Preview -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <p class="font-bold text-primary-text text-xs group-hover:text-primary transition-colors truncate">
                        {{ item.title }}
                      </p>
                      <span
                        v-if="item.file_name"
                        class="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold uppercase bg-primary/10 text-primary border border-primary/20"
                      >
                        {{ formatFileNameDisplay(item.file_name) }}
                      </span>
                    </div>
                    <p class="text-[11px] text-secondary-text line-clamp-1 mt-0.5">
                      {{ item.previewText }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Type Badge -->
              <td class="py-3 px-3">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border"
                  :class="
                    item.isDoc
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  "
                >
                  <component :is="item.isDoc ? Paperclip : FileText" class="w-3 h-3" />
                  {{ item.isDoc ? 'Document' : 'Internal Note' }}
                </span>
              </td>

              <!-- Created By / Author -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {{ (item.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-primary-text text-xs truncate max-w-[120px]">
                    {{ item.author || 'Admin User' }}
                  </span>
                </div>
              </td>

              <!-- Date & Time -->
              <td class="py-3 px-3 text-secondary-text text-[11px] font-medium whitespace-nowrap">
                {{ formatDateTime(item.created_at) }}
              </td>

              <!-- Actions (View, Edit, Delete) -->
              <td class="py-3 px-3.5 text-right whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <!-- View Button -->
                  <button
                    type="button"
                    @click="openViewDrawer(item)"
                    class="p-1.5 rounded-lg border border-primary-border/80 text-secondary-text hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                    title="View Details"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <!-- Edit Button -->
                  <button
                    type="button"
                    @click="openEditDrawer(item)"
                    class="p-1.5 rounded-lg border border-primary-border/80 text-secondary-text hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                    title="Edit"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete Button -->
                  <button
                    type="button"
                    @click="openDeleteModal(item)"
                    class="p-1.5 rounded-lg border border-primary-border/80 text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer shadow-2xs"
                    title="Delete"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── 1. VIEW SIDE DRAWER (Slide from Right) ────────────────── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="viewDrawerOpen"
          class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
          @click="closeViewDrawer"
        >
          <!-- Side Drawer Panel -->
          <div
            class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-xl h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
            @click.stop
          >
            <!-- Drawer Header -->
            <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
                  :class="selectedItem?.isDoc ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'"
                >
                  <component :is="selectedItem?.isDoc ? FileImage : FileText" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ selectedItem?.isDoc ? 'KYC Reference Document' : 'KYC Internal Note' }}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    Created on {{ formatDateTime(selectedItem?.created_at) }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="closeViewDrawer"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Drawer Body (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-card-background">
              <!-- Author & Date Info Banner -->
              <div class="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary-border">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">
                    {{ (selectedItem?.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-[10px] text-secondary-text uppercase font-semibold">Author / Uploader</p>
                    <p class="font-bold text-primary-text text-xs">{{ selectedItem?.author || 'Admin User' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">Type</p>
                  <span
                    class="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border"
                    :class="selectedItem?.isDoc ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'"
                  >
                    {{ selectedItem?.isDoc ? 'Document Attachment' : 'Internal Note' }}
                  </span>
                </div>
              </div>

              <!-- Document Name Box (If File) -->
              <div v-if="selectedItem?.isDoc" class="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                  Document Name / Identifier
                </p>
                <div class="flex items-center justify-between gap-2">
                  <p class="font-bold text-sm text-primary font-mono">
                    {{ selectedItem.file_name || 'Document File' }}
                  </p>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-background border border-primary-border font-semibold text-secondary-text uppercase">
                    ID #{{ selectedItem.id }}
                  </span>
                </div>
              </div>

              <!-- Document Image / Attachment Preview -->
              <div v-if="selectedItem?.isDoc || selectedItem?.file_url" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                    Attached Document Preview
                  </span>
                  <a
                    v-if="selectedItem.file_url"
                    :href="selectedItem.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink class="w-3 h-3" />
                    Open Original
                  </a>
                </div>

                <!-- Preview Box -->
                <div class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3">
                  <!-- File Header -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <File class="w-4 h-4 text-primary shrink-0" />
                      <span class="font-bold text-primary-text truncate text-xs">
                        {{ selectedItem.file_name || selectedItem.title }}
                      </span>
                    </div>
                    <span v-if="selectedItem.file_url" class="text-[10px] text-secondary-text font-mono truncate max-w-[160px]">
                      {{ selectedItem.path || '' }}
                    </span>
                  </div>

                  <!-- Image Preview (Full View) -->
                  <div
                    v-if="isImageFile(selectedItem.file_name || selectedItem.file_url)"
                    class="relative rounded-xl overflow-hidden border border-primary-border bg-black/30 flex items-center justify-center p-2 group/preview"
                  >
                    <img
                      :src="selectedItem.file_url"
                      :alt="selectedItem.file_name"
                      class="object-contain max-h-80 w-full rounded-lg transition-transform group-hover/preview:scale-[1.01]"
                    />
                  </div>

                  <!-- PDF Document Preview Card -->
                  <div
                    v-else
                    class="p-6 rounded-xl border border-dashed border-primary-border flex flex-col items-center justify-center text-center gap-2 bg-card-background"
                  >
                    <div class="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <FileText class="w-6 h-6" />
                    </div>
                    <div>
                      <p class="font-bold text-primary-text text-xs">{{ selectedItem.file_name || 'PDF Document' }}</p>
                      <p class="text-[10px] text-secondary-text mt-0.5">Click below to view or download document</p>
                    </div>
                    <a
                      v-if="selectedItem.file_url"
                      :href="selectedItem.file_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-1 px-4 py-1.5 rounded-lg bg-primary text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-primary-hover transition"
                    >
                      <ExternalLink class="w-3.5 h-3.5" />
                      View Document
                    </a>
                  </div>
                </div>
              </div>

              <!-- Remarks / Details Section -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                    Remarks / Internal Notes
                  </span>
                  <button
                    v-if="selectedItem?.remarks"
                    type="button"
                    @click="copyToClipboard(selectedItem.remarks)"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy class="w-3 h-3" />
                    Copy Notes
                  </button>
                </div>
                <div class="p-3.5 rounded-xl bg-background border border-primary-border text-primary-text font-medium leading-relaxed whitespace-pre-wrap">
                  {{ selectedItem?.remarks || 'No remarks provided for this reference.' }}
                </div>
              </div>
            </div>

            <!-- Drawer Footer -->
            <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <button
                type="button"
                @click="openDeleteModal(selectedItem)"
                class="px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </button>
              <div class="flex items-center gap-2.5">
                <button
                  type="button"
                  @click="openEditDrawer(selectedItem)"
                  class="px-4 py-2 text-xs font-semibold text-primary hover:bg-background rounded-xl border border-primary-border transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  @click="closeViewDrawer"
                  class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── 2. ADD / EDIT SIDE DRAWER (Slide from Right) ─────────── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="formDrawerOpen"
          class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
          @click="closeFormDrawer"
        >
          <!-- Side Drawer Panel -->
          <div
            class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-xl h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
            @click.stop
          >
            <!-- Drawer Header -->
            <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <component :is="isEditing ? Pencil : Plus" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ isEditing ? 'Edit KYC Reference' : 'Add KYC Reference / Document' }}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    {{ isEditing ? 'Update document name, file attachment or remarks.' : 'Upload reference documents or log verification remarks.' }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                @click="closeFormDrawer"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Drawer Form Body (Scrollable) -->
            <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-6 space-y-4.5 text-xs bg-card-background">
              <!-- Mode Tabs (Doc vs Note) - only when adding -->
              <div v-if="!isEditing" class="flex items-center p-1 bg-background rounded-xl border border-primary-border">
                <button
                  type="button"
                  @click="drawerMode = 'doc'"
                  class="flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  :class="drawerMode === 'doc' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
                >
                  <Upload class="w-3.5 h-3.5" />
                  <span>Document Upload</span>
                </button>
                <button
                  type="button"
                  @click="drawerMode = 'note'"
                  class="flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  :class="drawerMode === 'note' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
                >
                  <FileText class="w-3.5 h-3.5" />
                  <span>Note Only</span>
                </button>
              </div>

              <!-- 1. Document Name / Type (Only when uploading doc or editing doc) -->
              <div v-if="drawerMode === 'doc' || isEditingDoc" class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-primary-text block">
                    Document Name / Type <span class="text-primary-red">*</span>
                  </label>
                  <span class="text-[10px] text-secondary-text">e.g. adhar_front, pan_card</span>
                </div>

                <input
                  v-model="formFileName"
                  type="text"
                  placeholder="e.g. adhar_front, pan_card, passport, bank_statement"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  :required="drawerMode === 'doc' || isEditingDoc"
                />

                <!-- Quick Suggestion Preset Chips -->
                <div class="space-y-1">
                  <p class="text-[10px] font-semibold text-secondary-text">Quick Presets:</p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="preset in documentPresets"
                      :key="preset.value"
                      type="button"
                      @click="selectPreset(preset.value)"
                      class="px-2 py-0.8 rounded-lg text-[10px] font-mono font-medium border transition cursor-pointer"
                      :class="formFileName === preset.value
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-background border-primary-border text-secondary-text hover:border-primary hover:text-primary'"
                    >
                      {{ preset.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 2. File Attachment & Preview (For Document Mode) -->
              <div v-if="drawerMode === 'doc' || isEditingDoc" class="space-y-2">
                <label class="font-bold text-primary-text block">
                  Document File <span v-if="!isEditing" class="text-primary-red">*</span>
                </label>

                <!-- A. If NEW Local File Selected -->
                <div
                  v-if="selectedFile"
                  class="border border-primary/40 rounded-xl p-3.5 bg-primary/5 space-y-3"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <File class="w-4 h-4 text-primary shrink-0" />
                      <div class="min-w-0">
                        <p class="font-bold text-primary-text truncate text-xs">{{ selectedFile.name }}</p>
                        <p class="text-[10px] text-secondary-text font-mono">
                          {{ (selectedFile.size / 1024).toFixed(1) }} KB · Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="removeSelectedFile"
                      class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove selected file"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Live Image Preview -->
                  <div
                    v-if="localPreviewUrl"
                    class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 max-h-56 flex items-center justify-center p-2"
                  >
                    <img
                      :src="localPreviewUrl"
                      alt="Selected preview"
                      class="object-contain max-h-52 w-full rounded"
                    />
                  </div>
                </div>

                <!-- B. If Existing File in Edit Mode (No new file chosen yet) -->
                <div
                  v-else-if="isEditing && existingFileUrl"
                  class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <File class="w-4 h-4 text-primary shrink-0" />
                      <div class="min-w-0">
                        <p class="font-bold text-primary-text truncate text-xs">{{ formFileName || 'Existing Document' }}</p>
                        <p class="text-[10px] text-secondary-text">Current uploaded document</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="triggerFileInput"
                      class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                    >
                      Replace File
                    </button>
                  </div>

                  <!-- Existing Image Preview -->
                  <div
                    v-if="isImageFile(existingFileUrl)"
                    class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 max-h-56 flex items-center justify-center p-2"
                  >
                    <img
                      :src="existingFileUrl"
                      :alt="formFileName"
                      class="object-contain max-h-52 w-full rounded"
                    />
                  </div>
                </div>

                <!-- C. Dropzone / File Picker (When no file selected) -->
                <div
                  v-else
                  @click="triggerFileInput"
                  class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group"
                >
                  <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
                    <Upload class="w-5 h-5" />
                  </div>
                  <p class="font-bold text-primary-text text-xs">
                    Click to browse or drag file here
                  </p>
                  <p class="text-[10px] text-secondary-text mt-0.5">
                    PNG, JPG, JPEG, WEBP, PDF (Max. 10MB)
                  </p>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*,.pdf"
                    class="hidden"
                    @change="handleFileSelected"
                  />
                </div>
              </div>

              <!-- 3. Remarks / Internal Note -->
              <div class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Remarks / Internal Notes
                  <span v-if="drawerMode === 'note'" class="text-primary-red">*</span>
                </label>
                <textarea
                  v-model="formRemarks"
                  rows="4"
                  placeholder="e.g. Identity verified via phone consultation, documents matched with government registry..."
                  class="w-full p-3.5 resize-none border border-primary-border rounded-xl bg-background text-primary-text placeholder:text-secondary-text/60 focus:outline-hidden focus:border-primary text-xs"
                  :required="drawerMode === 'note'"
                ></textarea>
                <p class="text-[10px] text-secondary-text">
                  Add optional internal details, audit notes, or remarks for this record.
                </p>
              </div>

              <!-- Drawer Submit Button Area (inside scrollable or sticky footer) -->
              <div class="pt-4 border-t border-primary-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  @click="closeFormDrawer"
                  class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="clientDepthStore.isSubmittingReference || (drawerMode === 'note' && !formRemarks.trim()) || (drawerMode === 'doc' && !isEditing && !selectedFile && !formFileName.trim())"
                  class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Loader2
                    v-if="clientDepthStore.isSubmittingReference"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <span>{{ isEditing ? 'Save Changes' : 'Submit Reference' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── 3. DELETE CONFIRMATION MODAL ─────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="deleteModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
          @click="closeDeleteModal"
        >
          <div
            class="bg-card-background border border-primary-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 cursor-default"
            @click.stop
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-base">Delete KYC Reference?</h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Are you sure you want to delete this reference item? This action cannot be undone.
                </p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-background border border-primary-border text-xs text-primary-text font-medium">
              <p class="font-bold">{{ itemToDelete?.file_name || itemToDelete?.title || 'Selected Reference' }}</p>
              <p class="text-[11px] text-secondary-text mt-0.5 line-clamp-2">{{ itemToDelete?.remarks || '—' }}</p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-primary-border">
              <button
                type="button"
                @click="closeDeleteModal"
                class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmDelete"
                :disabled="clientDepthStore.isDeletingReference"
                class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Loader2
                  v-if="clientDepthStore.isDeletingReference"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <span>Delete Reference</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import {
  FileText,
  FileImage,
  File,
  Paperclip,
  Eye,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  X,
  ExternalLink,
  Copy,
  AlertTriangle,
  Upload,
} from "lucide-vue-next";

const props = defineProps({
  userId: {
    type: [String, Number],
    default: null,
  },
});

const route = useRoute();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();

const activeFilter = ref("all"); // 'all' | 'notes' | 'files'

const currentUserId = computed(() => {
  return props.userId || route.params.id || clientDepthStore.activeClient?.id;
});

// Document Presets
const documentPresets = [
  { label: "Aadhaar Front", value: "addhar_front" },
  { label: "Aadhaar Back", value: "addhar_back" },
  { label: "PAN Card", value: "pan_card" },
  { label: "Passport", value: "passport" },
  { label: "Driving License", value: "driving_license" },
  { label: "Bank Statement", value: "bank_statement" },
  { label: "Utility Bill", value: "utility_bill" },
];

const selectPreset = (val) => {
  formFileName.value = val;
};

const formatFileNameDisplay = (fileName) => {
  if (!fileName) return "";
  return fileName.replace(/_/g, " ");
};

// ─── Fetch References ─────────────────────────────────────────────────────────
const loadReferences = (force = false) => {
  if (currentUserId.value) {
    clientDepthStore.fetchUserReferences(currentUserId.value, force);
  }
};

onMounted(() => {
  loadReferences(true);
});

watch(
  () => currentUserId.value,
  (newId) => {
    if (newId) loadReferences(true);
  },
);

const refreshData = () => {
  loadReferences(true);
};

// ─── Resolvers for Notes & Files ──────────────────────────────────────────────
const rawData = computed(() => {
  return clientDepthStore.userReferencesData || {};
});

const notesList = computed(() => {
  const notes = rawData.value?.notes || [];
  return notes.map((n, idx) => ({
    uniqueKey: `note-${n.id || idx}`,
    id: n.id,
    isDoc: false,
    file_name: null,
    title: n.creator_name ? `${n.creator_name}'s Note` : "Internal Verification Note",
    remarks: n.remarks || n.note || n.text || "",
    previewText: n.remarks || n.note || n.text || "—",
    author: n.creator_name || n.uploaded_by_name || "Admin User",
    created_at: n.created_at || rawData.value?.created_at || new Date().toISOString(),
    raw: n,
  }));
});

const filesList = computed(() => {
  const files = rawData.value?.files || [];
  return files.map((f, idx) => ({
    uniqueKey: `file-${f.id || idx}`,
    id: f.id,
    isDoc: true,
    file_name: f.file_name || `Reference Document #${f.id || idx + 1}`,
    title: f.file_name ? formatFileNameDisplay(f.file_name) : `Document #${f.id || idx + 1}`,
    remarks: f.remarks || "",
    previewText: f.remarks || f.path || f.file_name || "Attached document",
    file_url: f.formatted_path || f.path || null,
    path: f.path || null,
    author: f.uploaded_by_name || "Admin User",
    created_at: f.created_at || rawData.value?.created_at || new Date().toISOString(),
    raw: f,
  }));
});

const combinedItems = computed(() => {
  const all = [...notesList.value, ...filesList.value];
  return all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
});

const totalItemsCount = computed(() => {
  return notesList.value.length + filesList.value.length;
});

const filteredItems = computed(() => {
  if (activeFilter.value === "notes") return notesList.value;
  if (activeFilter.value === "files") return filesList.value;
  return combinedItems.value;
});

// ─── Formatting Utilities ─────────────────────────────────────────────────────
const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const isImageFile = (filenameOrUrl) => {
  if (!filenameOrUrl) return false;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(filenameOrUrl);
};

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show("Remarks copied to clipboard!", "success");
};

// ─── View Drawer State ────────────────────────────────────────────────────────
const selectedItem = ref(null);
const viewDrawerOpen = ref(false);

const openViewDrawer = (item) => {
  selectedItem.value = item;
  viewDrawerOpen.value = true;
};

const closeViewDrawer = () => {
  viewDrawerOpen.value = false;
};

// ─── Add / Edit Drawer State ──────────────────────────────────────────────────
const formDrawerOpen = ref(false);
const isEditing = ref(false);
const isEditingDoc = ref(false);
const editingItemId = ref(null);
const drawerMode = ref("doc"); // 'doc' | 'note'
const formFileName = ref("");
const formRemarks = ref("");
const selectedFile = ref(null);
const localPreviewUrl = ref(null);
const existingFileUrl = ref(null);
const fileInputRef = ref(null);

const openAddDrawer = (mode = "doc") => {
  if (viewDrawerOpen.value) closeViewDrawer();
  isEditing.value = false;
  isEditingDoc.value = mode === "doc";
  drawerMode.value = mode;
  editingItemId.value = null;
  formFileName.value = "";
  formRemarks.value = "";
  selectedFile.value = null;
  localPreviewUrl.value = null;
  existingFileUrl.value = null;
  formDrawerOpen.value = true;
};

const openEditDrawer = (item) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  isEditing.value = true;
  isEditingDoc.value = item.isDoc;
  drawerMode.value = item.isDoc ? "doc" : "note";
  editingItemId.value = item.id;
  formFileName.value = item.file_name || "";
  formRemarks.value = item.remarks || "";
  selectedFile.value = null;
  localPreviewUrl.value = null;
  existingFileUrl.value = item.file_url || null;
  formDrawerOpen.value = true;
};

const closeFormDrawer = () => {
  formDrawerOpen.value = false;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    selectedFile.value = file;
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value);
    }
    localPreviewUrl.value = URL.createObjectURL(file);

    // Auto-fill file_name if empty
    if (!formFileName.value.trim()) {
      const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_").toLowerCase();
      formFileName.value = rawName;
    }
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const submitForm = () => {
  if (!currentUserId.value) return;

  const isDocType = drawerMode.value === "doc" || isEditingDoc.value;

  // Build Payload
  let payload;
  if (selectedFile.value || isDocType) {
    payload = new FormData();
    payload.append("user_id", currentUserId.value);
    if (formRemarks.value.trim()) {
      payload.append("remarks", formRemarks.value.trim());
    }
    if (formFileName.value.trim()) {
      payload.append("file_name", formFileName.value.trim());
      payload.append("doc_name", formFileName.value.trim());
    }
    if (selectedFile.value) {
      payload.append("file", selectedFile.value);
    }
    if (isEditing.value && editingItemId.value) {
      payload.append("id", editingItemId.value);
      if (isDocType) {
        payload.append("file_id", editingItemId.value);
      } else {
        payload.append("note_id", editingItemId.value);
      }
    }
  } else {
    payload = {
      user_id: currentUserId.value,
      remarks: formRemarks.value.trim(),
      ...(isEditing.value && editingItemId.value ? { id: editingItemId.value, note_id: editingItemId.value } : {}),
    };
  }

  if (isEditing.value) {
    clientDepthStore.updateUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormDrawer();
    });
  } else {
    clientDepthStore.addUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormDrawer();
    });
  }
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const deleteModalOpen = ref(false);
const itemToDelete = ref(null);

const openDeleteModal = (item) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  itemToDelete.value = item;
  deleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  itemToDelete.value = null;
};

const confirmDelete = () => {
  if (!itemToDelete.value || !currentUserId.value) return;

  const payload = {
    user_id: currentUserId.value,
    id: itemToDelete.value.id,
    note_id: itemToDelete.value.isDoc ? undefined : itemToDelete.value.id,
    file_id: itemToDelete.value.isDoc ? itemToDelete.value.id : undefined,
  };

  clientDepthStore.deleteUserReference(currentUserId.value, payload, (err) => {
    if (!err) closeDeleteModal();
  });
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .transform,
.drawer-fade-leave-active .transform {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .transform,
.drawer-fade-leave-to .transform {
  transform: translateX(100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
