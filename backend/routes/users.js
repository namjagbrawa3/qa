import express from 'express';
import User from '../models/User.js';
import ExamRecord from '../models/ExamRecord.js';
import { authenticateToken, requireAdmin, requireOwnershipOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有用户（仅管理员）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await User.findAll(parseInt(limit), parseInt(offset));
    
    res.json({
      users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取用户统计信息（仅管理员）
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: '获取用户统计失败' });
  }
});

// 获取特定用户信息
router.get('/:userId', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 移除敏感信息
    const { password, ...userInfo } = user;
    
    res.json({ user: userInfo });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 获取用户的考试记录
router.get('/:userId/exam-records', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const records = await ExamRecord.findByUser(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      records,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get user exam records error:', error);
    res.status(500).json({ error: '获取考试记录失败' });
  }
});

// 获取用户考试记录详情
router.get('/:userId/exam-records/:recordId', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const { userId, recordId } = req.params;
    
    const record = await ExamRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: '考试记录不存在' });
    }
    
    // 验证记录属于该用户
    if (record.user_id !== parseInt(userId)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    const detailedResults = await ExamRecord.getDetailedResults(recordId);
    
    res.json(detailedResults);
  } catch (error) {
    console.error('Get exam record details error:', error);
    res.status(500).json({ error: '获取考试记录详情失败' });
  }
});

// 创建用户（仅管理员）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码都是必填项' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }
    
    const userId = await User.create({ username, email, password, role });
    const user = await User.findById(userId);
    
    // 移除敏感信息
    const { password: _, ...userInfo } = user;
    
    res.status(201).json({
      message: '用户创建成功',
      user: userInfo
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 更新用户信息（仅管理员）
router.put('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role } = req.body;
    
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (role) updates.role = role;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }
    
    const success = await User.updateById(userId, updates);
    if (!success) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const updatedUser = await User.findById(userId);
    const { password, ...userInfo } = updatedUser;
    
    res.json({
      message: '用户信息更新成功',
      user: userInfo
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 删除用户（仅管理员）
router.delete('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 检查是否是当前登录的管理员
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: '不能删除自己的账户' });
    }
    
    const success = await User.deleteById(userId);
    if (!success) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 重置用户密码（仅管理员）
router.put('/:userId/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度至少6位' });
    }
    
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const success = await User.updateById(userId, { password: hashedPassword });
    if (!success) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

export default router;