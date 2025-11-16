<template>
  <div class="mobile-nav md:hidden">
    <div class="flex">
      <router-link
        to="/"
        class="mobile-nav-item"
        :class="{ 'text-blue-600': $route.name === 'Dashboard' }"
      >
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
        </svg>
        <span>首页</span>
      </router-link>
      
      <router-link
        to="/exams"
        class="mobile-nav-item"
        :class="{ 'text-blue-600': $route.name === 'ExamManagement' }"
      >
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{{ authStore.isAdmin ? '试卷' : '考试' }}</span>
      </router-link>
      
      <router-link
        v-if="authStore.isAdmin"
        to="/questions"
        class="mobile-nav-item"
        :class="{ 'text-blue-600': $route.name === 'QuestionBank' }"
      >
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>题库</span>
      </router-link>
      
      <router-link
        v-if="authStore.isAdmin"
        to="/users"
        class="mobile-nav-item"
        :class="{ 'text-blue-600': $route.name === 'UserManagement' }"
      >
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <span>用户</span>
      </router-link>
      
      <button
        @click="showUserMenu = !showUserMenu"
        class="mobile-nav-item relative"
      >
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>我的</span>
        
        <!-- 用户菜单 -->
        <div
          v-if="showUserMenu"
          class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
          @click.stop
        >
          <div class="px-4 py-2 border-b border-gray-200">
            <div class="font-medium text-gray-900">{{ authStore.user?.username }}</div>
            <div class="text-sm text-gray-500">{{ authStore.user?.email }}</div>
          </div>
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            退出登录
          </button>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  showUserMenu.value = false
}
</script>