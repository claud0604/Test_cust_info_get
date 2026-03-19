# 오라클 서버 SMS API 호출 가이드

서버: `152.67.200.121:2070`

---

## 헬스체크

```bash
curl http://152.67.200.121:2070/health
```

응답:
```json
{ "success": true, "message": "SMS Auth Module is running" }
```

---

## 1. 인증번호 발송

```bash
curl -X POST http://152.67.200.121:2070/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"serviceName":"진단 사전정보 입력","phone":"010-2577-3237"}'
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| serviceName | String | X | 서비스명 (기본값: "본인인증") |
| phone | String | O | 수신자 번호 (010-XXXX-XXXX) |

응답:
```json
{ "success": true, "message": "인증번호가 발송되었습니다." }
```

---

## 2. 인증번호 확인

```bash
curl -X POST http://152.67.200.121:2070/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"010-2577-3237","code":"1234"}'
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| phone | String | O | 발송한 번호 |
| code | String | O | 수신한 인증번호 4자리 |

성공:
```json
{ "success": true, "message": "인증이 완료되었습니다.", "verifyToken": "uuid" }
```

실패:
```json
{ "success": false, "message": "인증번호가 일치하지 않습니다." }
{ "success": false, "message": "인증번호가 만료되었습니다. 다시 발송해주세요." }
```

---

## JS 호출 예시 (axios)

```js
const axios = require('axios');
const API = 'http://152.67.200.121:2070';

// 인증번호 발송
const { data } = await axios.post(`${API}/api/auth/send-code`, {
    serviceName: '진단 사전정보 입력',
    phone: '010-2577-3237',
});

// 인증번호 확인
const { data: result } = await axios.post(`${API}/api/auth/verify-code`, {
    phone: '010-2577-3237',
    code: '1234',
});

// verifyToken으로 인증 완료 여부 판단
if (result.success) {
    console.log('인증 토큰:', result.verifyToken);
}
```

---

## 참고

- 인증번호: 4자리, **3분 만료**
- production 모드: 실제 SMS 발송 (건당 ~8.5원)
- PM2 프로세스명: `sms-auth-module`
