import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import bcrypt from 'bcrypt';

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

// 회원탈퇴
export const withdrawUser = async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        // 유저가 작성한 댓글 삭제
        const comments = await Comment.getAllComments();
        const userComments = comments.filter(
            comment => comment.user_id === userId,
        );

        for (const comment of userComments) {
            await Comment.deleteComment(comment.comment_id);
        }

        // 유저가 작성한 게시물 삭제
        const posts = await Post.getAllPosts();
        const userPosts = posts.filter(post => post.user_id === userId);

        for (const post of userPosts) {
            // 게시물 삭제
            await Post.deletePost(post.post_id);
        }

        // 유저 삭제
        const affectedRows = await User.deleteUser(userId);
        if (affectedRows === 0) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        // 세션도 제거
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: '로그아웃 실패' });
            }
            res.clearCookie('connect.sid'); // 세션 쿠키 제거
            console.log('회원탈퇴 및 관련된 게시물/댓글 삭제 완료');
            res.status(200).json({ message: '회원탈퇴 성공', data: null });
        });
    } catch (err) {
        console.error('데이터베이스 오류:', err);
        return res
            .status(500)
            .json({ message: '서버에 오류가 발생했습니다.', data: null });
    }
};

// 닉네임 수정
export const editNickname = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newNickname } = req.body;

    if (!newNickname || newNickname.length === 0) {
        return res
            .status(400)
            .json({ message: '새로운 닉네임을 입력해주세요.', data: null });
    }

    try {
        // 사용자 정보 조회
        const user = await User.getUserById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        // 닉네임 중복 검사
        const existingUser = await User.getUserByNickname(newNickname);
        if (existingUser) {
            return res
                .status(401)
                .json({ message: '*중복된 닉네임입니다.', data: null });
        }

        // 변경된 필드만 업데이트
        const affectedRows = await User.updateUser(
            userId,
            user.email,
            user.password,
            newNickname,
            user.profile_image,
        );
        if (affectedRows === 0) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        // 세션에 반영된 정보 업데이트
        req.session.user.nickname = newNickname;
        console.log('닉네임 변경');
        return res
            .status(200)
            .json({ message: '닉네임 변경 성공', data: req.session.user });
    } catch (err) {
        console.error('데이터베이스 오류:', err);
        return res
            .status(500)
            .json({ message: '서버에 오류가 발생했습니다.', data: null });
    }
};

// 비밀번호 수정
export const editPassword = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length === 0) {
        return res
            .status(400)
            .json({ message: '새로운 비밀번호를 입력해주세요.', data: null });
    }

    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!passwordPattern.test(newPassword)) {
        return res.status(400).json({
            message:
                '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.',
            data: null,
        });
    }

    try {
        // 사용자 정보 조회
        const user = await User.getUserById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        // 비밀번호 암호화
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 비밀번호 업데이트
        const affectedRows = await User.updateUser(
            userId,
            user.email,
            hashedPassword,
            user.nickname,
            user.profile_image,
        );
        if (affectedRows === 0) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        console.log('비밀번호 변경 성공');
        return res
            .status(200)
            .json({ message: '비밀번호 변경 성공', data: null });
    } catch (err) {
        console.error('데이터베이스 오류:', err);
        return res
            .status(500)
            .json({ message: '서버에 오류가 발생했습니다.', data: null });
    }
};

// 프로필 사진 변경
export const editProfileImage = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newProfileImg } = req.body;

    try {
        // 사용자 정보 조회
        const user = await User.getUserById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        // 변경된 필드만 업데이트
        const affectedRows = await User.updateUser(
            userId,
            user.email,
            user.password,
            user.nickname,
            newProfileImg,
        );
        if (affectedRows === 0) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        // 세션에 반영된 정보 업데이트
        req.session.user.profileImage = newProfileImg;
        console.log('프로필사진 변경');
        return res
            .status(200)
            .json({
                message: '프로필 이미지 변경 성공',
                data: req.session.user,
            });
    } catch (err) {
        console.error('데이터베이스 오류:', err);
        return res
            .status(500)
            .json({ message: '서버에 오류가 발생했습니다.', data: null });
    }
};
