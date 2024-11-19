const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const usersFilePath = path.join(__dirname, '../config/users.json'); // 사용자 데이터 파일 경로


// 사용자 정보 가져오는 엔드포인트
exports.getUserInfo = (req, res) => {
    if (req.session.user) {
        // 세션에 저장된 사용자 정보를 반환
        res.status(200).json({
            isLogin: true,
            data: req.session.user
        });
    } else {
        // 세션에 정보가 없으면 에러 반환
        res.status(401).json({
            isLogin: false,
            data: null
        });
    }
    console.log("세션 전송")
    console.log(req.session.user);
};

// 로그인 검증
exports.login = (req, res) => {
    const { email, password } = req.body;

    // 파일에서 사용자 정보 읽기
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('사용자 파일 읽기 오류:', err);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        const users = JSON.parse(data); // JSON 파싱
        const user = users.find(user => user.email === email && user.password === password); // 이메일, 비밀번호 확인

        if (user) {
            req.session.user = {
                userId: user.userId,
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImage
            };
            console.log(req.session);
            res.status(200).json({ 
                message: '로그인 성공', 
                data: null
            });
        } else {
            res.status(401).json({ message: '*이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
    });
};


// 회원가입 처리
exports.regist = (req, res) => {
    const { email, password, nickname, profileImage } = req.body;

    // 새로운 사용자의 데이터
    const newUser = { email, password, nickname, profileImage };

    // 기존 사용자 데이터를 읽어옴
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        let users = [];

        if (!err) {
            users = JSON.parse(data); // 기존 사용자 목록 불러오기
        }

        // 중복된 이메일이나 닉네임이 있는지 검사
        const emailExists = users.some(user => user.email === email);
        if (emailExists) {
            return res.status(401).json({ message: "*중복된 이메일입니다", data: null });
        }

        const nicknameExists = users.some(user => user.nickname === nickname);
        if (nicknameExists) {
            return res.status(402).json({ message: "*중복된 닉네임입니다", data: null });
        }

        // 새로운 userId 생성: 기존 ID의 최대값 + 1
        const newUserId = users.length > 0 ? Math.max(...users.map(user => user.userId)) + 1 : 1;
        newUser.userId = newUserId;

        // 새로운 사용자 추가
        users.push(newUser);

        // 새로운 사용자 데이터를 파일에 저장
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('사용자 데이터 저장 오류:', err);
                return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
            }

            console.log('회원가입 완료:', newUser);
            res.status(200).json({ message: "회원가입이 성공적으로 완료되었습니다!", data: null });
        });
    });
};

// 이메일 중복 검사
exports.emailCheck = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "*이메일을 입력해주세요.",
            data: null
        });
    }

    // 파일에서 사용자 정보 읽기
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('사용자 파일 읽기 오류:', err);
            return res.status(500).json({
                message: "서버에 오류가 발생했습니다.",
                data: null
            });
        }

        const users = JSON.parse(data);
        const emailExists = users.some(user => user.email === email);

        if (emailExists) {
            return res.status(401).json({
                message: "*중복된 이메일입니다",
                data: null
            });
        } else {
            return res.status(200).json({
                message: "이메일 중복 검사 성공",
                data: null
            });
        }
    });
};

// 닉네임 중복 검사
exports.nicknameCheck = (req, res) => {
    const { nickname } = req.body;

    if (!nickname) {
        return res.status(400).json({
            message: "*닉네임을 입력해주세요.",
            data: null
        });
    }

    // 파일에서 사용자 정보 읽기
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('사용자 파일 읽기 오류:', err);
            return res.status(500).json({
                message: "서버에 오류가 발생했습니다.",
                data: null
            });
        }

        const users = JSON.parse(data);
        const nicknameExists = users.some(user => user.nickname === nickname);

        if (nicknameExists) {
            return res.status(401).json({
                message: "*중복된 닉네임입니다",
                data: null
            });
        } else {
            return res.status(200).json({
                message: "닉네임 중복 검사 성공",
                data: null
            });
        }
    });
};