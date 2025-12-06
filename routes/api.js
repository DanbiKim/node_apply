const express = require('express');
const router = express.Router();
const applyRoutes = require('./apply');

// 가입 관련 API
router.use('/apply', applyRoutes);

module.exports = router;

