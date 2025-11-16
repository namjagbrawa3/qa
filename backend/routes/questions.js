import express from 'express';
import Question from '../models/Question.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { uploadMedia, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// 获取所有题目
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, search } = req.query;
    
    let questions;
    if (search) {
      questions = await Question.search(search, type, parseInt(limit), parseInt(offset));
    } else {
      questions = await Question.findAll(parseInt(limit), parseInt(offset));
      if (type) {
        questions = questions.filter(q => q.type === type);
      }
    }
    
    res.json({
      questions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: '获取题目列表失败' });
  }
});

// 获取题目统计信息
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Question.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({ error: '获取题目统计失败' });
  }
});

// 获取特定题目
router.get('/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ error: '题目不存在' });
    }
    
    res.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: '获取题目失败' });
  }
});

// 创建题目（仅管理员）
router.post('/', authenticateToken, requireAdmin, uploadMedia, handleUploadError, async (req, res) => {
  try {
    const { type, question, options, correctAnswer, score = 10 } = req.body;
    
    // 验证输入
    if (!type || !question || !options || correctAnswer === undefined) {
      return res.status(400).json({ error: '题目类型、题目内容、选项和正确答案都是必填项' });
    }
    
    // 解析选项和正确答案
    let parsedOptions, parsedCorrectAnswer;
    try {
      parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      parsedCorrectAnswer = typeof correctAnswer === 'string' ? JSON.parse(correctAnswer) : correctAnswer;
    } catch (e) {
      return res.status(400).json({ error: '选项或正确答案格式错误' });
    }
    
    // 验证题目类型和答案格式
    if (type === 'single' && typeof parsedCorrectAnswer !== 'number') {
      return res.status(400).json({ error: '单选题的正确答案应该是数字索引' });
    }
    
    if (type === 'multiple' && !Array.isArray(parsedCorrectAnswer)) {
      return res.status(400).json({ error: '多选题的正确答案应该是数组' });
    }
    
    // 处理上传的文件
    let imageUrl = null, audioUrl = null, videoUrl = null;
    
    if (req.files) {
      if (req.files.image) {
        imageUrl = `/uploads/images/${req.files.image[0].filename}`;
      }
      if (req.files.audio) {
        audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
      }
      if (req.files.video) {
        videoUrl = `/uploads/video/${req.files.video[0].filename}`;
      }
    }
    
    const questionId = await Question.create({
      type,
      question,
      options: parsedOptions,
      correctAnswer: parsedCorrectAnswer,
      score: parseInt(score),
      imageUrl,
      audioUrl,
      videoUrl,
      createdBy: req.user.id
    });
    
    const newQuestion = await Question.findById(questionId);
    
    res.status(201).json({
      message: '题目创建成功',
      question: newQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: '创建题目失败' });
  }
});

// 更新题目（仅管理员）
router.put('/:questionId', authenticateToken, requireAdmin, uploadMedia, handleUploadError, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { type, question, options, correctAnswer, score } = req.body;
    
    const updates = {};
    
    if (type) updates.type = type;
    if (question) updates.question = question;
    if (score) updates.score = parseInt(score);
    
    if (options) {
      try {
        updates.options = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (e) {
        return res.status(400).json({ error: '选项格式错误' });
      }
    }
    
    if (correctAnswer !== undefined) {
      try {
        updates.correctAnswer = typeof correctAnswer === 'string' ? JSON.parse(correctAnswer) : correctAnswer;
      } catch (e) {
        return res.status(400).json({ error: '正确答案格式错误' });
      }
    }
    
    // 处理上传的文件
    if (req.files) {
      if (req.files.image) {
        updates.image_url = `/uploads/images/${req.files.image[0].filename}`;
      }
      if (req.files.audio) {
        updates.audio_url = `/uploads/audio/${req.files.audio[0].filename}`;
      }
      if (req.files.video) {
        updates.video_url = `/uploads/video/${req.files.video[0].filename}`;
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }
    
    const success = await Question.updateById(questionId, updates);
    if (!success) {
      return res.status(404).json({ error: '题目不存在' });
    }
    
    const updatedQuestion = await Question.findById(questionId);
    
    res.json({
      message: '题目更新成功',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: '更新题目失败' });
  }
});

// 删除题目（仅管理员）
router.delete('/:questionId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const success = await Question.deleteById(questionId);
    if (!success) {
      return res.status(404).json({ error: '题目不存在' });
    }
    
    res.json({ message: '题目删除成功' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: '删除题目失败' });
  }
});

// 批量删除题目（仅管理员）
router.delete('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { questionIds } = req.body;
    
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: '请提供要删除的题目ID列表' });
    }
    
    let deletedCount = 0;
    for (const questionId of questionIds) {
      const success = await Question.deleteById(questionId);
      if (success) deletedCount++;
    }
    
    res.json({
      message: `成功删除 ${deletedCount} 道题目`,
      deletedCount
    });
  } catch (error) {
    console.error('Batch delete questions error:', error);
    res.status(500).json({ error: '批量删除题目失败' });
  }
});

export default router;