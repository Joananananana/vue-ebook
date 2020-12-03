import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/ebook'
    },
    {
      path: '/ebook',
      name: 'ebook',
      // 直接使用import方法返回一个组件
      component: () => import('./views/ebook/index.vue'),
      children: [
        {
          path: ':fileName',
          //  实现动态路由 获取电子书下载路径
          component: () => import('./components/ebook/EbookReader.vue')
        }
      ]
    }
  ]
})
