import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/store'
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
    },
    {
      path: '/store',
      component: () => import('./views/store/index.vue'),
      redirect: '/store/shelf',
      children: [
        {
          path: 'home',
          component: () => import('./views/store/Storehome.vue')
        },
        {
          path: 'list',
          component: () => import('./views/store/StoreList.vue')
        },
        {
          path: 'detail',
          component: () => import('./views/store/StoreDetail.vue')
        },
        {
          path: 'shelf',
          component: () => import('./views/store/StoreShelf.vue')
        },
        {
          path: 'category',
          component: () => import('./views/store/StoreCategory.vue')
        }
      ]
    }
  ]
})
