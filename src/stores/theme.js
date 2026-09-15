import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  const applyThemeClass = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const init = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = document.documentElement.classList.contains('dark')
    }

    applyThemeClass(isDark.value)
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyThemeClass(isDark.value)
  }

  init()

  return { isDark, init, toggleTheme }
})
