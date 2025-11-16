const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      const dbPath = path.join(__dirname, '../database.db');
      this.db = new Database(dbPath);
      
      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
      
      this.createTables();
      this.createDefaultAdmin();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  createTables() {
    // 创建用户表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建题目表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        points INTEGER DEFAULT 1,
        image_url TEXT,
        audio_url TEXT,
        video_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建试卷表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        scoring_mode TEXT DEFAULT 'positive',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建试卷题目关联表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    `);

    // 创建考试记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS exam_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        answers TEXT,
        score INTEGER,
        total_score INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
      )
    `);
  }

  createDefaultAdmin() {
    const bcrypt = require('bcrypt');
    
    // 检查是否已存在管理员
    const existingAdmin = this.db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      this.db.prepare(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
      `).run('admin', 'admin@example.com', hashedPassword, 'admin');
      
      console.log('Default admin user created: admin/admin123');
    }
  }

  getDatabase() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new DatabaseManager();