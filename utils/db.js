const config = require('../config/config');

let mysql = null;
let pool = null;

// mysql2 패키지가 설치되어 있는지 확인
try {
  mysql = require('mysql2/promise');
  
  // Connection pool 생성
  pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: config.db.connectionLimit,
    queueLimit: 0
  });
} catch (error) {
  console.warn('⚠️  mysql2 package not installed. Database features will be disabled.');
  pool = null;
}

// DB 연결 테스트
async function testConnection() {
  if (!pool) {
    console.warn('⚠️  Database not available (mysql2 not installed)');
    return false;
  }
  
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// DB 사용 가능 여부 확인
function isAvailable() {
  return pool !== null;
}

module.exports = {
  pool,
  testConnection,
  isAvailable
};

