import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionAPI, examAPI, userAPI } from '../services/api.js'

export const useExamStore = defineStore('exam', () => {
  // 题库
  const questions = ref([])
  const questionsLoading = ref(false)
  const questionsError = ref(null)

  // 试卷
  const exams = ref([])
  const examsLoading = ref(false)
  const examsError = ref(null)

  // 考试记录
  const examRecords = ref([])
  const recordsLoading = ref(false)
  const recordsError = ref(null)

  // 当前考试状态
  const currentExam = ref(null)
  const currentRecord = ref(null)
  const examStartTime = ref(null)
  const examAnswers = ref({})

  // 统计数据
  const stats = ref({
    questions: { totalQuestions: 0, singleChoiceCount: 0, multipleChoiceCount: 0, withMediaCount: 0 },
    exams: { totalExams: 0, activeExams: 0, totalParticipants: 0, avgScore: 0 },
    users: { totalUsers: 0, totalAdmins: 0, recentUsers: [] }
  })

  // 计算属性
  const totalQuestions = computed(() => questions.value.length)
  const totalExams = computed(() => exams.value.length)
  const totalParticipants = computed(() => examRecords.value.length)

  // 题目管理方法
  const fetchQuestions = async (params = {}) => {
    questionsLoading.value = true
    questionsError.value = null
    
    try {
      const response = await questionAPI.getQuestions(params)
      questions.value = response.data.questions
      return { success: true, data: response.data }
    } catch (error) {
      questionsError.value = error.response?.data?.error || '获取题目失败'
      return { success: false, error: questionsError.value }
    } finally {
      questionsLoading.value = false
    }
  }

  const addQuestion = async (questionData) => {
    try {
      const response = await questionAPI.createQuestion(questionData)
      questions.value.push(response.data.question)
      return { success: true, question: response.data.question }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '添加题目失败' }
    }
  }

  const updateQuestion = async (questionId, questionData) => {
    try {
      const response = await questionAPI.updateQuestion(questionId, questionData)
      const index = questions.value.findIndex(q => q.id === questionId)
      if (index > -1) {
        questions.value[index] = response.data.question
      }
      return { success: true, question: response.data.question }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '更新题目失败' }
    }
  }

  const deleteQuestion = async (questionId) => {
    try {
      await questionAPI.deleteQuestion(questionId)
      const index = questions.value.findIndex(q => q.id === questionId)
      if (index > -1) {
        questions.value.splice(index, 1)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '删除题目失败' }
    }
  }

  // 试卷管理方法
  const fetchExams = async (params = {}) => {
    examsLoading.value = true
    examsError.value = null
    
    try {
      const response = await examAPI.getExams(params)
      exams.value = response.data.exams
      return { success: true, data: response.data }
    } catch (error) {
      examsError.value = error.response?.data?.error || '获取试卷失败'
      return { success: false, error: examsError.value }
    } finally {
      examsLoading.value = false
    }
  }

  const createExam = async (examData) => {
    try {
      const response = await examAPI.createExam(examData)
      exams.value.push(response.data.exam)
      return { success: true, exam: response.data.exam }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '创建试卷失败' }
    }
  }

  const updateExam = async (examId, examData) => {
    try {
      const response = await examAPI.updateExam(examId, examData)
      const index = exams.value.findIndex(e => e.id === examId)
      if (index > -1) {
        exams.value[index] = response.data.exam
      }
      return { success: true, exam: response.data.exam }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '更新试卷失败' }
    }
  }

  const deleteExam = async (examId) => {
    try {
      await examAPI.deleteExam(examId)
      const index = exams.value.findIndex(e => e.id === examId)
      if (index > -1) {
        exams.value.splice(index, 1)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '删除试卷失败' }
    }
  }

  // 考试相关方法
  const startExam = async (examId) => {
    try {
      const response = await examAPI.startExam(examId)
      currentExam.value = response.data.exam
      currentRecord.value = { id: response.data.recordId }
      examStartTime.value = new Date()
      examAnswers.value = {}
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '开始考试失败' }
    }
  }

  const submitExam = async (examId, answers) => {
    try {
      const response = await examAPI.submitExam(examId, {
        recordId: currentRecord.value.id,
        answers
      })
      
      // 清除当前考试状态
      currentExam.value = null
      currentRecord.value = null
      examStartTime.value = null
      examAnswers.value = {}
      
      return { success: true, result: response.data.result }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '提交考试失败' }
    }
  }

  // 获取用户考试记录
  const fetchUserExamRecords = async (userId, params = {}) => {
    recordsLoading.value = true
    recordsError.value = null
    
    try {
      const response = await userAPI.getUserExamRecords(userId, params)
      examRecords.value = response.data.records
      return { success: true, data: response.data }
    } catch (error) {
      recordsError.value = error.response?.data?.error || '获取考试记录失败'
      return { success: false, error: recordsError.value }
    } finally {
      recordsLoading.value = false
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const [questionStats, examStats, userStats] = await Promise.all([
        questionAPI.getQuestionStats(),
        examAPI.getExamStats(),
        userAPI.getUserStats()
      ])
      
      stats.value = {
        questions: questionStats.data,
        exams: examStats.data,
        users: userStats.data
      }
      
      return { success: true, stats: stats.value }
    } catch (error) {
      return { success: false, error: '获取统计数据失败' }
    }
  }

  // 获取随机题目（用于无限制模式）
  const getRandomQuestions = (excludeIds = [], count = 1) => {
    const availableQuestions = questions.value.filter(q => !excludeIds.includes(q.id))
    if (availableQuestions.length === 0) return []
    
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // 无限制模式专用：提交单题答案
  const submitUnlimitedAnswer = (questionId, userAnswer, currentScore) => {
    const question = questions.value.find(q => q.id === questionId)
    if (!question) return { isCorrect: false, newScore: currentScore }

    let isCorrect = false
    if (question.type === 'single') {
      isCorrect = userAnswer === question.correct_answer
    } else if (question.type === 'multiple') {
      isCorrect = Array.isArray(userAnswer) && 
        userAnswer.length === question.correct_answer.length &&
        userAnswer.every(ans => question.correct_answer.includes(ans))
    }

    // 无限制模式：答对不得分，答错扣分
    const newScore = isCorrect ? currentScore : Math.max(0, currentScore - question.score)
    
    return {
      isCorrect,
      newScore,
      scoreChange: isCorrect ? 0 : -question.score,
      question
    }
  }

  return {
    // 状态
    questions,
    questionsLoading,
    questionsError,
    exams,
    examsLoading,
    examsError,
    examRecords,
    recordsLoading,
    recordsError,
    currentExam,
    currentRecord,
    examStartTime,
    examAnswers,
    stats,
    
    // 计算属性
    totalQuestions,
    totalExams,
    totalParticipants,
    
    // 方法
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    fetchExams,
    createExam,
    updateExam,
    deleteExam,
    startExam,
    submitExam,
    fetchUserExamRecords,
    fetchStats,
    getRandomQuestions,
    submitUnlimitedAnswer
  }
})