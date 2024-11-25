import express from 'express';
import User from '../models/User.js'; // User 모델을 사용
import bcrypt from 'bcrypt';
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
    } else {
        // 세션에 정보가 없으면 에러 반환
        res.status(400).json({
            isLogin: false,
            data: null,
        });
    }
    console.log('세션 전송');
};

// 로그인 검증
export const login = async (req, res) => {
    const { email, password } = req.body;

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
                    message: '*이메일 또는 비밀번호가 올바르지 않습니다.',
                });
        }

        // 로그인 성공: 세션에 사용자 정보 저장
        req.session.user = {
            userId: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profileImage: user.profile_image,
        };

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

    if (!email) {
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

    if (!nickname) {
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
