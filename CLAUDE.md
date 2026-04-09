# APL COLOR 고객정보 입력 시스템

## Git
- 레포: https://github.com/claud0604/Test_cust_info_get

## 프론트엔드
- 배포: Cloudflare Pages (자동 - git push 시)
- URL: https://test-cust-info-get.apls.kr
- 추가 도메인: https://custinfo25.apls.kr
- Pages 도메인: https://test-cust-info-get.pages.dev

## 백엔드 (Oracle Cloud VM)
- 서버 경로: `/home/ubuntu/Project_APL_cust_connect/Test_cust_info_get/server/`
- PM2 프로세스명: `test-cust-info-get`
- 포트: 3010
- API 도메인: https://cust-info-get-test-connect.apls.kr
- Nginx 설정: `/etc/nginx/sites-available/cust-info-get-test.conf`

## SMS 인증 모듈 (Oracle Cloud VM - 독립 서비스)
- 서버 경로: (별도 관리)
- PM2 프로세스명: `sms-auth-module`
- 포트: 2070
- API: `http://152.67.200.121:2070/api/auth/*`

## 배포 순서
1. `git push origin main` → Cloudflare Pages 프론트 자동 배포
2. `ssh apldev2` → `cd /home/ubuntu/Project_APL_cust_connect/Test_cust_info_get`
3. `git pull origin main`
4. `cd server && npm install`
5. PM2 재시작: `pm2 restart test-cust-info-get`
6. Nginx 변경 시: `sudo nginx -t && sudo systemctl reload nginx`
