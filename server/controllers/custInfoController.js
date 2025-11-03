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

        // 날짜/시간을 파일명 형식으로 변환 (예: 2025-11-09 15:30 -> 2511091530)
        const dateTimeStr = `${date.replace(/-/g, '').slice(2)}${time.replace(/:/g, '').slice(0, 4)}`;

        // 이미지 번호 카운터
        let imageNumber = 0;

        // 화장 스타일 이미지 업로드
        if (req.files['makeupImage1']) {
            const file = req.files['makeupImage1'][0];
            imageNumber++;
            const fileName = `${dateTimeStr}_${name}_${imageNumber}.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        if (req.files['makeupImage2']) {
            const file = req.files['makeupImage2'][0];
            imageNumber++;
            const fileName = `${dateTimeStr}_${name}_${imageNumber}.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        // 패션 스타일 이미지 업로드
        if (req.files['fashionImage1']) {
            const file = req.files['fashionImage1'][0];
            imageNumber++;
            const fileName = `${dateTimeStr}_${name}_${imageNumber}.jpg`;
            const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
            uploadedImageKeys.push(s3Key);
        }

        if (req.files['fashionImage2']) {
            const file = req.files['fashionImage2'][0];
            imageNumber++;
            const fileName = `${dateTimeStr}_${name}_${imageNumber}.jpg`;
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
