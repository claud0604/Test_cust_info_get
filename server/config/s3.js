const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// S3 클라이언트 초기화
const s3Client = new S3Client({
    region: process.env.MY_AWS_REGION,
    credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    },
});

console.log('✅ AWS S3 Client initialized successfully');

/**
 * S3에 이미지 업로드
 * @param {Buffer} fileBuffer - 이미지 파일 버퍼
 * @param {string} fileName - 저장할 파일명
 * @param {string} mimeType - 파일 MIME 타입
 * @returns {Promise<string>} S3 키 (경로)
 */
const uploadImageToS3 = async (fileBuffer, fileName, mimeType) => {
    const key = `${process.env.S3_PREFIX}${fileName}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        console.log(`✅ S3 Upload Success: ${key}`);
        return key;
    } catch (error) {
        console.error(`❌ S3 Upload Error: ${error.message}`);
        throw error;
    }
};

module.exports = { s3Client, uploadImageToS3 };
