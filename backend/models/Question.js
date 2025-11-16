import { dbGet, dbAll, dbRun } from './database.js';

class Question {
  static async create(questionData) {
    const {
      type,
      question,
      options,
      correctAnswer,
      score = 10,
      imageUrl = null,
      audioUrl = null,
      videoUrl = null,
      createdBy
    } = questionData;
    
    const result = await dbRun(
      `INSERT INTO questions (type, question, options, correct_answer, score, image_url, audio_url, video_url, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        question,
        JSON.stringify(options),
        JSON.stringify(correctAnswer),
        score,
        imageUrl,
        audioUrl,
        videoUrl,
        createdBy
      ]
    );
    
    return result.id;
  }
  
  static async findById(id) {
    const question = await dbGet('SELECT * FROM questions WHERE id = ?', [id]);
    if (question) {
      question.options = JSON.parse(question.options);
      question.correct_answer = JSON.parse(question.correct_answer);
    }
    return question;
  }
  
  static async findAll(limit = 50, offset = 0) {
    const questions = await dbAll(
      'SELECT * FROM questions ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    return questions.map(question => ({
      ...question,
      options: JSON.parse(question.options),
      correct_answer: JSON.parse(question.correct_answer)
    }));
  }
  
  static async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    const questions = await dbAll(
      `SELECT * FROM questions WHERE id IN (${placeholders})`,
      ids
    );
    
    return questions.map(question => ({
      ...question,
      options: JSON.parse(question.options),
      correct_answer: JSON.parse(question.correct_answer)
    }));
  }
  
  static async updateById(id, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && updates[key] !== undefined) {
        if (key === 'options' || key === 'correctAnswer') {
          fields.push(`${key === 'correctAnswer' ? 'correct_answer' : key} = ?`);
          values.push(JSON.stringify(updates[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      throw new Error('没有要更新的字段');
    }
    
    values.push(id);
    
    const result = await dbRun(
      `UPDATE questions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return result.changes > 0;
  }
  
  static async deleteById(id) {
    const result = await dbRun('DELETE FROM questions WHERE id = ?', [id]);
    return result.changes > 0;
  }
  
  static async getStats() {
    const totalQuestions = await dbGet('SELECT COUNT(*) as count FROM questions');
    const singleChoiceCount = await dbGet("SELECT COUNT(*) as count FROM questions WHERE type = 'single'");
    const multipleChoiceCount = await dbGet("SELECT COUNT(*) as count FROM questions WHERE type = 'multiple'");
    const withMediaCount = await dbGet(
      'SELECT COUNT(*) as count FROM questions WHERE image_url IS NOT NULL OR audio_url IS NOT NULL OR video_url IS NOT NULL'
    );
    
    return {
      totalQuestions: totalQuestions.count,
      singleChoiceCount: singleChoiceCount.count,
      multipleChoiceCount: multipleChoiceCount.count,
      withMediaCount: withMediaCount.count
    };
  }
  
  static async search(keyword, type = null, limit = 50, offset = 0) {
    let sql = 'SELECT * FROM questions WHERE question LIKE ?';
    let params = [`%${keyword}%`];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const questions = await dbAll(sql, params);
    
    return questions.map(question => ({
      ...question,
      options: JSON.parse(question.options),
      correct_answer: JSON.parse(question.correct_answer)
    }));
  }
}

export default Question;