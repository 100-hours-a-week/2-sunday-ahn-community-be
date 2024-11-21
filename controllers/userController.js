import User from '../models/User.js';

// 로그아웃
export const logout = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: '로그아웃 실패' });
            }
            res.clearCookie('connect.sid'); // 세션 쿠키 제거
            return res.status(200).json({ message: '로그아웃 성공' });
        });
    } else {
        res.status(400).json({ message: '로그인 상태가 아닙니다.' });
    }
};

// 유저 회원 탈퇴
export const withdrawUser = (req, res) => {
    const userId = parseInt(req.params.userId); // 요청으로부터 userId를 가져옴

    User.deleteUser(userId, (err, affectedRows) => {
        if (err) {
            console.error("데이터베이스 오류:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        if (affectedRows === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
        }

        // 세션도 제거
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: '로그아웃 실패' });
            }
            res.clearCookie('connect.sid'); // 세션 쿠키 제거
            res.status(200).json({ message: "회원탈퇴 성공", data: null });
        });
    });
};

// 닉네임 수정
export const editNickname = (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newNickname } = req.body;

    if (!newNickname || newNickname.length === 0) {
        return res.status(400).json({ message: "새로운 닉네임을 입력해주세요.", data: null });
    }

    // 사용자 정보 조회
    User.getUserById(userId, (err, user) => {
        if (err) {
            console.error("데이터베이스 오류:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
        }

        // 닉네임 중복 검사
        User.getUserByNickname(newNickname, (err, existingUser) => {
            if (err) {
                console.error("데이터베이스 오류:", err);
                return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
            }

            if (existingUser) {
                return res.status(401).json({ message: "*중복된 닉네임입니다.", data: null });
            }

            // 변경된 필드만 업데이트
            User.updateUser(userId, user.email, user.password, newNickname, user.profile_image, (err, affectedRows) => {
                if (err) {
                    console.error("데이터베이스 오류:", err);
                    return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
                }

                if (affectedRows === 0) {
                    return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
                }

                // 세션에 반영된 정보 업데이트
                req.session.user.nickname = newNickname;
                res.status(200).json({ message: "닉네임 변경 성공", data: req.session.user });
            });
        });
    });
};

// 비밀번호 수정
export const editPassword = (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length === 0) {
        return res.status(400).json({ message: "새로운 비밀번호를 입력해주세요.", data: null });
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!passwordPattern.test(newPassword)) {
        return res.status(400).json({ message: "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.", data: null });
    }

    // 사용자 정보 조회
    User.getUserById(userId, (err, user) => {
        if (err) {
            console.error("데이터베이스 오류:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
        }

        // 변경된 필드만 업데이트
        User.updateUser(userId, user.email, newPassword, user.nickname, user.profile_image, (err, affectedRows) => {
            if (err) {
                console.error("데이터베이스 오류:", err);
                return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
            }

            if (affectedRows === 0) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
            }

            res.status(200).json({ message: "비밀번호 변경 성공", data: null });
        });
    });
};

// 프로필 사진 변경
export const editProfileImage = (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newProfileImg } = req.body;

    // 사용자 정보 조회
    User.getUserById(userId, (err, user) => {
        if (err) {
            console.error("데이터베이스 오류:", err);
            return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
        }

        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
        }

        // 변경된 필드만 업데이트
        User.updateUser(userId, user.email, user.password, user.nickname, newProfileImg, (err, affectedRows) => {
            if (err) {
                console.error("데이터베이스 오류:", err);
                return res.status(500).json({ message: "서버에 오류가 발생했습니다.", data: null });
            }

            if (affectedRows === 0) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
            }

            // 세션에 반영된 정보 업데이트
            req.session.user.profileImage = newProfileImg;
            res.status(200).json({ message: "프로필 이미지 변경 성공", data: req.session.user });
        });
    });
};
