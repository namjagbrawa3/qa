import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import Dashboard from '../views/Dashboard.vue'
import QuestionBank from '../views/QuestionBank.vue'
import ExamManagement from '../views/ExamManagement.vue'
import TakeExam from '../views/TakeExam.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import UserManagement from '../views/UserManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/questions',
    name: 'QuestionBank',
    component: QuestionBank,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/exams',
    name: 'ExamManagement',
    component: ExamManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/exam/:id',
    name: 'TakeExam',
    component: TakeExam,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }
  
  // 检查是否需要游客权限（已登录用户不能访问登录/注册页面）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router