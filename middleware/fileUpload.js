const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 업로드 디렉토리 생성
const uploadDirs = [
  path.join(__dirname, '..', 'public', 'uploads', 'id'),
  path.join(__dirname, '..', 'public', 'uploads', 'job'),
  path.join(__dirname, '..', 'public', 'uploads', 'user')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'user');
    
    if (file.fieldname === 'id_img') {
      uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'id');
    } else if (file.fieldname === 'job_img') {
      uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'job');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 파일 필터
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용되지 않는 파일 형식입니다. (JPEG, PNG만 가능)'), false);
  }
};

// Multer 설정
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: fileFilter
});

// 여러 이미지 업로드 (img_1 ~ img_9)
const uploadMultipleImages = upload.fields([
  { name: 'id_img', maxCount: 1 },
  { name: 'job_img', maxCount: 1 },
  { name: 'img_1', maxCount: 1 },
  { name: 'img_2', maxCount: 1 },
  { name: 'img_3', maxCount: 1 },
  { name: 'img_4', maxCount: 1 },
  { name: 'img_5', maxCount: 1 },
  { name: 'img_6', maxCount: 1 },
  { name: 'img_7', maxCount: 1 },
  { name: 'img_8', maxCount: 1 },
  { name: 'img_9', maxCount: 1 }
]);

module.exports = {
  uploadMultipleImages,
  upload
};

