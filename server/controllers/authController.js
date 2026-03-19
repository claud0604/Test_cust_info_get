const smsAuth = require('../config/smsAuth');

/**
 * POST /api/auth/send-code
 * SMS 모듈로 인증번호 발송 요청
 */
const sendCode = async (req, res) => {
    try {
        const { serviceName, phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: '전화번호가 필요합니다.' });
        }

        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: '올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)' });
        }

        const result = await smsAuth.sendCode(serviceName || '본인인증', phone);
        res.json(result);
    } catch (error) {
        console.error('SMS 발송 오류:', error.message);
        res.status(500).json({ success: false, message: 'SMS 모듈 통신 오류가 발생했습니다.' });
    }
};

/**
 * POST /api/auth/verify-code
 * SMS 모듈로 인증번호 확인 요청
 */
const verifyCodeHandler = async (req, res) => {
    try {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({ success: false, message: '전화번호와 인증번호가 필요합니다.' });
        }

        const result = await smsAuth.verifyCode(phone, code);
        res.json(result);
    } catch (error) {
        console.error('인증 확인 오류:', error.message);
        if (error.response && error.response.data) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ success: false, message: 'SMS 모듈 통신 오류가 발생했습니다.' });
    }
};

module.exports = { sendCode, verifyCodeHandler };
