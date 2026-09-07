<template>
  <div
    class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6 flex flex-col justify-between min-h-[360px] flex-1"
  >
    <!-- ─── HEADER ────────────────────────────────────────────────── -->
    <div class="flex flex-col justify-between gap-3 pb-4 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Files class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
              Documents
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {{ filesList.length }}
              </span>
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">Uploaded documents for this client.</p>
          </div>
        </div>
      </div>

      <!-- Actions on Top Right -->
      <div class="flex justify-between items-center gap-2 flex-wrap">
        <!-- Filter Tabs -->
        <div class="flex items-center bg-background p-0.5 rounded-xl border border-primary-border text-xs">
          <button
            type="button"
            @click="activeFilter = 'all'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            All ({{ filesList.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'docs'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'docs' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            PDF / Docs ({{ docCount }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'images'"
            class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
            :class="activeFilter === 'images' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text'"
          >
            Images ({{ imageCount }})
          </button>
        </div>
        <div class="flex items-center gap-2">

          <button
            type="button"
            @click="refreshData"
            :disabled="clientDepthStore.userReferencesLoading"
            class="w-8 h-8 rounded-xl border border-primary-border flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh documents"
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              :class="clientDepthStore.userReferencesLoading ? 'animate-spin text-primary' : ''"
            />
          </button>
  
          <!-- Upload Document / Image Button -->
          <button
            type="button"
            @click="openAddDrawer('document')"
            class="bg-primary hover:bg-primary-hover text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
          >
            <Upload class="w-3.5 h-3.5" />
            Upload Doc / Img
          </button>

        </div>
        <!-- Refresh Button -->
      </div>
    </div>

    <!-- ─── BODY / TABLE CONTENT ───────────────────────────────────── -->
    <div class="pt-4 flex-1 flex flex-col justify-start">
      <!-- Loading Skeleton -->
      <div v-if="clientDepthStore.userReferencesLoading && filesList.length === 0" class="space-y-3 py-2">
        <div v-for="i in 3" :key="i" class="h-14 rounded-xl bg-primary-border/40 animate-pulse" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredFiles.length === 0"
        class="py-12 flex flex-col items-center justify-center text-center my-auto"
      >
        <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <Files class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-primary-text">No KYC documents or images uploaded</p>
        <p class="text-xs text-secondary-text mt-1 max-w-sm">
          Upload Aadhaar, PAN card, Passport, driving license or bank statements for verification.
        </p>
        <div class="flex items-center gap-2 mt-4">
          <button
            type="button"
            @click="openAddDrawer('document')"
            class="border border-primary text-primary hover:bg-primary/10 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Upload class="w-3.5 h-3.5" />
            Upload Document
          </button>
          <button
            type="button"
            @click="openAddDrawer('image')"
            class="border border-primary-border text-primary-text hover:bg-background rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <ImageIcon class="w-3.5 h-3.5 text-secondary-text" />
            Upload Image
          </button>
        </div>
      </div>

      <!-- Table of Documents & Images (Scrollable with sticky header) -->
      <div v-else class="flex-1 flex flex-col min-h-0 border border-primary-border/80 rounded-lg overflow-x-auto overflow-y-auto max-h-[380px] no-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10 bg-card-background border-b border-primary-border/80">
            <tr class="bg-card-background text-[11px] font-bold text-secondary-text uppercase tracking-wider">
              <th class="py-2.5 px-3.5 bg-card-background">Document Details</th>
              <th class="py-2.5 px-3 bg-card-background">Type</th>
              <th class="py-2.5 px-3 bg-card-background">Uploaded By</th>
              <th class="py-2.5 px-3 bg-card-background">Date & Time</th>
              <th class="py-2.5 px-3.5 text-right bg-card-background">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="item in filteredFiles"
              :key="item.uniqueKey"
              class="hover:bg-background/40 transition-colors group cursor-pointer"
              @click="openViewDrawer(item)"
            >
              <!-- Details / Title / Remarks -->
              <td class="py-3 px-3.5 max-w-xs">
                <div class="flex items-start gap-2.5">
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
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                >
                  <component :is="isImageFile(item.file_name || item.file_url) ? ImageIcon : FileText" class="w-3 h-3" />
                  {{ isImageFile(item.file_name || item.file_url) ? 'Image' : 'Document' }}
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

              <!-- Actions (Three-dot DropdownMenu) -->
              <td class="py-2.5 px-3.5 text-right whitespace-nowrap" @click.stop>
                <div class="inline-flex justify-end">
                  <DropdownMenu
                    :items="getDocumentActions(item)"
                    position="bottom-end"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── 1. VIEW DOCUMENT SIDE DRAWER (Slide from Right) ────────── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="viewDrawerOpen"
          class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
          @click="closeViewDrawer"
        >
          <div
            class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-xl h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
            @click.stop
          >
            <!-- Drawer Header -->
            <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 bg-blue-500/10 border-blue-500/20 text-blue-500">
                  <component :is="isImageFile(selectedItem?.file_name || selectedItem?.file_url) ? ImageIcon : FileText" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    KYC Reference Document
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    Uploaded on {{ formatDateTime(selectedItem?.created_at) }}
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
              <!-- Author Banner -->
              <div class="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary-border">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">
                    {{ (selectedItem?.author || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-[10px] text-secondary-text uppercase font-semibold">Uploader</p>
                    <p class="font-bold text-primary-text text-xs">{{ selectedItem?.author || 'Admin User' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">Type</p>
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {{ isImageFile(selectedItem?.file_name || selectedItem?.file_url) ? 'Image' : 'Document' }}
                  </span>
                </div>
              </div>

              <!-- Document Name Box -->
              <div class="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                  Document Name / Identifier
                </p>
                <div class="flex items-center justify-between gap-2">
                  <p class="font-bold text-sm text-primary font-mono">
                    {{ selectedItem?.file_name || 'Document File' }}
                  </p>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-background border border-primary-border font-semibold text-secondary-text uppercase">
                    ID #{{ selectedItem?.id }}
                  </span>
                </div>
              </div>

              <!-- Attachment Preview -->
              <div v-if="selectedItem?.file_url" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                    Document Attachment Preview
                  </span>
                  <a
                    :href="selectedItem.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink class="w-3 h-3" />
                    Open Original
                  </a>
                </div>

                <div class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3">
                  <!-- File Header -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <File class="w-4 h-4 text-primary shrink-0" />
                      <span class="font-bold text-primary-text truncate text-xs">
                        {{ selectedItem.file_name || selectedItem.title }}
                      </span>
                    </div>
                    <span class="text-[10px] text-secondary-text font-mono truncate max-w-[160px]">
                      {{ selectedItem.path || '' }}
                    </span>
                  </div>

                  <!-- Image Preview -->
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

              <!-- Description / Details Section -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-secondary-text text-[11px] uppercase tracking-wider">
                    Description / Remarks
                  </span>
                  <button
                    v-if="selectedItem?.remarks"
                    type="button"
                    @click="copyToClipboard(selectedItem.remarks)"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy class="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div class="p-3.5 rounded-xl bg-background border border-primary-border text-primary-text font-medium leading-relaxed whitespace-pre-wrap">
                  {{ selectedItem?.remarks || 'No description provided for this document.' }}
                </div>
              </div>
            </div>

            <!-- Footer -->
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

    <!-- ─── 2. ADD / EDIT DOCUMENT SIDE DRAWER (Slide from Right) ── -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="formDrawerOpen"
          class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
          @click="closeFormDrawer"
        >
          <div
            class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-xl h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
            @click.stop
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <component :is="isEditing ? Pencil : Upload" class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ isEditing ? 'Edit KYC Document' : 'Upload KYC Document / Image' }}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    {{ isEditing ? 'Update document name, file attachment or description.' : 'Upload client identity proof, scanned documents or images.' }}
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

            <!-- Form Body -->
            <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-6 space-y-4.5 text-xs bg-card-background">
              <!-- STEP 1: Type Selection (Document vs Image) - only when adding -->
              <div v-if="!isEditing" class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Select Upload Type <span class="text-primary-red">*</span>
                </label>
                <div class="grid grid-cols-2 gap-2 bg-background p-1 rounded-xl border border-primary-border">
                  <button
                    type="button"
                    @click="setUploadCategory('document')"
                    class="py-2 px-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-center"
                    :class="uploadCategory === 'document' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60'"
                  >
                    <FileText class="w-4 h-4" />
                    <span>Document (PDF / DOC)</span>
                  </button>

                  <button
                    type="button"
                    @click="setUploadCategory('image')"
                    class="py-2 px-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-center"
                    :class="uploadCategory === 'image' ? 'bg-primary text-white shadow-2xs' : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60'"
                  >
                    <ImageIcon class="w-4 h-4" />
                    <span>Image (Single / Dual)</span>
                  </button>
                </div>
              </div>

              <!-- STEP 2 (IF IMAGE): Single Image vs Multiple (Front & Back) -->
              <div v-if="!isEditing && uploadCategory === 'image'" class="space-y-2 p-3.5 rounded-xl bg-background border border-primary-border">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-primary-text block text-[11px]">
                    Image Upload Condition <span class="text-primary-red">*</span>
                  </label>
                  <span class="text-[10px] text-secondary-text">Single or Dual (Front & Back)</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="setImageUploadMode('single')"
                    class="p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-left"
                    :class="imageUploadMode === 'single'
                      ? 'bg-primary/10 border-primary text-primary shadow-2xs'
                      : 'bg-card-background border-primary-border text-secondary-text hover:border-primary/40 hover:text-primary-text'"
                  >
                    <div
                      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      :class="imageUploadMode === 'single' ? 'bg-primary text-white border-primary' : 'bg-background border-primary-border text-secondary-text'"
                    >
                      <ImageIcon class="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p class="font-bold text-xs">Single Image</p>
                      <p class="text-[10px] opacity-75">1 file (file_name)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    @click="setImageUploadMode('dual')"
                    class="p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-left"
                    :class="imageUploadMode === 'dual'
                      ? 'bg-primary/10 border-primary text-primary shadow-2xs'
                      : 'bg-card-background border-primary-border text-secondary-text hover:border-primary/40 hover:text-primary-text'"
                  >
                    <div
                      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      :class="imageUploadMode === 'dual' ? 'bg-primary text-white border-primary' : 'bg-background border-primary-border text-secondary-text'"
                    >
                      <Images class="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p class="font-bold text-xs">Front & Back</p>
                      <p class="text-[10px] opacity-75">Dual files (front & back)</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- ── CASE A: DOCUMENT UPLOAD (Single File) ── -->
              <template v-if="(uploadCategory === 'document' && !isEditing) || (isEditing && !isImageFile(existingFileUrl))">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      Document Name / Type <span class="text-primary-red">*</span>
                    </label>
                    <span class="text-[10px] text-secondary-text">e.g. bank_statement</span>
                  </div>

                  <input
                    v-model="formFileName"
                    type="text"
                    placeholder="e.g. bank_statement, utility_bill, agreement, salary_slip"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                    required
                  />

                  <!-- Quick Presets -->
                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold text-secondary-text">Document Presets:</p>
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

                <!-- Single File Picker -->
                <div class="space-y-2">
                  <label class="font-bold text-primary-text block">
                    Upload Document File (PDF / DOC) <span v-if="!isEditing" class="text-primary-red">*</span>
                  </label>

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
                        @click="removeSingleFile"
                        class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    v-else-if="isEditing && existingFileUrl"
                    class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <File class="w-4 h-4 text-primary shrink-0" />
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">{{ formFileName || 'Existing Document' }}</p>
                          <p class="text-[10px] text-secondary-text">Current document</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="triggerSingleFileInput"
                        class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                      >
                        Replace File
                      </button>
                    </div>
                  </div>

                  <div
                    v-else
                    @click="triggerSingleFileInput"
                    class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group"
                  >
                    <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
                      <Upload class="w-5 h-5" />
                    </div>
                    <p class="font-bold text-primary-text text-xs">
                      Click to browse or drop document
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      PDF, DOC, DOCX, XLS, TXT (Single file, Max 10MB)
                    </p>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf"
                      class="hidden"
                      @change="handleSingleFileSelected"
                    />
                  </div>
                </div>
              </template>

              <!-- ── CASE B: SINGLE IMAGE UPLOAD ── -->
              <template v-if="(uploadCategory === 'image' && imageUploadMode === 'single' && !isEditing) || (isEditing && isImageFile(existingFileUrl))">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      Image / Document Name <span class="text-primary-red">*</span>
                    </label>
                    <span class="text-[10px] text-secondary-text">e.g. pan_card, passport</span>
                  </div>

                  <input
                    v-model="formFileName"
                    type="text"
                    placeholder="e.g. pan_card, passport, photo, signature"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                    required
                  />

                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold text-secondary-text">Single Image Presets:</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="preset in singleImagePresets"
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

                <!-- File Picker -->
                <div class="space-y-2">
                  <label class="font-bold text-primary-text block">
                    Image File <span v-if="!isEditing" class="text-primary-red">*</span>
                  </label>

                  <div
                    v-if="selectedFile"
                    class="border border-primary/40 rounded-xl p-3.5 bg-primary/5 space-y-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <ImageIcon class="w-4 h-4 text-primary shrink-0" />
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">{{ selectedFile.name }}</p>
                          <p class="text-[10px] text-secondary-text font-mono">
                            {{ (selectedFile.size / 1024).toFixed(1) }} KB · Ready
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="removeSingleFile"
                        class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>

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

                  <div
                    v-else-if="isEditing && existingFileUrl"
                    class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <ImageIcon class="w-4 h-4 text-primary shrink-0" />
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">{{ formFileName || 'Existing Image' }}</p>
                          <p class="text-[10px] text-secondary-text">Current image</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="triggerSingleFileInput"
                        class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                      >
                        Replace Image
                      </button>
                    </div>

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

                  <div
                    v-else
                    @click="triggerSingleFileInput"
                    class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group"
                  >
                    <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
                      <Upload class="w-5 h-5" />
                    </div>
                    <p class="font-bold text-primary-text text-xs">
                      Click to browse or drop single image
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      PNG, JPG, JPEG, WEBP (Single file, Max 10MB)
                    </p>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleSingleFileSelected"
                    />
                  </div>
                </div>
              </template>

              <!-- ── CASE C: DUAL IMAGES (FRONT & BACK) ── -->
              <template v-if="uploadCategory === 'image' && imageUploadMode === 'dual' && !isEditing">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      Document / ID Type <span class="text-secondary-text font-normal">(Optional Name)</span>
                    </label>
                    <span class="text-[10px] text-secondary-text">e.g. aadhaar_card</span>
                  </div>

                  <input
                    v-model="formFileName"
                    type="text"
                    placeholder="e.g. aadhaar_card, driving_license, voter_id"
                    class="w-full px-3.5 py-2 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                  />

                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold text-secondary-text">Dual Image Presets:</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="preset in dualImagePresets"
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

                <!-- Dual Dropzones -->
                <div class="space-y-3 pt-1">
                  <div class="flex items-center justify-between">
                    <p class="font-bold text-primary-text text-xs">
                      Upload Both Images <span class="text-primary-red">*</span>
                    </p>
                    <span class="text-[10px] text-secondary-text font-mono">front & back</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- 1. FRONT -->
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-primary-text flex items-center gap-1">
                          <span class="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
                          Front Image <span class="text-primary-red">*</span>
                        </span>
                        <span v-if="frontFile" class="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-0.5">
                          <CheckCircle2 class="w-3 h-3" /> Ready
                        </span>
                      </div>

                      <div
                        v-if="frontFile"
                        class="border border-primary/40 rounded-xl p-2.5 bg-primary/5 space-y-2"
                      >
                        <div class="flex items-center justify-between gap-1.5">
                          <div class="min-w-0 flex-1">
                            <p class="font-bold text-primary-text truncate text-[11px]">{{ frontFile.name }}</p>
                            <p class="text-[9px] text-secondary-text font-mono">
                              {{ (frontFile.size / 1024).toFixed(1) }} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            @click="removeFrontFile"
                            class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remove front"
                          >
                            <X class="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div
                          v-if="frontPreviewUrl"
                          class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-32 flex items-center justify-center p-1"
                        >
                          <img
                            :src="frontPreviewUrl"
                            alt="Front preview"
                            class="object-contain max-h-30 w-full rounded"
                          />
                        </div>
                      </div>

                      <div
                        v-else
                        @click="triggerFrontFileInput"
                        class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group min-h-[140px]"
                      >
                        <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform">
                          <Upload class="w-4 h-4" />
                        </div>
                        <p class="font-bold text-primary-text text-[11px]">
                          Upload Front Side
                        </p>
                        <p class="text-[9px] text-secondary-text mt-0.5">
                          front (JPG, PNG)
                        </p>
                        <input
                          ref="frontFileInputRef"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleFrontFileSelected"
                        />
                      </div>
                    </div>

                    <!-- 2. BACK -->
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-primary-text flex items-center gap-1">
                          <span class="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
                          Back Image <span class="text-primary-red">*</span>
                        </span>
                        <span v-if="backFile" class="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-0.5">
                          <CheckCircle2 class="w-3 h-3" /> Ready
                        </span>
                      </div>

                      <div
                        v-if="backFile"
                        class="border border-primary/40 rounded-xl p-2.5 bg-primary/5 space-y-2"
                      >
                        <div class="flex items-center justify-between gap-1.5">
                          <div class="min-w-0 flex-1">
                            <p class="font-bold text-primary-text truncate text-[11px]">{{ backFile.name }}</p>
                            <p class="text-[9px] text-secondary-text font-mono">
                              {{ (backFile.size / 1024).toFixed(1) }} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            @click="removeBackFile"
                            class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remove back"
                          >
                            <X class="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div
                          v-if="backPreviewUrl"
                          class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-32 flex items-center justify-center p-1"
                        >
                          <img
                            :src="backPreviewUrl"
                            alt="Back preview"
                            class="object-contain max-h-30 w-full rounded"
                          />
                        </div>
                      </div>

                      <div
                        v-else
                        @click="triggerBackFileInput"
                        class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group min-h-[140px]"
                      >
                        <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform">
                          <Upload class="w-4 h-4" />
                        </div>
                        <p class="font-bold text-primary-text text-[11px]">
                          Upload Back Side
                        </p>
                        <p class="text-[9px] text-secondary-text mt-0.5">
                          back (JPG, PNG)
                        </p>
                        <input
                          ref="backFileInputRef"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleBackFileSelected"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Description / Remarks -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-primary-text block">
                    Description / Remarks
                  </label>
                  <span class="text-[10px] text-secondary-text">Optional</span>
                </div>
                <textarea
                  v-model="formRemarks"
                  rows="3"
                  placeholder="e.g. Government issued card, valid till 2030, address verified..."
                  class="w-full p-3.5 resize-none border border-primary-border rounded-xl bg-background text-primary-text placeholder:text-secondary-text/60 focus:outline-hidden focus:border-primary text-xs"
                ></textarea>
                <p class="text-[10px] text-secondary-text">
                  Add optional details or compliance notes for this document.
                </p>
              </div>

              <!-- Drawer Submit Button Area -->
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
                  :disabled="isSubmitDisabled"
                  class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Loader2
                    v-if="clientDepthStore.isSubmittingReference"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <span>{{ isEditing ? 'Save Changes' : 'Upload Document' }}</span>
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
                <h3 class="font-bold text-primary-text text-base">Delete KYC Document?</h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Are you sure you want to delete this document? This action cannot be undone.
                </p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-background border border-primary-border text-xs text-primary-text font-medium">
              <p class="font-bold">{{ itemToDelete?.file_name || itemToDelete?.title || 'Selected Document' }}</p>
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
                <span>Delete Document</span>
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
  File,
  Files,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  ExternalLink,
  Copy,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Images,
  CheckCircle2,
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

const activeFilter = ref("all"); // 'all' | 'docs' | 'images'

const currentUserId = computed(() => {
  return props.userId || route.params.id || clientDepthStore.activeClient?.id;
});

// Presets
const documentPresets = [
  { label: "Bank Statement", value: "bank_statement" },
  { label: "Salary Slip", value: "salary_slip" },
  { label: "Utility Bill", value: "utility_bill" },
  { label: "Agreement / Contract", value: "agreement" },
  { label: "Tax Return", value: "tax_return" },
  { label: "Business Reg.", value: "business_registration" },
];

const singleImagePresets = [
  { label: "PAN Card", value: "pan_card" },
  { label: "Passport", value: "passport" },
  { label: "Driving License", value: "driving_license" },
  { label: "Profile Photo", value: "client_photo" },
  { label: "Signature", value: "signature" },
];

const dualImagePresets = [
  { label: "Aadhaar Card", value: "aadhaar_card" },
  { label: "Driving License", value: "driving_license" },
  { label: "Voter ID Card", value: "voter_id" },
  { label: "National ID", value: "national_id" },
  { label: "Residence Card", value: "residence_card" },
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

// ─── Resolvers for Files ──────────────────────────────────────────────────────
const rawData = computed(() => {
  return clientDepthStore.userReferencesData || {};
});

const isImageFile = (filenameOrUrl) => {
  if (!filenameOrUrl) return false;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(filenameOrUrl);
};

const filesList = computed(() => {
  const files = rawData.value?.files || [];
  return files
    .map((f, idx) => ({
      uniqueKey: `file-${f.id || idx}`,
      id: f.id,
      isDoc: true,
      file_name: f.file_name || `Reference Document #${f.id || idx + 1}`,
      title: f.file_name ? formatFileNameDisplay(f.file_name) : `Document #${f.id || idx + 1}`,
      remarks: f.description || f.remarks || "",
      previewText: f.description || f.remarks || f.path || f.file_name || "Attached document",
      file_url: f.formatted_path || f.path || null,
      path: f.path || null,
      author: f.uploaded_by_name || "Admin User",
      created_at: f.created_at || rawData.value?.created_at || new Date().toISOString(),
      raw: f,
    }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
});

const docCount = computed(() => {
  return filesList.value.filter((f) => !isImageFile(f.file_name || f.file_url)).length;
});

const imageCount = computed(() => {
  return filesList.value.filter((f) => isImageFile(f.file_name || f.file_url)).length;
});

const filteredFiles = computed(() => {
  if (activeFilter.value === "docs") {
    return filesList.value.filter((f) => !isImageFile(f.file_name || f.file_url));
  }
  if (activeFilter.value === "images") {
    return filesList.value.filter((f) => isImageFile(f.file_name || f.file_url));
  }
  return filesList.value;
});

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

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show("Copied to clipboard!", "success");
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

// ─── Document Dropdown Actions ───────────────────────────────────────────────
const getDocumentActions = (item) => {
  const actions = [
    {
      id: "view",
      label: "View Details",
      icon: Eye,
      handler: () => openViewDrawer(item),
    },
    {
      id: "edit",
      label: "Edit Document",
      icon: Pencil,
      handler: () => openEditDrawer(item),
    },
  ];

  if (item.file_url) {
    actions.push({
      id: "open",
      label: "Open Link",
      icon: ExternalLink,
      handler: () => window.open(item.file_url, "_blank", "noopener,noreferrer"),
    });
  }

  actions.push({
    id: "delete",
    label: "Delete",
    icon: Trash2,
    danger: true,
    handler: () => openDeleteModal(item),
  });

  return actions;
};

// ─── Add / Edit Drawer State ──────────────────────────────────────────────────
const formDrawerOpen = ref(false);
const isEditing = ref(false);
const editingItemId = ref(null);

const uploadCategory = ref("document"); // 'document' | 'image'
const imageUploadMode = ref("single"); // 'single' | 'dual'

const formFileName = ref("");
const formRemarks = ref("");

// Single File State
const selectedFile = ref(null);
const localPreviewUrl = ref(null);
const fileInputRef = ref(null);

// Dual Image State
const frontFile = ref(null);
const frontPreviewUrl = ref(null);
const frontFileInputRef = ref(null);

const backFile = ref(null);
const backPreviewUrl = ref(null);
const backFileInputRef = ref(null);

// Existing file in edit mode
const existingFileUrl = ref(null);

const setUploadCategory = (cat) => {
  uploadCategory.value = cat;
  if (cat === "document") {
    if (dualImagePresets.some((p) => p.value === formFileName.value) || singleImagePresets.some((p) => p.value === formFileName.value)) {
      formFileName.value = "";
    }
  } else if (cat === "image") {
    if (documentPresets.some((p) => p.value === formFileName.value)) {
      formFileName.value = "";
    }
    if (imageUploadMode.value === "dual" && !formFileName.value) {
      formFileName.value = "aadhaar_card";
    }
  }
};

const setImageUploadMode = (mode) => {
  imageUploadMode.value = mode;
  if (mode === "dual") {
    if (!formFileName.value.trim() || singleImagePresets.some((p) => p.value === formFileName.value)) {
      formFileName.value = "aadhaar_card";
    }
  } else if (mode === "single") {
    if (dualImagePresets.some((p) => p.value === formFileName.value)) {
      formFileName.value = "";
    }
  }
};

const openAddDrawer = (type = "document") => {
  if (viewDrawerOpen.value) closeViewDrawer();
  isEditing.value = false;
  uploadCategory.value = type === "image" ? "image" : "document";
  imageUploadMode.value = "single";
  editingItemId.value = null;
  formFileName.value = "";
  formRemarks.value = "";

  // Reset single file
  selectedFile.value = null;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (fileInputRef.value) fileInputRef.value.value = "";

  // Reset dual files
  frontFile.value = null;
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (frontFileInputRef.value) frontFileInputRef.value.value = "";

  backFile.value = null;
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
  if (backFileInputRef.value) backFileInputRef.value.value = "";

  existingFileUrl.value = null;
  formDrawerOpen.value = true;
};

const openEditDrawer = (item) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  isEditing.value = true;
  uploadCategory.value = isImageFile(item.file_name || item.file_url) ? "image" : "document";
  imageUploadMode.value = "single";
  editingItemId.value = item.id;
  formFileName.value = item.file_name || "";
  formRemarks.value = item.remarks || "";

  selectedFile.value = null;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }

  frontFile.value = null;
  backFile.value = null;
  existingFileUrl.value = item.file_url || null;
  formDrawerOpen.value = true;
};

const closeFormDrawer = () => {
  formDrawerOpen.value = false;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
};

const triggerSingleFileInput = () => {
  fileInputRef.value?.click();
};

const triggerFrontFileInput = () => {
  frontFileInputRef.value?.click();
};

const triggerBackFileInput = () => {
  backFileInputRef.value?.click();
};

const handleSingleFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    selectedFile.value = file;
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value);
    }
    if (file.type.startsWith("image/")) {
      localPreviewUrl.value = URL.createObjectURL(file);
    } else {
      localPreviewUrl.value = null;
    }

    if (!formFileName.value.trim()) {
      const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_").toLowerCase();
      formFileName.value = rawName;
    }
  }
};

const removeSingleFile = () => {
  selectedFile.value = null;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const handleFrontFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    frontFile.value = file;
    if (frontPreviewUrl.value) {
      URL.revokeObjectURL(frontPreviewUrl.value);
    }
    frontPreviewUrl.value = URL.createObjectURL(file);
  }
};

const removeFrontFile = () => {
  frontFile.value = null;
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (frontFileInputRef.value) frontFileInputRef.value.value = "";
};

const handleBackFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    backFile.value = file;
    if (backPreviewUrl.value) {
      URL.revokeObjectURL(backPreviewUrl.value);
    }
    backPreviewUrl.value = URL.createObjectURL(file);
  }
};

const removeBackFile = () => {
  backFile.value = null;
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
  if (backFileInputRef.value) backFileInputRef.value.value = "";
};

const isSubmitDisabled = computed(() => {
  if (clientDepthStore.isSubmittingReference) return true;

  if (isEditing.value) {
    return !formFileName.value.trim();
  }

  if (uploadCategory.value === "document") {
    return !selectedFile.value || !formFileName.value.trim();
  }

  if (uploadCategory.value === "image") {
    if (imageUploadMode.value === "single") {
      return !selectedFile.value || !formFileName.value.trim();
    }
    if (imageUploadMode.value === "dual") {
      return !frontFile.value || !backFile.value;
    }
  }

  return false;
});

const submitForm = () => {
  if (!currentUserId.value) return;

  // Edit Mode
  if (isEditing.value) {
    const payload = new FormData();
    payload.append("user_id", currentUserId.value);
    payload.append("id", editingItemId.value);
    payload.append("file_id", editingItemId.value);
    if (formRemarks.value.trim()) payload.append("description", formRemarks.value.trim());
    if (formFileName.value.trim()) {
      payload.append("file_name", formFileName.value.trim());
    }
    if (selectedFile.value) {
      payload.append("file", selectedFile.value);
    }

    clientDepthStore.updateUserReference(currentUserId.value, payload, (err) => {
      if (!err) closeFormDrawer();
    });
    return;
  }

  // Add Mode
  let payload;
  if (uploadCategory.value === "document") {
    payload = new FormData();
    payload.append("user_id", currentUserId.value);
    if (formRemarks.value.trim()) payload.append("description", formRemarks.value.trim());
    if (formFileName.value.trim()) {
      payload.append("file_name", formFileName.value.trim());
    }
    if (selectedFile.value) {
      payload.append("file", selectedFile.value);
    }
  } else if (uploadCategory.value === "image") {
    if (imageUploadMode.value === "single") {
      payload = new FormData();
      payload.append("user_id", currentUserId.value);
      if (formRemarks.value.trim()) payload.append("description", formRemarks.value.trim());
      if (formFileName.value.trim()) {
        payload.append("file_name", formFileName.value.trim());
      }
      if (selectedFile.value) {
        payload.append("file", selectedFile.value);
      }
    } else {
      payload = new FormData();
      payload.append("user_id", currentUserId.value);
      if (formRemarks.value.trim()) payload.append("description", formRemarks.value.trim());
      if (formFileName.value.trim()) {
        payload.append("file_name", formFileName.value.trim());
      }
      if (frontFile.value) {
        payload.append("front", frontFile.value);
      }
      if (backFile.value) {
        payload.append("back", backFile.value);
      }
    }
  }

  clientDepthStore.addUserReference(currentUserId.value, payload, (err) => {
    if (!err) closeFormDrawer();
  });
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
    file_id: itemToDelete.value.id,
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
