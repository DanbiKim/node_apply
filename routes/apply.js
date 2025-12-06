const express = require('express');
const router = express.Router();
const applyController = require('../controllers/applyController');
const { validatePhone, validateRegister } = require('../middleware/validation');
const { uploadMultipleImages } = require('../middleware/fileUpload');

// 전화번호 중복 체크
router.post('/check-phone', validatePhone, applyController.checkPhone);

// 가입 정보 저장
router.post('/register', uploadMultipleImages, validateRegister, applyController.register);

// 매력/성격 리스트 조회
router.get('/charm-list', applyController.getCharmList);

// 얼굴 타입 리스트 조회
router.get('/face-list', applyController.getFaceList);

module.exports = router;

