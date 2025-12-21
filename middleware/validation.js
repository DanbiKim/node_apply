const { body, validationResult } = require('express-validator');

// 에러 결과 처리 미들웨어
const handleValidationErrors = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('========== Validation Error (400) ==========');
      console.error('URL:', req.method, req.originalUrl);
      try {
        console.error('요청 Body:', JSON.stringify(req.body, null, 2));
      } catch (e) {
        console.error('요청 Body (직렬화 실패):', req.body);
      }
      console.error('검증 실패 항목:');
      const errorArray = errors.array();
      errorArray.forEach((error, index) => {
        console.error(`  ${index + 1}. 필드: ${error.param}, 메시지: ${error.msg}, 값: ${error.value}`);
      });
      console.error('=============================================');
      return res.status(400).json({
        success: false,
        message: '입력값 검증 실패',
        errors: errorArray
      });
    }
    next();
  } catch (error) {
    console.error('Validation error handler error:', error);
    return res.status(500).json({
      success: false,
      message: '검증 처리 중 오류가 발생했습니다.'
    });
  }
};

// 전화번호 검증 규칙
const validatePhone = [
  body('user_tel')
    .notEmpty().withMessage('전화번호를 입력해주세요.'),
    // .matches(/^[0-9]{10,11}$/).withMessage('전화번호 형식이 올바르지 않습니다.'),
  handleValidationErrors
];

// 가입 정보 검증 규칙
const validateRegister = [
  body('user_name')
    .notEmpty().withMessage('이름을 입력해주세요.')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('이름은 2자 이상 50자 이하여야 합니다.'),
  body('user_tel')
    .notEmpty().withMessage('전화번호를 입력해주세요.'),
    // .matches(/^[0-9]{10,11}$/).withMessage('전화번호 형식이 올바르지 않습니다.'),
  body('birth_y')
    .optional()
    .isInt({ min: 1970, max: 2010 }).withMessage('올바른 연도를 입력해주세요.'),
  body('gender')
    .isIn(['M', 'F']).withMessage('성별을 선택해주세요.'),
  handleValidationErrors
];

module.exports = {
  validatePhone,
  validateRegister,
  handleValidationErrors
};

