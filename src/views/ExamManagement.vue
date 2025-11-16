<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- 页面标题 -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ authStore.isAdmin ? '试卷管理' : '考试中心' }}
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          {{ authStore.isAdmin ? '创建和管理考试试卷，查看考试统计' : '参加考试，查看考试记录' }}
        </p>
      </div>
      <div v-if="authStore.isAdmin" class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          创建试卷
        </button>
      </div>
    </div>

    <!-- 试卷列表 -->
    <div class="mt-8">
      <div v-if="examStore.examsLoading" class="text-center py-12">
        <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </div>
      </div>

      <div v-else-if="examStore.exams.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无试卷</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ authStore.isAdmin ? '开始创建第一份试卷吧' : '暂时没有可参加的考试' }}
        </p>
        <div v-if="authStore.isAdmin" class="mt-6">
          <button
            @click="showCreateModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            创建试卷
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="exam in examStore.exams"
          :key="exam.id"
          class="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ exam.title }}</h3>
            <div class="flex flex-col items-end space-y-1">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                exam.scoring_mode === 'add' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              ]">
                {{ exam.scoring_mode === 'add' ? '加分制' : '减分制' }}
              </span>
              <span v-if="authStore.isAdmin" :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                exam.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ exam.is_active ? '已激活' : '未激活' }}
              </span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">{{ exam.description || '暂无描述' }}</p>
          
          <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>{{ exam.questions?.length || 0 }} 题</span>
            <span>{{ exam.total_score || 0 }} 分</span>
            <span>{{ exam.duration || 60 }} 分钟</span>
          </div>
          
          <div class="flex space-x-2">
            <!-- 管理员操作 -->
            <template v-if="authStore.isAdmin">
              <button
                @click="editExam(exam)"
                class="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                编辑
              </button>
              <button
                @click="viewExamResults(exam)"
                class="flex-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                查看结果
              </button>
              <button
                @click="deleteExam(exam)"
                class="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                删除
              </button>
            </template>
            
            <!-- 用户操作 -->
            <template v-else>
              <button
                v-if="!exam.hasUserTaken"
                @click="startExam(exam)"
                :disabled="!exam.is_active"
                class="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium"
              >
                {{ exam.is_active ? '开始考试' : '考试未开放' }}
              </button>
              <button
                v-else
                @click="viewExamResult(exam)"
                class="flex-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                查看结果
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建试卷模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showCreateModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form @submit.prevent="handleCreateExam">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ editingExam ? '编辑试卷' : '创建试卷' }}
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">试卷标题</label>
                      <input
                        v-model="examForm.title"
                        type="text"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="请输入试卷标题"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">试卷描述</label>
                      <textarea
                        v-model="examForm.description"
                        rows="3"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="请输入试卷描述（可选）"
                      ></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">考试时长（分钟）</label>
                        <input
                          v-model.number="examForm.duration"
                          type="number"
                          min="1"
                          max="300"
                          required
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700">计分方式</label>
                        <select
                          v-model="examForm.scoringMode"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="add">加分制</option>
                          <option value="subtract">减分制</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">选择题目</label>
                      <div class="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                        <div v-if="examStore.questions.length === 0" class="text-center text-gray-500 py-4">
                          暂无题目，请先添加题目
                        </div>
                        <div v-else class="space-y-2">
                          <label
                            v-for="question in examStore.questions"
                            :key="question.id"
                            class="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              :value="question.id"
                              v-model="examForm.selectedQuestions"
                              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div class="flex-1">
                              <div class="flex items-center space-x-2">
                                <span :class="[
                                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                  question.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                ]">
                                  {{ question.type === 'single' ? '单选' : '多选' }}
                                </span>
                                <span class="text-sm text-gray-500">{{ question.score }}分</span>
                              </div>
                              <p class="text-sm text-gray-900 mt-1">{{ question.question }}</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="isLoading || examForm.selectedQuestions.length === 0"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ isLoading ? '创建中...' : (editingExam ? '更新' : '创建') }}
              </button>
              <button
                type="button"
                @click="closeCreateModal"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/exam.js'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const examStore = useExamStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const editingExam = ref(null)
const isLoading = ref(false)

const examForm = reactive({
  title: '',
  description: '',
  duration: 60,
  scoringMode: 'add',
  selectedQuestions: []
})

const resetExamForm = () => {
  examForm.title = ''
  examForm.description = ''
  examForm.duration = 60
  examForm.scoringMode = 'add'
  examForm.selectedQuestions = []
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingExam.value = null
  resetExamForm()
}

const handleCreateExam = async () => {
  if (examForm.selectedQuestions.length === 0) {
    alert('请至少选择一道题目')
    return
  }
  
  isLoading.value = true
  
  try {
    const examData = {
      title: examForm.title,
      description: examForm.description,
      duration: examForm.duration,
      scoringMode: examForm.scoringMode,
      questions: examForm.selectedQuestions
    }
    
    let result
    if (editingExam.value) {
      result = await examStore.updateExam(editingExam.value.id, examData)
    } else {
      result = await examStore.createExam(examData)
    }
    
    if (result.success) {
      closeCreateModal()
    } else {
      alert(result.error || '操作失败')
    }
  } catch (error) {
    console.error('创建试卷失败:', error)
    alert('操作失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const editExam = (exam) => {
  editingExam.value = exam
  examForm.title = exam.title
  examForm.description = exam.description || ''
  examForm.duration = exam.duration
  examForm.scoringMode = exam.scoring_mode
  examForm.selectedQuestions = exam.questions?.map(q => q.id) || []
  showCreateModal.value = true
}

const deleteExam = async (exam) => {
  if (confirm(`确定要删除试卷"${exam.title}"吗？此操作不可恢复。`)) {
    const result = await examStore.deleteExam(exam.id)
    if (!result.success) {
      alert(result.error || '删除失败')
    }
  }
}

const startExam = async (exam) => {
  if (confirm(`确定要开始考试"${exam.title}"吗？考试开始后不能重复参加。`)) {
    const result = await examStore.startExam(exam.id)
    if (result.success) {
      router.push(`/exam/${exam.id}`)
    } else {
      alert(result.error || '开始考试失败')
    }
  }
}

const viewExamResults = (exam) => {
  // TODO: 实现查看试卷结果功能
  console.log('查看试卷结果:', exam)
}

const viewExamResult = (exam) => {
  // TODO: 实现查看个人考试结果功能
  console.log('查看个人考试结果:', exam)
}

onMounted(async () => {
  // 加载试卷列表和题目列表
  await Promise.all([
    examStore.fetchExams(),
    examStore.fetchQuestions()
  ])
})
</script>