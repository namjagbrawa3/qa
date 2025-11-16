import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '../services/api.js';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isUser = computed(() => user.value?.role === 'user');

  // 初始化 - 从localStorage恢复状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      token.value = savedToken;
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
        clearAuth();
      }
    }
  };

  // 清除认证状态
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    error.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 保存认证状态
  const saveAuth = (userData, tokenData) => {
    user.value = userData;
    token.value = tokenData;
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 用户登录
  const login = async (credentials) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token: tokenData } = response.data;
      
      saveAuth(userData, tokenData);
      
      return { success: true, user: userData };
    } catch (err) {
      error.value = err.response?.data?.error || '登录失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 用户注册
  const register = async (userData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token: tokenData } = response.data;
      
      saveAuth(newUser, tokenData);
      
      return { success: true, user: newUser };
    } catch (err) {
      error.value = err.response?.data?.error || '注册失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 用户登出
  const logout = () => {
    clearAuth();
  };

  // 获取当前用户信息
  const getCurrentUser = async () => {
    if (!token.value) return { success: false, error: '未登录' };
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data.user;
      
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (err) {
      error.value = err.response?.data?.error || '获取用户信息失败';
      if (err.response?.status === 401) {
        clearAuth();
      }
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 更新用户信息
  const updateProfile = async (updateData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.updateProfile(updateData);
      const userData = response.data.user;
      
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (err) {
      error.value = err.response?.data?.error || '更新用户信息失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 修改密码
  const changePassword = async (passwordData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await authAPI.changePassword(passwordData);
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error || '修改密码失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 检查权限
  const hasPermission = (requiredRole) => {
    if (!user.value) return false;
    
    if (requiredRole === 'admin') {
      return user.value.role === 'admin';
    } else if (requiredRole === 'user') {
      return user.value.role === 'user' || user.value.role === 'admin';
    }
    
    return true;
  };

  // 初始化认证状态
  initAuth();

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    isUser,
    
    // 方法
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    hasPermission,
    clearAuth
  };
});