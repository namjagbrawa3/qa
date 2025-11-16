# 在线答题考试系统

一个功能完整的在线答题考试系统，支持题库管理、试卷创建、在线考试、用户管理和统计分析。

## 功能特性

### 🎯 核心功能
- **题库管理**: 支持单选题、多选题，可添加图片、音频、视频等多媒体内容
- **试卷管理**: 灵活的试卷创建，支持加分制和减分制两种计分模式
- **在线考试**: 实时倒计时、自动提交、防作弊机制
- **用户管理**: 管理员和普通用户角色分离，完整的权限控制
- **统计分析**: 详细的考试数据统计和用户表现分析

### 🔐 用户系统
- **管理员功能**:
  - 题目的增删改查
  - 试卷的创建和管理
  - 用户管理和权限控制
  - 考试数据统计和分析
  - 系统概览和监控

- **普通用户功能**:
  - 参加在线考试
  - 查看考试历史和成绩
  - 个人统计数据查看
  - 每份试卷只能参加一次

### 🎨 界面特性
- **响应式设计**: 完美支持桌面端和移动端
- **现代化UI**: 基于Tailwind CSS的美观界面
- **移动端优化**: 专门的移动端导航和交互
- **动画效果**: 流畅的过渡动画和交互反馈

### 🔧 技术特性
- **前端**: Vue 3 + Vite + Tailwind CSS + Pinia
- **后端**: Node.js + Express.js + SQLite
- **认证**: JWT Token认证
- **文件上传**: 支持多媒体文件上传和管理
- **API设计**: RESTful API设计

## 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd qa
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动后端服务**
   ```bash
   # 在项目根目录下
   node backend/server.js
   ```
   后端服务将在 http://localhost:3001 启动

4. **启动前端服务**
   ```bash
   # 在另一个终端窗口
   npm run dev
   ```
   前端服务将在 http://localhost:5173 启动

### 默认账户

系统会自动创建默认管理员账户：
- **用户名**: admin
- **密码**: admin123
- **角色**: 管理员

## 使用指南

### 管理员操作

1. **登录系统**
   - 使用默认管理员账户登录
   - 或创建新的管理员账户

2. **题库管理**
   - 进入"题库管理"页面
   - 点击"添加题目"创建新题目
   - 支持单选题和多选题
   - 可上传图片、音频、视频文件
   - 设置题目分值和正确答案

3. **试卷管理**
   - 进入"试卷管理"页面
   - 点击"创建试卷"
   - 设置试卷标题、描述、时长
   - 选择计分模式（加分制/减分制）
   - 从题库中选择题目

4. **用户管理**
   - 进入"用户管理"页面
   - 查看所有注册用户
   - 管理用户权限
   - 查看用户考试记录

5. **数据统计**
   - 在仪表板查看系统概览
   - 查看用户注册趋势
   - 分析考试数据和成绩分布

### 普通用户操作

1. **注册账户**
   - 在登录页面点击"注册"
   - 填写用户名、邮箱和密码
   - 完成注册后自动登录

2. **参加考试**
   - 在考试中心查看可参加的考试
   - 点击"开始考试"进入考试页面
   - 仔细阅读考试说明
   - 在规定时间内完成答题
   - 提交试卷查看成绩

3. **查看记录**
   - 在仪表板查看个人统计
   - 查看历史考试记录
   - 分析个人表现趋势

## 系统架构

### 前端架构
```
src/
├── components/          # 通用组件
│   ├── LoadingSpinner.vue
│   ├── EmptyState.vue
│   ├── MessageToast.vue
│   └── MobileNav.vue
├── views/              # 页面组件
│   ├── Dashboard.vue
│   ├── Login.vue
│   ├── Register.vue
│   ├── QuestionBank.vue
│   ├── ExamManagement.vue
│   ├── TakeExam.vue
│   └── UserManagement.vue
├── stores/             # 状态管理
│   ├── auth.js
│   └── exam.js
├── services/           # API服务
│   └── api.js
├── router/             # 路由配置
│   └── index.js
└── assets/             # 静态资源
    └── css/
        └── custom.css
```

### 后端架构
```
backend/
├── server.js           # 服务器入口
├── models/             # 数据模型
│   ├── User.js
│   ├── Question.js
│   ├── Exam.js
│   └── ExamRecord.js
├── routes/             # API路由
│   ├── auth.js
│   ├── users.js
│   ├── questions.js
│   ├── exams.js
│   └── stats.js
├── middleware/         # 中间件
│   └── auth.js
├── uploads/            # 文件上传目录
└── database.db         # SQLite数据库
```

### 数据库设计
- **users**: 用户信息表
- **questions**: 题目信息表
- **exams**: 试卷信息表
- **exam_questions**: 试卷题目关联表
- **exam_records**: 考试记录表

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 题目管理
- `GET /api/questions` - 获取题目列表
- `POST /api/questions` - 创建题目
- `PUT /api/questions/:id` - 更新题目
- `DELETE /api/questions/:id` - 删除题目

### 试卷管理
- `GET /api/exams` - 获取试卷列表
- `POST /api/exams` - 创建试卷
- `GET /api/exams/:id` - 获取试卷详情
- `PUT /api/exams/:id` - 更新试卷
- `DELETE /api/exams/:id` - 删除试卷

### 考试相关
- `POST /api/exams/:id/start` - 开始考试
- `POST /api/exams/:id/submit` - 提交答案

### 用户管理
- `GET /api/users` - 获取用户列表（管理员）
- `PUT /api/users/:id` - 更新用户信息（管理员）
- `DELETE /api/users/:id` - 删除用户（管理员）

### 统计数据
- `GET /api/stats/overview` - 系统概览统计（管理员）
- `GET /api/stats/user-performance` - 用户表现统计

## 部署说明

### 开发环境
1. 按照"快速开始"部分的步骤启动开发服务器
2. 前端开发服务器支持热重载
3. 后端修改需要手动重启服务

### 生产环境
1. **构建前端**
   ```bash
   npm run build
   ```

2. **配置环境变量**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-secret-key
   export PORT=3001
   ```

3. **启动生产服务器**
   ```bash
   node backend/server.js
   ```

4. **使用进程管理器**
   ```bash
   # 使用PM2
   npm install -g pm2
   pm2 start backend/server.js --name "qa-backend"
   ```

## 常见问题

### Q: 忘记管理员密码怎么办？
A: 可以直接修改数据库中的用户密码，或删除数据库文件重新初始化系统。

### Q: 如何备份数据？
A: 备份 `backend/database.db` 文件和 `backend/uploads/` 目录即可。

### Q: 支持哪些文件格式？
A: 
- 图片：jpg, jpeg, png, gif, webp
- 音频：mp3, wav, ogg, m4a
- 视频：mp4, webm, ogg

### Q: 如何修改默认端口？
A: 修改 `backend/server.js` 中的端口配置，或设置环境变量 `PORT`。

### Q: 移动端体验如何？
A: 系统专门优化了移动端体验，包括响应式布局、触摸友好的交互和底部导航栏。

## 技术支持

如果您在使用过程中遇到问题，请：
1. 查看本文档的常见问题部分
2. 检查浏览器控制台的错误信息
3. 查看后端服务器的日志输出
4. 提交Issue到项目仓库

## 许可证

本项目采用 MIT 许可证，详情请查看 LICENSE 文件。

## 更新日志

### v1.0.0 (2024-11-16)
- 🎉 初始版本发布
- ✨ 完整的题库管理功能
- ✨ 试卷创建和管理
- ✨ 在线考试系统
- ✨ 用户认证和权限管理
- ✨ 多媒体内容支持
- ✨ 响应式设计和移动端优化
- ✨ 统计分析功能
- 🔧 完整的API文档
- 📱 移动端友好界面

---

感谢使用在线答题考试系统！如有任何建议或问题，欢迎反馈。