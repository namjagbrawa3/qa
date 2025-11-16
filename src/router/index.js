import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import QuestionBank from '../views/QuestionBank.vue'
import ExamManagement from '../views/ExamManagement.vue'
import TakeExam from '../views/TakeExam.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/questions',
    name: 'QuestionBank',
    component: QuestionBank
  },
  {
    path: '/exams',
    name: 'ExamManagement',
    component: ExamManagement
  },
  {
    path: '/exam/:id',
    name: 'TakeExam',
    component: TakeExam
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router