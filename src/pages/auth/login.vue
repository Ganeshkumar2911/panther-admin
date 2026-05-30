<script setup>
import { ref, reactive } from 'vue'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-vue-next'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import apiRequest from '@/api/request'
import authToken from '@/common/authToken'
import urls from '@/api/urls'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.png'

const router = useRouter()
const snackbar = useSnackbarStore()

const loading = ref(false)
const showPassword = ref(false)

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
  <div class="min-h-screen bg-background flex items-center justify-center px-4">

    <!-- Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.06]"
        style="background: radial-gradient(circle, var(--color-accent), transparent 70%)"
      />
      <div
        class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style="background: radial-gradient(circle, var(--color-accent), transparent 70%)"
      />
    </div>

    <!-- Card -->
    <div class="relative w-full max-w-md bg-card-background rounded-2xl border border-primary-border p-8">

      <!-- Logo + Brand -->
      <div class="text-center mb-10">
        <div class="flex justify-center mb-4">
          <img :src="logo" alt="Panther Capital" class="w-12 h-12 object-contain rounded-xl" />
        </div>

        <h1 class="text-xl font-semibold text-primary-text tracking-wide">
          Login
        </h1>

        <p class="text-sm text-secondary-text mt-2">
          login to continue to your workspace
        </p>
      </div>

      <!-- Form -->
      <div
        style="box-shadow: 0 2px 24px rgba(23,21,20,0.06)"
      >

        <!-- Email -->
        <div class="mb-5">
          <label class="block text-sm font-medium text-primary-text mb-1.5">
            Email address
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text">
              <Mail :size="16" />
            </span>
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-primary-border bg-background text-primary-text text-sm outline-none"
              :class="{ 'border-accent': errors.email }"
              @focus="clearError('email')"
            />
          </div>
          <p v-if="errors.email" class="text-xs mt-1.5 text-red-500">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-primary-text mb-1.5">
            Password
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text">
              <Lock :size="16" />
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-primary-border bg-background text-primary-text text-sm outline-none"
              :class="{ 'border-accent': errors.password }"
              @focus="clearError('password')"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
          <p v-if="errors.password" class="text-xs mt-1.5 text-red-500">
            {{ errors.password }}
          </p>
        </div>
        <!-- Button -->
        <button
          type="button"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-background text-sm font-medium"
          @click="handleLogin"
        >
          <Loader2 v-if="loading" :size="16" class="animate-spin" />
          <span>{{ loading ? 'logging in…' : 'login' }}</span>
          <ArrowRight v-if="!loading" :size="16" />
        </button>

      </div>
    </div>
  </div>
</template>