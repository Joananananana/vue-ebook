import Vue from 'vue'
import App from './App.vue'
import router from './router'

// import store from './store'
import store from './store/index.js'
import './assets/styles/icon.css'
// import './assets/fonts/daysOne.css'
import './assets/styles/global.scss'
import i18n from './lang'
// import './mock'
import './lazy'
import './utils/boost'
import './utils/create-api'
Vue.config.productionTip = false
Vue.config.devtools = true

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
