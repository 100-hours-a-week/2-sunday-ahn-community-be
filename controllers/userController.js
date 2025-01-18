import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import bcrypt from 'bcrypt';
import s3 from '../config/s3.js';
import 'dotenv/config';
import { validateNickname,validatePassword } from "./authController.js";

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

// 회원 탈퇴
export const withdrawUser = async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        // 유저가 작성한 게시글 가져오기
        const userPosts = await Post.getPostsByUserId(userId);

        // 각 게시글에 달린 댓글 삭제
        for (const post of userPosts) {
            const postComments = await Comment.getCommentsByPostId(post.post_id);
            for (const comment of postComments) {
                await Comment.deleteComment(comment.comment_id);
            }
            // 게시글 삭제
            await Post.deletePost(post.post_id);
        }

        // 유저가 작성한 댓글 삭제 (다른 사용자의 게시글에 남긴 댓글)
        const userComments = await Comment.getCommentsByUserId(userId);
        for (const comment of userComments) {
            await Comment.deleteComment(comment.comment_id);
            await Post.updateCommentsCount(comment.post_id); // 댓글 수 업데이트
        }

        // 유저 프로필 삭제
        const userProfile = await User.getUserById(userId);
        console.log("user:", userProfile);
        if(userProfile.profile_image !== ""){
            const key = userProfile.profile_image.split("profiles/").pop(); // S3 파일 경로 추출
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `profiles/${key}`,
            };
            try {
                await s3.deleteObject(params).promise();
                console.log("S3에서 이미지 삭제 성공:", userProfile.profile_image);
            } catch (error) {
                console.error("S3 이미지 삭제 실패:", error);
                throw new Error("S3 이미지 삭제 중 오류가 발생했습니다.");
            }
        }

        // 유저 삭제
        const affectedRows = await User.deleteUser(userId);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        // 세션 제거
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: "로그아웃 실패" });
            }
            res.clearCookie("connect.sid"); // 세션 쿠키 제거
            console.log("회원탈퇴 및 관련된 게시물/댓글 삭제 완료");
            res.status(200).json({ message: "회원탈퇴 성공" });
        });
    } catch (err) {
        console.error("데이터베이스 오류:", err);
        return res.status(500).json({ message: "서버에 오류가 발생했습니다." });
    }
};

// 닉네임 수정
export const editNickname = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { newNickname } = req.body;

    // 닉네임 유효성 검사
    if (validateNickname(newNickname)) {
        return res.status(400).json({
            message: '입력한 정보가 올바르지않습니다.',
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
    const userId = decodeURIComponent(req.params.userId);

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

export const deleteProfileImage = async (req,res) => {
    const imageUrl = decodeURIComponent(req.params.imageUrl);

    if (!imageUrl) {
        return res.status(400).json({ message: "이미지 URL이 필요합니다." });
    }

    // S3에서 삭제할 파일 Key 추출
    const key = imageUrl.split("profiles/").pop(); // URL에서 파일 경로 추출

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `profiles/${key}`,
    };

    try {
        await s3.deleteObject(params).promise(); // S3에서 파일 삭제
        res.status(200).json({ message: "이미지가 삭제되었습니다." });
        console.log("이미지 삭제함");
    } catch (error) {
        console.error("이미지 삭제 오류:", error);
        res.status(500).json({ message: "이미지 삭제 중 오류가 발생했습니다." });
    }
};