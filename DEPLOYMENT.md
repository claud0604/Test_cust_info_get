# APL COLOR 고객정보 시스템 배포 가이드

## 📋 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [프론트엔드 배포 (Cloudflare Pages)](#프론트엔드-배포-cloudflare-pages)
3. [백엔드 배포 (Node.js + Nginx)](#백엔드-배포-nodejs--nginx)
4. [DNS 설정](#dns-설정)
5. [환경변수 설정](#환경변수-설정)
6. [테스트](#테스트)

---

## 아키텍처 개요

```
사용자
  ↓
Cloudflare Pages (프론트엔드)
  ↓ HTTPS
Cloudflare DNS → api.yourdomain.com
  ↓
Nginx (포트 80/443)
  ↓ 리버스 프록시
Node.js 서버 (포트 3010)
  ↓
MongoDB + AWS S3
```

### 구성 요소
- **프론트엔드**: Cloudflare Pages (정적 호스팅)
- **백엔드**: Node.js/Express (포트 3010)
- **리버스 프록시**: Nginx
- **데이터베이스**: MongoDB
- **파일 저장소**: AWS S3
- **DNS**: Cloudflare

---

## 프론트엔드 배포 (Cloudflare Pages)

### 1. Cloudflare Pages 프로젝트 생성

1. Cloudflare 대시보드 접속
2. **Pages** → **Create a project** 선택
3. Git 저장소 연결 또는 직접 업로드 선택

### 2. 프론트엔드 파일 준비

```bash
cd Test_cust_info_get/public
```

업로드할 파일:
- `index.html`
- `APLCOLOR_logo.png`

### 3. API 엔드포인트 수정

`index.html` 파일에서 API 호출 URL을 백엔드 도메인으로 변경:

```javascript
// 변경 전 (현재)
const response = await fetch('/api/customer-info', {

// 변경 후
const response = await fetch('https://api.yourdomain.com/api/customer-info', {
```

**⚠️ 중요**: `api.yourdomain.com`을 실제 백엔드 도메인으로 변경하세요.

### 4. Cloudflare Pages 설정

- **Build command**: (없음 - 정적 파일)
- **Build output directory**: `/`
- **Root directory**: `public`

### 5. 배포

Cloudflare Pages가 자동으로 배포를 시작합니다.
배포 완료 후 URL 확인: `https://your-project.pages.dev`

---

## 백엔드 배포 (Node.js + Nginx)

### 1. 서버 준비 (Ubuntu 기준)

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 설치 (v18 이상 권장)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx 설치
sudo apt install -y nginx

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2
```

### 2. 백엔드 코드 배포

```bash
# 프로젝트 클론 또는 복사
cd /var/www
sudo git clone <your-repo-url> aplcolor-api
cd aplcolor-api/Test_cust_info_get/server

# 의존성 설치
npm install

# 환경변수 설정 (.env 파일 생성)
sudo nano .env
```

### 3. 환경변수 설정 (.env)

```env
# 서버 설정
PORT=3010
NODE_ENV=production

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/aplcolor
# 또는 MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/aplcolor

# AWS S3 설정
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket-name
```

### 4. PM2로 서버 실행

```bash
# 서버 시작
pm2 start server.js --name aplcolor-api

# 부팅 시 자동 실행 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs aplcolor-api
```

### 5. Nginx 설정

```bash
# Nginx 설정 파일 복사
sudo cp /var/www/aplcolor-api/Test_cust_info_get/nginx.conf /etc/nginx/sites-available/aplcolor

# 도메인 설정 수정
sudo nano /etc/nginx/sites-available/aplcolor
```

**수정할 부분**:
```nginx
# 1. 도메인 변경
server_name api.yourdomain.com;

# 2. CORS 오리진 변경
add_header 'Access-Control-Allow-Origin' 'https://your-cloudflare-pages.pages.dev' always;
```

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/aplcolor /etc/nginx/sites-enabled/

# 기본 설정 제거 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d api.yourdomain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

또는 **Cloudflare Origin Certificate** 사용:
1. Cloudflare 대시보드 → SSL/TLS → Origin Server
2. Create Certificate
3. 생성된 인증서를 서버에 저장:
   ```bash
   sudo nano /etc/ssl/certs/cloudflare-origin.pem
   sudo nano /etc/ssl/private/cloudflare-origin-key.pem
   ```
4. nginx.conf에서 SSL 경로 수정

---

## DNS 설정

### Cloudflare DNS 설정

1. Cloudflare 대시보드 → DNS → Records 이동
2. 새 레코드 추가:

#### 백엔드 API 레코드
```
Type: A
Name: api
IPv4 address: <서버 IP 주소>
Proxy status: Proxied (오렌지 구름 아이콘)
TTL: Auto
```

#### 프론트엔드 (Cloudflare Pages)
자동으로 설정됨. 커스텀 도메인 추가 시:
```
Type: CNAME
Name: www (또는 @)
Target: your-project.pages.dev
Proxy status: Proxied
```

### SSL/TLS 모드 설정

Cloudflare 대시보드 → SSL/TLS:
- **SSL/TLS encryption mode**: Full (strict) 권장
- **Edge Certificates**: 자동 발급됨

---

## 환경변수 설정

### 프론트엔드 (index.html)

```javascript
// API 엔드포인트
const API_BASE_URL = 'https://api.yourdomain.com';

// fetch 호출 시 사용
const response = await fetch(`${API_BASE_URL}/api/customer-info`, {
```

### 백엔드 (.env)

```env
PORT=3010
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/aplcolor

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket
```

---

## 테스트

### 1. 백엔드 헬스체크

```bash
curl http://localhost:3010/health
# 또는
curl https://api.yourdomain.com/health
```

예상 응답:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-11-02T12:00:00.000Z"
}
```

### 2. CORS 테스트

브라우저 콘솔에서:
```javascript
fetch('https://api.yourdomain.com/health')
  .then(res => res.json())
  .then(data => console.log(data))
```

### 3. 프론트엔드 테스트

1. Cloudflare Pages URL 접속: `https://your-project.pages.dev`
2. 고객정보 입력 폼 작성
3. 이미지 업로드 테스트
4. 제출 후 MongoDB 및 S3에 데이터 저장 확인

### 4. PM2 모니터링

```bash
# 로그 확인
pm2 logs aplcolor-api

# 상태 확인
pm2 status

# 재시작
pm2 restart aplcolor-api
```

### 5. Nginx 로그 확인

```bash
# Access log
sudo tail -f /var/log/nginx/aplcolor-access.log

# Error log
sudo tail -f /var/log/nginx/aplcolor-error.log
```

---

## 트러블슈팅

### CORS 오류 발생 시

1. Nginx 설정의 CORS 헤더 확인
2. Cloudflare DNS Proxy 상태 확인 (Proxied로 설정)
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### 502 Bad Gateway

```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs aplcolor-api

# 서버 재시작
pm2 restart aplcolor-api
```

### MongoDB 연결 실패

```bash
# MongoDB 상태 확인
sudo systemctl status mongod

# MongoDB 시작
sudo systemctl start mongod
```

### 이미지 업로드 실패

1. AWS S3 권한 확인
2. 환경변수(.env) 확인
3. Nginx `client_max_body_size` 설정 확인

---

## 유지보수

### 백엔드 업데이트

```bash
cd /var/www/aplcolor-api/Test_cust_info_get/server
git pull
npm install
pm2 restart aplcolor-api
```

### 프론트엔드 업데이트

1. `public/index.html` 수정
2. Git push
3. Cloudflare Pages가 자동으로 재배포

### 백업

```bash
# MongoDB 백업
mongodump --uri="mongodb://localhost:27017/aplcolor" --out=/backup/$(date +%Y%m%d)

# S3 이미지는 자동으로 AWS에 저장됨
```

---

## 보안 권장사항

1. ✅ HTTPS 사용 (SSL/TLS)
2. ✅ 환경변수로 민감 정보 관리
3. ✅ Nginx rate limiting 설정
4. ✅ MongoDB 인증 활성화
5. ✅ AWS IAM 최소 권한 원칙
6. ✅ 정기적인 보안 업데이트

---

## 참고 자료

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Nginx 문서](https://nginx.org/en/docs/)
- [PM2 문서](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
