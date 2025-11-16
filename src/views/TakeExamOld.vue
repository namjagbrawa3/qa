<template>
  <div class="px-4 py-6 sm:px-0">
    <div v-if="!exam" class="text-center py-12">
      <h2 class="text-xl font-medium text-gray-900">试卷不存在</h2>
      <router-link to="/" class="mt-4 inline-block text-blue-600 hover:text-blue-800">返回首页</router-link>
    </div>

    <div v-else-if="!examStarted" class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ exam.title }}</h1>
        <p class="text-gray-600 mb-6">{{ exam.description }}</p>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">题目数量</div>
            <div class="text-xl font-semibold text-gray-900">{{ exam.questions.length }} 题</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">总分</div>
            <div class="text-xl font-semibold text-gray-900">{{ exam.totalScore }} 分</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">考试时长</div>
            <div class="text-xl font-semibold text-gray-900">{{ exam.timeLimit }} 分钟</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">计分模式</div>
            <div class="text-xl font-semibold text-gray-900">
              {{ getScoringModeText(exam.scoringMode) }}
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">考试说明：</h3>
          <ul class="text-sm text-yellow-700 space-y-1">
            <li v-if="exam.scoringMode === 'add'">• 加分制：答对题目获得相应分数，答错不扣分</li>
            <li v-else-if="exam.scoringMode === 'subtract'">• 减分制：答对题目获得相应分数，答错扣除相应分数</li>
            <li v-else-if="exam.scoringMode === 'unlimited'">• 无限制模式：从满分{{ exam.maxScore }}分开始，答对不得分，答错扣分，答完题目后继续抽取新题目直到分数为0</li>
            <li v-if="exam.scoringMode !== 'unlimited'">• 请在规定时间内完成所有题目</li>
            <li v-else>• 挑战模式：坚持到最后一刻！</li>
            <li>• 提交后无法修改答案</li>
          </ul>
        </div>

        <button 
          @click="startExam"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          开始考试
        </button>
      </div>
    </div>

    <div v-else-if="!examFinished" class="max-w-4xl mx-auto">
      <!-- 无限制模式 -->
      <div v-if="unlimitedMode" class="space-y-6">
        <!-- 状态栏 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-xl font-semibold text-gray-900">{{ exam.title }} - 挑战模式</h1>
            <div class="flex items-center space-x-4">
              <div class="text-lg font-bold" :class="currentScore > 20 ? 'text-green-600' : currentScore > 10 ? 'text-yellow-600' : 'text-red-600'">
                剩余分数: {{ currentScore }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-sm text-gray-500">已答题数</div>
              <div class="text-xl font-semibold text-blue-600">{{ unlimitedResults.length }}</div>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <div class="text-sm text-gray-500">正确率</div>
              <div class="text-xl font-semibold text-green-600">
                {{ unlimitedResults.length > 0 ? Math.round((unlimitedResults.filter(r => r.isCorrect).length / unlimitedResults.length) * 100) : 0 }}%
              </div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
              <div class="text-sm text-gray-500">初始分数</div>
              <div class="text-xl font-semibold text-purple-600">{{ exam.maxScore }}</div>
            </div>
          </div>
        </div>

        <!-- 当前题目 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div v-if="getCurrentQuestion()" class="space-y-6">
            <div class="flex items-start">
              <span class="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-medium mr-4">
                {{ unlimitedResults.length + 1 }}
              </span>
              <div class="flex-1">
                <h3 class="text-xl font-medium text-gray-900 mb-4">
                  {{ getCurrentQuestion()?.question }}
                  <span class="ml-2 text-sm text-red-500 font-medium">(答错扣{{ getCurrentQuestion()?.score }}分)</span>
                </h3>
                
                <div class="space-y-3">
                  <div 
                    v-for="(option, optionIndex) in getCurrentQuestion()?.options" 
                    :key="optionIndex"
                    class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    @click="getCurrentQuestion()?.type === 'single' ? currentAnswer = optionIndex : null"
                  >
                    <input 
                      v-if="getCurrentQuestion()?.type === 'single'"
                      v-model="currentAnswer"
                      :value="optionIndex"
                      type="radio" 
                      :name="`current-question`"
                      class="mr-3"
                    />
                    <input 
                      v-else
                      v-model="currentAnswer"
                      :value="optionIndex"
                      type="checkbox" 
                      class="mr-3"
                    />
                    <label class="text-gray-700 cursor-pointer flex-1">
                      {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                    </label>
                  </div>
                </div>
                
                <div class="mt-6 flex justify-center">
                  <button 
                    @click="submitUnlimitedAnswer"
                    :disabled="currentAnswer === null || (Array.isArray(currentAnswer) && currentAnswer.length === 0)"
                    class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    提交答案
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 普通模式 -->
      <div v-else>
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 class="text-xl font-semibold text-gray-900">{{ exam.title }}</h1>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-600">
                剩余时间: <span class="font-medium text-red-600">{{ formatTime(timeRemaining) }}</span>
              </div>
              <button 
                @click="submitExam"
                class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                提交试卷
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div v-for="(questionId, index) in exam.questions" :key="questionId" class="mb-8 last:mb-0">
            <div class="border-b border-gray-200 pb-6 last:border-b-0">
              <div class="flex items-start mb-4">
                <span class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                  {{ index + 1 }}
                </span>
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">
                    {{ getQuestion(questionId)?.question }}
                    <span class="ml-2 text-sm text-gray-500">({{ getQuestion(questionId)?.score }}分)</span>
                  </h3>
                  
                  <div class="space-y-2">
                    <div 
                      v-for="(option, optionIndex) in getQuestion(questionId)?.options" 
                      :key="optionIndex"
                      class="flex items-center"
                    >
                      <input 
                        v-if="getQuestion(questionId)?.type === 'single'"
                        v-model="answers[questionId]"
                        :value="optionIndex"
                        type="radio" 
                        :name="`question-${questionId}`"
                        class="mr-3"
                      />
                      <input 
                        v-else
                        v-model="answers[questionId]"
                        :value="optionIndex"
                        type="checkbox" 
                        class="mr-3"
                      />
                      <label class="text-gray-700">
                        {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <!-- 考试结果 -->
      <div class="bg-white rounded-lg shadow p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">考试完成！</h2>
          <p class="text-gray-600">您的考试结果如下</p>
        </div>

        <div v-if="examResult.scoringMode === 'unlimited'" class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-red-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-red-600">{{ examResult.totalScore }}</div>
            <div class="text-sm text-red-600">剩余分数</div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">{{ examResult.totalQuestions }}</div>
            <div class="text-sm text-blue-600">总答题数</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">{{ Math.round((examResult.correctCount / examResult.totalQuestions) * 100) }}%</div>
            <div class="text-sm text-green-600">正确率</div>
          </div>
        </div>
        <div v-else class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">{{ examResult.totalScore }}</div>
            <div class="text-sm text-blue-600">总得分</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">{{ examResult.correctCount }}/{{ examResult.totalQuestions }}</div>
            <div class="text-sm text-green-600">正确题数</div>
          </div>
        </div>

        <div class="space-y-4 mb-8">
          <h3 class="text-lg font-medium text-gray-900">答题详情</h3>
          <div v-for="(result, index) in examResult.results" :key="result.questionId" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-start justify-between mb-2">
              <span class="text-sm font-medium text-gray-900">第 {{ index + 1 }} 题</span>
              <span class="text-sm font-medium" :class="result.isCorrect ? 'text-green-600' : 'text-red-600'">
                {{ result.isCorrect ? '正确' : '错误' }} ({{ result.score > 0 ? '+' : '' }}{{ result.score }}分)
              </span>
            </div>
            <p class="text-sm text-gray-700 mb-2">{{ getQuestion(result.questionId)?.question }}</p>
            <div class="text-xs text-gray-500">
              <div>您的答案: {{ formatAnswer(result.userAnswer, result.questionId) }}</div>
              <div>正确答案: {{ formatAnswer(result.correctAnswer, result.questionId) }}</div>
            </div>
          </div>
        </div>

        <div class="flex space-x-4">
          <router-link 
            to="/"
            class="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回首页
          </router-link>
          <router-link 
            to="/exams"
            class="flex-1 border border-blue-600 text-blue-600 text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            查看更多试卷
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/exam'

const route = useRoute()
const examStore = useExamStore()
const { questions, exams } = storeToRefs(examStore)
const { submitExam: submitExamToStore } = examStore

const examId = parseInt(route.params.id)
const exam = computed(() => exams.value.find(e => e.id === examId))

const examStarted = ref(false)
const examFinished = ref(false)
const timeRemaining = ref(0)
const answers = ref({})
const examResult = ref(null)
let timer = null

// 无限制模式专用状态
const unlimitedMode = computed(() => exam.value?.scoringMode === 'unlimited')
const currentScore = ref(0)
const currentQuestionIndex = ref(0)
const currentQuestions = ref([])
const usedQuestionIds = ref([])
const unlimitedResults = ref([])
const currentAnswer = ref(null)

const getQuestion = (questionId) => {
  return questions.value.find(q => q.id === questionId)
}

const getScoringModeText = (mode) => {
  switch(mode) {
    case 'add': return '加分制'
    case 'subtract': return '减分制'
    case 'unlimited': return '无限制'
    default: return '未知'
  }
}

const startExam = () => {
  examStarted.value = true
  
  if (unlimitedMode.value) {
    // 无限制模式初始化
    currentScore.value = exam.value.maxScore || 100
    currentQuestionIndex.value = 0
    currentQuestions.value = [...exam.value.questions]
    usedQuestionIds.value = []
    unlimitedResults.value = []
    initCurrentQuestion()
  } else {
    // 普通模式初始化
    timeRemaining.value = exam.value.timeLimit * 60 // 转换为秒
    
    // 初始化答案
    exam.value.questions.forEach(questionId => {
      const question = getQuestion(questionId)
      if (question?.type === 'multiple') {
        answers.value[questionId] = []
      } else {
        answers.value[questionId] = null
      }
    })
    
    // 开始计时
    timer = setInterval(() => {
      timeRemaining.value--
      if (timeRemaining.value <= 0) {
        submitExam()
      }
    }, 1000)
  }
}

const submitExam = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  
  examResult.value = submitExamToStore(examId, answers.value, exam.value.scoringMode)
  examFinished.value = true
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatAnswer = (answer, questionId) => {
  const question = getQuestion(questionId)
  if (!question) return ''
  
  if (question.type === 'single') {
    return answer !== null ? `${String.fromCharCode(65 + answer)}. ${question.options[answer]}` : '未作答'
  } else {
    if (Array.isArray(answer) && answer.length > 0) {
      return answer.map(idx => `${String.fromCharCode(65 + idx)}. ${question.options[idx]}`).join(', ')
    }
    return '未作答'
  }
}

// 无限制模式相关函数
const initCurrentQuestion = () => {
  const question = getQuestion(getCurrentQuestionId())
  if (question?.type === 'multiple') {
    currentAnswer.value = []
  } else {
    currentAnswer.value = null
  }
}

const getCurrentQuestionId = () => {
  return currentQuestions.value[currentQuestionIndex.value]
}

const getCurrentQuestion = () => {
  return getQuestion(getCurrentQuestionId())
}

const submitUnlimitedAnswer = () => {
  const questionId = getCurrentQuestionId()
  const result = examStore.submitUnlimitedAnswer(questionId, currentAnswer.value, currentScore.value)
  
  // 记录结果
  unlimitedResults.value.push({
    questionId,
    userAnswer: currentAnswer.value,
    correctAnswer: result.question.correctAnswer,
    isCorrect: result.isCorrect,
    scoreChange: result.scoreChange,
    question: result.question
  })
  
  // 更新分数
  currentScore.value = result.newScore
  usedQuestionIds.value.push(questionId)
  
  // 检查游戏是否结束
  if (currentScore.value <= 0) {
    finishUnlimitedExam()
    return
  }
  
  // 移动到下一题
  currentQuestionIndex.value++
  
  // 如果当前试卷题目答完了，获取新题目
  if (currentQuestionIndex.value >= currentQuestions.value.length) {
    const newQuestions = examStore.getRandomQuestions(usedQuestionIds.value, 5)
    if (newQuestions.length === 0) {
      // 没有更多题目了，结束考试
      finishUnlimitedExam()
      return
    }
    currentQuestions.value = newQuestions.map(q => q.id)
    currentQuestionIndex.value = 0
  }
  
  initCurrentQuestion()
}

const finishUnlimitedExam = () => {
  examResult.value = {
    totalScore: currentScore.value,
    correctCount: unlimitedResults.value.filter(r => r.isCorrect).length,
    totalQuestions: unlimitedResults.value.length,
    results: unlimitedResults.value,
    scoringMode: 'unlimited',
    maxScore: exam.value.maxScore || 100
  }
  examFinished.value = true
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>