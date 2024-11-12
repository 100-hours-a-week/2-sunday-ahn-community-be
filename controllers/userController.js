const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const usersFilePath = path.join(__dirname, '../config/users.json'); // 사용자 데이터 파일 경로

// NOTE : 임시임. 나중에 처리 필요
exports.logout = (req, res) => {
    // 여기에 로그아웃 처리 로직(세션 제거)을 추가
    
        res.status(200).json({ message: '로그아웃 성공' });

};

//유저 회원 탈퇴
exports.withdrawUser = (req, res) => {
    const userId = parseInt(req.params.userId); // 요청으로부터 userId를 가져옴 (숫자로 변환)

    // users.json 파일을 읽기
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일을 읽는 도중 오류 발생:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        try {
            const users = JSON.parse(data); // JSON 형식의 문자열을 객체로 파싱
            const updatedUsers = users.filter(user => user.userId !== userId); // userId가 일치하지 않는 사용자만 남김

            // 사용자 존재 여부 확인
            if (updatedUsers.length === users.length) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
            }

            // users.json 파일에 업데이트된 사용자 데이터 쓰기
            fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("파일을 쓰는 도중 오류 발생:", writeErr);
                    return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
                }

                res.status(200).json({ message: "회원탈퇴 성공", data: null });
            });

        } catch (parseErr) {
            console.error("JSON 파싱 오류 발생:", parseErr);
            res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }
    });
};

// 닉네임 수정
exports.editNickname = (req, res) => {
    const userId = parseInt(req.params.userId); // 요청으로부터 userId를 가져옴 (숫자로 변환)
    const { newNickname } = req.body; // 요청 본문에서 새로운 닉네임 받기

    if (!newNickname || newNickname.length === 0) {
        return res.status(400).json({ message: "새로운 닉네임을 입력해주세요.", data: null });
    }

    // users.json 파일을 읽기
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일을 읽는 도중 오류 발생:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        try {
            const users = JSON.parse(data); // JSON 형식의 문자열을 객체로 파싱
            const userIndex = users.findIndex(user => user.userId === userId); // userId에 해당하는 인덱스를 찾기

            if (userIndex === -1) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
            }

            // 이미 존재하는 닉네임인지 확인
            const isNicknameTaken = users.some(user => user.nickname === newNickname);
            if (isNicknameTaken) {
                return res.status(401).json({ message: "*중복된 닉네임입니다.", data: null });
            }

            // 닉네임 수정
            users[userIndex].nickname = newNickname;

            // 수정된 users.json 파일을 저장
            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("파일을 쓰는 도중 오류 발생:", writeErr);
                    return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
                }

                res.status(200).json({ message: "닉네임 변경 성공", data: null });
            });

        } catch (parseErr) {
            console.error("JSON 파싱 오류 발생:", parseErr);
            res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }
    });
};

// 비밀번호 수정
exports.editPassword = (req, res) => {
    const userId = parseInt(req.params.userId); // 요청으로부터 userId를 가져옴 (숫자로 변환)
    const { newPassword } = req.body; // 요청 본문에서 새로운 비밀번호 받기

    if (!newPassword || newPassword.length === 0) {
        return res.status(400).json({ message: "새로운 비밀번호를 입력해주세요.", data: null });
    }

    // 비밀번호 유효성 검사 (예: 최소 8자, 대문자, 소문자, 숫자, 특수문자 포함)
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!passwordPattern.test(newPassword)) {
        return res.status(400).json({ message: "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.", data: null });
    }

    // users.json 파일을 읽기
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일을 읽는 도중 오류 발생:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        try {
            const users = JSON.parse(data); // JSON 형식의 문자열을 객체로 파싱
            const userIndex = users.findIndex(user => user.userId === userId); // userId에 해당하는 인덱스를 찾기

            if (userIndex === -1) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
            }

            // 비밀번호 수정
            users[userIndex].password = newPassword;

            // 수정된 users.json 파일을 저장
            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("파일을 쓰는 도중 오류 발생:", writeErr);
                    return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
                }

                res.status(200).json({ message: "비밀번호 변경 성공", data: null });
            });

        } catch (parseErr) {
            console.error("JSON 파싱 오류 발생:", parseErr);
            res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }
    });
};
