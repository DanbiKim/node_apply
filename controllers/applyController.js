const userModel = require('../models/userModel');
const { sendSMS } = require('../utils/sms');
const config = require('../config/config');

/**
 * 전화번호 중복 체크
 */
async function checkPhone(req, res) {
  try {
    const { user_tel } = req.body;
    
    if (!user_tel) {
      return res.status(400).json({
        success: false,
        message: '전화번호를 입력해주세요.'
      });
    }
    
    // 하이픈 제거
    const cleanPhone = user_tel.replace(/[^0-9]/g, '');
    
    const isDuplicate = await userModel.checkPhoneDuplicate(cleanPhone);
    
    if (isDuplicate) {
      return res.json({
        success: false,
        message: '이미 가입되어 있는 번호입니다. 매니저와 컨택해 주세요.'
      });
    }
    
    res.json({
      success: true,
      message: '확인되었습니다.'
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

/**
 * 가입 정보 저장
 */
async function register(req, res) {
  try {
    const userData = { ...req.body };
    
    // 파일 경로 처리
    const filePaths = {};
    if (req.files) {
      if (req.files.id_img && req.files.id_img[0]) {
        filePaths.id_path = config.upload.idPath + '/' + req.files.id_img[0].filename;
      }
      if (req.files.job_img && req.files.job_img[0]) {
        filePaths.job_path = config.upload.jobPath + '/' + req.files.job_img[0].filename;
      }
      
      // 프로필 이미지 처리 (img_1 ~ img_9)
      for (let i = 1; i <= 9; i++) {
        const fieldName = `img_${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          userData[fieldName] = config.upload.userPath + '/' + req.files[fieldName][0].filename;
        }
      }
    }
    
    // 사용자 정보 저장
    console.log('========== DB 저장 시작 ==========');
    console.log('DB 연결 상태:', require('../utils/db').isAvailable() ? '연결됨' : '연결 안됨');
    console.log('저장할 사용자 데이터 키:', Object.keys(userData).join(', '));
    
    const userId = await userModel.createUser(userData);
    console.log('✅ 사용자 저장 성공, userId:', userId);
    
    // 파일 경로 업데이트
    if (Object.keys(filePaths).length > 0) {
      console.log('파일 경로 업데이트 시작:', filePaths);
      await userModel.updateUser(userId, filePaths);
      console.log('✅ 파일 경로 업데이트 성공');
    }
    
    // SMS 발송
    const phoneNumber = userData.user_tel || req.body.user_tel;
    const userName = userData.user_name || req.body.user_name;
    const smsMessage = `${userName.slice(-2)}님의 팅팅팅 소개팅 신청이 접수되셨습니다. 접수 순서대로 연락 드릴게요!(소요시간 1~2일)`;
    
    const smsResult = await sendSMS(phoneNumber, smsMessage, userName);
    
    // SMS 로그 저장
    await userModel.saveSMSLog({
      user_tel: phoneNumber,
      user_name: userName,
      result_code: smsResult.resultCode || 'ERROR'
    });
    
    res.json({
      success: true,
      message: '저장중입니다. 잠시만 기다려주세요.',
      userId: userId
    });
  } catch (error) {
    console.error('========== Register Error ==========');
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    console.error('에러 전체:', error);
    console.error('=====================================');
    res.status(500).json({
      success: false,
      message: '등록에 실패하였습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * 매력/성격 리스트 조회
 */
async function getCharmList(req, res) {
  try {
    const list = await userModel.getCharmList();
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('Get charm list error:', error);
    res.status(500).json({
      success: false,
      message: '리스트 조회에 실패했습니다.'
    });
  }
}

/**
 * 얼굴 타입 리스트 조회
 */
async function getFaceList(req, res) {
  try {
    const list = await userModel.getFaceList();
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('Get face list error:', error);
    res.status(500).json({
      success: false,
      message: '리스트 조회에 실패했습니다.'
    });
  }
}

module.exports = {
  checkPhone,
  register,
  getCharmList,
  getFaceList
};

