import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(__dirname, '../uploads/images');
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(__dirname, '../uploads/audio');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(__dirname, '../uploads/video');
    } else {
      return cb(new Error('不支持的文件类型'), null);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'audio/mpeg': true,
    'audio/mp3': true,
    'audio/wav': true,
    'audio/ogg': true,
    'audio/m4a': true,
    'video/mp4': true,
    'video/mpeg': true,
    'video/quicktime': true,
    'video/x-msvideo': true,
    'video/webm': true
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB限制
    files: 3 // 最多3个文件（图片、音频、视频各一个）
  }
});

// 处理多种类型的文件上传
export const uploadMedia = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// 错误处理中间件
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制（最大50MB）' });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '文件数量超过限制' });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: '意外的文件字段' });
    }
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};