import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/main-layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'payments',
        component: () => import('@/pages/payments/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]
