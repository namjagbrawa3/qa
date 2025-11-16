<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          注册新账户
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          已有账户？
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            立即登录
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              v-model="form.username"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入用户名"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="form.email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入邮箱地址"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="form.password"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入密码（至少6位）"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">确认密码</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              v-model="form.confirmPassword"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请再次输入密码"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg v-if="!isLoading" class="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <svg v-else class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const isLoading = ref(false)

const validateForm = () => {
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    return '请填写所有字段'
  }
  
  if (form.password.length < 6) {
    return '密码长度至少6位'
  }
  
  if (form.password !== form.confirmPassword) {
    return '两次输入的密码不一致'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    return '请输入有效的邮箱地址'
  }
  
  return null
}

const handleRegister = async () => {
  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    return
  }

  isLoading.value = true
  error.value = ''

  const result = await authStore.register({
    username: form.username,
    email: form.email,
    password: form.password,
    role: 'user' // 默认注册为普通用户
  })

  isLoading.value = false

  if (result.success) {
    // 注册成功，跳转到首页
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>