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

## 3. 인증 완료 여부 확인

```bash
curl -X POST http://152.67.200.121:2070/api/auth/is-verified \
  -H "Content-Type: application/json" \
  -d '{"phone":"010-2577-3237","verifyToken":"인증시 받은 토큰"}'
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| phone | String | O | 인증한 번호 |
| verifyToken | String | O | verify-code 성공 시 받은 토큰 |

응답:
```json
{ "success": true, "verified": true }
{ "success": true, "verified": false }
```

---

## 참고

- 인증번호: 4자리, **3분 만료**
- production 모드: 실제 SMS 발송 (건당 ~8.5원)
- PM2 프로세스명: `sms-auth-module`
- 인증 데이터는 **인메모리** 저장 (PM2 restart 시 초기화됨)

---

## 주의사항

- **이 모듈은 여러 프로젝트에서 공유 사용 중** — 모듈 코드를 직접 수정하면 모든 프로젝트에 즉시 영향
- **모듈 코드를 수정하지 말 것** — 필요한 기능은 이 문서의 API만 호출하여 사용
- **PM2 restart 시 진행 중인 인증 세션 소멸** — 발송된 인증번호, verifyToken이 모두 초기화됨
- **PM2 재등록 시 반드시 Node v22 인터프리터 지정** — 시스템 기본 Node는 v12이므로, `--interpreter /home/ubuntu/.nvm/versions/node/v22.18.0/bin/node` 옵션 필수 (미지정 시 `crypto.randomUUID()` 에러로 verify-code 500 발생)
- 프론트엔드에서 직접 호출 불가 (CORS) — 반드시 백엔드 서버를 통해 프록시 호출할 것

---

## PM2 등록/재등록 방법

PM2 delete 후 재등록 시 **반드시 아래 3가지를 모두 명시**해야 정상 작동합니다.

```bash
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v22.18.0/bin

pm2 delete sms-auth-module

pm2 start '/home/ubuntu/02_function-module_ora/07-mudule-sms-auth&message/test-server.js' \
  --name sms-auth-module \
  --interpreter /home/ubuntu/.nvm/versions/node/v22.18.0/bin/node \
  --cwd '/home/ubuntu/02_function-module_ora/07-mudule-sms-auth&message'

pm2 save
```

| 옵션 | 필수 | 누락 시 문제 |
|------|------|-------------|
| `--interpreter` | O | 시스템 기본 Node v12로 실행 → `crypto.randomUUID()` 에러 |
| `--cwd` | O | `.env` 파일 못 찾음 → 알리고 API 인증 실패 + development 모드 |
| `pm2 save` | O | 서버 재부팅 시 설정 복원 안 됨 |

등록 후 확인:

```bash
pm2 describe sms-auth-module | grep 'exec cwd\|node.js version\|interpreter'
```

정상 상태:
- `interpreter`: `/home/ubuntu/.nvm/versions/node/v22.18.0/bin/node`
- `exec cwd`: `/home/ubuntu/02_function-module_ora/07-mudule-sms-auth&message`
- `node.js version`: `22.18.0`
