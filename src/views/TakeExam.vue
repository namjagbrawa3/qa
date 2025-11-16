<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h2 class="mt-2 text-xl font-medium text-gray-900">{{ error }}</h2>
        <router-link to="/exams" class="mt-4 inline-block text-blue-600 hover:text-blue-800">返回考试中心</router-link>
      </div>
    </div>

    <!-- 考试准备页面 -->
    <div v-else-if="!examStarted && exam" class="max-w-2xl mx-auto py-12 px-4">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ exam.title }}</h1>
        <p class="text-gray-600 mb-6">{{ exam.description || '暂无描述' }}</p>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">题目数量</div>
            <div class="text-xl font-semibold text-gray-900">{{ exam.questions?.length || 0 }} 题</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">总分</div>
            <div class="text-xl font-semibold text-gray-900">{{ exam.total_score || 0 }} 分</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">考试时长</div>
            <div class="text-xl font-semibold text-gray-900">{{ exam.duration || 60 }} 分钟</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">计分模式</div>
            <div class="text-xl font-semibold text-gray-900">
              {{ exam.scoring_mode === 'add' ? '加分制' : '减分制' }}
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">考试说明：</h3>
          <ul class="text-sm text-yellow-700 space-y-1">
            <li v-if="exam.scoring_mode === 'add'">• 加分制：答对题目获得相应分数，答错不扣分</li>
            <li v-else>• 减分制：答对题目获得相应分数，答错扣除相应分数</li>
            <li>• 请在规定时间内完成所有题目</li>
            <li>• 提交后无法修改答案</li>
            <li>• 每份试卷只能参加一次</li>
          </ul>
        </div>

        <button 
          @click="startExam"
          :disabled="isStarting"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isStarting ? '准备中...' : '开始考试' }}
        </button>
      </div>
    </div>

    <!-- 考试进行中 -->
    <div v-else-if="examStarted && exam" class="max-w-4xl mx-auto py-6 px-4">
      <!-- 考试头部信息 -->
      <div class="bg-white rounded-lg shadow p-4 mb-6 sticky top-0 z-10">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-semibold text-gray-900">{{ exam.title }}</h1>
            <p class="text-sm text-gray-500">
              第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ exam.questions.length }} 题
            </p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold" :class="timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'">
              {{ formatTime(timeRemaining) }}
            </div>
            <p class="text-sm text-gray-500">剩余时间</p>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="mt-4">
          <div class="bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 题目内容 -->
      <div v-if="currentQuestion" class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center space-x-2 mb-4">
          <span :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            currentQuestion.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          ]">
            {{ currentQuestion.type === 'single' ? '单选题' : '多选题' }}
          </span>
          <span class="text-sm text-gray-500">{{ currentQuestion.score }}分</span>
        </div>
        
        <h2 class="text-lg font-medium text-gray-900 mb-4">{{ currentQuestion.question }}</h2>
        
        <!-- 多媒体内容 -->
        <div v-if="currentQuestion.image_url || currentQuestion.audio_url || currentQuestion.video_url" class="mb-6 space-y-4">
          <img v-if="currentQuestion.image_url" :src="getMediaUrl(currentQuestion.image_url)" alt="题目图片" class="max-w-md rounded-lg" />
          <audio v-if="currentQuestion.audio_url" :src="getMediaUrl(currentQuestion.audio_url)" controls class="w-full max-w-md"></audio>
          <video v-if="currentQuestion.video_url" :src="getMediaUrl(currentQuestion.video_url)" controls class="w-full max-w-md"></video>
        </div>
        
        <!-- 选项 -->
        <div class="space-y-3">
          <label
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50 border-blue-300': isOptionSelected(index) }"
          >
            <input
              v-if="currentQuestion.type === 'single'"
              type="radio"
              :name="`question-${currentQuestion.id}`"
              :value="index"
              v-model="answers[currentQuestion.id]"
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <input
              v-else
              type="checkbox"
              :value="index"
              v-model="answers[currentQuestion.id]"
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div class="flex-1">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium mr-3">
                {{ String.fromCharCode(65 + index) }}
              </span>
              <span class="text-gray-900">{{ option }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex justify-between items-center">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一题
          </button>
          
          <div class="flex space-x-2">
            <button
              v-if="currentQuestionIndex < exam.questions.length - 1"
              @click="nextQuestion"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              下一题
            </button>
            <button
              v-else
              @click="submitExam"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? '提交中...' : '提交试卷' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 考试结果 -->
    <div v-else-if="examResult" class="max-w-2xl mx-auto py-12 px-4">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <div class="mb-6">
          <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-4">考试完成！</h1>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">得分</div>
            <div class="text-2xl font-bold text-gray-900">{{ examResult.total_score }} 分</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">正确率</div>
            <div class="text-2xl font-bold text-gray-900">
              {{ Math.round((examResult.correct_count / examResult.total_questions) * 100) }}%
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">正确题数</div>
            <div class="text-2xl font-bold text-gray-900">{{ examResult.correct_count }} / {{ examResult.total_questions }}</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">用时</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatDuration(examResult.duration_seconds) }}</div>
          </div>
        </div>
        
        <router-link
          to="/exams"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          返回考试中心
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '../stores/exam.js'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()

const isLoading = ref(true)
const error = ref('')
const exam = ref(null)
const examStarted = ref(false)
const isStarting = ref(false)
const isSubmitting = ref(false)
const currentQuestionIndex = ref(0)
const answers = reactive({})
const startTime = ref(null)
const timeRemaining = ref(0)
const timer = ref(null)
const examResult = ref(null)

const currentQuestion = computed(() => {
  if (!exam.value || !exam.value.questions) return null
  return exam.value.questions[currentQuestionIndex.value]
})

const isOptionSelected = (optionIndex) => {
  if (!currentQuestion.value) return false
  
  const answer = answers[currentQuestion.value.id]
  if (currentQuestion.value.type === 'single') {
    return answer === optionIndex
  } else {
    return Array.isArray(answer) && answer.includes(optionIndex)
  }
}

const getMediaUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : `http://localhost:3001${url}`
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  }
  return `${remainingSeconds}秒`
}

const startTimer = () => {
  if (timer.value) clearInterval(timer.value)
  
  timer.value = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
    const duration = (exam.value.duration || 60) * 60
    timeRemaining.value = Math.max(0, duration - elapsed)
    
    if (timeRemaining.value === 0) {
      submitExam()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const loadExam = async () => {
  try {
    const examId = route.params.id
    const response = await examStore.examAPI.getExam(examId)
    exam.value = response.data.exam
    
    if (response.data.hasUserTaken) {
      error.value = '您已经参加过这个考试'
      return
    }
    
    // 初始化答案对象
    if (exam.value.questions) {
      exam.value.questions.forEach(question => {
        if (question.type === 'single') {
          answers[question.id] = null
        } else {
          answers[question.id] = []
        }
      })
    }
  } catch (err) {
    console.error('加载考试失败:', err)
    error.value = err.response?.data?.error || '加载考试失败'
  } finally {
    isLoading.value = false
  }
}

const startExam = async () => {
  isStarting.value = true
  
  try {
    const result = await examStore.startExam(exam.value.id)
    if (result.success) {
      examStarted.value = true
      startTime.value = Date.now()
      timeRemaining.value = (exam.value.duration || 60) * 60
      startTimer()
    } else {
      alert(result.error || '开始考试失败')
    }
  } catch (error) {
    console.error('开始考试失败:', error)
    alert('开始考试失败，请重试')
  } finally {
    isStarting.value = false
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < exam.value.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const submitExam = async () => {
  if (!confirm('确定要提交试卷吗？提交后无法修改。')) {
    return
  }
  
  isSubmitting.value = true
  stopTimer()
  
  try {
    const result = await examStore.submitExam(exam.value.id, answers)
    if (result.success) {
      examResult.value = result.result
      examStarted.value = false
    } else {
      alert(result.error || '提交失败')
      startTimer() // 重新开始计时
    }
  } catch (error) {
    console.error('提交考试失败:', error)
    alert('提交失败，请重试')
    startTimer() // 重新开始计时
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadExam()
})

onUnmounted(() => {
  stopTimer()
})
</script>