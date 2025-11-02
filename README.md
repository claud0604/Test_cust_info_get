# APL COLOR 고객정보 입력 시스템

AWS Lambda에서 Node.js/Express 서버로 마이그레이션한 고객정보 수집 시스템입니다.

## 프로젝트 구조

```
Test_cust_info_get/
├── public/                      # 프론트엔드 파일
│   ├── index.html              # 고객정보 입력 폼
│   └── APLCOLOR_logo.png       # 로고 이미지
│
├── server/                      # 백엔드 서버
│   ├── config/                 # 설정 파일
│   │   ├── db.js              # MongoDB 연결
│   │   └── s3.js              # AWS S3 설정 및 업로드 함수
│   │
│   ├── models/                 # 데이터 모델
│   │   └── Cust_info.js       # 고객정보 스키마
│   │
│   ├── controllers/            # 컨트롤러
│   │   └── custInfoController.js  # 고객정보 처리 로직
│   │
│   ├── routes/                 # API 라우트
│   │   └── custInfoRoutes.js  # 고객정보 API 엔드포인트
│   │
│   ├── middleware/             # 미들웨어
│   │   └── upload.js          # Multer 파일 업로드 설정
│   │
│   ├── server.js              # Express 앱 진입점
│   ├── package.json           # 의존성 관리
│   └── .env                   # 환경 변수
│
└── README.md                   # 문서 (이 파일)
```

## 설치 및 실행

### 1. 의존성 설치
```bash
cd server
npm install
```

### 2. 서버 실행

**개발 모드:**
```bash
cd server
npm run dev
```

**프로덕션 모드:**
```bash
cd server
npm start
```

### 3. 웹 브라우저에서 접속
```
http://localhost:3010
```

## 주요 기능

- 고객 기본정보 수집 (이름, 성별, 나이, 연락처 등)
- 예약 상품 및 진단 일시 기록
- 신체 정보 수집 (키, 몸무게, 옷 사이즈 - 선택)
- 진단 의뢰이유 및 원하는 스타일링 기록
- 화장 스타일 및 패션 스타일 이미지 업로드 (각 최대 2장)
- 이미지 자동 압축 (1MB 이하, 1024px 이하)
- AWS S3에 이미지 저장
- MongoDB에 고객정보 저장
