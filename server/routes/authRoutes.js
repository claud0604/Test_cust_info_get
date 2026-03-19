const express = require('express');
const router = express.Router();
const { sendCode, verifyCodeHandler } = require('../controllers/authController');

router.post('/send-code', sendCode);
router.post('/verify-code', verifyCodeHandler);

module.exports = router;
