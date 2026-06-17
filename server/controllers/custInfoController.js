const Cust_info = require('../models/Cust_info');
const { uploadImageToS3 } = require('../config/s3');
const smsAuth = require('../config/smsAuth');

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
            phoneVerified,
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
            phoneVerified: phoneVerified === true || phoneVerified === 'true',
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

/**
 * 고객 정보 검색 (이름 + 전화번호)
 */
const searchCustomerInfo = async (req, res) => {
    try {
        const { name, phone, verifyToken } = req.query;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message: '이름과 전화번호가 필요합니다.' });
        }

        const verified = await smsAuth.isVerified(phone, verifyToken);
        if (!verified) {
            return res.status(403).json({ success: false, message: '전화번호 인증이 필요합니다.' });
        }

        const customerInfo = await Cust_info.findOne({ name, phone }).sort({ createdAt: -1 });

        if (!customerInfo) {
            return res.status(404).json({ success: false, message: '입력된 정보가 없습니다.' });
        }

        res.status(200).json({ success: true, data: customerInfo });
    } catch (error) {
        console.error('❌ Search Customer Info Error:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

/**
 * 고객 정보 수정
 */
const updateCustomerInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const existingInfo = await Cust_info.findById(id);
        if (!existingInfo) {
            return res.status(404).json({ success: false, message: '고객 정보를 찾을 수 없습니다.' });
        }

        const {
            date, time, serviceName, name, gender, age, phone,
            occupation, height, weight, clothingSize, reason, stylePreference,
            phoneVerified,
        } = req.body;

        // 이미지 처리
        let uploadedImageKeys = [...(existingInfo.images || [])];

        if (req.files && Object.keys(req.files).length > 0) {
            uploadedImageKeys = [];
            const dateTimeStr = `${(date || existingInfo.date).replace(/-/g, '').slice(2)}${(time || existingInfo.time).replace(/:/g, '').slice(0, 4)}`;
            const customerName = name || existingInfo.name;
            let imageNumber = 0;

            const imageFields = ['makeupImage1', 'makeupImage2', 'fashionImage1', 'fashionImage2'];
            for (const field of imageFields) {
                if (req.files[field]) {
                    const file = req.files[field][0];
                    imageNumber++;
                    const fileName = `${dateTimeStr}_${customerName}_${imageNumber}.jpg`;
                    const s3Key = await uploadImageToS3(file.buffer, fileName, file.mimetype);
                    uploadedImageKeys.push(s3Key);
                }
            }
        }

        const updateData = {
            date: date || existingInfo.date,
            time: time || existingInfo.time,
            serviceName: serviceName || existingInfo.serviceName,
            name: name || existingInfo.name,
            gender: gender || existingInfo.gender,
            age: age || existingInfo.age,
            phone: phone || existingInfo.phone,
            occupation: occupation !== undefined ? occupation : existingInfo.occupation,
            height: height !== undefined ? height : existingInfo.height,
            weight: weight !== undefined ? weight : existingInfo.weight,
            clothingSize: clothingSize !== undefined ? clothingSize : existingInfo.clothingSize,
            reason: reason || existingInfo.reason,
            stylePreference: stylePreference || existingInfo.stylePreference,
            phoneVerified: phoneVerified !== undefined ? (phoneVerified === true || phoneVerified === 'true') : existingInfo.phoneVerified,
            images: uploadedImageKeys,
        };

        const updatedInfo = await Cust_info.findByIdAndUpdate(id, updateData, { new: true });

        console.log(`✅ Customer Info Updated: ${updatedInfo.name} (${updatedInfo._id})`);

        res.status(200).json({
            success: true,
            message: '고객 정보가 수정되었습니다.',
            data: {
                id: updatedInfo._id,
                name: updatedInfo.name,
                imagesCount: uploadedImageKeys.length,
            },
        });
    } catch (error) {
        console.error('❌ Update Customer Info Error:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

module.exports = {
    createCustomerInfo,
    getCustomerInfo,
    searchCustomerInfo,
    updateCustomerInfo,
};
