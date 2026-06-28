<script setup>
import { ref, reactive, computed } from 'vue'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-vue-next'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import apiRequest from '@/api/request'
import authToken from '@/common/authToken'
import urls from '@/api/urls'
import { useRouter } from 'vue-router'
import logoLight from '@/assets/logo_full.svg'
// import logoDark from '@/assets/logo_dark_full.png'
import bgImage from '@/assets/auth-bg.png'

const router = useRouter()
const snackbar = useSnackbarStore()

const loading = ref(false)
const showPassword = ref(false)

// Compute logo based on theme in localStorage
// const logo = computed(() => {
//   const theme = localStorage.getItem('theme')
//   return theme === 'light' ? logoDark : logoLight
// })

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
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

  return valid
}

const clearError = (field) => {
  errors[field] = ''
}

// ─── API Call ─────────────────────────────────────────
const handleLogin = () => {
  if (!validate()) return

  loading.value = true

  const successHandler = (res) => {
    loading.value = false
    authToken.setToken(res.access_token)
    router.push('/dashboard') // ✅ direct navigation
  }

  const failureHandler = (err) => {
    loading.value = false
    snackbar.show(err?.error || 'Something went wrong.', 'error')
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

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

    <!-- Background Image -->
    <div class="absolute inset-0 bg-black/95">
      <img :src="bgImage" alt="" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/20" />
    </div>

    <!-- Card -->
    <div
      class="relative w-full max-w-[440px] rounded-2xl border border-white/10 p-8 py-10"
      style="background: #FFFFFF1A; backdrop-filter: blur(134px);"
    >

      <!-- Logo + Brand -->
      <div class="text-center mb-7">
        <div class="flex justify-center mb-5">
          <img src="/panther-logo.svg" alt="Panther Capitals" class="h-15 object-contain" />
        </div>
        <h1 class="text-2xl font-semibold text-white mb-1.5">
          Login
        </h1>
        <p class="text-sm text-white/60">
          login to continue to your workspace
        </p>
      </div>

      <!-- Form -->
      <div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-white mb-1.5">Email address</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            class="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-white/40 transition-colors"
            :class="{ 'border-red-400': errors.email }"
            @focus="clearError('email')"
          />
          <p v-if="errors.email" class="text-xs mt-1.5 text-red-400">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="mb-2">
          <label class="block text-sm font-medium text-white mb-1.5">Password</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-4 pr-10 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm outline-none focus:border-white/40 transition-colors"
              :class="{ 'border-red-400': errors.password }"
              @focus="clearError('password')"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="15" />
              <Eye v-else :size="15" />
            </button>
          </div>
          <p v-if="errors.password" class="text-xs mt-1.5 text-red-400">{{ errors.password }}</p>
        </div>

        <!-- Forgot Password -->
        <div class="flex justify-end mb-5">
          <button class="text-xs text-white/70 hover:text-white transition-colors">
            Forgot Password?
          </button>
        </div>

        <!-- Button -->
        <button
          type="button"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
          style="background: linear-gradient(180deg, #E0CA3C 0%, #FFE74D 100%);"
          @click="handleLogin"
        >
          <Loader2 v-if="loading" :size="16" class="animate-spin" />
          <span>{{ loading ? 'Logging in…' : 'Submit' }}</span>
        </button>

      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-white/70 mt-5">
        Don't have an account?
        <button class="text-white font-semibold ml-1 hover:underline" @click="goToRegister">
          Sign Up
        </button>
      </p>

      <!-- Disclaimer -->
      <p class="text-center text-[11px] text-white/40 mt-5 leading-relaxed px-2">
        Panther Capitals Ltd we don't offer services to residents of certain countries, including: Syria, North Korea, Iran, Iraq, Mauritius, USA, Canada, Sudan, Myanmar, Yemen, Afghanistan, Vanuatu, and those within the European Economic Area (EEA).
      </p>

      <!-- Footer Links -->
      <div class="flex items-center justify-center gap-2 mt-4">
        <button class="text-[11px] text-white/50 hover:text-white transition-colors">Terms & Condition</button>
        <span class="text-white/20 text-xs">|</span>
        <button class="text-[11px] text-white/50 hover:text-white transition-colors">Privacy Policy</button>
        <span class="text-white/20 text-xs">|</span>
        <button class="text-[11px] text-white/50 hover:text-white transition-colors">Risk Disclosure</button>
      </div>

    </div>
  </div>
</template>