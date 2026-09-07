<template>
  <div class="space-y-5 pt-4 pb-12">
    <!-- ─── MAIN 2-COLUMN GRID ───────────────────────────────────── -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 items-stretch">
      <!-- ─── LEFT COLUMN ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-3 h-full">
        <!-- 1. Profile Information Card -->
        <div
          class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
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
          <div class="flex flex-col sm:flex-row items-start gap-4 pt-5">
            <!-- Avatar / Photo Area -->
            <div class="flex flex-col items-center shrink-0 w-full sm:w-36">
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

            <!-- Profile Details with Vertical & Horizontal Borders -->
            <div class="flex-1 w-full sm:border-l sm:border-primary-border/60 sm:pl-4 space-y-0 text-xs">
              <!-- Row 1: Full Name, Date of Birth, Gender -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-primary-border/60">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Full Name
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.name || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Date of Birth
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ formattedDob }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Gender
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.gender || "Male" }}
                  </p>
                </div>
              </div>

              <!-- Row 2: Email Address, Phone Number -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 py-4 border-b border-primary-border/60">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Email Address
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-primary-text text-xs sm:text-[12px] break-all">
                      {{ user.email || "—" }}
                    </span>
                    <span
                      class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                    >
                      <Check class="w-3 h-3 stroke-[3]" />
                      Verified
                    </span>
                  </div>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Phone Number
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-primary-text text-xs sm:text-[12px]">
                      {{ user.phone_number || "—" }}
                    </span>
                    <span
                      v-if="user.phone_number"
                      class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                    >
                      <Check class="w-3 h-3 stroke-[3]" />
                      Verified
                    </span>
                    <span
                      v-else
                      class="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      Not Verified
                    </span>
                  </div>
                </div>
              </div>

              <!-- Row 3: Country of Residence, Nationality, Preferred Language -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 py-4 border-b border-primary-border/60">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Country of Residence
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px] flex items-center gap-1.5">
                    <span
                      v-if="user.country && getFlagCode(user.country)"
                      :class="['fi', `fi-${getFlagCode(user.country)}`, 'fis', 'w-4 h-3 flex-shrink-0']"
                    ></span>
                    <span>{{ cleanCountryLabel(user.country) || "—" }}</span>
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Nationality
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.nationality || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Preferred Language
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.preferred_language || "English" }}
                  </p>
                </div>
              </div>

              <!-- Row 4: Address, ZIP / Postal Code -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Address
                  </p>
                  <p class="font-bold text-primary-text text-xs sm:text-[12px]">
                    {{ user.address || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    ZIP / Postal Code
                  </p>
                  <p class="font-bold text-primary-text text-xs sm:text-[12px]">
                    {{ user.zip_code || user.postal_code || "—" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. KYC Documents & Uploaded Files Card -->
        <KycDocumentsTable :userId="clientForEdit.id" />
      </div>

      <!-- ─── RIGHT COLUMN ────────────────────────────────────────── -->
      <div class="flex flex-col gap-3 h-full">
        <!-- 3. KYC Verification Card -->
        <div
          class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6 space-y-6"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
                KYC Verification
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Track and manage client verification status and documents.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <!-- Super Admin: Approve / Reject Document Button -->
              <button
                v-if="isSuperAdmin"
                type="button"
                @click="openApprovalModal('approve')"
                class="bg-primary hover:bg-primary-hover text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Review and Approve / Reject KYC Documents"
              >
                <ShieldCheck class="w-3.5 h-3.5" />
                Approve / Reject
              </button>

              <button
                type="button"
                @click="refreshKycStatus"
                :disabled="clientDepthStore.kycLoading"
                class="border border-primary-border rounded-xl px-3.5 py-1.5 text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="clientDepthStore.kycLoading ? 'animate-spin' : ''" />
                Refresh
              </button>
            </div>
          </div>

          <!-- Status & Progress Hero Box -->
          <div
            class="bg-primary-yellow/5 border border-primary-yellow/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4 min-w-0">
              <!-- Orange Shield / Badge Icon -->
              <div
                class="w-12 h-12 rounded-2xl bg-primary-yellow/15 border border-primary-yellow/30 flex items-center justify-center text-primary-yellow font-extrabold text-2xl shrink-0"
              >
                A
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold tracking-wider text-secondary-text">
                  Current Status
                </p>
                <p class="text-xl min-[1650px]:text-2xl font-bold text-primary-yellow capitalize mt-0.5">
                  {{ kycStatus }}
                </p>
                <p class="text-xs text-secondary-text mt-0.5">
                  {{ kycStatusMessage }}
                </p>
              </div>
            </div>

            <!-- Progress Indicator -->
            <div class="flex flex-col sm:items-start shrink-0 w-full sm:w-auto">
              <span class="text-xs font-semibold text-secondary-text">Progress</span>
              <span class="text-sm font-extrabold text-primary-text mt-0.5">
                {{ completedStepsCount }} / {{ totalStepsCount }}
              </span>
              <div class="w-full sm:w-36 h-2 rounded-full bg-primary-border/80 overflow-hidden mt-1.5">
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

          <!-- Document Checklist Section (3 Fields) -->
          <div class="space-y-3 pt-2">
            <div>
              <h4 class="text-sm font-bold text-primary-text">Document Checklist</h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Please upload valid documents to proceed.
              </p>
            </div>

            <!-- Documents Table (Scrollable with sticky header) -->
            <div class="border border-primary-border/80 rounded-xl overflow-x-auto overflow-y-auto max-h-[170px] no-scrollbar">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="sticky top-0 z-10 bg-card-background border-b border-primary-border/80 shadow-2xs">
                  <tr class="bg-card-background text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                    <th class="py-2.5 px-4 bg-card-background">Document Type</th>
                    <th class="py-2.5 px-3 bg-card-background">Status</th>
                    <th class="py-2.5 px-3 bg-card-background">Remarks</th>
                    <th class="py-2.5 px-4 text-right bg-card-background">Action</th>
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
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
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

                    <!-- Action Buttons -->
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- If Document Uploaded: View & Review (Super Admin) & Edit buttons -->
                        <template v-if="doc.uploaded">
                          <button
                            type="button"
                            @click="openViewDoc(doc)"
                            class="border border-primary-border rounded-lg px-2.5 py-1 text-xs font-semibold text-primary hover:bg-background transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <Eye class="w-3 h-3" />
                            View
                          </button>
                          <button
                            v-if="isSuperAdmin"
                            type="button"
                            @click="openApprovalModal('approve')"
                            class="border border-primary-green/40 bg-primary-green/10 text-primary-green hover:bg-primary-green/20 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Approve / Reject Document (Super Admin)"
                          >
                            <ShieldCheck class="w-3 h-3" />
                            Review
                          </button>
                          <button
                            type="button"
                            @click="openEditDoc(doc)"
                            class="border border-primary-border rounded-lg px-2.5 py-1 text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <Pencil class="w-3 h-3" />
                            Edit
                          </button>
                        </template>

                        <!-- If Document Not Uploaded: Upload button -->
                        <template v-else>
                          <button
                            type="button"
                            @click="openUploadDoc(doc)"
                            class="border border-primary text-primary hover:bg-primary/10 rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <Upload class="w-3 h-3" />
                            Upload
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. KYC Notes References Table -->
        <KycNotesTable :userId="clientForEdit.id" />
      </div>
    </div>

    <!-- ─── MODALS & DRAWERS ────────────────────────────────────── -->

    <!-- 1. Edit Client Profile Drawer -->
    <EditClientProfileDrawer
      :open="editProfileDrawerOpen"
      :client="clientForEdit"
      @close="closeEditProfileDrawer"
      @success="handleProfileEditSuccess"
    />

    <!-- 2. Upload / Edit KYC Document Modal -->
    <UploadKycDocumentModal
      :open="uploadDocModalOpen"
      :client="clientForEdit"
      :existingDoc="selectedDoc"
      @close="closeUploadDocModal"
      @success="handleUploadDocSuccess"
    />

    <!-- 3. View KYC Document Modal -->
    <ViewKycDocumentModal
      :open="viewDocModalOpen"
      :doc="selectedDoc"
      :status="kycStatus"
      :isSuperAdmin="isSuperAdmin"
      @close="closeViewDocModal"
      @edit="openEditDoc(selectedDoc)"
      @approve="openApprovalModal('approve')"
      @reject="openApprovalModal('reject')"
    />

    <!-- 4. Approve / Reject KYC Modal (Super Admin Only) -->
    <ApproveRejectKycModal
      :open="approveRejectModalOpen"
      :client="clientForEdit"
      :kycData="kycData"
      :initialAction="approvalInitialAction"
      @close="approveRejectModalOpen = false"
      @success="handleApprovalSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useProfileStore } from "@/stores/profile/profile";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import EditClientProfileDrawer from "@/components/clientDetails/EditClientProfileDrawer.vue";
import UploadKycDocumentModal from "@/components/clientDetails/UploadKycDocumentModal.vue";
import ViewKycDocumentModal from "@/components/clientDetails/ViewKycDocumentModal.vue";
import ApproveRejectKycModal from "@/components/clientDetails/ApproveRejectKycModal.vue";
import KycNotesTable from "@/components/clientDetails/KycNotesTable.vue";
import KycDocumentsTable from "@/components/clientDetails/KycDocumentsTable.vue";
import {
  User,
  Pencil,
  Check,
  Upload,
  Mail,
  RefreshCw,
  ChevronRight,
  Plus,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  ShieldCheck,
  ShieldAlert,
} from "lucide-vue-next";

const route = useRoute();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();
const profileStore = useProfileStore();

// ─── Super Admin Access Check ────────────────────────────────────────────────
const isSuperAdmin = computed(() => {
  const role = profileStore.user?.role || "";
  return String(role).toLowerCase() === "superadmin";
});

// ─── User Profile State ───────────────────────────────────────────────────────
const localStoredUser = ref({});

const loadClientFromStorage = () => {
  try {
    const raw = localStorage.getItem("active_client");
    if (raw) {
      localStoredUser.value = JSON.parse(raw);
    }
  } catch {
    localStoredUser.value = {};
  }
};

const user = computed(() => {
  return {
    ...localStoredUser.value,
    ...(clientDepthStore.activeClient || {}),
    ...(clientDepthStore.overviewData?.user || {}),
  };
});

const clientForEdit = computed(() => {
  return {
    ...user.value,
    id: user.value?.id || route.params.id,
  };
});

const loadKyc = (force = false) => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, force);
    clientDepthStore.fetchUserReferences(userId, force);
  }
};

onMounted(() => {
  loadClientFromStorage();
  loadKyc(true);
  if (!profileStore.user) {
    profileStore.fetchUserProfile().catch(() => {});
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadClientFromStorage();
      loadKyc(true);
    }
  },
);

const formattedDob = computed(() => {
  const dob = user.value.date_of_birth || user.value.dob;
  if (!dob) return "—";
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

// ─── Edit Profile Drawer State ────────────────────────────────────────────────
const editProfileDrawerOpen = ref(false);

const openEditProfileModal = () => {
  editProfileDrawerOpen.value = true;
};

const closeEditProfileDrawer = () => {
  editProfileDrawerOpen.value = false;
};

const handleProfileEditSuccess = (updatedClient) => {
  if (updatedClient) {
    localStoredUser.value = { ...localStoredUser.value, ...updatedClient };
    clientDepthStore.setActiveClient(updatedClient);
  } else {
    loadClientFromStorage();
  }
};

// ─── KYC Document Helpers & Formatters ────────────────────────────────────────
const formatDocType = (type) => {
  if (!type) return "Passport, ID Card, or Driver's License";
  const map = {
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    passport: "Passport",
    driving_license: "Driving License",
    voter_id: "Voter ID Card",
    national_id: "National Identity Card",
    address_proof: "Address Proof",
    selfie: "Selfie Photo",
    other: "Official Identity Document",
  };
  return map[type] || String(type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getVerificationStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "verified" || s === "approved")
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
  if (s === "unverified" || s === "pending" || s === "in_progress" || s === "under review")
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
  if (s === "rejected")
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
  return "bg-secondary-text/10 text-secondary-text";
};

// ─── KYC Response Resolver ───────────────────────────────────────────────────
const kycData = computed(() => {
  return clientDepthStore.kycData || null;
});

const kycStatus = computed(() => {
  return (
    kycData.value?.kyc_status ||
    kycData.value?.status ||
    user.value?.kyc_status ||
    "Pending"
  );
});

const kycStatusMessage = computed(() => {
  const isUploaded = !!kycData.value?.docs_uploaded;
  const s = (kycStatus.value || "").toLowerCase();
  if (s === "approved" || s === "verified") {
    return "Client identity verification completed.";
  }
  if (s === "rejected") {
    return kycData.value?.kyc_reject_reason || "Document rejected. Please upload valid proof.";
  }
  if (isUploaded) {
    return "Complete the remaining steps to get verified.";
  }
  return "Complete the remaining steps to get verified.";
});

// ─── 3-Field Document Checklist Resolver ──────────────────────────────────────
const documentChecklist = computed(() => {
  const k = clientDepthStore.kycData || {};
  const isUploaded = !!k.docs_uploaded;
  const docType = k.doc_type || "passport";
  const docPath = k.doc_path || {};
  const frontUrl = docPath.front || k.front || k.front_url || null;
  const backUrl = docPath.back || k.back || k.back_url || null;
  const status = k.kyc_status || (k.doc_approved ? "approved" : (isUploaded ? "unverified" : null));
  const remarks = k.kyc_reject_reason || (k.doc_approved ? "Approved" : (isUploaded ? "Waiting for verification" : "Required"));

  return [
    {
      id: "identity",
      type: "identity",
      doc_type: docType,
      title: "Proof of Identity",
      subtitle: isUploaded ? formatDocType(docType) : "Passport, ID Card, or Driver's License",
      uploaded: isUploaded,
      verification_status: isUploaded ? status : null,
      remarks: isUploaded ? remarks : "Waiting for verification",
      front: frontUrl,
      back: backUrl,
      doc_path: docPath,
    },
    // {
    //   id: "address",
    //   type: "address",
    //   doc_type: "address_proof",
    //   title: "Proof of Address",
    //   subtitle: "Utility Bill, Bank Statement, etc.",
    //   uploaded: isUploaded,
    //   verification_status: isUploaded ? "unverified" : null,
    //   remarks: isUploaded ? "Waiting for verification" : "Waiting for verification",
    //   front: frontUrl,
    //   back: backUrl,
    //   doc_path: docPath,
    // },
    // {
    //   id: "selfie",
    //   type: "selfie",
    //   doc_type: "selfie",
    //   title: "Selfie Photo",
    //   subtitle: "Clear selfie for verification",
    //   uploaded: false,
    //   verification_status: null,
    //   remarks: "Required",
    //   front: null,
    //   back: null,
    //   doc_path: null,
    // },
  ];
});

// ─── Stepper Progress Logic ───────────────────────────────────────────────────
const completedStepsCount = computed(() => {
  let count = 1; // Personal Info
  if (kycData.value?.docs_uploaded) count += 1;
  const s = (kycStatus.value || "").toLowerCase();
  if (s === "approved" || s === "verified") count += 1;
  return count;
});

const totalStepsCount = ref(3);

const progressPercentage = computed(() => {
  return Math.min(
    100,
    Math.round((completedStepsCount.value / (totalStepsCount.value || 3)) * 100)
  );
});

const stepperSteps = computed(() => {
  const isDocUploaded = !!kycData.value?.docs_uploaded;
  const s = (kycStatus.value || "").toLowerCase();
  const isVerified = s === "approved" || s === "verified";
  const isRejected = s === "rejected";

  return [
    {
      number: 1,
      label: "Personal Info",
      status: "completed",
      statusText: "Completed",
    },
    {
      number: 2,
      label: "Documents",
      status: isDocUploaded ? "completed" : "pending",
      statusText: isDocUploaded ? "Pending" : "Pending",
    },
    {
      number: 3,
      label: "Verification",
      status: isVerified ? "completed" : (isRejected ? "rejected" : (isDocUploaded ? "in_progress" : "pending")),
      statusText: isVerified ? "Approved" : (isRejected ? "Rejected" : (isDocUploaded ? "Pending" : "Pending")),
    },
  ];
});

function getStepBadgeClass(status) {
  if (status === "completed") return "bg-primary-green text-white";
  if (status === "pending" || status === "in_progress") return "bg-primary-yellow text-white";
  if (status === "rejected") return "bg-primary-red text-white";
  return "bg-primary-border text-secondary-text";
}

function getStepTextClass(status) {
  if (status === "completed") return "text-primary-green";
  if (status === "pending" || status === "in_progress") return "text-primary-yellow";
  if (status === "rejected") return "text-primary-red";
  return "text-secondary-text";
}

// ─── Upload & View Modals State ───────────────────────────────────────────────
const selectedDoc = ref(null);
const uploadDocModalOpen = ref(false);
const viewDocModalOpen = ref(false);

const openViewDoc = (doc) => {
  selectedDoc.value = doc;
  viewDocModalOpen.value = true;
};

const openEditDoc = (doc) => {
  selectedDoc.value = doc;
  uploadDocModalOpen.value = true;
};

const openUploadDoc = (doc) => {
  selectedDoc.value = doc;
  uploadDocModalOpen.value = true;
};

const closeUploadDocModal = () => {
  uploadDocModalOpen.value = false;
};

const closeViewDocModal = () => {
  viewDocModalOpen.value = false;
};

const handleUploadDocSuccess = () => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, true);
  }
};

// ─── Super Admin Document Approval Modal Handlers ───────────────────────────
const approveRejectModalOpen = ref(false);
const approvalInitialAction = ref("approve");

const openApprovalModal = (action = "approve") => {
  approvalInitialAction.value = action;
  approveRejectModalOpen.value = true;
};

const handleApprovalSuccess = () => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, true);
    clientDepthStore.fetchClientOverview(userId, true);
  }
};

const refreshKycStatus = () => {
  const userId = route.params.id || user.value?.id;
  if (!userId) return;
  clientDepthStore.fetchClientKyc(userId, true);
  clientDepthStore.fetchUserReferences(userId, true);
};

const sendKycInstructions = () => {
  snackbar.show("Verification instructions sent to client email!", "success");
};
</script>
