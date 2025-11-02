const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const connectDB = require('./config/db');
const custInfoRoutes = require('./routes/custInfoRoutes');

const app = express();
const PORT = process.env.PORT || 3010;

// MongoDB 연결
connectDB();

// Middleware
// CORS 설정 - Cloudflare Pages 프론트엔드 허용 (pages.dev 및 커스텀 도메인)
const corsOptions = {
    origin: [
        'https://test-cust-info-get.apls.kr',
        'https://test-cust-info-get.pages.dev'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (프론트엔드)
app.use(express.static(path.join(__dirname, '../public')));

// API 라우트
app.use('/api/customer-info', custInfoRoutes);

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date()
    });
});

// 루트 경로 - 프론트엔드 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 에러 핸들러
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: '파일 업로드 오류',
            error: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: err.message
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 Server is running on port ${PORT}
    📡 API endpoint: http://localhost:${PORT}/api/customer-info
    🌐 Frontend: http://localhost:${PORT}
    ========================================
    `);
});
