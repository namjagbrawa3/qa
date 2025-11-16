import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 生成JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 验证JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的访问令牌' });
  }
};

// 验证管理员权限
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// 验证用户权限（用户只能访问自己的数据）
export const requireOwnershipOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.userId || req.body.userId);
  
  if (req.user.role === 'admin' || req.user.id === userId) {
    next();
  } else {
    return res.status(403).json({ error: '权限不足' });
  }
};