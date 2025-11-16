<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- 页面标题 -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">用户管理</h1>
        <p class="mt-2 text-sm text-gray-700">
          管理系统中的所有用户账户，包括创建、编辑和删除用户。
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加用户
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">总用户数</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.totalUsers || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">管理员数</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.totalAdmins || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">活跃用户</dt>
                <dd class="text-lg font-medium text-gray-900">{{ users.filter(u => u.role === 'user').length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">最近注册</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.recentUsers?.length || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户信息
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ user.username.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    ]">
                      {{ user.role === 'admin' ? '管理员' : '用户' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      @click="resetPassword(user)"
                      class="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      重置密码
                    </button>
                    <button
                      v-if="user.id !== currentUser?.id"
                      @click="deleteUser(user)"
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

    <!-- 创建用户模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showCreateModal = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleCreateUser">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    创建新用户
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">用户名</label>
                      <input
                        v-model="createForm.username"
                        type="text"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">邮箱</label>
                      <input
                        v-model="createForm.email"
                        type="email"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">密码</label>
                      <input
                        v-model="createForm.password"
                        type="password"
                        required
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">角色</label>
                      <select
                        v-model="createForm.role"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="user">用户</option>
                        <option value="admin">管理员</option>
                      </select>
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
                {{ isLoading ? '创建中...' : '创建' }}
              </button>
              <button
                type="button"
                @click="showCreateModal = false"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { userAPI } from '../services/api.js'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const users = ref([])
const stats = ref({})
const isLoading = ref(false)
const showCreateModal = ref(false)

const createForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await userAPI.getUsers()
    users.value = response.data.users
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await userAPI.getUserStats()
    stats.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 创建用户
const handleCreateUser = async () => {
  isLoading.value = true
  
  try {
    await userAPI.createUser(createForm)
    showCreateModal.value = false
    
    // 重置表单
    Object.assign(createForm, {
      username: '',
      email: '',
      password: '',
      role: 'user'
    })
    
    // 刷新用户列表
    await fetchUsers()
    await fetchStats()
  } catch (error) {
    console.error('创建用户失败:', error)
    alert(error.response?.data?.error || '创建用户失败')
  } finally {
    isLoading.value = false
  }
}

// 编辑用户
const editUser = (user) => {
  // TODO: 实现编辑用户功能
  console.log('编辑用户:', user)
}

// 重置密码
const resetPassword = async (user) => {
  const newPassword = prompt('请输入新密码（至少6位）:')
  if (!newPassword || newPassword.length < 6) {
    alert('密码长度至少6位')
    return
  }
  
  try {
    await userAPI.resetUserPassword(user.id, { newPassword })
    alert('密码重置成功')
  } catch (error) {
    console.error('重置密码失败:', error)
    alert(error.response?.data?.error || '重置密码失败')
  }
}

// 删除用户
const deleteUser = async (user) => {
  if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复。`)) {
    return
  }
  
  try {
    await userAPI.deleteUser(user.id)
    await fetchUsers()
    await fetchStats()
  } catch (error) {
    console.error('删除用户失败:', error)
    alert(error.response?.data?.error || '删除用户失败')
  }
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchUsers()
  fetchStats()
})
</script>