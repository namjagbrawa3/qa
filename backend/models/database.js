import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database.db');

// 创建数据库连接
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

console.log('Connected to SQLite database');

// 初始化数据库表
const initDatabase = () => {
  try {
    // 用户表
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 题目表
    db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('single', 'multiple')),
        question TEXT NOT NULL,
        options TEXT NOT NULL, -- JSON格式存储选项
        correct_answer TEXT NOT NULL, -- JSON格式存储正确答案
        score INTEGER DEFAULT 10,
        image_url TEXT,
        audio_url TEXT,
        video_url TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // 试卷表
    db.exec(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER DEFAULT 60, -- 考试时长（分钟）
        scoring_mode TEXT DEFAULT 'add' CHECK(scoring_mode IN ('add', 'subtract')),
        total_score INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // 试卷题目关联表
    db.exec(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        question_order INTEGER DEFAULT 0,
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
        UNIQUE(exam_id, question_id)
      )
    `);

    // 考试记录表
    db.exec(`
      CREATE TABLE IF NOT EXISTS exam_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        answers TEXT NOT NULL, -- JSON格式存储答案
        total_score INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        scoring_mode TEXT DEFAULT 'add',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        submitted_at DATETIME,
        duration_seconds INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (exam_id) REFERENCES exams (id),
        UNIQUE(user_id, exam_id) -- 确保每个用户每个试卷只能做一次
      )
    `);

    // 创建默认管理员账户
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users (username, email, password, role) 
      VALUES (?, ?, ?, ?)
    `);
    
    // 密码: password
    stmt.run('admin', 'admin@example.com', '$2a$10$Ytz63pqyeAWrfXs/fecwbuyqoxKHtJVELu7x3cV6swJzr1HbFR7uq', 'admin');
    
    console.log('Database initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return Promise.reject(error);
  }
};

// 数据库操作辅助函数 - better-sqlite3 是同步的，但我们保持异步API兼容性
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.prepare(sql).get(params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.prepare(sql).all(params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.prepare(sql).run(params);
      resolve({ id: result.lastInsertRowid, changes: result.changes });
    } catch (err) {
      reject(err);
    }
  });
};

export { db, initDatabase, dbGet, dbAll, dbRun };