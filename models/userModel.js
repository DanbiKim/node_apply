const { pool, isAvailable } = require('../utils/db');
const { encrypt } = require('../utils/encryption');

/**
 * 전화번호 중복 체크
 * @param {string} phoneNumber - 전화번호
 * @returns {Promise<boolean>} 중복 여부
 */
async function checkPhoneDuplicate(phoneNumber) {
  if (!isAvailable()) {
    throw new Error('Database not available');
  }
  
  try {
    const encrypted1 = encrypt(phoneNumber);
    const encrypted2 = encrypt(phoneNumber.replace(/-/g, ''));
    const encrypted3 = encrypt(phoneNumber.replace(/[^0-9]/g, ''));
 
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM user 
       WHERE user_tel IN (?, ?, ?) 
       AND user_type NOT IN ('del')`,
      [encrypted1, encrypted2, encrypted3]
    );
    
    return rows[0].count > 0;
  } catch (error) {
    console.error('Phone duplicate check error:', error);
    throw error;
  }
}

/**
 * 사용자 정보 저장
 * @param {Object} userData - 사용자 데이터
 * @returns {Promise<number>} 생성된 사용자 seq
 */
async function createUser(userData) {
  if (!isAvailable()) {
    console.error('❌ DB 연결 불가: isAvailable() = false');
    throw new Error('Database not available');
  }
  
  try {
    if (!userData.user_name) {
      throw new Error('이름을 입력해주세요.');
    }
    if (!userData.user_tel) {
      throw new Error('번호를 정확히 입력해주세요.');
    }
  
    // 전화번호 암호화
    userData.user_tel = encrypt(userData.user_tel);
  
    // 배열 처리
    ['charm','ideal_charm','ideal_first'].forEach(k => {
      if (Array.isArray(userData[k])) userData[k] = userData[k].join(',');
    });
    ['feel_user','feel_ideal'].forEach(k => {
      if (Array.isArray(userData[k])) userData[k] = userData[k].join('');
    });
  
    // check 처리
    if (userData.checkAll === 'on') {
      userData.check1 = 'on';
      userData.check2 = 'on';
      userData.check3 = 'on';
    }
  
    userData.profile_YN = userData.check1 === 'on' ? 'Y' : userData.profile_YN || 'Y';
    userData.request_YN = userData.check2 === 'on' ? 'Y' : userData.request_YN || 'N';
  
    delete userData.checkAll;
    delete userData.check1;
    delete userData.check2;
    delete userData.check3;
    delete userData.tel_check;
  
    // _필드 제거
    Object.keys(userData).forEach(k => {
      if (k.startsWith('_')) delete userData[k];
    });
  
    // 기본값
    userData.alim_manager = userData.alim_manager || '49';
    userData.alim_manager_name = userData.alim_manager_name || '최승호매니저';
  
    // whitelist 필터
    // Object.keys(userData).forEach(k => {
    //   if (!ALLOWED_FIELDS.has(k)) delete userData[k];
    // });
  
    const fields = Object.keys(userData);
    const values = Object.values(userData);
  
    const sql = `
      INSERT INTO user (${fields.join(', ')})
      VALUES (${fields.map(() => '?').join(', ')})
    `;
  
    const [result] = await pool.execute(sql, values);
    return result.insertId;
  } catch (error) {
    console.error('========== User Creation Error ==========');
    console.error('에러 메시지:', error.message);
    console.error('에러 코드:', error.code);
    console.error('에러 SQL:', error.sql);
    console.error('에러 스택:', error.stack);
    console.error('에러 전체:', error);
    console.error('=========================================');
    throw error;
  }
}

/**
 * 사용자 정보 업데이트 (파일 경로 등)
 * @param {number} userId - 사용자 seq
 * @param {Object} updateData - 업데이트할 데이터
 * @returns {Promise<boolean>} 성공 여부
 */
async function updateUser(userId, updateData) {
  if (!isAvailable()) {
    throw new Error('Database not available');
  }
  
  try {
    const fields = Object.keys(updateData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updateData[field]), userId];
    
    const [result] = await pool.execute(
      `UPDATE user SET ${setClause} WHERE seq = ?`,
      values
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('User update error:', error);
    throw error;
  }
}

/**
 * SMS 발송 로그 저장
 * @param {Object} logData - 로그 데이터
 * @returns {Promise<boolean>} 성공 여부
 */
async function saveSMSLog(logData) {
  if (!isAvailable()) {
    console.warn('Database not available, skipping SMS log save');
    return false;
  }
  
  try {
    const { encrypt } = require('../utils/encryption');
    logData.user_tel = encrypt(logData.user_tel);
    
    const fields = Object.keys(logData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => logData[field]);
    
    // await pool.execute(
    //   `INSERT INTO alimtalk_log (${fields.join(', ')}) VALUES (${placeholders})`,
    //   values
    // );
    
    return true;
  } catch (error) {
    console.error('SMS log save error:', error);
    throw error;
  }
}

/**
 * 매력/성격 리스트 조회
 * @returns {Promise<Array>} 리스트
 */
async function getCharmList() {
  if (!isAvailable()) {
    // DB가 없으면 빈 배열 반환 (나중에 DB 연결 후 실제 데이터 반환)
    return [];
  }
  
  try {
    const [rows] = await pool.execute('SELECT * FROM charm ORDER BY seq');
    return rows;
  } catch (error) {
    console.error('Charm list error:', error);
    throw error;
  }
}

/**
 * 얼굴 타입 리스트 조회
 * @returns {Promise<Array>} 리스트
 */
async function getFaceList() {
  if (!isAvailable()) {
    // DB가 없으면 빈 배열 반환 (나중에 DB 연결 후 실제 데이터 반환)
    return [];
  }
  
  try {
    const [rows] = await pool.execute('SELECT * FROM face ORDER BY seq');
    return rows;
  } catch (error) {
    console.error('Face list error:', error);
    throw error;
  }
}

module.exports = {
  checkPhoneDuplicate,
  createUser,
  updateUser,
  saveSMSLog,
  getCharmList,
  getFaceList
};

