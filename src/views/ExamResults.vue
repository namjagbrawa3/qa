<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- 页面标题 -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">试卷结果统计</h1>
        <p class="mt-2 text-sm text-gray-700">查看试卷的详细统计信息和考试记录</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="$router.go(-1)"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          返回
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600">{{ error }}</div>
    </div>

    <!-- 试卷信息 -->
    <div v-else-if="examData" class="mt-8">
      <!-- 试卷基本信息 -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ examData.title }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ examData.totalParticipants }}</div>
            <div class="text-sm text-gray-500">参与人数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ examData.avgScore }}</div>
            <div class="text-sm text-gray-500">平均分数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ examData.avgAccuracy }}%</div>
            <div class="text-sm text-gray-500">平均正确率</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ Math.round(examData.avgTime / 60) }}分钟</div>
            <div class="text-sm text-gray-500">平均用时</div>
          </div>
        </div>
      </div>

      <!-- 分数分布 -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">分数分布</h3>
        <div class="space-y-3">
          <div
            v-for="range in examData.scoreDistribution"
            :key="range.range"
            class="flex items-center"
          >
            <div class="w-20 text-sm text-gray-600">{{ range.range }}分</div>
            <div class="flex-1 bg-gray-200 rounded-full h-4 mx-4">
              <div
                class="bg-blue-600 h-4 rounded-full"
                :style="{ width: `${(range.count / examData.totalParticipants) * 100}%` }"
              ></div>
            </div>
            <div class="w-12 text-sm text-gray-600 text-right">{{ range.count }}人</div>
          </div>
        </div>
      </div>

      <!-- 前10名 -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">前10名</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分数</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正确率</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用时</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(performer, index) in examData.topPerformers"
                :key="performer.username"
                :class="index < 3 ? 'bg-yellow-50' : ''"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span v-if="index === 0" class="text-yellow-600">🥇</span>
                  <span v-else-if="index === 1" class="text-gray-400">🥈</span>
                  <span v-else-if="index === 2" class="text-yellow-800">🥉</span>
                  <span v-else>{{ index + 1 }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ performer.username }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ performer.score }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ performer.accuracy }}%</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ Math.round(performer.duration / 60) }}分钟</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 详细考试记录 -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">详细考试记录</h3>
          <div class="flex space-x-2">
            <button
              @click="loadExamResults()"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              刷新
            </button>
          </div>
        </div>
        
        <div v-if="resultsLoading" class="text-center py-8">
          <LoadingSpinner />
        </div>
        
        <div v-else-if="examResults.length === 0" class="text-center py-8">
          <EmptyState message="暂无考试记录" />
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分数</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正确率</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用时</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="result in examResults" :key="result.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ result.username }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ result.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ result.total_score }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ Math.round((result.correct_count / result.total_questions) * 100) }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ Math.round(result.duration_seconds / 60) }}分钟
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(result.submitted_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { statsAPI, examAPI } from '../services/api.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const examId = route.params.examId

const loading = ref(true)
const resultsLoading = ref(false)
const error = ref('')
const examData = ref(null)
const examResults = ref([])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadExamStats = async () => {
  try {
    loading.value = true
    const response = await statsAPI.getExamPerformance({ examId })
    examData.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || '获取试卷统计失败'
  } finally {
    loading.value = false
  }
}

const loadExamResults = async () => {
  try {
    resultsLoading.value = true
    const response = await examAPI.getExamResults(examId)
    examResults.value = response.data
  } catch (err) {
    console.error('获取考试记录失败:', err)
  } finally {
    resultsLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadExamStats(),
    loadExamResults()
  ])
})
</script>