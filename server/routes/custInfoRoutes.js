const express = require('express');
const router = express.Router();
const { uploadCustomerImages } = require('../middleware/upload');
const { createCustomerInfo, getCustomerInfo } = require('../controllers/custInfoController');

/**
 * POST /api/customer-info
 * 고객 정보 저장 (이미지 포함)
 */
router.post('/', uploadCustomerImages, createCustomerInfo);

/**
 * GET /api/customer-info/:id
 * 고객 정보 조회 (테스트용)
 */
router.get('/:id', getCustomerInfo);

module.exports = router;
