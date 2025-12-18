import { createRouter, createWebHistory } from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'

const routes = [
  {
    path: '/',
    name: 'generator',
    component: GeneratorView
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('../views/LibraryView.vue')
  },
  {
    path: '/analyze',
    name: 'analyze',
    component: () => import('../views/AnalyzeView.vue')
  },
  {
    path: '/export',
    name: 'export',
    component: () => import('../views/ExportView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router