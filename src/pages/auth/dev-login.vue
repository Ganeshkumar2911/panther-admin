<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Mail, Lock, Eye, EyeOff, Loader2, Globe } from 'lucide-vue-next'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import apiRequest from '@/api/request'
import authToken from '@/common/authToken'
import urls from '@/api/urls'
import { useRouter } from 'vue-router'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import bgImage from '@/assets/Login-img.jpeg'

const router = useRouter()
const snackbar = useSnackbarStore()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  baseUrl: ''
})

const errors = reactive({
  email: '',
  password: '',
  baseUrl: ''
})

// Load saved custom base URL on mounted
onMounted(() => {
  const savedUrl = localStorage.getItem('custom_base_url')
  if (savedUrl) {
    form.baseUrl = savedUrl
  }
})

// ─── Validation ─────────────────────────────────────────
const validate = () => {
  let valid = true

  if (!form.email) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    valid = false
  }

  if (!form.baseUrl) {
    errors.baseUrl = 'Base URL is required.'
    valid = false
  } else {
    try {
      const url = new URL(form.baseUrl.trim())
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.baseUrl = 'URL must start with http:// or https://'
        valid = false
      }
    } catch (_) {
      errors.baseUrl = 'Enter a valid URL.'
      valid = false
    }
  }

  return valid
}

const clearError = (field) => {
  errors[field] = ''
}

const resetToDefault = () => {
  form.baseUrl = ''
  localStorage.removeItem('custom_base_url')
  snackbar.show('Target Base URL reset to default.', 'success')
}

// ─── API Call ─────────────────────────────────────────
const handleLogin = () => {
  if (!validate()) return

  loading.value = true

  // Save the custom URL first so the login request hits this URL
  localStorage.setItem('custom_base_url', form.baseUrl.trim())

  const successHandler = (res) => {
    loading.value = false
    authToken.setToken(res.access_token)
    useMyPermissionsStore().fetchMyPermissions(true)
    snackbar.show('Connected to target host successfully.', 'success')
    router.push('/dashboard')
  }

  const failureHandler = (err) => {
    loading.value = false
    snackbar.show(err?.error || 'Authentication failed on target host.', 'error')
  }

  apiRequest(urls.KEYS.POST, urls.auth.login, {
    data: {
      email: form.email,
      password: form.password,
    },
    isTokenRequired: false,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}
</script>

<template>
  <div class="min-h-screen flex bg-[#0A0A0A]">

    <!-- LEFT SIDE -->
    <div class="hidden lg:flex lg:w-1/2 pl-4 pt-4">
      <div
        class="w-full h-[calc(100vh-24px)] overflow-hidden
               rounded-tr-3xl rounded-tl-3xl rounded-br-3xl rounded-bl-none
               shadow-2xl"
      >
        <img
          :src="bgImage"
          alt="Login Background"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div
      class="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-[#0A0A0A]"
    >
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-6">
            <img
              src="/logo_full.svg"
              alt="Panther Capitals"
              class="h-12 object-contain"
            />
          </div>

          <h1 class="text-2xl font-semibold text-white">
            Developer Login Override
          </h1>

          <p class="mt-2 text-sm text-amber-500 font-medium">
            Target custom environments in production
          </p>
        </div>

        <!-- Form -->
        <div>

          <!-- Base URL Override -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-white">
                Target Base URL
              </label>
              <button
                v-if="form.baseUrl"
                type="button"
                @click="resetToDefault"
                class="text-xs text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
              >
                Reset to Default
              </button>
            </div>

            <div class="relative">
              <input
                v-model="form.baseUrl"
                type="text"
                placeholder="https://f7v2d03l-2504.inc1.devtunnels.ms"
                class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
                :class="{ 'border-red-500': errors.baseUrl }"
                @focus="clearError('baseUrl')"
                @keyup.enter="handleLogin"
              />
            </div>

            <p
              v-if="errors.baseUrl"
              class="text-xs text-red-400 mt-1"
            >
              {{ errors.baseUrl }}
            </p>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-white mb-2">
              Super Admin Email
            </label>

            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
              :class="{ 'border-red-500': errors.email }"
              @focus="clearError('email')"
            />

            <p
              v-if="errors.email"
              class="text-xs text-red-400 mt-1"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-white mb-2">
              Password
            </label>

            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
                :class="{ 'border-red-500': errors.password }"
                @focus="clearError('password')"
                @keyup.enter="handleLogin"
              />

              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <EyeOff
                  v-if="showPassword"
                  :size="18"
                />

                <Eye
                  v-else
                  :size="18"
                />
              </button>
            </div>

            <p
              v-if="errors.password"
              class="text-xs text-red-400 mt-1"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- Login -->
          <button
            type="button"
            :disabled="loading"
            @click="handleLogin"
            class="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
            style="background: linear-gradient(180deg, #E0CA3C 0%, #FFE74D 100%)"
          >
            <Loader2
              v-if="loading"
              class="animate-spin"
              :size="18"
            />

            <span>
              {{ loading ? "Connecting & Logging in..." : "Login to Environment" }}
            </span>
          </button>

        </div>

        <!-- Footer -->
        <div class="mt-8">
          <p class="text-center text-xs text-white/40">
            Note: This dynamic override targets the backend API environment directly. Verify the base URL before signing in.
          </p>

          <div
            class="mt-5 flex items-center justify-center gap-2"
          >
            <router-link to="/login" class="text-xs text-amber-500 hover:underline">
              Back to Standard Login
            </router-link>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
