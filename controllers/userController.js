const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const usersFilePath = path.join(__dirname, '../config/users.json'); // 사용자 데이터 파일 경로

// 로그인 검증
exports.loginCheck = (req, res) => {
    const { email, password } = req.body;

    // 파일에서 사용자 정보 읽기
    fs.readFile(usersFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('사용자 파일 읽기 오류:', err);
            return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }

        const users = JSON.parse(data); // JSON 파싱
        const user = users.find(user => user.email === email && user.password === password); // 이메일, 비밀번호 확인

        if (user) {
            res.status(200).json({ 
                message: '로그인 성공', 
                user: { 
                    email: user.email, 
                    nickname: user.nickname, 
                    profileImage: user.profileImage 
                } 
            });
        } else {
            res.status(401).json({ error: '*이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
    });
};

// 회원가입 처리
exports.regist = (req, res) => {
    const { email, password, nickname, profileImage } = req.body; 
    const profileImageData = profileImage.split(';base64,').pop(); 

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
    const filePath = path.join(__dirname, '../config/profileImgs', uniqueFilename);

    // 프로필 이미지 저장
    fs.writeFile(filePath, profileImageData, { encoding: 'base64' }, (err) => {
        if (err) {
            console.error('이미지 파일 저장 오류:', err);
            return res.status(500).json({ error: '이미지 저장에 실패했습니다.' });
        }

        // 사용자 데이터 저장
        const newUser = { email, password, nickname, profileImage: uniqueFilename };
        
        fs.readFile(usersFilePath, 'utf-8', (err, data) => {
            let users = [];

            if (!err) {
                users = JSON.parse(data); // 기존 사용자 목록 불러오기
            }

            users.push(newUser); // 새로운 사용자 추가

            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('사용자 데이터 저장 오류:', err);
                    return res.status(500).json({ error: '회원가입 저장에 실패했습니다.' });
                }

                console.log('회원가입 완료:', newUser);
                res.status(200).json({ message: '회원가입이 성공적으로 완료되었습니다!' });
            });
        });
    });
};

// NOTE : 임시임. 나중에 처리 필요
exports.logout = (req, res) => {
    // 여기에 로그아웃 처리 로직(세션 제거)을 추가
    
        res.status(200).json({ message: '로그아웃 성공' });

}