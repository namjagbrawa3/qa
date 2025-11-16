<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">题库管理</h1>
        <p class="mt-2 text-sm text-gray-700">管理考试题目，支持单选题和多选题</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
            @click="showAddModal = true"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          添加题目
        </button>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">题目</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">分值</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="question in questions" :key="question.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ question.question }}</div>
                  <div class="text-sm text-gray-500 mt-1">
                    <div v-for="(option, index) in question.options" :key="index" class="flex items-center">
                      <span class="mr-2">{{ String.fromCharCode(65 + index) }}.</span>
                      <span>{{ option }}</span>
                      <span v-if="isCorrectOption(question, index)" class="ml-2 text-green-600">✓</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          :class="question.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                      {{ question.type === 'single' ? '单选题' : '多选题' }}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ question.score }} 分
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                      @click="deleteQuestion(question.id)"
                      class="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加题目模态框 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">添加新题目</h3>

          <form @submit.prevent="addNewQuestion">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">题目类型</label>
              <select v-model="newQuestion.type" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">题目内容</label>
              <textarea
                  v-model="newQuestion.question"
                  rows="3"
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">选项</label>
              <div v-for="(option, index) in newQuestion.options" :key="index" class="flex items-center mb-2">
                <span class="mr-2 w-6">{{ String.fromCharCode(65 + index) }}.</span>
                <input
                    v-model="newQuestion.options[index]"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 mr-2"
                    required
                />
                <button
                    v-if="newQuestion.options.length > 2"
                    @click="removeOption(index)"
                    type="button"
                    class="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </div>
              <button
                  @click="addOption"
                  type="button"
                  class="text-blue-600 hover:text-blue-800 text-sm"
              >
                + 添加选项
              </button>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">正确答案</label>
              <div v-if="newQuestion.type === 'single'">
                <div v-for="(option, index) in newQuestion.options" :key="index" class="flex items-center mb-1">
                  <input
                      v-model="newQuestion.correctAnswer"
                      :value="index"
                      type="radio"
                      class="mr-2"
                  />
                  <span>{{ String.fromCharCode(65 + index) }}. {{ option }}</span>
                </div>
              </div>
              <div v-else>
                <div v-for="(option, index) in newQuestion.options" :key="index" class="flex items-center mb-1">
                  <input
                      v-model="newQuestion.correctAnswer"
                      :value="index"
                      type="checkbox"
                      class="mr-2"
                  />
                  <span>{{ String.fromCharCode(65 + index) }}. {{ option }}</span>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">分值</label>
              <input
                  v-model.number="newQuestion.score"
                  type="number"
                  min="1"
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
              />
            </div>

            <div class="flex justify-end space-x-3">
              <button
                  @click="showAddModal = false"
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                添加题目
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/exam'

const examStore = useExamStore()
const { questions } = storeToRefs(examStore)
const { addQuestion, deleteQuestion } = examStore

const showAddModal = ref(false)
const newQuestion = ref({
  type: 'single',
  question: '',
  options: ['', ''],
  correctAnswer: 0,
  score: 10
})

// 修复：监听题目类型变化，动态初始化 correctAnswer
watch(() => newQuestion.value.type, (newType) => {
  if (newType === 'single') {
    newQuestion.value.correctAnswer = 0
  } else {
    newQuestion.value.correctAnswer = Array.isArray(newQuestion.value.correctAnswer)
        ? newQuestion.value.correctAnswer
        : []
  }
})

const isCorrectOption = (question, index) => {
  if (question.type === 'single') {
    return question.correctAnswer === index
  } else {
    return Array.isArray(question.correctAnswer) && question.correctAnswer.includes(index)
  }
}

const addOption = () => {
  newQuestion.value.options.push('')
}

const removeOption = (index) => {
  newQuestion.value.options.splice(index, 1)
  // 调整正确答案
  if (newQuestion.value.type === 'single' && newQuestion.value.correctAnswer >= index) {
    newQuestion.value.correctAnswer = Math.max(0, newQuestion.value.correctAnswer - 1)
  } else if (newQuestion.value.type === 'multiple') {
    newQuestion.value.correctAnswer = newQuestion.value.correctAnswer
        .filter(ans => ans !== index)
        .map(ans => ans > index ? ans - 1 : ans)
  }
}

const addNewQuestion = () => {
  if (newQuestion.value.question.trim() && newQuestion.value.options.every(opt => opt.trim())) {
    addQuestion({
      ...newQuestion.value,
      options: newQuestion.value.options.filter(opt => opt.trim())
    })

    // 修复：重置时保持 correctAnswer 类型一致
    newQuestion.value = {
      type: 'single',
      question: '',
      options: ['', ''],
      correctAnswer: 0,
      score: 10
    }
    showAddModal.value = false
  }
}
</script>