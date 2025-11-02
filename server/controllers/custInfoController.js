const Cust_info = require('../models/Cust_info');
const { uploadImageToS3 } = require('../config/s3');

/**
 * 고객 정보 생성 (이미지 포함)
 */
const createCustomerInfo = async (req, res) => {
    try {
        const {
            date,
            time,
            serviceName,
            name,
            gender,
            age,
            phone,
            occupation,
            height,
            weight,
            clothingSize,
            reason,
            stylePreference,
        } = req.body;

        // 필수 필드 검증
        if (!date || !time || !serviceName || !name || !gender || !age || !phone || !reason || !stylePreference) {
            return res.status(400).json({
                success: false,
                message: '필수 입력 항목이 누락되었습니다.',
            });
        }

        // 이미지 파일 처리
        const uploadedImageKeys = [];
        const timestamp = Date.now();

        // 이름에서 특수문자 제거 (파일명에 사용)
        const sanitizedName = name.replace(/[^a-zA-Z0-9가-힣]/g, '');

        // 화장 스타일 이미지 업로드
        if (req.files['makeupImage1']) {
            const file = req.files['makeupImage1'][0];
            const fileName = `${sanitizedName}_${timestamp}_makeup1.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        if (req.files['makeupImage2']) {
            const file = req.files['makeupImage2'][0];
            const fileName = `${sanitizedName}_${timestamp}_makeup2.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        // 패션 스타일 이미지 업로드
        if (req.files['fashionImage1']) {
            const file = req.files['fashionImage1'][0];
            const fileName = `${sanitizedName}_${timestamp}_fashion1.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        if (req.files['fashionImage2']) {
            const file = req.files['fashionImage2'][0];
            const fileName = `${sanitizedName}_${timestamp}_fashion2.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        // MongoDB에 고객 정보 저장
        const customerInfo = new Cust_info({
            name,
            gender,
            age,
            phone,
            occupation: occupation || '',
            serviceName,
            height: height || '',
            weight: weight || '',
            clothingSize: clothingSize || '',
            reason,
            stylePreference,
            date,
            time,
            images: uploadedImageKeys,
        });

        await customerInfo.save();

        console.log(`✅ Customer Info Saved: ${name} (${customerInfo._id})`);

        res.status(201).json({
            success: true,
            message: '고객 정보가 성공적으로 저장되었습니다.',
            data: {
                id: customerInfo._id,
                name: customerInfo.name,
                imagesCount: uploadedImageKeys.length,
            },
        });

    } catch (error) {
        console.error('❌ Create Customer Info Error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message,
        });
    }
};

/**
 * 고객 정보 조회 (테스트용)
 */
const getCustomerInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const customerInfo = await Cust_info.findById(id);

        if (!customerInfo) {
            return res.status(404).json({
                success: false,
                message: '고객 정보를 찾을 수 없습니다.',
            });
        }

        res.status(200).json({
            success: true,
            data: customerInfo,
        });

    } catch (error) {
        console.error('❌ Get Customer Info Error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message,
        });
    }
};

module.exports = {
    createCustomerInfo,
    getCustomerInfo,
};
