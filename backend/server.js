import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './models/database.js';

// 路由导入
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import questionRoutes from './routes/questions.js';
import examRoutes from './routes/exams.js';
import statsRoutes from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://work-1-cnhschjrqyafowac.prod-runtime.all-hands.dev', 'https://work-2-cnhschjrqyafowac.prod-runtime.all-hands.dev'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/stats', statsRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '在线答题考试系统后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    console.log('数据库初始化完成');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`API地址: http://localhost:${PORT}/api`);
      console.log(`健康检查: http://localhost:${PORT}/api/health`);
      console.log('默认管理员账户: admin / password');
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();