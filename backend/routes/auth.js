import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码都是必填项' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }
    
    // 创建用户
    const userId = await User.create({ username, email, password, role });
    const user = await User.findById(userId);
    
    // 生成token
    const token = generateToken(user);
    
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必填项' });
    }
    
    // 查找用户
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成token
    const token = generateToken(user);
    
    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const updates = {};
    
    if (email) {
      // 检查邮箱是否已被其他用户使用
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: '邮箱已被使用' });
      }
      updates.email = email;
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }
    
    await User.updateById(req.user.id, updates);
    const updatedUser = await User.findById(req.user.id);
    
    res.json({
      message: '更新成功',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 修改密码
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码都是必填项' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度至少6位' });
    }
    
    const user = await User.findById(req.user.id);
    
    // 验证当前密码
    const isValidPassword = await User.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '当前密码错误' });
    }
    
    // 加密新密码
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.updateById(req.user.id, { password: hashedPassword });
    
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

export default router;