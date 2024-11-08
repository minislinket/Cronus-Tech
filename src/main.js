import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './fontAwesome'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './FCMNotifications'
// import './socket_io'






createApp(App)
.use(store)
.use(router)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')
