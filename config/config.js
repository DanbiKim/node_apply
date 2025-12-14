require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || '115.68.102.13',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'virginkr',
    password: process.env.DB_PASSWORD || 'FZlXG4xLb5',
    database: process.env.DB_NAME || 'virginkr',
    connectionLimit: 10
  },
  encryption: {
    key: process.env.ENCRYPT_KEY || 'default-encryption-key-change-in-production'
  },
  sms: {
    apiUrl: process.env.SMS_API_URL || 'https://apis.aligo.in/send/',
    userId: process.env.SMS_USER_ID || '',
    apiKey: process.env.SMS_API_KEY || '',
    sender: process.env.SMS_SENDER || '010-3924-4997'
  },
  upload: {
    idPath: '/uploads/id',
    jobPath: '/uploads/job',
    userPath: '/uploads/user',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg']
  }
};

