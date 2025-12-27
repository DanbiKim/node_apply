const express = require('express');
const axios = require('axios');
const router = express.Router();
const applyRoutes = require('./apply');

// 가입 관련 API
router.use('/apply', applyRoutes);

// Kakao 주소 검색 API
router.get('/kakao-address', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: '검색어가 필요합니다' });
        }

        const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
            headers: { 
                'Authorization': 'KakaoAK 99f16702bdf9695590e5151b3b87c8ed'
            },
            params: { query }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Kakao API 오류:', error.message);
        res.status(500).json({ error: 'API 호출 실패' });
    }
});

module.exports = router;

