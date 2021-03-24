import Vue from 'vue'
import lazyload from 'vue-lazyload'

Vue.use(lazyload, {
  error: require('@/assets/images/1.jpg'),
  loading: require('@/assets/images/2.jpg')
})
