import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/me'),
  
  // 更新用户信息
  updateProfile: (userData) => api.put('/auth/me', userData),
  
  // 修改密码
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData)
};

// 用户管理API（管理员）
export const userAPI = {
  // 获取所有用户
  getUsers: (params = {}) => api.get('/users', { params }),
  
  // 获取用户统计
  getUserStats: () => api.get('/users/stats'),
  
  // 获取特定用户信息
  getUser: (userId) => api.get(`/users/${userId}`),
  
  // 获取用户考试记录
  getUserExamRecords: (userId, params = {}) => api.get(`/users/${userId}/exam-records`, { params }),
  
  // 获取用户考试记录详情
  getUserExamRecordDetail: (userId, recordId) => api.get(`/users/${userId}/exam-records/${recordId}`),
  
  // 创建用户
  createUser: (userData) => api.post('/users', userData),
  
  // 更新用户信息
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  
  // 删除用户
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  // 重置用户密码
  resetUserPassword: (userId, passwordData) => api.put(`/users/${userId}/reset-password`, passwordData)
};

// 题目管理API
export const questionAPI = {
  // 获取所有题目
  getQuestions: (params = {}) => api.get('/questions', { params }),
  
  // 获取题目统计
  getQuestionStats: () => api.get('/questions/stats'),
  
  // 获取特定题目
  getQuestion: (questionId) => api.get(`/questions/${questionId}`),
  
  // 创建题目（支持文件上传）
  createQuestion: (questionData) => {
    const formData = new FormData();
    
    // 添加基本字段
    Object.keys(questionData).forEach(key => {
      if (key !== 'image' && key !== 'audio' && key !== 'video') {
        if (typeof questionData[key] === 'object') {
          formData.append(key, JSON.stringify(questionData[key]));
        } else {
          formData.append(key, questionData[key]);
        }
      }
    });
    
    // 添加文件
    if (questionData.image) formData.append('image', questionData.image);
    if (questionData.audio) formData.append('audio', questionData.audio);
    if (questionData.video) formData.append('video', questionData.video);
    
    return api.post('/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 更新题目
  updateQuestion: (questionId, questionData) => {
    const formData = new FormData();
    
    Object.keys(questionData).forEach(key => {
      if (key !== 'image' && key !== 'audio' && key !== 'video') {
        if (typeof questionData[key] === 'object') {
          formData.append(key, JSON.stringify(questionData[key]));
        } else {
          formData.append(key, questionData[key]);
        }
      }
    });
    
    if (questionData.image) formData.append('image', questionData.image);
    if (questionData.audio) formData.append('audio', questionData.audio);
    if (questionData.video) formData.append('video', questionData.video);
    
    return api.put(`/questions/${questionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 删除题目
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),
  
  // 批量删除题目
  batchDeleteQuestions: (questionIds) => api.delete('/questions', { data: { questionIds } })
};

// 试卷管理API
export const examAPI = {
  // 获取所有试卷
  getExams: (params = {}) => api.get('/exams', { params }),
  
  // 获取试卷统计
  getExamStats: () => api.get('/exams/stats'),
  
  // 获取特定试卷
  getExam: (examId) => api.get(`/exams/${examId}`),
  
  // 获取试卷结果
  getExamResults: (examId, params = {}) => api.get(`/exams/${examId}/results`, { params }),
  
  // 创建试卷
  createExam: (examData) => api.post('/exams', examData),
  
  // 更新试卷
  updateExam: (examId, examData) => api.put(`/exams/${examId}`, examData),
  
  // 删除试卷
  deleteExam: (examId) => api.delete(`/exams/${examId}`),
  
  // 切换试卷激活状态
  toggleExamActive: (examId) => api.patch(`/exams/${examId}/toggle-active`),
  
  // 开始考试
  startExam: (examId) => api.post(`/exams/${examId}/start`),
  
  // 提交考试
  submitExam: (examId, submissionData) => api.post(`/exams/${examId}/submit`, submissionData)
};

// 统计API
export const statsAPI = {
  // 获取系统总体统计
  getOverviewStats: () => api.get('/stats/overview'),
  
  // 获取用户考试统计
  getUserPerformance: (params = {}) => api.get('/stats/user-performance', { params }),
  
  // 获取试卷统计
  getExamPerformance: (params = {}) => api.get('/stats/exam-performance', { params }),
  
  // 获取题目分析
  getQuestionAnalysis: (params = {}) => api.get('/stats/question-analysis', { params })
};

// 健康检查
export const healthCheck = () => api.get('/health');

export default api;