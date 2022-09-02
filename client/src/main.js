import { createApp } from 'vue'
import App from './App.vue'
import http from './api/index.js'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import store from './store'
import NavBar from './minis/navigation.vue'
import ShowToast from './utils/showToast.js'

const app = createApp(App)

app.component('uni-icons', UniIcons)
app.component('nav-bar', NavBar)
app.use(store)
app.provide('$http', http)
app.provide('showToast', ShowToast)

app.mount('#app')
