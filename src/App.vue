<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h1 class="text-xl font-semibold text-gray-900">在线答题考试系统</h1>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Dashboard' }"
            >
              首页
            </router-link>
            
            <!-- 管理员专用菜单 -->
            <template v-if="authStore.isAdmin">
              <router-link 
                to="/questions" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'QuestionBank' }"
              >
                题库管理
              </router-link>
              <router-link 
                to="/users" 
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'UserManagement' }"
              >
                用户管理
              </router-link>
            </template>
            
            <router-link 
              to="/exams" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-blue-600 bg-blue-50': $route.name === 'ExamManagement' }"
            >
              {{ authStore.isAdmin ? '试卷管理' : '考试中心' }}
            </router-link>
            
            <!-- 用户菜单 -->
            <div class="relative ml-3">
              <div>
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span class="sr-only">打开用户菜单</span>
                  <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ authStore.user?.username?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </button>
              </div>
              
              <div
                v-if="showUserMenu"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                @click="showUserMenu = false"
              >
                <div class="px-4 py-2 text-sm text-gray-700 border-b">
                  <div class="font-medium">{{ authStore.user?.username }}</div>
                  <div class="text-xs text-gray-500">{{ authStore.user?.email }}</div>
                  <div class="text-xs">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1',
                      authStore.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    ]">
                      {{ authStore.isAdmin ? '管理员' : '用户' }}
                    </span>
                  </div>
                </div>
                
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main :class="[
      authStore.isAuthenticated ? 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8' : '',
      authStore.isAuthenticated ? 'pb-20 md:pb-6' : ''
    ]">
      <router-view />
    </main>

    <!-- 移动端导航 -->
    <MobileNav v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import MobileNav from './components/MobileNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

// 处理登出
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 点击外部关闭用户菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 如果有token但没有用户信息，尝试获取用户信息
  if (authStore.token && !authStore.user) {
    authStore.getCurrentUser()
  }
})
</script>