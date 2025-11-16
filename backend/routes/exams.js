import express from 'express';
import Exam from '../models/Exam.js';
import ExamRecord from '../models/ExamRecord.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有试卷
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    let exams;
    if (req.user.role === 'admin') {
      exams = await Exam.findAll(parseInt(limit), parseInt(offset));
    } else {
      // 普通用户只能看到激活的试卷
      exams = await Exam.findAll(parseInt(limit), parseInt(offset));
      exams = exams.filter(exam => exam.is_active);
    }
    
    res.json({
      exams,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: '获取试卷列表失败' });
  }
});

// 获取试卷统计信息（仅管理员）
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Exam.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get exam stats error:', error);
    res.status(500).json({ error: '获取试卷统计失败' });
  }
});

// 获取特定试卷
router.get('/:examId', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    // 普通用户只能看到激活的试卷
    if (req.user.role !== 'admin' && !exam.is_active) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    // 检查用户是否已经参加过这个考试
    const hasUserTaken = await Exam.hasUserTaken(req.user.id, examId);
    
    res.json({ 
      exam,
      hasUserTaken
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ error: '获取试卷失败' });
  }
});

// 获取试卷结果（仅管理员）
router.get('/:examId/results', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { examId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const results = await Exam.getExamResults(examId, parseInt(limit), parseInt(offset));
    
    res.json({
      results,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ error: '获取试卷结果失败' });
  }
});

// 创建试卷（仅管理员）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, duration, scoringMode, questions } = req.body;
    
    // 验证输入
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: '试卷标题和题目列表都是必填项' });
    }
    
    const examId = await Exam.create({
      title,
      description: description || '',
      duration: parseInt(duration) || 60,
      scoringMode: scoringMode || 'add',
      questions,
      createdBy: req.user.id
    });
    
    const newExam = await Exam.findById(examId);
    
    res.status(201).json({
      message: '试卷创建成功',
      exam: newExam
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: '创建试卷失败' });
  }
});

// 更新试卷（仅管理员）
router.put('/:examId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { examId } = req.params;
    const { title, description, duration, scoringMode, questions, isActive } = req.body;
    
    const updates = {};
    
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (duration) updates.duration = parseInt(duration);
    if (scoringMode) updates.scoring_mode = scoringMode;
    if (isActive !== undefined) updates.is_active = isActive ? 1 : 0;
    if (questions && Array.isArray(questions)) updates.questions = questions;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }
    
    const success = await Exam.updateById(examId, updates);
    if (!success) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    const updatedExam = await Exam.findById(examId);
    
    res.json({
      message: '试卷更新成功',
      exam: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ error: '更新试卷失败' });
  }
});

// 切换试卷激活状态（仅管理员）
router.patch('/:examId/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { examId } = req.params;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    const newActiveStatus = !exam.is_active;
    const success = await Exam.updateById(examId, { is_active: newActiveStatus ? 1 : 0 });
    
    if (!success) {
      return res.status(500).json({ error: '更新试卷状态失败' });
    }
    
    const updatedExam = await Exam.findById(examId);
    
    res.json({
      message: `试卷已${newActiveStatus ? '激活' : '停用'}`,
      exam: updatedExam
    });
  } catch (error) {
    console.error('Toggle exam active error:', error);
    res.status(500).json({ error: '切换试卷状态失败' });
  }
});

// 删除试卷（仅管理员）
router.delete('/:examId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { examId } = req.params;
    
    const success = await Exam.deleteById(examId);
    if (!success) {
      return res.status(404).json({ error: '试卷不存在或已有考试记录' });
    }
    
    res.json({ message: '试卷删除成功' });
  } catch (error) {
    console.error('Delete exam error:', error);
    if (error.message.includes('已有考试记录')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: '删除试卷失败' });
    }
  }
});

// 开始考试
router.post('/:examId/start', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    
    // 检查试卷是否存在且激活
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    if (!exam.is_active) {
      return res.status(400).json({ error: '试卷未激活' });
    }
    
    // 检查用户是否已经参加过这个考试
    const hasUserTaken = await Exam.hasUserTaken(req.user.id, examId);
    if (hasUserTaken) {
      return res.status(400).json({ error: '您已经参加过这个考试' });
    }
    
    // 创建考试记录
    const recordId = await ExamRecord.create({
      userId: req.user.id,
      examId: parseInt(examId),
      answers: {},
      startedAt: new Date().toISOString()
    });
    
    // 返回试卷信息（不包含正确答案）
    const examForUser = {
      ...exam,
      questions: exam.questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        score: q.score,
        image_url: q.image_url,
        audio_url: q.audio_url,
        video_url: q.video_url
      }))
    };
    
    res.json({
      message: '考试开始',
      recordId,
      exam: examForUser
    });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: '开始考试失败' });
  }
});

// 提交考试
router.post('/:examId/submit', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { recordId, answers } = req.body;
    
    if (!recordId || !answers) {
      return res.status(400).json({ error: '考试记录ID和答案都是必填项' });
    }
    
    // 验证考试记录
    const record = await ExamRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: '考试记录不存在' });
    }
    
    if (record.user_id !== req.user.id) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    if (record.submitted_at) {
      return res.status(400).json({ error: '考试已经提交过了' });
    }
    
    // 获取试卷信息
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    // 提交考试并计算分数
    const result = await ExamRecord.submitExam(recordId, answers, exam);
    
    res.json({
      message: '考试提交成功',
      result
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: '提交考试失败' });
  }
});

export default router;