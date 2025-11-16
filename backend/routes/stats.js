import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import ExamRecord from '../models/ExamRecord.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取系统总体统计信息（仅管理员）
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [userStats, questionStats, examStats, recordStats] = await Promise.all([
      User.getStats(),
      Question.getStats(),
      Exam.getStats(),
      ExamRecord.getStats()
    ]);
    
    res.json({
      users: userStats,
      questions: questionStats,
      exams: examStats,
      records: recordStats
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// 获取用户考试统计（用户只能看自己的，管理员可以看所有）
router.get('/user-performance', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    // 权限检查
    let targetUserId = req.user.id;
    if (userId && req.user.role === 'admin') {
      targetUserId = parseInt(userId);
    } else if (userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    
    const records = await ExamRecord.findByUser(targetUserId);
    
    if (records.length === 0) {
      return res.json({
        totalExams: 0,
        avgScore: 0,
        avgAccuracy: 0,
        totalTime: 0,
        recentRecords: []
      });
    }
    
    const completedRecords = records.filter(r => r.submitted_at);
    
    const totalScore = completedRecords.reduce((sum, r) => sum + r.total_score, 0);
    const totalCorrect = completedRecords.reduce((sum, r) => sum + r.correct_count, 0);
    const totalQuestions = completedRecords.reduce((sum, r) => sum + r.total_questions, 0);
    const totalTime = completedRecords.reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
    
    const avgScore = completedRecords.length > 0 ? Math.round(totalScore / completedRecords.length) : 0;
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    res.json({
      totalExams: completedRecords.length,
      avgScore,
      avgAccuracy,
      totalTime,
      recentRecords: completedRecords.slice(0, 5)
    });
  } catch (error) {
    console.error('Get user performance error:', error);
    res.status(500).json({ error: '获取用户统计失败' });
  }
});

// 获取试卷统计信息（仅管理员）
router.get('/exam-performance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { examId } = req.query;
    
    if (!examId) {
      return res.status(400).json({ error: '试卷ID是必填项' });
    }
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    const records = await ExamRecord.findByExam(examId);
    const completedRecords = records.filter(r => r.submitted_at);
    
    if (completedRecords.length === 0) {
      return res.json({
        examTitle: exam.title,
        totalParticipants: 0,
        avgScore: 0,
        avgAccuracy: 0,
        avgTime: 0,
        scoreDistribution: [],
        topPerformers: []
      });
    }
    
    const totalScore = completedRecords.reduce((sum, r) => sum + r.total_score, 0);
    const totalCorrect = completedRecords.reduce((sum, r) => sum + r.correct_count, 0);
    const totalQuestions = completedRecords.reduce((sum, r) => sum + r.total_questions, 0);
    const totalTime = completedRecords.reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
    
    const avgScore = Math.round(totalScore / completedRecords.length);
    const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100);
    const avgTime = Math.round(totalTime / completedRecords.length);
    
    // 分数分布
    const scoreRanges = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];
    
    completedRecords.forEach(record => {
      const percentage = Math.round((record.total_score / exam.total_score) * 100);
      if (percentage <= 20) scoreRanges[0].count++;
      else if (percentage <= 40) scoreRanges[1].count++;
      else if (percentage <= 60) scoreRanges[2].count++;
      else if (percentage <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });
    
    // 前10名
    const topPerformers = completedRecords
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 10)
      .map(record => ({
        username: record.username,
        score: record.total_score,
        accuracy: Math.round((record.correct_count / record.total_questions) * 100),
        duration: record.duration_seconds
      }));
    
    res.json({
      examTitle: exam.title,
      totalParticipants: completedRecords.length,
      avgScore,
      avgAccuracy,
      avgTime,
      scoreDistribution: scoreRanges,
      topPerformers
    });
  } catch (error) {
    console.error('Get exam performance error:', error);
    res.status(500).json({ error: '获取试卷统计失败' });
  }
});

// 获取题目统计信息（仅管理员）
router.get('/question-analysis', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { examId } = req.query;
    
    if (!examId) {
      return res.status(400).json({ error: '试卷ID是必填项' });
    }
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: '试卷不存在' });
    }
    
    const records = await ExamRecord.findByExam(examId);
    const completedRecords = records.filter(r => r.submitted_at);
    
    if (completedRecords.length === 0) {
      return res.json({
        examTitle: exam.title,
        questionAnalysis: []
      });
    }
    
    // 分析每道题的答题情况
    const questionAnalysis = exam.questions.map(question => {
      let correctCount = 0;
      let totalAnswered = 0;
      const answerDistribution = {};
      
      // 初始化选项分布
      question.options.forEach((option, index) => {
        answerDistribution[index] = 0;
      });
      
      completedRecords.forEach(record => {
        const userAnswer = record.answers[question.id];
        if (userAnswer !== undefined && userAnswer !== null) {
          totalAnswered++;
          
          // 检查答案是否正确
          let isCorrect = false;
          if (question.type === 'single') {
            isCorrect = userAnswer === question.correct_answer;
            if (answerDistribution[userAnswer] !== undefined) {
              answerDistribution[userAnswer]++;
            }
          } else if (question.type === 'multiple') {
            isCorrect = Array.isArray(userAnswer) && 
              userAnswer.length === question.correct_answer.length &&
              userAnswer.every(ans => question.correct_answer.includes(ans));
            
            // 多选题的分布统计比较复杂，这里简化处理
            if (Array.isArray(userAnswer)) {
              userAnswer.forEach(ans => {
                if (answerDistribution[ans] !== undefined) {
                  answerDistribution[ans]++;
                }
              });
            }
          }
          
          if (isCorrect) correctCount++;
        }
      });
      
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      
      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        options: question.options,
        correctAnswer: question.correct_answer,
        totalAnswered,
        correctCount,
        accuracy,
        answerDistribution
      };
    });
    
    res.json({
      examTitle: exam.title,
      totalParticipants: completedRecords.length,
      questionAnalysis
    });
  } catch (error) {
    console.error('Get question analysis error:', error);
    res.status(500).json({ error: '获取题目分析失败' });
  }
});

export default router;