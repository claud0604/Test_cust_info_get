const multer = require('multer');

// Multer 메모리 스토리지 설정 (파일을 메모리에 버퍼로 저장)
const storage = multer.memoryStorage();

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'), false);
    }
};

// Multer 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 제한
    }
});

// 필드별 업로드 설정 (화장 스타일 이미지 2개, 패션 스타일 이미지 2개)
const uploadCustomerImages = upload.fields([
    { name: 'makeupImage1', maxCount: 1 },
    { name: 'makeupImage2', maxCount: 1 },
    { name: 'fashionImage1', maxCount: 1 },
    { name: 'fashionImage2', maxCount: 1 }
]);

module.exports = { uploadCustomerImages };
