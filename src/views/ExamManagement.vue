<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">试卷管理</h1>
        <p class="mt-2 text-sm text-gray-700">创建和管理考试试卷</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button 
          @click="showCreateModal = true"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          创建试卷
        </button>
      </div>
    </div>

    <!-- 试卷列表 -->
    <div class="mt-8">
      <div v-if="exams.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无试卷</h3>
        <p class="mt-1 text-sm text-gray-500">开始创建您的第一份试卷</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="exam in exams" 
          :key="exam.id"
          class="bg-white rounded-lg shadow border border-gray-200 p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ exam.title }}</h3>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="exam.scoringMode === 'add' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'">
              {{ exam.scoringMode === 'add' ? '加分制' : '减分制' }}
            </span>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">{{ exam.description }}</p>
          
          <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>{{ exam.questions.length }} 题</span>
            <span>{{ exam.totalScore }} 分</span>
            <span>{{ exam.timeLimit }} 分钟</span>
          </div>
          
          <div class="flex space-x-2">
            <router-link 
              :to="`/exam/${exam.id}`"
              class="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              开始考试
            </router-link>
            <button 
              @click="deleteExam(exam.id)"
              class="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建试卷模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">创建新试卷</h3>
          
          <form @submit.prevent="createNewExam">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">试卷标题</label>
              <input 
                v-model="newExam.title" 
                type="text" 
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">试卷描述</label>
              <textarea 
                v-model="newExam.description" 
                rows="3" 
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">计分模式</label>
              <select v-model="newExam.scoringMode" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="add">加分制（答对加分，答错不扣分）</option>
                <option value="subtract">减分制（答对加分，答错扣分）</option>
                <option value="unlimited">无限制（满分开始，答错扣分，答完继续抽题）</option>
              </select>
            </div>

            <div v-if="newExam.scoringMode === 'unlimited'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">满分设置</label>
              <input 
                v-model.number="newExam.maxScore" 
                type="number" 
                min="50"
                max="1000"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="例如：100"
                required
              />
              <p class="text-sm text-gray-500 mt-1">无限制模式下的初始满分，答错题目会扣分直到分数为0</p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">考试时长（分钟）</label>
              <input 
                v-model.number="newExam.timeLimit" 
                type="number" 
                min="1"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">选择题目</label>
              <div class="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                <div v-for="question in questions" :key="question.id" class="flex items-start mb-3">
                  <input 
                    v-model="newExam.questions" 
                    :value="question.id"
                    type="checkbox" 
                    class="mt-1 mr-3"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ question.question }}</p>
                    <p class="text-xs text-gray-500">
                      {{ question.type === 'single' ? '单选题' : '多选题' }} - {{ question.score }}分
                    </p>
                  </div>
                </div>
                <div v-if="questions.length === 0" class="text-center text-gray-500 py-4">
                  暂无题目，请先添加题目到题库
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button 
                @click="showCreateModal = false"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                type="submit"
                :disabled="newExam.questions.length === 0"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                创建试卷
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/exam'

const examStore = useExamStore()
const { questions, exams } = storeToRefs(examStore)
const { createExam, deleteExam } = examStore

const showCreateModal = ref(false)
const newExam = ref({
  title: '',
  description: '',
  questions: [],
  scoringMode: 'add',
  timeLimit: 60,
  maxScore: 100
})

const createNewExam = () => {
  if (newExam.value.title.trim() && newExam.value.questions.length > 0) {
    // 计算总分
    const totalScore = newExam.value.questions.reduce((sum, questionId) => {
      const question = questions.value.find(q => q.id === questionId)
      return sum + (question ? question.score : 0)
    }, 0)

    createExam({
      ...newExam.value,
      totalScore
    })
    
    // 重置表单
    newExam.value = {
      title: '',
      description: '',
      questions: [],
      scoringMode: 'add',
      timeLimit: 60,
      maxScore: 100
    }
    showCreateModal.value = false
  }
}
</script>