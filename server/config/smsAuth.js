const axios = require('axios');

const SMS_AUTH_URL = process.env.SMS_AUTH_URL || 'http://152.67.200.121:2070';

/**
 * SMS 모듈 API 호출 - 인증번호 발송
 */
const sendCode = async (serviceName, phone) => {
    const response = await axios.post(`${SMS_AUTH_URL}/api/auth/send-code`, {
        serviceName,
        phone,
    });
    return response.data;
};

/**
 * SMS 모듈 API 호출 - 인증번호 확인
 */
const verifyCode = async (phone, code) => {
    const response = await axios.post(`${SMS_AUTH_URL}/api/auth/verify-code`, {
        phone,
        code,
    });
    return response.data;
};

/**
 * SMS 모듈 API 호출 - 인증 완료 여부 확인
 */
const isVerified = async (phone, verifyToken) => {
    const response = await axios.post(`${SMS_AUTH_URL}/api/auth/is-verified`, {
        phone,
        verifyToken,
    });
    return response.data.verified;
};

module.exports = { sendCode, verifyCode, isVerified };
