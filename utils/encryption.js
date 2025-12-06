const crypto = require('crypto');
const config = require('../config/config');

/**
 * 문자열 암호화
 * @param {string} text - 암호화할 텍스트
 * @param {string} key - 암호화 키 (선택사항)
 * @returns {string} 암호화된 문자열
 */
function encrypt(text, key = config.encryption.key) {
  if (!text) return '';
  
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.substring(0, 32).padEnd(32, '0')), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 문자열 복호화
 * @param {string} encryptedText - 복호화할 텍스트
 * @param {string} key - 암호화 키 (선택사항)
 * @returns {string} 복호화된 문자열
 */
function decrypt(encryptedText, key = config.encryption.key) {
  if (!encryptedText) return '';
  
  try {
    const algorithm = 'aes-256-cbc';
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key.substring(0, 32).padEnd(32, '0')), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

module.exports = {
  encrypt,
  decrypt
};

