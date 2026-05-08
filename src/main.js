import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTheme } from '@/utils/theme'
import BaseSelect from '@/components/common/BaseSelect.vue'

initTheme()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('BaseSelect', BaseSelect)
app.mount('#app')