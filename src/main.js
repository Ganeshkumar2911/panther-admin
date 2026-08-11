import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTheme } from '@/utils/theme'
import BaseSelect from '@/components/common/BaseSelect.vue'
import DropdownMenu from './components/common/DropdownMenu.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'

initTheme()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('BaseSelect', BaseSelect)
app.component('DropdownMenu', DropdownMenu)
app.component('Tooltip', Tooltip)
app.component('BaseDatePicker', BaseDatePicker)
app.component('BaseCalendar', BaseDatePicker)
app.mount('#app')