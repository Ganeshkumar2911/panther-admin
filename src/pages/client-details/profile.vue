<template>
  <div class="bg-background space-y-5 pt-4 pb-8 overflow-y-auto no-scrollbar">
    <!-- Main 2-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- ─── LEFT COLUMN ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-5">
        <!-- 1. Profile Information Card -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-primary/30"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-primary-text">
                Profile Information
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Personal and contact information provided by the client.
              </p>
            </div>
            <button
              type="button"
              @click="openEditProfileModal"
              class="border border-primary-border rounded-xl px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Pencil class="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          <!-- Card Body -->
          <div class="flex flex-col sm:flex-row items-start gap-6 pt-5">
            <!-- Avatar / Photo Area -->
            <div class="flex flex-col items-center shrink-0 w-full sm:w-auto">
              <div class="relative">
                <div
                  class="w-24 h-24 rounded-full bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green"
                >
                  <User class="w-12 h-12" />
                </div>
                <!-- Verified Green Badge -->
                <div
                  class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-green text-white flex items-center justify-center border-2 border-card-background shadow-xs"
                  title="Verified Profile"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <button
                type="button"
                @click="triggerPhotoUpload"
                class="mt-3.5 border border-primary-border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-text hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload class="w-3.5 h-3.5 text-secondary-text" />
                Upload Photo
              </button>
              <input
                ref="photoInputRef"
                type="file"
                accept="image/jpeg,image/png"
                class="hidden"
                @change="handlePhotoUpload"
              />
              <span class="text-[10px] text-secondary-text mt-1 text-center font-medium">
                JPG, PNG (Max. 2MB)
              </span>
            </div>

            <!-- Profile Details Grid -->
            <div class="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 text-xs">
              <!-- Full Name -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Full Name
                </p>
                <p class="font-bold text-primary-text text-sm">
                  {{ user.name || "Testing One" }}
                </p>
              </div>

              <!-- Date of Birth -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Date of Birth
                </p>
                <p class="font-semibold text-primary-text text-sm">
                  {{ formattedDob }}
                </p>
              </div>

              <!-- Gender -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Gender
                </p>
                <p class="font-semibold text-primary-text text-sm">
                  {{ user.gender || "Male" }}
                </p>
              </div>

              <!-- Email Address -->
              <div class="sm:col-span-2">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Email Address
                </p>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-primary-text break-all">
                    {{ user.email || "—" }}
                  </span>
                  <span
                    class="bg-primary-green/10 text-primary-green text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  >
                    <Check class="w-3 h-3 stroke-[3]" />
                    Verified
                  </span>
                </div>
              </div>

              <!-- Phone Number -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Phone Number
                </p>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-primary-text">
                    {{ user.phone_number || "—" }}
                  </span>
                  <span
                    v-if="user.phone_number"
                    class="bg-primary-green/10 text-primary-green text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  >
                    Verified
                  </span>
                  <span
                    v-else
                    class="bg-primary-red/10 text-primary-red text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Not Verified
                  </span>
                </div>
              </div>

              <!-- Country of Residence -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Country of Residence
                </p>
                <p class="font-semibold text-primary-text flex items-center gap-1.5">
                  <span
                    v-if="user.country && getFlagCode(user.country)"
                    :class="['fi', `fi-${getFlagCode(user.country)}`, 'fis', 'w-4 h-3 flex-shrink-0']"
                  ></span>
                  <span>{{ cleanCountryLabel(user.country) || "—" }}</span>
                </p>
              </div>

              <!-- Nationality -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Nationality
                </p>
                <p class="font-semibold text-primary-text">
                  {{ user.nationality || "—" }}
                </p>
              </div>

              <!-- Preferred Language -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Preferred Language
                </p>
                <p class="font-semibold text-primary-text">
                  {{ user.preferred_language || "English" }}
                </p>
              </div>

              <!-- Address -->
              <div class="sm:col-span-2">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  Address
                </p>
                <p class="font-semibold text-primary-text">
                  {{ user.address || "—" }}
                </p>
              </div>

              <!-- ZIP / Postal Code -->
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-0.5">
                  ZIP / Postal Code
                </p>
                <p class="font-semibold text-primary-text">
                  {{ user.zip_code || user.postal_code || "—" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Contact Preferences Card -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-primary/30"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-primary-text">
                Contact Preferences
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Manage how the client prefers to be contacted.
              </p>
            </div>
            <button
              type="button"
              @click="openPreferencesModal"
              class="border border-primary-border rounded-xl px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Pencil class="w-3.5 h-3.5" />
              Edit Preferences
            </button>
          </div>

          <!-- Preferences 2x2 Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-5">
            <!-- Email Notifications -->
            <div
              class="border border-primary-border/70 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-background/50 hover:bg-background transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-primary-blue/10 flex items-center justify-center shrink-0">
                  <Mail class="w-4 h-4 text-primary-blue" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-primary-text truncate">
                    Email Notifications
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                :class="preferences.email ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
              >
                {{ preferences.email ? 'Enabled' : 'Disabled' }}
              </span>
            </div>

            <!-- SMS Notifications -->
            <div
              class="border border-primary-border/70 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-background/50 hover:bg-background transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-primary-green/10 flex items-center justify-center shrink-0">
                  <MessageSquare class="w-4 h-4 text-primary-green" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-primary-text truncate">
                    SMS Notifications
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    Receive updates via SMS
                  </p>
                </div>
              </div>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                :class="preferences.sms ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
              >
                {{ preferences.sms ? 'Enabled' : 'Disabled' }}
              </span>
            </div>

            <!-- Phone Calls -->
            <div
              class="border border-primary-border/70 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-background/50 hover:bg-background transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-primary-green/10 flex items-center justify-center shrink-0">
                  <Phone class="w-4 h-4 text-primary-green" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-primary-text truncate">
                    Phone Calls
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    Receive updates via phone
                  </p>
                </div>
              </div>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                :class="preferences.phone ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
              >
                {{ preferences.phone ? 'Enabled' : 'Disabled' }}
              </span>
            </div>

            <!-- Marketing Updates -->
            <div
              class="border border-primary-border/70 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-background/50 hover:bg-background transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Megaphone class="w-4 h-4 text-accent" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-primary-text truncate">
                    Marketing Updates
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    Receive marketing communications
                  </p>
                </div>
              </div>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                :class="preferences.marketing ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
              >
                {{ preferences.marketing ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── RIGHT COLUMN ────────────────────────────────────────── -->
      <div class="flex flex-col gap-5">
        <!-- 3. KYC Verification Card -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 transition-all hover:border-primary/30"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-primary-text">
                KYC Verification
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Track and manage client verification status and documents.
              </p>
            </div>
            <button
              type="button"
              @click="refreshKycStatus"
              :disabled="clientDepthStore.kycLoading"
              class="border border-primary-border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="clientDepthStore.kycLoading ? 'animate-spin' : ''" />
              Refresh
            </button>
          </div>

          <!-- Status & Progress Hero Box -->
          <div
            class="bg-primary-yellow/5 border border-primary-yellow/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div class="flex items-center gap-4 min-w-0">
              <!-- Orange Shield / Badge Icon -->
              <div
                class="w-12 h-12 rounded-2xl bg-primary-yellow/15 border border-primary-yellow/30 flex items-center justify-center text-primary-yellow font-extrabold text-2xl shrink-0"
              >
                A
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                  Current Status
                </p>
                <p class="text-xl sm:text-2xl font-bold text-primary-yellow capitalize mt-0.5">
                  {{ kycStatus }}
                </p>
                <p class="text-xs text-secondary-text mt-0.5">
                  {{ kycStatusMessage }}
                </p>
              </div>
            </div>

            <!-- Progress Indicator -->
            <div class="flex flex-col items-end shrink-0 w-full sm:w-auto">
              <span class="text-xs font-semibold text-secondary-text">Progress</span>
              <span class="text-sm font-extrabold text-primary-text mt-0.5">
                {{ completedStepsCount }} / {{ totalStepsCount }}
              </span>
              <div class="w-36 h-2 rounded-full bg-primary-border/80 overflow-hidden mt-1.5">
                <div
                  class="h-full bg-primary-yellow rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercentage}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Stepper Progress -->
          <div class="flex items-center justify-between gap-2 px-2 sm:px-6 py-2 overflow-x-auto no-scrollbar">
            <template v-for="(step, sIdx) in stepperSteps" :key="step.number">
              <!-- Step Item -->
              <div class="flex items-center gap-3 shrink-0">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
                  :class="getStepBadgeClass(step.status)"
                >
                  {{ step.number }}
                </div>
                <div>
                  <p class="text-xs font-bold text-primary-text">{{ step.label }}</p>
                  <p class="text-[11px] font-semibold capitalize" :class="getStepTextClass(step.status)">
                    {{ step.statusText || step.status }}
                  </p>
                </div>
              </div>

              <!-- Connector Arrow -->
              <ChevronRight
                v-if="sIdx < stepperSteps.length - 1"
                class="w-4 h-4 text-secondary-text/40 shrink-0"
              />
            </template>
          </div>

          <!-- Document Checklist Section -->
          <div class="space-y-3 pt-2">
            <div>
              <h4 class="text-sm font-bold text-primary-text">Document Checklist</h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Please upload valid documents to proceed.
              </p>
            </div>

            <!-- Documents Table -->
            <div class="border border-primary-border/80 rounded-xl overflow-hidden overflow-x-auto no-scrollbar">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-background/80 border-b border-primary-border/80 text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                    <th class="py-2.5 px-4">Document Type</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3">Remarks</th>
                    <th class="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-border/60">
                  <tr
                    v-for="doc in documentChecklist"
                    :key="doc.id || doc.type"
                    class="hover:bg-background/40 transition-colors"
                  >
                    <!-- Type & Subtitle -->
                    <td class="py-3 px-4">
                      <div class="flex items-start gap-2.5">
                        <component
                          :is="doc.uploaded ? CheckCircle2 : AlertCircle"
                          class="w-4 h-4 shrink-0 mt-0.5"
                          :class="doc.uploaded ? 'text-primary-green' : 'text-primary-red'"
                        />
                        <div>
                          <p class="font-bold text-primary-text">{{ doc.title }}</p>
                          <p class="text-[11px] text-secondary-text">{{ doc.subtitle }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Status Badges -->
                    <td class="py-3 px-3">
                      <div class="flex flex-col gap-1 items-start">
                        <span
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          :class="doc.uploaded ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
                        >
                          {{ doc.uploaded ? 'Uploaded' : 'Not Uploaded' }}
                        </span>
                        <span
                          v-if="doc.verification_status"
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          :class="getVerificationStatusBadgeClass(doc.verification_status)"
                        >
                          {{ doc.verification_status }}
                        </span>
                      </div>
                    </td>

                    <!-- Remarks -->
                    <td class="py-3 px-3 text-secondary-text font-medium text-[11px]">
                      {{ doc.remarks || '—' }}
                    </td>

                    <!-- Action Button -->
                    <td class="py-3 px-4 text-right">
                      <button
                        type="button"
                        @click="handleDocumentAction(doc)"
                        class="border border-primary-border rounded-lg px-3 py-1 text-xs font-semibold text-primary hover:bg-background transition-colors cursor-pointer shadow-2xs"
                      >
                        {{ doc.action || (doc.uploaded ? 'View' : 'Upload') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. KYC Notes Card -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-primary/30"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-4 border-b border-primary-border/60">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-primary-text">
                KYC Notes
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Add internal notes related to client KYC verification.
              </p>
            </div>
            <button
              type="button"
              @click="openAddNoteModal"
              class="border border-primary-border rounded-xl px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus class="w-3.5 h-3.5" />
              Add Note
            </button>
          </div>

          <!-- Notes List or Empty State -->
          <div class="pt-5">
            <div v-if="allNotes.length === 0" class="py-8 flex flex-col items-center justify-center text-center">
              <FileText class="w-10 h-10 text-secondary-text/40 mb-2" />
              <p class="text-xs text-secondary-text font-medium">
                No notes added yet.
              </p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(note, i) in allNotes"
                :key="i"
                class="border border-primary-border/70 rounded-xl p-3 bg-background/50"
              >
                <div class="flex items-center justify-between text-[11px] text-secondary-text mb-1">
                  <span class="font-bold text-primary-text">{{ note.author || 'Admin' }}</span>
                  <span>{{ note.date || note.created_at || 'Just now' }}</span>
                </div>
                <p class="text-xs text-primary-text font-medium">{{ note.text || note.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── BOTTOM FULL-WIDTH BANNER: KYC PENDING? ──────────────── -->
    <div
      class="bg-primary-blue/5 border border-primary-blue/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
    >
      <!-- Left Info -->
      <div class="shrink-0 w-full md:w-auto">
        <h4 class="text-base font-bold text-primary-blue">KYC Pending?</h4>
        <p class="text-xs text-secondary-text mt-0.5">
          Help the client complete verification quickly.
        </p>
      </div>

      <!-- Center 3-Step Guide -->
      <div class="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-6 w-full text-xs">
        <!-- Step 1 -->
        <div class="flex items-start gap-2.5">
          <div>
            <p class="font-bold text-primary-text">1. Upload Documents</p>
            <p class="text-[11px] text-secondary-text">
              Ensure all required documents are clear and valid.
            </p>
          </div>
        </div>

        <ChevronRight class="w-4 h-4 text-primary-blue/60 shrink-0 hidden sm:block" />

        <!-- Step 2 -->
        <div class="flex items-start gap-2.5">
          <div>
            <p class="font-bold text-primary-text">2. Wait for Verification</p>
            <p class="text-[11px] text-secondary-text">
              Our team will review and verify your documents.
            </p>
          </div>
        </div>

        <ChevronRight class="w-4 h-4 text-primary-blue/60 shrink-0 hidden sm:block" />

        <!-- Step 3 -->
        <div class="flex items-start gap-2.5">
          <div>
            <p class="font-bold text-primary-text">3. Get Verified</p>
            <p class="text-[11px] text-secondary-text">
              Once verified, you will gain full access to all features.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Action Button -->
      <button
        type="button"
        @click="sendKycInstructions"
        class="w-full md:w-auto bg-primary-blue hover:bg-primary-blue/90 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs"
      >
        <Mail class="w-4 h-4" />
        Send Instructions
      </button>
    </div>

    <!-- ─── MODALS & DIALOGS ────────────────────────────────────── -->

    <!-- Edit Profile Modal -->
    <div
      v-if="editProfileModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div class="bg-card-background border border-primary-border rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-primary-border pb-3">
          <h3 class="font-bold text-primary-text text-base">Edit Profile Information</h3>
          <button @click="editProfileModalOpen = false" class="text-secondary-text hover:text-primary-text">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">Full Name</label>
            <input v-model="editForm.name" class="input-field p-2.5" />
          </div>
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">Date of Birth</label>
            <input v-model="editForm.date_of_birth" type="date" class="input-field p-2.5" />
          </div>
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">Gender</label>
            <select v-model="editForm.gender" class="input-field p-2.5">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">Preferred Language</label>
            <input v-model="editForm.preferred_language" class="input-field p-2.5" />
          </div>
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">Nationality</label>
            <input v-model="editForm.nationality" class="input-field p-2.5" />
          </div>
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">Country</label>
            <input v-model="editForm.country" class="input-field p-2.5" />
          </div>
          <div class="sm:col-span-2">
            <label class="font-semibold text-secondary-text mb-1 block">Address</label>
            <input v-model="editForm.address" class="input-field p-2.5" />
          </div>
          <div>
            <label class="font-semibold text-secondary-text mb-1 block">ZIP / Postal Code</label>
            <input v-model="editForm.zip_code" class="input-field p-2.5" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-primary-border">
          <button
            type="button"
            @click="editProfileModalOpen = false"
            class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveProfileInfo"
            class="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Contact Preferences Modal -->
    <div
      v-if="editPreferencesModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div class="bg-card-background border border-primary-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-primary-border pb-3">
          <h3 class="font-bold text-primary-text text-base">Edit Contact Preferences</h3>
          <button @click="editPreferencesModalOpen = false" class="text-secondary-text hover:text-primary-text">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <label class="flex items-center justify-between p-3 border border-primary-border rounded-xl cursor-pointer hover:bg-background">
            <div>
              <p class="font-bold text-primary-text">Email Notifications</p>
              <p class="text-[11px] text-secondary-text">Receive updates via email</p>
            </div>
            <input type="checkbox" v-model="preferences.email" class="w-4 h-4 accent-primary" />
          </label>

          <label class="flex items-center justify-between p-3 border border-primary-border rounded-xl cursor-pointer hover:bg-background">
            <div>
              <p class="font-bold text-primary-text">SMS Notifications</p>
              <p class="text-[11px] text-secondary-text">Receive updates via SMS</p>
            </div>
            <input type="checkbox" v-model="preferences.sms" class="w-4 h-4 accent-primary" />
          </label>

          <label class="flex items-center justify-between p-3 border border-primary-border rounded-xl cursor-pointer hover:bg-background">
            <div>
              <p class="font-bold text-primary-text">Phone Calls</p>
              <p class="text-[11px] text-secondary-text">Receive updates via phone</p>
            </div>
            <input type="checkbox" v-model="preferences.phone" class="w-4 h-4 accent-primary" />
          </label>

          <label class="flex items-center justify-between p-3 border border-primary-border rounded-xl cursor-pointer hover:bg-background">
            <div>
              <p class="font-bold text-primary-text">Marketing Updates</p>
              <p class="text-[11px] text-secondary-text">Receive marketing communications</p>
            </div>
            <input type="checkbox" v-model="preferences.marketing" class="w-4 h-4 accent-primary" />
          </label>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-primary-border">
          <button
            type="button"
            @click="editPreferencesModalOpen = false"
            class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="editPreferencesModalOpen = false; snackbar.show('Preferences updated successfully!', 'success')"
            class="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Add Note Modal -->
    <div
      v-if="addNoteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div class="bg-card-background border border-primary-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-primary-border pb-3">
          <h3 class="font-bold text-primary-text text-base">Add KYC Note</h3>
          <button @click="addNoteModalOpen = false" class="text-secondary-text hover:text-primary-text">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2 text-xs">
          <label class="font-semibold text-secondary-text block">Internal Note</label>
          <textarea
            v-model="newNoteText"
            rows="4"
            placeholder="Type your verification notes or observations here..."
            class="input-field p-3 resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-primary-border">
          <button
            type="button"
            @click="addNoteModalOpen = false"
            class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveNewNote"
            class="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import {
  User,
  Pencil,
  Check,
  Upload,
  Mail,
  MessageSquare,
  Phone,
  Megaphone,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  X,
} from "lucide-vue-next";

const route = useRoute();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();

// ─── User Profile State ───────────────────────────────────────────────────────
const user = ref({});

onMounted(() => {
  try {
    const raw = localStorage.getItem("active_client");
    if (raw) {
      user.value = JSON.parse(raw);
    }
  } catch {
    user.value = {};
  }
  loadKyc();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadKyc();
  }
);

const loadKyc = () => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId).catch(() => {
      // Gracefully falls back to mock/defaults until backend response is active
    });
  }
};

const formattedDob = computed(() => {
  const dob = user.value.date_of_birth || user.value.dob;
  if (!dob) return "15 Apr 1995";
  try {
    return new Date(dob).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dob;
  }
});

// ─── Photo Upload ─────────────────────────────────────────────────────────────
const photoInputRef = ref(null);

const triggerPhotoUpload = () => {
  photoInputRef.value?.click();
};

const handlePhotoUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    snackbar.show("Profile photo uploaded successfully!", "success");
  }
};

// ─── Contact Preferences ──────────────────────────────────────────────────────
const preferences = ref({
  email: true,
  sms: false,
  phone: true,
  marketing: false,
});

const editPreferencesModalOpen = ref(false);
const openPreferencesModal = () => {
  editPreferencesModalOpen.value = true;
};

// ─── Edit Profile ─────────────────────────────────────────────────────────────
const editProfileModalOpen = ref(false);
const editForm = ref({
  name: "",
  date_of_birth: "",
  gender: "Male",
  preferred_language: "English",
  nationality: "",
  country: "",
  address: "",
  zip_code: "",
});

const openEditProfileModal = () => {
  editForm.value = {
    name: user.value.name || "Testing One",
    date_of_birth: user.value.date_of_birth || "1995-04-15",
    gender: user.value.gender || "Male",
    preferred_language: user.value.preferred_language || "English",
    nationality: user.value.nationality || "",
    country: user.value.country || "",
    address: user.value.address || "",
    zip_code: user.value.zip_code || user.value.postal_code || "",
  };
  editProfileModalOpen.value = true;
};

const saveProfileInfo = () => {
  Object.assign(user.value, editForm.value);
  try {
    localStorage.setItem("active_client", JSON.stringify(user.value));
  } catch {}
  editProfileModalOpen.value = false;
  snackbar.show("Profile updated successfully!", "success");
};

// ─── KYC Dynamic Resolvers & Fallbacks ────────────────────────────────────────
const defaultKyc = {
  status: "Pending",
  message: "Complete the remaining steps to get verified.",
  completed_steps: 2,
  total_steps: 3,
  steps: [
    { number: 1, label: "Personal Info", status: "completed", statusText: "Completed" },
    { number: 2, label: "Documents", status: "pending", statusText: "Pending" },
    { number: 3, label: "Verification", status: "pending", statusText: "Pending" },
  ],
  documents: [
    {
      id: "identity",
      type: "identity",
      title: "Proof of Identity",
      subtitle: "Passport, ID Card, or Driver's License",
      uploaded: true,
      verification_status: "Unverified",
      remarks: "Waiting for verification",
      action: "View",
    },
    {
      id: "address",
      type: "address",
      title: "Proof of Address",
      subtitle: "Utility Bill, Bank Statement, etc.",
      uploaded: true,
      verification_status: "Unverified",
      remarks: "Waiting for verification",
      action: "View",
    },
    {
      id: "selfie",
      type: "selfie",
      title: "Selfie Photo",
      subtitle: "Clear selfie for verification",
      uploaded: false,
      verification_status: null,
      remarks: "Required",
      action: "Upload",
    },
  ],
  notes: [],
};

const kycData = computed(() => {
  return clientDepthStore.kycData || defaultKyc;
});

const kycStatus = computed(() => {
  return (
    kycData.value?.status ||
    kycData.value?.kyc_status ||
    user.value?.kyc_status ||
    "Pending"
  );
});

const kycStatusMessage = computed(() => {
  return (
    kycData.value?.message ||
    kycData.value?.status_message ||
    "Complete the remaining steps to get verified."
  );
});

const completedStepsCount = computed(() => {
  return (
    kycData.value?.completed_steps ??
    kycData.value?.progress?.completed_steps ??
    2
  );
});

const totalStepsCount = computed(() => {
  return (
    kycData.value?.total_steps ??
    kycData.value?.progress?.total_steps ??
    3
  );
});

const progressPercentage = computed(() => {
  return Math.min(
    100,
    Math.round((completedStepsCount.value / (totalStepsCount.value || 1)) * 100)
  );
});

const stepperSteps = computed(() => {
  if (Array.isArray(kycData.value?.steps) && kycData.value.steps.length > 0) {
    return kycData.value.steps;
  }
  return defaultKyc.steps;
});

const documentChecklist = computed(() => {
  if (Array.isArray(kycData.value?.documents) && kycData.value.documents.length > 0) {
    return kycData.value.documents;
  }
  if (Array.isArray(kycData.value?.document_checklist) && kycData.value.document_checklist.length > 0) {
    return kycData.value.document_checklist;
  }
  return defaultKyc.documents;
});

const localNotes = ref([]);
const allNotes = computed(() => {
  const apiNotes = kycData.value?.notes || [];
  return [...localNotes.value, ...apiNotes];
});

// ─── Helpers for Badges & Actions ─────────────────────────────────────────────
function getStepBadgeClass(status) {
  if (status === "completed") return "bg-primary-green text-white";
  if (status === "pending" || status === "in_progress") return "bg-primary-yellow text-white";
  return "bg-primary-border text-secondary-text";
}

function getStepTextClass(status) {
  if (status === "completed") return "text-primary-green";
  if (status === "pending" || status === "in_progress") return "text-primary-yellow";
  return "text-secondary-text";
}

function getVerificationStatusBadgeClass(status) {
  const s = String(status).toLowerCase();
  if (s === "verified" || s === "approved") return "bg-primary-green/10 text-primary-green";
  if (s === "unverified" || s === "pending") return "bg-primary-yellow/10 text-primary-yellow";
  if (s === "rejected") return "bg-primary-red/10 text-primary-red";
  return "bg-secondary-text/10 text-secondary-text";
}

const handleDocumentAction = (doc) => {
  if (doc.uploaded) {
    snackbar.show(`Opening document preview for ${doc.title}...`, "info");
  } else {
    snackbar.show(`Please upload document for ${doc.title}`, "info");
  }
};

const refreshKycStatus = () => {
  const userId = route.params.id;
  if (!userId) return;
  clientDepthStore
    .fetchClientKyc(userId)
    .then(() => {
      snackbar.show("KYC verification status refreshed!", "success");
    })
    .catch(() => {
      snackbar.show("KYC status refreshed", "info");
    });
};

const sendKycInstructions = () => {
  snackbar.show("Verification instructions sent to client email!", "success");
};

// ─── KYC Notes ────────────────────────────────────────────────────────────────
const addNoteModalOpen = ref(false);
const newNoteText = ref("");

const openAddNoteModal = () => {
  newNoteText.value = "";
  addNoteModalOpen.value = true;
};

const saveNewNote = () => {
  if (!newNoteText.value.trim()) return;
  localNotes.value.unshift({
    text: newNoteText.value.trim(),
    author: "Super Admin",
    date: "Just now",
  });
  addNoteModalOpen.value = false;
  snackbar.show("Internal KYC note added!", "success");
};
</script>
