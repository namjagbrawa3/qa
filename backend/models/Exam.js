import { dbGet, dbAll, dbRun } from './database.js';
import Question from './Question.js';

class Exam {
  static async create(examData) {
    const {
      title,
      description = '',
      duration = 60,
      scoringMode = 'add',
      questions = [],
      createdBy
    } = examData;
    
    // 计算总分
    const questionDetails = await Question.findByIds(questions);
    const totalScore = questionDetails.reduce((sum, q) => sum + q.score, 0);
    
    const result = await dbRun(
      `INSERT INTO exams (title, description, duration, scoring_mode, total_score, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, duration, scoringMode, totalScore, createdBy]
    );
    
    const examId = result.id;
    
    // 添加试卷题目关联
    if (questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        await dbRun(
          'INSERT INTO exam_questions (exam_id, question_id, question_order) VALUES (?, ?, ?)',
          [examId, questions[i], i + 1]
        );
      }
    }
    
    return examId;
  }
  
  static async findById(id) {
    const exam = await dbGet('SELECT * FROM exams WHERE id = ?', [id]);
    if (!exam) return null;
    
    // 获取试卷题目
    const questions = await dbAll(
      `SELECT q.*, eq.question_order 
       FROM questions q 
       JOIN exam_questions eq ON q.id = eq.question_id 
       WHERE eq.exam_id = ? 
       ORDER BY eq.question_order`,
      [id]
    );
    
    exam.questions = questions.map(question => ({
      ...question,
      options: JSON.parse(question.options),
      correct_answer: JSON.parse(question.correct_answer)
    }));
    
    return exam;
  }
  
  static async findAll(limit = 50, offset = 0) {
    const exams = await dbAll(
      `SELECT e.*, u.username as creator_name,
       (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as question_count,
       (SELECT COUNT(*) FROM exam_records WHERE exam_id = e.id) as participant_count
       FROM exams e 
       LEFT JOIN users u ON e.created_by = u.id 
       ORDER BY e.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    return exams;
  }
  
  static async findByCreator(creatorId, limit = 50, offset = 0) {
    const exams = await dbAll(
      `SELECT e.*,
       (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as question_count,
       (SELECT COUNT(*) FROM exam_records WHERE exam_id = e.id) as participant_count
       FROM exams e 
       WHERE e.created_by = ? 
       ORDER BY e.created_at DESC 
       LIMIT ? OFFSET ?`,
      [creatorId, limit, offset]
    );
    
    return exams;
  }
  
  static async updateById(id, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'questions' && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0 && !updates.questions) {
      throw new Error('没有要更新的字段');
    }
    
    if (fields.length > 0) {
      values.push(id);
      await dbRun(
        `UPDATE exams SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }
    
    // 更新题目关联
    if (updates.questions) {
      // 删除现有关联
      await dbRun('DELETE FROM exam_questions WHERE exam_id = ?', [id]);
      
      // 添加新关联
      for (let i = 0; i < updates.questions.length; i++) {
        await dbRun(
          'INSERT INTO exam_questions (exam_id, question_id, question_order) VALUES (?, ?, ?)',
          [id, updates.questions[i], i + 1]
        );
      }
      
      // 重新计算总分
      const questionDetails = await Question.findByIds(updates.questions);
      const totalScore = questionDetails.reduce((sum, q) => sum + q.score, 0);
      await dbRun('UPDATE exams SET total_score = ? WHERE id = ?', [totalScore, id]);
    }
    
    return true;
  }
  
  static async deleteById(id) {
    // 检查是否有考试记录
    const recordCount = await dbGet('SELECT COUNT(*) as count FROM exam_records WHERE exam_id = ?', [id]);
    if (recordCount.count > 0) {
      throw new Error('该试卷已有考试记录，无法删除');
    }
    
    const result = await dbRun('DELETE FROM exams WHERE id = ?', [id]);
    return result.changes > 0;
  }
  
  static async getStats() {
    const totalExams = await dbGet('SELECT COUNT(*) as count FROM exams');
    const activeExams = await dbGet('SELECT COUNT(*) as count FROM exams WHERE is_active = 1');
    const totalParticipants = await dbGet('SELECT COUNT(*) as count FROM exam_records');
    const avgScore = await dbGet('SELECT AVG(total_score) as avg FROM exam_records');
    
    return {
      totalExams: totalExams.count,
      activeExams: activeExams.count,
      totalParticipants: totalParticipants.count,
      avgScore: Math.round(avgScore.avg || 0)
    };
  }
  
  static async getExamResults(examId, limit = 50, offset = 0) {
    const results = await dbAll(
      `SELECT er.*, u.username, u.email 
       FROM exam_records er 
       JOIN users u ON er.user_id = u.id 
       WHERE er.exam_id = ? 
       ORDER BY er.total_score DESC, er.submitted_at ASC 
       LIMIT ? OFFSET ?`,
      [examId, limit, offset]
    );
    
    return results.map(result => ({
      ...result,
      answers: JSON.parse(result.answers)
    }));
  }
  
  static async hasUserTaken(userId, examId) {
    const record = await dbGet(
      'SELECT id FROM exam_records WHERE user_id = ? AND exam_id = ?',
      [userId, examId]
    );
    return !!record;
  }
}

export default Exam;