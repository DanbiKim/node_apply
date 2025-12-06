const axios = require('axios');
const config = require('../config/config');

/**
 * SMS 발송
 * @param {string} phoneNumber - 수신자 전화번호
 * @param {string} message - 발송할 메시지
 * @param {string} receiverName - 수신자 이름
 * @param {string} title - 메시지 제목
 * @returns {Promise<Object>} 발송 결과
 */
async function sendSMS(phoneNumber, message, receiverName, title = '신청서 가입') {
  try {
    const smsData = {
      user_id: config.sms.userId,
      key: config.sms.apiKey,
      msg: message,
      receiver: phoneNumber,
      destination: receiverName,
      sender: config.sms.sender,
      title: title,
      testmode_yn: process.env.SMS_TEST_MODE || ''
    };

    const response = await axios.post(config.sms.apiUrl, smsData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      success: response.data.result_code === '1',
      resultCode: response.data.result_code,
      message: response.data.message || 'SMS sent successfully',
      data: response.data
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      resultCode: 'ERROR',
      message: error.message || 'SMS sending failed',
      data: null
    };
  }
}

module.exports = {
  sendSMS
};

