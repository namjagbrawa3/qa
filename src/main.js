import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import './assets/css/custom.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')