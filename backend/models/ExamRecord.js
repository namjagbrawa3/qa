import { dbGet, dbAll, dbRun } from './database.js';
import Question from './Question.js';

class ExamRecord {
  static async create(recordData) {
    const {
      userId,
      examId,
      answers,
      startedAt = new Date().toISOString()
    } = recordData;
    
    const result = await dbRun(
      `INSERT INTO exam_records (user_id, exam_id, answers, started_at) 
       VALUES (?, ?, ?, ?)`,
      [userId, examId, JSON.stringify(answers), startedAt]
    );
    
    return result.id;
  }
  
  static async submitExam(recordId, answers, examData) {
    const { questions, scoringMode, totalScore: examTotalScore } = examData;
    
    let totalScore = 0;
    let correctCount = 0;
    const results = [];
    
    // 计算分数
    for (const question of questions) {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      
      if (question.type === 'single') {
        isCorrect = userAnswer === question.correct_answer;
      } else if (question.type === 'multiple') {
        isCorrect = Array.isArray(userAnswer) && 
          userAnswer.length === question.correct_answer.length &&
          userAnswer.every(ans => question.correct_answer.includes(ans));
      }
      
      if (isCorrect) {
        correctCount++;
        if (scoringMode === 'add') {
          totalScore += question.score;
        }
      } else if (scoringMode === 'subtract') {
        totalScore -= question.score;
      }
      
      results.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        score: isCorrect ? question.score : (scoringMode === 'subtract' ? -question.score : 0)
      });
    }
    
    // 减分制确保最低分为0
    if (scoringMode === 'subtract') {
      totalScore = Math.max(0, examTotalScore + totalScore);
    }
    
    const submittedAt = new Date().toISOString();
    
    // 计算考试时长
    const record = await dbGet('SELECT started_at FROM exam_records WHERE id = ?', [recordId]);
    const durationSeconds = Math.floor((new Date(submittedAt) - new Date(record.started_at)) / 1000);
    
    await dbRun(
      `UPDATE exam_records 
       SET answers = ?, total_score = ?, correct_count = ?, total_questions = ?, 
           submitted_at = ?, duration_seconds = ? 
       WHERE id = ?`,
      [
        JSON.stringify(answers),
        totalScore,
        correctCount,
        questions.length,
        submittedAt,
        durationSeconds,
        recordId
      ]
    );
    
    return {
      id: recordId,
      totalScore,
      correctCount,
      totalQuestions: questions.length,
      results,
      submittedAt,
      durationSeconds,
      scoringMode
    };
  }
  
  static async findById(id) {
    const record = await dbGet('SELECT * FROM exam_records WHERE id = ?', [id]);
    if (record && record.answers) {
      record.answers = JSON.parse(record.answers);
    }
    return record;
  }
  
  static async findByUserAndExam(userId, examId) {
    const record = await dbGet(
      'SELECT * FROM exam_records WHERE user_id = ? AND exam_id = ?',
      [userId, examId]
    );
    if (record && record.answers) {
      record.answers = JSON.parse(record.answers);
    }
    return record;
  }
  
  static async findByUser(userId, limit = 50, offset = 0) {
    const records = await dbAll(
      `SELECT er.*, e.title as exam_title, e.total_score as exam_total_score 
       FROM exam_records er 
       JOIN exams e ON er.exam_id = e.id 
       WHERE er.user_id = ? 
       ORDER BY er.submitted_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    return records.map(record => ({
      ...record,
      answers: record.answers ? JSON.parse(record.answers) : {}
    }));
  }
  
  static async findByExam(examId, limit = 50, offset = 0) {
    const records = await dbAll(
      `SELECT er.*, u.username, u.email 
       FROM exam_records er 
       JOIN users u ON er.user_id = u.id 
       WHERE er.exam_id = ? 
       ORDER BY er.total_score DESC, er.submitted_at ASC 
       LIMIT ? OFFSET ?`,
      [examId, limit, offset]
    );
    
    return records.map(record => ({
      ...record,
      answers: record.answers ? JSON.parse(record.answers) : {}
    }));
  }
  
  static async getDetailedResults(recordId) {
    const record = await this.findById(recordId);
    if (!record) return null;
    
    // 获取试卷信息
    const exam = await dbGet('SELECT * FROM exams WHERE id = ?', [record.exam_id]);
    
    // 获取题目详情
    const questions = await dbAll(
      `SELECT q.*, eq.question_order 
       FROM questions q 
       JOIN exam_questions eq ON q.id = eq.question_id 
       WHERE eq.exam_id = ? 
       ORDER BY eq.question_order`,
      [record.exam_id]
    );
    
    const questionDetails = questions.map(question => ({
      ...question,
      options: JSON.parse(question.options),
      correct_answer: JSON.parse(question.correct_answer)
    }));
    
    // 分析答题结果
    const results = [];
    let correctCount = 0;
    
    questionDetails.forEach(question => {
      const userAnswer = record.answers[question.id];
      let isCorrect = false;
      
      if (question.type === 'single') {
        isCorrect = userAnswer === question.correct_answer;
      } else if (question.type === 'multiple') {
        isCorrect = Array.isArray(userAnswer) && 
          userAnswer.length === question.correct_answer.length &&
          userAnswer.every(ans => question.correct_answer.includes(ans));
      }
      
      if (isCorrect) correctCount++;
      
      results.push({
        question,
        userAnswer,
        isCorrect,
        score: isCorrect ? question.score : 0
      });
    });
    
    return {
      record,
      exam,
      results,
      correctCount,
      totalQuestions: questionDetails.length,
      accuracy: Math.round((correctCount / questionDetails.length) * 100)
    };
  }
  
  static async getStats() {
    const totalRecords = await dbGet('SELECT COUNT(*) as count FROM exam_records WHERE submitted_at IS NOT NULL');
    const avgScore = await dbGet('SELECT AVG(total_score) as avg FROM exam_records WHERE submitted_at IS NOT NULL');
    const avgDuration = await dbGet('SELECT AVG(duration_seconds) as avg FROM exam_records WHERE submitted_at IS NOT NULL');
    const topScores = await dbAll(
      `SELECT er.total_score, u.username, e.title as exam_title 
       FROM exam_records er 
       JOIN users u ON er.user_id = u.id 
       JOIN exams e ON er.exam_id = e.id 
       WHERE er.submitted_at IS NOT NULL 
       ORDER BY er.total_score DESC 
       LIMIT 10`
    );
    
    return {
      totalRecords: totalRecords.count,
      avgScore: Math.round(avgScore.avg || 0),
      avgDuration: Math.round(avgDuration.avg || 0),
      topScores
    };
  }
}

export default ExamRecord;