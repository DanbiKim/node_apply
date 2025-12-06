const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const { testConnection } = require('./utils/db');
const apiRoutes = require('./routes/api');

const app = express();

// 보안 미들웨어 - CSP 설정 완화 (inline script 및 이벤트 핸들러 허용)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"], // 인라인 이벤트 핸들러 허용 (onclick 등)
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS 설정
app.use(cors());

// Body 파서
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙
app.use('/apply/web', express.static(path.join(__dirname, 'public', 'apply', 'web')));
app.use('/web', express.static(path.join(__dirname, 'public', 'apply', 'web'))); // 추가 경로 지원
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API 라우트
app.use('/api', apiRoutes);

// apply 폴더의 HTML 파일들 서빙 (register.html 제외)
app.get('/apply/:filename', (req, res) => {
  const filename = req.params.filename;
  if (filename === 'register.html' || filename === 'register') {
    // register.html은 아래에서 처리
    return res.status(404).send('Not found');
  }
  if (filename.endsWith('.html')) {
    const filePath = path.join(__dirname, 'public', 'apply', filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(404).send('File not found');
      }
    });
  } else {
    res.status(404).send('Not found');
  }
});

// 가입 페이지 서빙 (마지막에 배치하여 다른 라우트와 충돌 방지)
app.get('/apply', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'apply', 'register.html'));
});

// 기존 홈 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ message: '요청하신 페이지를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.'
  });
});

// 서버 시작
async function startServer() {
  // DB 연결 테스트
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('⚠️  Database connection failed. Some features may not work.');
  }
  
  app.listen(config.port, () => {
    console.log(`🚀 Server listening on http://localhost:${config.port}`);
    console.log(`📝 Apply page: http://localhost:${config.port}/apply`);
    console.log(`🔍 Health check: http://localhost:${config.port}/health`);
  });
}

startServer();

module.exports = app;
