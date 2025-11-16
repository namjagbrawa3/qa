<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- 页面标题 -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">题库管理</h1>
        <p class="mt-2 text-sm text-gray-700">
          管理系统中的所有题目，支持单选题、多选题，以及图片、音频、视频等多媒体内容。
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="openModal()"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加题目
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="mt-6">
      <div class="max-w-lg">
        <label for="search" class="sr-only">搜索题目</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            v-model="searchQuery"
            type="search"
            placeholder="搜索题目内容..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="mt-8 flex flex-col">
      <LoadingSpinner v-if="examStore.questionsLoading" />

      <EmptyState
        v-else-if="filteredQuestions.length === 0"
        title="暂无题目"
        description="开始创建第一个题目吧。"
        icon="question"
      >
        <template #action>
          <button
            @click="openModal()"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            添加题目
          </button>
        </template>
      </EmptyState>

      <div v-else class="space-y-6">
        <div
          v-for="question in filteredQuestions"
          :key="question.id"
          class="bg-white shadow rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-3">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  question.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ question.type === 'single' ? '单选题' : '多选题' }}
                </span>
                <span class="text-sm text-gray-500">{{ question.score }}分</span>
              </div>
              
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ question.question }}</h3>
              
              <!-- 多媒体内容 -->
              <div v-if="question.image_url || question.audio_url || question.video_url" class="mb-4 space-y-2">
                <img v-if="question.image_url" :src="getMediaUrl(question.image_url)" alt="题目图片" class="max-w-xs rounded-lg" />
                <audio v-if="question.audio_url" :src="getMediaUrl(question.audio_url)" controls class="w-full max-w-md"></audio>
                <video v-if="question.video_url" :src="getMediaUrl(question.video_url)" controls class="w-full max-w-md"></video>
              </div>
              
              <div class="space-y-2">
                <div
                  v-for="(option, index) in question.options"
                  :key="index"
                  class="flex items-center space-x-2"
                >
                  <span :class="[
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                    isCorrectOption(question, index) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  ]">
                    {{ String.fromCharCode(65 + index) }}
                  </span>
                  <span :class="[
                    'text-sm',
                    isCorrectOption(question, index) ? 'text-green-800 font-medium' : 'text-gray-700'
                  ]">
                    {{ option }}
                  </span>
                  <svg v-if="isCorrectOption(question, index)" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4">
              <button
                @click="openModal(question)"
                class="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                编辑
              </button>
              <button
                @click="deleteQuestion(question)"
                class="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑题目模态框 -->
    <div v-if="showModal" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form @submit.prevent="handleSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ editingQuestion ? '编辑题目' : '添加题目' }}
                  </h3>
                  
                  <div class="space-y-4">
                    <!-- 题目类型 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">题目类型</label>
                      <select
                        v-model="form.type"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="single">单选题</option>
                        <option value="multiple">多选题</option>
                      </select>
                    </div>
                    
                    <!-- 题目内容 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">题目内容</label>
                      <textarea
                        v-model="form.question"
                        rows="3"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="请输入题目内容..."
                      ></textarea>
                    </div>
                    
                    <!-- 多媒体文件上传 -->
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">图片</label>
                        <input
                          type="file"
                          accept="image/*"
                          @change="handleFileUpload($event, 'image')"
                          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700">音频</label>
                        <input
                          type="file"
                          accept="audio/*"
                          @change="handleFileUpload($event, 'audio')"
                          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700">视频</label>
                        <input
                          type="file"
                          accept="video/*"
                          @change="handleFileUpload($event, 'video')"
                          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                    
                    <!-- 选项 -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium text-gray-700">选项</label>
                        <button
                          type="button"
                          @click="addOption"
                          class="text-sm text-blue-600 hover:text-blue-500"
                        >
                          + 添加选项
                        </button>
                      </div>
                      
                      <div class="space-y-2">
                        <div
                          v-for="(option, index) in form.options"
                          :key="index"
                          class="flex items-center space-x-2"
                        >
                          <button
                            type="button"
                            @click="toggleCorrectAnswer(index)"
                            :class="[
                              'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium border-2',
                              isCorrectAnswer(index) 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400'
                            ]"
                          >
                            {{ String.fromCharCode(65 + index) }}
                          </button>
                          
                          <input
                            v-model="form.options[index]"
                            type="text"
                            required
                            class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                          />
                          
                          <button
                            v-if="form.options.length > 2"
                            type="button"
                            @click="removeOption(index)"
                            class="text-red-600 hover:text-red-800"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <p class="mt-2 text-sm text-gray-500">
                        点击选项前的字母来设置正确答案
                      </p>
                    </div>
                    
                    <!-- 分值 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">分值</label>
                      <input
                        v-model.number="form.score"
                        type="number"
                        min="1"
                        max="100"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ isLoading ? '保存中...' : (editingQuestion ? '更新' : '添加') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useExamStore } from '../stores/exam.js'
import { useAuthStore } from '../stores/auth.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const examStore = useExamStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingQuestion = ref(null)
const searchQuery = ref('')
const isLoading = ref(false)

const form = reactive({
  type: 'single',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: null,
  score: 10,
  image: null,
  audio: null,
  video: null
})

const filteredQuestions = computed(() => {
  if (!searchQuery.value) return examStore.questions
  return examStore.questions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const isCorrectAnswer = (index) => {
  if (form.type === 'single') {
    return form.correctAnswer === index
  } else {
    return Array.isArray(form.correctAnswer) && form.correctAnswer.includes(index)
  }
}

const isCorrectOption = (question, index) => {
  if (question.type === 'single') {
    return question.correct_answer === index
  } else {
    return Array.isArray(question.correct_answer) && question.correct_answer.includes(index)
  }
}

const resetForm = () => {
  form.type = 'single'
  form.question = ''
  form.options = ['', '', '', '']
  form.correctAnswer = null
  form.score = 10
  form.image = null
  form.audio = null
  form.video = null
}

const openModal = (question = null) => {
  editingQuestion.value = question
  if (question) {
    form.type = question.type
    form.question = question.question
    form.options = [...question.options]
    form.correctAnswer = question.correct_answer
    form.score = question.score
  } else {
    resetForm()
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingQuestion.value = null
  resetForm()
}

const addOption = () => {
  form.options.push('')
}

const removeOption = (index) => {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
    // 调整正确答案
    if (form.type === 'single' && form.correctAnswer >= index) {
      form.correctAnswer = form.correctAnswer > index ? form.correctAnswer - 1 : null
    } else if (form.type === 'multiple' && Array.isArray(form.correctAnswer)) {
      form.correctAnswer = form.correctAnswer
        .map(ans => ans > index ? ans - 1 : ans)
        .filter(ans => ans !== index)
    }
  }
}

const handleFileUpload = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    form[type] = file
  }
}

const handleSubmit = async () => {
  // 验证表单
  if (!form.question.trim()) {
    alert('请输入题目内容')
    return
  }
  
  if (form.options.some(opt => !opt.trim())) {
    alert('请填写所有选项')
    return
  }
  
  if (form.correctAnswer === null || 
      (Array.isArray(form.correctAnswer) && form.correctAnswer.length === 0)) {
    alert('请选择正确答案')
    return
  }
  
  isLoading.value = true
  
  const questionData = {
    type: form.type,
    question: form.question.trim(),
    options: form.options.map(opt => opt.trim()),
    correctAnswer: form.correctAnswer,
    score: parseInt(form.score),
    image: form.image,
    audio: form.audio,
    video: form.video
  }
  
  try {
    let result
    if (editingQuestion.value) {
      // 编辑题目
      result = await examStore.updateQuestion(editingQuestion.value.id, questionData)
    } else {
      // 添加新题目
      result = await examStore.addQuestion(questionData)
    }
    
    if (result.success) {
      closeModal()
    } else {
      alert(result.error || '操作失败')
    }
  } catch (error) {
    console.error('提交题目失败:', error)
    alert('提交失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const deleteQuestion = async (question) => {
  if (confirm(`确定要删除题目"${question.question}"吗？`)) {
    const result = await examStore.deleteQuestion(question.id)
    if (!result.success) {
      alert(result.error || '删除失败')
    }
  }
}

const toggleCorrectAnswer = (optionIndex) => {
  if (form.type === 'single') {
    form.correctAnswer = optionIndex
  } else {
    if (!Array.isArray(form.correctAnswer)) {
      form.correctAnswer = []
    }
    const index = form.correctAnswer.indexOf(optionIndex)
    if (index > -1) {
      form.correctAnswer.splice(index, 1)
    } else {
      form.correctAnswer.push(optionIndex)
    }
  }
}

const getMediaUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : `http://localhost:3001${url}`
}

onMounted(async () => {
  // 加载题目列表
  await examStore.fetchQuestions()
})
</script>