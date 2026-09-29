<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      <div class="space-y-1.5 max-w-2xl">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
          >
            <ShieldCheck class="w-4 h-4" />
          </div>
          <h3 class="text-base font-bold text-primary-text">
            Two-Factor Authentication (2FA)
          </h3>
        </div>
        <p class="text-xs text-secondary-text leading-relaxed">
          Manage global Google Authenticator rules. These rules apply platform-wide.
        </p>
      </div>
    </div>

    <!-- Main Settings Card -->
    <div
      v-if="hasPermission(['two_factor.view'])"
      class="bg-card-background border border-primary-border rounded-2xl p-6 shadow-xs"
    >
      <div v-if="loading" class="flex justify-center p-8">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
      </div>

      <div v-else class="space-y-8">
        <!-- Global Switches -->
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <input
              id="is_enabled"
              type="checkbox"
              v-model="formData.is_enabled"
              class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
            />
            <label for="is_enabled" class="text-sm font-semibold text-primary-text cursor-pointer">
              Feature enabled
            </label>
          </div>
          <div class="flex items-center gap-3">
            <input
              id="enrollment_mandatory"
              type="checkbox"
              v-model="formData.enrollment_mandatory"
              class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
            />
            <label for="enrollment_mandatory" class="text-sm font-semibold text-primary-text cursor-pointer">
              Force all users to enroll
            </label>
          </div>
        </div>

        <div class="border-t border-primary-border pt-6">
          <h4 class="text-sm font-bold text-primary-text mb-2">Where to require code</h4>
          <p class="text-xs text-secondary-text mb-4">
            These rules only ask for an authenticator code when the user has already turned on 2FA. Use “Force all users to enroll” if everyone must set it up.
          </p>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <input
                id="require_login"
                type="checkbox"
                v-model="formData.require_login"
                class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
              />
              <label for="require_login" class="text-sm font-medium text-primary-text cursor-pointer">
                Require on login
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_withdrawal"
                type="checkbox"
                v-model="formData.require_withdrawal"
                class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
              />
              <label for="require_withdrawal" class="text-sm font-medium text-primary-text cursor-pointer">
                Require on withdrawal
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_password_change"
                type="checkbox"
                v-model="formData.require_password_change"
                class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
              />
              <label for="require_password_change" class="text-sm font-medium text-primary-text cursor-pointer">
                Require on password change
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_profile_update"
                type="checkbox"
                v-model="formData.require_profile_update"
                class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
              />
              <label for="require_profile_update" class="text-sm font-medium text-primary-text cursor-pointer">
                Require on profile update
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_internal_transfer"
                type="checkbox"
                v-model="formData.require_internal_transfer"
                class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
              />
              <label for="require_internal_transfer" class="text-sm font-medium text-primary-text cursor-pointer">
                Require on internal transfer
              </label>
            </div>
          </div>
        </div>

        <div class="border-t border-primary-border pt-6 max-w-sm">
          <label class="block text-sm font-bold text-primary-text mb-2">
            Issuer name
          </label>
          <input
            type="text"
            v-model="formData.issuer_name"
            placeholder="e.g. Panther Trade"
            class="w-full px-4 py-2 bg-background border border-primary-border rounded-lg text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <div class="border-t border-primary-border pt-6 flex justify-end gap-3" v-if="hasPermission(['two_factor.update'])">
          <button
            type="button"
            @click="fetchSettings"
            :disabled="isSubmitting"
            class="px-4 py-2 rounded-lg text-sm font-semibold bg-background border border-primary-border text-primary-text hover:bg-card-background/60 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Reload
          </button>
          <button
            type="button"
            @click="saveSettings"
            :disabled="isSubmitting"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ShieldCheck, Loader2 } from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const loading = ref(true);
const isSubmitting = ref(false);

const formData = ref({
  is_enabled: false,
  enrollment_mandatory: false,
  require_login: false,
  require_withdrawal: false,
  require_password_change: false,
  require_profile_update: false,
  require_internal_transfer: false,
  issuer_name: "Panther Trade",
});

const fetchSettings = () => {
  loading.value = true;
  const successHandler = (res) => {
    if (res?.data) {
      formData.value = { ...res.data };
    }
  };

  const failureHandler = (err) => {
    snackbar.show(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to load 2FA settings",
      "error",
    );
  };

  const finallyHandler = () => {
    loading.value = false;
  };

  apiRequest(urls.KEYS.GET, urls.twoFactor.settings, {
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
    onFinally: finallyHandler,
  });
};

const saveSettings = () => {
  if (!formData.value.issuer_name?.trim()) {
    snackbar.show("Issuer name is required", "error");
    return;
  }

  isSubmitting.value = true;
  
  const successHandler = (res) => {
    if (res?.data) {
      formData.value = { ...res.data };
    }
    snackbar.show("2FA settings updated successfully", "success");
  };

  const failureHandler = (err) => {
    snackbar.show(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to update 2FA settings",
      "error",
    );
  };

  const finallyHandler = () => {
    isSubmitting.value = false;
  };

  apiRequest(urls.KEYS.PUT, urls.twoFactor.settings, {
    isTokenRequired: true,
    data: formData.value,
    onSuccess: successHandler,
    onFailure: failureHandler,
    onFinally: finallyHandler,
  });
};

onMounted(() => {
  if (hasPermission(["two_factor.view"])) {
    fetchSettings();
  }
});
</script>
