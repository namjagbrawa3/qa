import { dbGet, dbAll, dbRun } from './database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    // 检查用户名和邮箱是否已存在
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser) {
      throw new Error('用户名或邮箱已存在');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await dbRun(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    
    return result.id;
  }
  
  static async findById(id) {
    return await dbGet('SELECT * FROM users WHERE id = ?', [id]);
  }
  
  static async findByUsername(username) {
    return await dbGet('SELECT * FROM users WHERE username = ?', [username]);
  }
  
  static async findByEmail(email) {
    return await dbGet('SELECT * FROM users WHERE email = ?', [email]);
  }
  
  static async findAll(limit = 50, offset = 0) {
    return await dbAll(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }
  
  static async updateById(id, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('没有要更新的字段');
    }
    
    values.push(id);
    
    const result = await dbRun(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return result.changes > 0;
  }
  
  static async deleteById(id) {
    const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }
  
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async getStats() {
    const totalUsers = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalAdmins = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const recentUsers = await dbAll(
      "SELECT id, username, email, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 5"
    );
    
    return {
      totalUsers: totalUsers.count,
      totalAdmins: totalAdmins.count,
      recentUsers
    };
  }
}

export default User;