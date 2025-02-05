import express from 'express';
import User from '../models/User.js'; // User 모델을 사용
import bcrypt from 'bcrypt';
import s3 from '../config/s3.js';
import 'dotenv/config';
const app = express();

app.use(express.json()); // JSON 형식의 요청 본문을 파싱

// 사용자 정보 가져오는 엔드포인트
export const getUserInfo = (req, res) => {
    if (req.session.user) {
        // 세션에 저장된 사용자 정보를 반환
        res.status(200).json({
            isLogin: true,
            data: req.session.user,
        });
    console.log(req.session.user.userId, '[세션 전송]');

    } else {
        // 세션에 정보가 없으면 에러 반환
        res.status(400).json({
            isLogin: false,
            data: null,
        });
    }
};

// 로그인 검증
export const login = async (req, res) => {
    const { email, password } = req.body;

    // 유효성 검사
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
        return res.status(400).json({
            message: '*이메일 또는 비밀번호가 올바르지 않습니다.',
        });
    }

    try {
        // 이메일로 사용자 정보 조회
        const user = await User.getUserByEmail(email);

        // 이메일이 존재하지 않으면
        if (!user) {
            return res.status(404).json({
                message: '*이메일 또는 비밀번호가 올바르지 않습니다.',
            });
        }
        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({
                    message: '*비밀번호가 올바르지 않습니다.',
                });
        }

        // 로그인 성공: 세션에 사용자 정보 저장
        req.session.user = {
            userId: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profileImage: user.profile_image,
        };
        console.log(req.session); // 로그인 후 세션에 사용자 정보가 포함되어 있는지 확인

        res.status(200).json({
            message: '로그인 성공',
            data: null,
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 회원가입 처리
export const regist = async (req, res) => {
    const { email, password, nickname, profileImage } = req.body;

    // 유효성 검사
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nicknameError = validateNickname(nickname);

    if (emailError || passwordError || nicknameError) {
        return res.status(400).json({
            message: '입력한 정보가 올바르지않습니다.',
        });
    }

    if (!profileImage.startsWith("https://d1udeqb19jqo1f.cloudfront.net/profiles/")) {
        return res.status(400).json({ message: "잘못된 프로필 이미지 URL입니다." });
    }
    
    try {
        // 이메일 중복 검사
        const emailExists = await User.getUserByEmail(email);
        if (emailExists) {
            return res
                .status(401)
                .json({ message: '*중복된 이메일입니다', data: null });
        }

        // 닉네임 중복 검사
        const nicknameExists = await User.getUserByNickname(nickname);
        if (nicknameExists) {
            return res
                .status(402)
                .json({ message: '*중복된 닉네임입니다', data: null });
        }

        // 비밀번호 암호화
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 새로운 사용자 추가
        await User.createUser(email, hashedPassword, nickname, profileImage); // 암호화된 비밀번호 사용
        console.log('회원가입');
        res.status(200).json({
            message: '회원가입이 성공적으로 완료되었습니다!',
            data: null,
        });
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({
            message: '서버에 오류가 발생했습니다.',
            data: null,
        });
    }
};

// 이메일 중복 검사
export const emailCheck = async (req, res) => {
    const { email } = req.body;

    if (validateEmail(email)) {
        return res.status(400).json({
            message: '*이메일을 입력해주세요.',
            data: null,
        });
    }

    try {
        const emailExists = await User.getUserByEmail(email);


        if (emailExists) {
            return res.status(401).json({
                message: '*중복된 이메일입니다',
                data: null,
            });
        } else {
            return res.status(200).json({
                message: '이메일 중복 검사 성공',
                data: null,
            });
        }
    } catch (error) {
        console.error('이메일 중복 검사 오류:', error);
        res.status(500).json({
            message: '서버에 오류가 발생했습니다.',
            data: null,
        });
    }
};

// 닉네임 중복 검사
export const nicknameCheck = async (req, res) => {
    const { nickname } = req.body;

    if (validateNickname(nickname)) {
        return res.status(400).json({
            message: '*닉네임을 입력해주세요.',
            data: null,
        });
    }

    try {
        const nicknameExists = await User.getUserByNickname(nickname);

        if (nicknameExists) {
            return res.status(401).json({
                message: '*중복된 닉네임입니다',
                data: null,
            });
        } else {
            return res.status(200).json({
                message: '닉네임 중복 검사 성공',
                data: null,
            });
        }
    } catch (error) {
        console.error('닉네임 중복 검사 오류:', error);
        res.status(500).json({
            message: '서버에 오류가 발생했습니다.',
            data: null,
        });
    }
};

// Pre-signed URL 생성
export const generatePresignedUrl = (req, res) => {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
        return res.status(400).json({ message: '파일 이름과 타입이 필요합니다.' });
    }

    const timestamp = Date.now(); // 타임스탬프 생성
    const fileKey = `profiles/${timestamp}_${filename}`; // 동일한 파일명 사용

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Expires: 60, // 60초 동안 유효
        ContentType: contentType,
    };

    try {
        const presignedUrl = s3.getSignedUrl('putObject', params);
        const fileUrl = `https://d1udeqb19jqo1f.cloudfront.net/${fileKey}`; // CloudFront URL 생성

        res.status(200).json({
            presignedUrl, // S3 업로드 URL
            fileUrl,      // 프론트에서 사용할 CloudFront URL
        });

        console.log("Generated URLs:", { presignedUrl, fileUrl });
    } catch (error) {
        console.error('Pre-signed URL 생성 실패:', error);
        res.status(500).json({ message: 'Pre-signed URL 생성 실패' });
    }
};


export const validateEmail = (email) => {
    if (!email.trim() || email === "") return "*이메일을 입력해주세요.";
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) return "*올바른 이메일 주소 형식을 입력해주세요.";
    return ""; // 유효
};

export const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!password.trim()) return "*비밀번호를 입력해주세요.";
    if (!passwordPattern.test(password)) {
        return "*비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.";
    }
    return ""; // 유효
};

export const validateNickname = (nickname) => {
    if (!nickname.trim()) return "*닉네임을 입력해주세요.";
    if (nickname.length > 10) return "*닉네임은 최대 10자 까지 작성 가능합니다.";
    if (/\s/.test(nickname)) return "*띄어쓰기를 없애주세요.";
    return ""; // 유효
};
