const express = require('express');
const router = express.Router();
const { uploadCustomerImages } = require('../middleware/upload');
const { createCustomerInfo, getCustomerInfo, searchCustomerInfo, updateCustomerInfo } = require('../controllers/custInfoController');

/**
 * GET /api/customer-info/search?name=&phone=&verifyToken=
 * 고객 정보 검색 (이름 + 전화번호)
 */
router.get('/search', searchCustomerInfo);

/**
 * POST /api/customer-info
 * 고객 정보 저장 (이미지 포함)
 */
router.post('/', uploadCustomerImages, createCustomerInfo);

/**
 * PUT /api/customer-info/:id
 * 고객 정보 수정 (이미지 포함)
 */
router.put('/:id', uploadCustomerImages, updateCustomerInfo);

/**
 * GET /api/customer-info/:id
 * 고객 정보 조회 (테스트용)
 */
router.get('/:id', getCustomerInfo);

module.exports = router;
