<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- 欢迎区域 -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">欢迎使用答题考试系统</h1>
        <p class="text-lg text-gray-600 mb-6">支持题库管理、试卷创建、在线考试，提供加分制和减分制两种计分模式</p>
        <div class="flex justify-center space-x-4">
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
            创建试卷
          </router-link>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p class="text-2xl font-bold text-gray-900">{{ totalQuestions }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ totalExams }}</p>
            <p class="text-sm text-gray-600">已创建试卷</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ totalParticipants }}</p>
            <p class="text-sm text-gray-600">参与考试人数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 试卷列表 -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">试卷列表</h2>
        <router-link 
          to="/exams"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          创建新试卷
        </router-link>
      </div>
      
      <div class="p-6">
        <div v-if="exams.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无试卷</h3>
          <p class="mt-1 text-sm text-gray-500">开始创建您的第一份试卷</p>
          <div class="mt-6">
            <router-link 
              to="/exams"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              创建第一份试卷
            </router-link>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="exam in exams" 
            :key="exam.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-medium text-gray-900 mb-2">{{ exam.title }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ exam.description }}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>{{ exam.questions.length }} 题</span>
              <span>{{ exam.totalScore }} 分</span>
            </div>
            <div class="mt-3 flex space-x-2">
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
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/exam'

const examStore = useExamStore()
const { exams, totalQuestions, totalExams, totalParticipants } = storeToRefs(examStore)
const { deleteExam } = examStore
</script>