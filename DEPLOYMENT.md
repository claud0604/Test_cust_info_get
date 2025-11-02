# APL COLOR 고객정보 시스템 배포 가이드

## 배포 아키텍처

- **프론트엔드**: Cloudflare Pages
  - URL: https://test-cust-info-get.apls.kr
  - 정적 HTML/CSS/JS 호스팅

- **백엔드 API**: Oracle Cloud VM (Ubuntu)
  - 도메인: http://cust-info-get-test-connect.apls.kr
  - IP 주소: 152.67.200.121
  - 포트: 3010
  - Nginx 리버스 프록시 사용

## DNS 설정 (Cloudflare)

### 현재 DNS 레코드

```
A 레코드 (백엔드 API):
  - Name: cust-info-get-test-connect
  - Type: A
  - IPv4: 152.67.200.121
  - Proxy: Enabled (프록싱됨)
  - 결과: cust-info-get-test-connect.apls.kr

CNAME 레코드 (프론트엔드):
  - Name: cust-info-get-test
  - Type: CNAME
  - Target: test-cust-info-get.apls.kr
  - Proxy: Enabled (프록싱됨)
```

---

## 1. 백엔드 API 서버 배포 (Oracle Cloud VM)

### 1-1. Nginx 설치 및 설정

#### Nginx 설치 (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nginx -y
```

#### Nginx 설정 파일 복사
```bash
# 프로젝트의 nginx.conf를 Nginx sites-available로 복사
sudo cp /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get/nginx.conf /etc/nginx/sites-available/apl-customer

# nginx.conf는 이미 다음과 같이 설정되어 있음:
# - server_name: cust-info-get-test-connect.apls.kr
# - proxy_pass: http://localhost:3010
# - CORS: https://test-cust-info-get.apls.kr
```

#### 심볼릭 링크 생성 및 기본 사이트 비활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/apl-customer /etc/nginx/sites-enabled/

# 기본 Nginx 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default
```

#### Nginx 설정 테스트 및 재시작
```bash
# 설정 파일 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx

# 부팅 시 자동 시작 활성화
sudo systemctl enable nginx
```

---

### 1-2. Node.js 앱 실행 (PM2)

#### PM2로 앱 시작
```bash
cd /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get/server

# PM2로 앱 시작
pm2 start ecosystem.config.js

# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs cust-info-get

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

#### 앱 상태 확인
```bash
# 로컬에서 헬스체크
curl http://localhost:3010/health

# Nginx를 통한 헬스체크
curl http://localhost/health
```

---

### 1-3. 방화벽 설정 (Oracle Cloud & UFW)

#### UFW 방화벽 설정
```bash
# UFW 설치 (이미 설치되어 있을 수 있음)
sudo apt install ufw -y

# HTTP, HTTPS 포트 허용
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH 접속 유지

# UFW 활성화
sudo ufw enable

# 상태 확인
sudo ufw status
```

#### Oracle Cloud 방화벽 설정 (Ingress Rules)

**Oracle Cloud Console에서 설정:**

1. Oracle Cloud Console 로그인
2. **Networking** → **Virtual Cloud Networks** 이동
3. 해당 VCN 선택 → **Security Lists** 클릭
4. Default Security List 선택
5. **Add Ingress Rules** 클릭

**추가할 규칙:**
- **HTTP (포트 80)**
  - Source CIDR: `0.0.0.0/0`
  - IP Protocol: `TCP`
  - Destination Port Range: `80`

- **HTTPS (포트 443)**
  - Source CIDR: `0.0.0.0/0`
  - IP Protocol: `TCP`
  - Destination Port Range: `443`

---

## 2. Cloudflare 설정

### 2-1. SSL/TLS 설정

**SSL/TLS 탭에서:**

1. **Overview** → **SSL/TLS encryption mode** 선택:
   - **Flexible** (추천): Cloudflare ↔ 방문자 간만 HTTPS, Origin은 HTTP
   - **Full**: Cloudflare ↔ Origin 간도 HTTPS (자체 서명 인증서 허용)
   - **Full (strict)**: Origin 서버에 유효한 SSL 인증서 필요

**현재 권장 설정: Flexible 모드**
- 추가 설정 불필요
- Cloudflare가 자동으로 HTTPS 제공
- Origin 서버는 HTTP로 동작 (Nginx 80번 포트)

### 2-2. Cloudflare 추가 보안 설정 (선택사항)

**Security 탭:**
- **Security Level**: Medium (기본값)
- **Challenge Passage**: 30분
- **Browser Integrity Check**: 켜기

**Speed 탭:**
- **Auto Minify**: HTML, CSS, JS 모두 켜기
- **Brotli**: 켜기

---

## 3. 프론트엔드 배포 (Cloudflare Pages)

### 3-1. Cloudflare Pages 설정

**이미 배포된 상태:**
- URL: https://test-cust-info-get.apls.kr
- 소스: `public/index.html` 및 관련 파일

### 3-2. API 엔드포인트 설정

**프론트엔드 코드에서 API 엔드포인트 확인:**

`public/index.html`의 JavaScript에서 API 호출 시:
```javascript
// 예시: completeForm() 함수
const response = await fetch('/api/customer-info', {
    method: 'POST',
    body: formData
});
```

**주의사항:**
- 프론트엔드가 Cloudflare Pages에 호스팅되면서 `/api/customer-info` 경로가 상대 경로로 동작
- Cloudflare Pages에는 API 엔드포인트가 없으므로, 절대 URL로 변경 필요:

```javascript
// 수정 필요:
const response = await fetch('http://cust-info-get-test-connect.apls.kr/api/customer-info', {
    method: 'POST',
    body: formData
});
```

---

## 4. 배포 확인

### 4-1. 로컬 테스트
```bash
# Node.js 앱 직접 접속
curl http://localhost:3010/health

# Nginx를 통한 접속
curl http://localhost/health
```

### 4-2. 외부 접속 테스트
```bash
# 공인 IP로 접속
curl http://152.67.200.121/health

# 도메인으로 접속
curl http://cust-info-get-test-connect.apls.kr/health
curl https://cust-info-get-test-connect.apls.kr/health  # HTTPS (Cloudflare)

# API 엔드포인트 테스트
curl http://cust-info-get-test-connect.apls.kr/api/customer-info
```

### 4-3. 브라우저 테스트
- **프론트엔드**: https://test-cust-info-get.apls.kr
- **백엔드 헬스체크**: http://cust-info-get-test-connect.apls.kr/health
- 고객정보 입력 폼이 정상적으로 로드되고 API 통신이 되는지 확인

---

## 5. 문제 해결 (Troubleshooting)

### 5-1. Nginx 로그 확인
```bash
# 에러 로그
sudo tail -f /var/log/nginx/apl-customer-error.log

# 액세스 로그
sudo tail -f /var/log/nginx/apl-customer-access.log
```

### 5-2. PM2 로그 확인
```bash
pm2 logs cust-info-get

# 실시간 로그
pm2 logs cust-info-get --lines 100
```

### 5-3. 포트 사용 확인
```bash
# 3010 포트 사용 확인
sudo netstat -tulpn | grep 3010

# Nginx 포트 확인
sudo netstat -tulpn | grep nginx
```

### 5-4. 방화벽 상태 확인
```bash
# UFW 상태
sudo ufw status

# iptables 상태
sudo iptables -L -n
```

### 5-5. DNS 전파 확인
```bash
# DNS 조회 (백엔드 API)
nslookup cust-info-get-test-connect.apls.kr
dig cust-info-get-test-connect.apls.kr

# DNS 조회 (프론트엔드)
nslookup test-cust-info-get.apls.kr

# Cloudflare 프록시 확인 (Cloudflare IP가 반환되어야 함)
```

### 5-6. CORS 문제 해결
```bash
# 브라우저 개발자 도구 콘솔에서 CORS 에러 확인
# "Access-Control-Allow-Origin" 헤더 확인

# 서버에서 CORS 헤더 확인
curl -I http://cust-info-get-test-connect.apls.kr/api/customer-info

# 예상 응답 헤더:
# Access-Control-Allow-Origin: https://test-cust-info-get.apls.kr
```

---

## 6. 유지보수

### 6-1. 앱 업데이트
```bash
cd /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get

# Git pull (코드 업데이트)
git pull origin main

# server 디렉토리로 이동
cd server

# 의존성 설치
npm install

# PM2 재시작
pm2 restart cust-info-get

# 로그 확인
pm2 logs cust-info-get
```

### 6-2. Nginx 설정 변경
```bash
# 설정 파일 수정
sudo nano /etc/nginx/sites-available/apl-customer

# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx
```

### 6-3. 로그 관리
```bash
# Nginx 로그 크기 확인
du -sh /var/log/nginx/

# 오래된 로그 삭제 (30일 이상)
sudo find /var/log/nginx/ -name "*.log" -mtime +30 -delete

# PM2 로그 초기화
pm2 flush
```

---

## 7. 보안 권장사항

### 7-1. 환경 변수 보호
```bash
# .env 파일 권한 설정
chmod 600 /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get/server/.env

# AWS 자격증명 확인
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - MONGODB_URI (비밀번호 포함)
```

### 7-2. HTTPS 적용 (선택사항)

**Cloudflare Flexible SSL 사용 중:**
- 사용자 ↔ Cloudflare: HTTPS
- Cloudflare ↔ Origin: HTTP

**Full (strict) SSL로 업그레이드 시:**
1. Let's Encrypt 또는 Cloudflare Origin Certificate 발급
2. Nginx HTTPS 서버 블록 활성화
3. Cloudflare SSL/TLS 모드를 "Full (strict)"로 변경

---

## 빠른 시작 (Quick Start)

```bash
# 1. Nginx 설치
sudo apt update && sudo apt install nginx -y

# 2. Nginx 설정 (도메인 이미 설정됨: cust-info-get-test-connect.apls.kr)
sudo cp /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get/nginx.conf /etc/nginx/sites-available/apl-customer
sudo ln -s /etc/nginx/sites-available/apl-customer /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 3. PM2로 앱 시작
cd /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get/server
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 4. 방화벽 설정
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# 5. DNS 설정 (이미 완료됨)
# A 레코드: cust-info-get-test-connect → 152.67.200.121 (Proxied)
# CNAME: cust-info-get-test → test-cust-info-get.apls.kr (Proxied)

# 6. 접속 테스트
curl http://localhost/health
curl http://cust-info-get-test-connect.apls.kr/health

# 7. 프론트엔드 접속
# https://test-cust-info-get.apls.kr
```

---

## 참고 자료

- **Nginx 공식 문서**: https://nginx.org/en/docs/
- **PM2 공식 문서**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Cloudflare 문서**: https://developers.cloudflare.com/
- **Cloudflare Pages 문서**: https://developers.cloudflare.com/pages/
- **Oracle Cloud 방화벽 설정**: https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm

---

**작성일**: 2025-11-02
**작성자**: Claude Code
**업데이트**: 실제 도메인 및 IP 주소로 설정 완료
