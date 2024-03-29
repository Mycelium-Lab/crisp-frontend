import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    redirect: '/swap'
    // name: 'home',
    // component: HomeView
  },
  {
    path: '/pools',
    name: 'pools',
    component: () => import('../views/LiquidityView.vue')
  },
  {
    path: '/deposit',
    name: 'deposit',
    component: () => import('../views/DepositView.vue')
  },
  {
    path: '/swap',
    name: 'swap',
    component: () => import('../views/SwapView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/lending',
    name: 'lending',
    component: () => import('../views/LendingView.vue')
  },
  {
    path: '/:catchAll(.*)', redirect: '/swap'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
