const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const postsFilePath = path.join(__dirname, '../config/posts.json'); // 게시물 데이터 파일 경로
const commentsFilePath = path.join(__dirname, '../config/comments.json'); // 댓글 데이터 파일 경로
const usersFilePath = path.join(__dirname, '../config/users.json'); // 유저 데이터 파일 경로

// 댓글 수정
exports.editComment = ('/:commentId', (req, res) => {
    const commentId = parseInt(req.params.commentId);  // URL 파라미터에서 댓글 ID를 가져옴
    const { newComment, date } = req.body;  // 요청 본문에서 댓글 수정에 필요한 데이터 받기

    // 댓글 데이터 파일을 읽어옴
    fs.readFile(commentsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일 읽기 오류:", err);
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        let commentsData = JSON.parse(data);  // JSON 파싱

        // 해당 댓글을 찾음
        const commentIndex = commentsData.comments.findIndex(comment => comment.commentId === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({ message: "해당 댓글을 찾을 수 없습니다.", data: null });
        }

        const comment = commentsData.comments[commentIndex];

        // 댓글 내용과 수정 일자를 업데이트
        comment.content = newComment;
        comment.date = date;

        // 수정된 댓글 데이터를 다시 파일에 저장
        fs.writeFile(commentsFilePath, JSON.stringify(commentsData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error("파일 저장 오류:", err);
                return res.status(500).json({ message: "서버 오류", data: null });
            }

            // 수정된 댓글 응답
            return res.status(200).json({ message: "댓글 수정 성공", data: comment });
        });
    });
});

// 댓글 삭제
exports.deleteComment = (req, res) => {
    const commentId = parseInt(req.params.commentId);

    fs.readFile(commentsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일 읽기 오류:", err);
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        let commentsData = JSON.parse(data);

        const commentIndex = commentsData.comments.findIndex(comment => comment.commentId === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({ message: "해당 댓글을 찾을 수 없습니다.", data: null });
        }

        const comment = commentsData.comments[commentIndex];

        // 댓글 삭제
        commentsData.comments.splice(commentIndex, 1);

        // 게시물의 commentsCnt 감소
        fs.readFile(postsFilePath, 'utf8', (err, postData) => {
            if (err) {
                console.error("파일 읽기 오류:", err);
                return res.status(500).json({ message: "서버 오류: 게시물 데이터 로딩 실패", data: null });
            }

            let postsData = JSON.parse(postData);
            const post = postsData.posts.find(post => post.postId === comment.postId);

            if (post) {
                post.commentsCnt -= 1; // 댓글 수 감소
                // 변경된 게시물 데이터를 파일에 저장
                fs.writeFile(postsFilePath, JSON.stringify(postsData, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error("파일 저장 오류:", err);
                        return res.status(500).json({ message: "서버 오류: 게시물 데이터 저장 실패", data: null });
                    }
                });
            }

            // 댓글 데이터를 다시 저장
            fs.writeFile(commentsFilePath, JSON.stringify(commentsData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error("파일 저장 오류:", err);
                    return res.status(500).json({ message: "서버 오류: 댓글 데이터 저장 실패", data: null });
                }

                return res.status(200).json({ message: "댓글 삭제 성공", data: null });
            });
        });
    });
};


// 댓글 등록
exports.addComment = (req, res) => {
    const { userId, postId, content, date } = req.body;

    if (!userId || !postId || !content || !date) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다.", data: null });
    }

    const numericUserId = parseInt(userId, 10);
    const numericPostId = parseInt(postId, 10);

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일 읽기 오류:", err);
            return res.status(500).json({ message: "서버 오류: 사용자 정보 로딩 실패", data: null });
        }

        let usersData = JSON.parse(data);
        const user = usersData.find(user => user.userId === numericUserId);

        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다.", data: null });
        }

        fs.readFile(commentsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error("파일 읽기 오류:", err);
                return res.status(500).json({ message: "서버 오류: 댓글 데이터 로딩 실패", data: null });
            }

            let commentsData = JSON.parse(data);

            const newCommentId = commentsData.comments.length > 0
                ? Math.max(...commentsData.comments.map(comment => comment.commentId)) + 1
                : 1;

            const newComment = {
                commentId: newCommentId,
                postId: numericPostId,
                content: content,
                author: {
                    userId: numericUserId,
                    nickname: user.nickname,
                    profileImage: user.profileImage,
                },
                date: date,
            };

            commentsData.comments.push(newComment);

            // 게시물의 commentsCnt 증가
            fs.readFile(postsFilePath, 'utf8', (err, postData) => {
                if (err) {
                    console.error("파일 읽기 오류:", err);
                    return res.status(500).json({ message: "서버 오류: 게시물 데이터 로딩 실패", data: null });
                }

                let postsData = JSON.parse(postData);
                const post = postsData.posts.find(post => post.postId === numericPostId);

                if (post) {
                    post.commentsCnt += 1; // 댓글 수 증가
                    // 변경된 게시물 데이터를 파일에 저장
                    fs.writeFile(postsFilePath, JSON.stringify(postsData, null, 2), 'utf8', (err) => {
                        if (err) {
                            console.error("파일 저장 오류:", err);
                            return res.status(500).json({ message: "서버 오류: 게시물 데이터 저장 실패", data: null });
                        }
                    });
                }

                // 댓글 데이터를 다시 저장
                fs.writeFile(commentsFilePath, JSON.stringify(commentsData, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error("파일 저장 오류:", err);
                        return res.status(500).json({ message: "서버 오류: 댓글 데이터 저장 실패", data: null });
                    }

                    return res.status(200).json({ message: "댓글 등록 성공", data: newComment });
                });
            });
        });
    });
};
