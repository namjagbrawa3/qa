<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- 欢迎区域 -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          欢迎回来，{{ authStore.user?.username }}！
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          {{ authStore.isAdmin ? '管理员控制台 - 管理题库、试卷和用户' : '学习中心 - 参加考试，提升自己' }}
        </p>
        <div class="flex justify-center space-x-4">
          <template v-if="authStore.isAdmin">
            <router-link 
              to="/questions"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              题库管理
            </router-link>
            <router-link 
              to="/exams"
              class="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              试卷管理
            </router-link>
            <router-link 
              to="/users"
              class="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              用户管理
            </router-link>
          </template>
          <template v-else>
            <router-link 
              to="/exams"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              参加考试
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- 管理员统计卡片 -->
    <div v-if="authStore.isAdmin" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ stats.questions?.totalQuestions || 0 }}</p>
            <p class="text-sm text-gray-600">题库题目</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ stats.exams?.totalExams || 0 }}</p>
            <p class="text-sm text-gray-600">试卷数量</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ stats.users?.totalUsers || 0 }}</p>
            <p class="text-sm text-gray-600">注册用户</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ stats.exams?.totalParticipants || 0 }}</p>
            <p class="text-sm text-gray-600">考试参与</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户统计卡片 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ userStats.totalExams || 0 }}</p>
            <p class="text-sm text-gray-600">已参加考试</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ userStats.avgScore || 0 }}</p>
            <p class="text-sm text-gray-600">平均分数</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-gray-900">{{ userStats.avgAccuracy || 0 }}%</p>
            <p class="text-sm text-gray-600">平均正确率</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 管理员内容区域 -->
    <div v-if="authStore.isAdmin" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 最近活动 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">最近注册用户</h3>
        </div>
        <div class="p-6">
          <div v-if="stats.users?.recentUsers?.length === 0" class="text-center text-gray-500 py-4">
            暂无最近注册用户
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="user in stats.users?.recentUsers?.slice(0, 5)"
              :key="user.id"
              class="flex items-center space-x-3"
            >
              <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700">
                  {{ user.username?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ user.username }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(user.created_at) }}</p>
              </div>
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              ]">
                {{ user.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统概览 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">系统概览</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">单选题</span>
              <span class="text-sm font-medium text-gray-900">{{ stats.questions?.singleChoiceCount || 0 }} 题</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">多选题</span>
              <span class="text-sm font-medium text-gray-900">{{ stats.questions?.multipleChoiceCount || 0 }} 题</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">包含多媒体</span>
              <span class="text-sm font-medium text-gray-900">{{ stats.questions?.withMediaCount || 0 }} 题</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">激活试卷</span>
              <span class="text-sm font-medium text-gray-900">{{ stats.exams?.activeExams || 0 }} 份</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">平均分数</span>
              <span class="text-sm font-medium text-gray-900">{{ stats.exams?.avgScore || 0 }} 分</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户内容区域 -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 可参加的考试 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">可参加的考试</h3>
        </div>
        <div class="p-6">
          <div v-if="availableExams.length === 0" class="text-center text-gray-500 py-4">
            暂无可参加的考试
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="exam in availableExams.slice(0, 5)"
              :key="exam.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-gray-900">{{ exam.title }}</h4>
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  exam.scoring_mode === 'add' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                ]">
                  {{ exam.scoring_mode === 'add' ? '加分制' : '减分制' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-3">{{ exam.description || '暂无描述' }}</p>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <span>{{ exam.questions?.length || 0 }} 题</span>
                <span>{{ exam.duration || 60 }} 分钟</span>
                <router-link
                  :to="`/exam/${exam.id}`"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  开始考试
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近考试记录 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">最近考试记录</h3>
        </div>
        <div class="p-6">
          <div v-if="userStats.recentRecords?.length === 0" class="text-center text-gray-500 py-4">
            暂无考试记录
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="record in userStats.recentRecords"
              :key="record.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-gray-900">{{ record.exam_title }}</h4>
                <span class="text-sm font-bold text-gray-900">{{ record.total_score }} 分</span>
              </div>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <span>正确率: {{ Math.round((record.correct_count / record.total_questions) * 100) }}%</span>
                <span>{{ formatDate(record.submitted_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useExamStore } from '../stores/exam.js'
import { statsAPI } from '../services/api.js'

const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

const stats = ref({
  questions: {},
  exams: {},
  users: {}
})

const userStats = ref({
  totalExams: 0,
  avgScore: 0,
  avgAccuracy: 0,
  recentRecords: []
})

const availableExams = computed(() => {
  return examStore.exams.filter(exam => exam.is_active && !exam.hasUserTaken)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadAdminStats = async () => {
  try {
    const response = await statsAPI.getOverviewStats()
    stats.value = response.data
  } catch (error) {
    console.error('获取管理员统计失败:', error)
  }
}

const loadUserStats = async () => {
  try {
    const response = await statsAPI.getUserPerformance()
    userStats.value = response.data
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

const refreshData = async () => {
  // 加载试卷列表
  await examStore.fetchExams()
  
  if (authStore.isAdmin) {
    await loadAdminStats()
  } else {
    await loadUserStats()
  }
}

onMounted(refreshData)

// 监听路由变化，当返回Dashboard时刷新数据
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/' || newPath === '/dashboard') {
    refreshData()
  }
})
</script>