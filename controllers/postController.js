const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const postsFilePath = path.join(__dirname, '../config/posts.json'); // 게시물 데이터 파일 경로
const commentsFilePath = path.join(__dirname, '../config/comments.json'); // 게시물 데이터 파일 경로

// 게시물 목록 조회
exports.getPostsList = ('/posts', (req, res) => {
    // posts.json 파일을 비동기적으로 읽기
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일을 읽는 중 오류가 발생했습니다:", err);
            return res.status(500).json({
                message: "서버에 오류가 발생했습니다.",
                data: null
            });
        }

        // 파일 읽기 성공 시 데이터 반환
        const postsData = JSON.parse(data);  // 파일 내용 JSON 파싱

        // 데이터가 정상적으로 있으면 클라이언트에 반환
        res.status(200).json({
            message: "게시물 리스트 조회 성공",
            data: postsData.posts
        });
    });
});

// 게시물 상세조회 
exports.getPost = (req, res) => {
    const postId = parseInt(req.params.postId);  // URL에서 postId 추출

    // 게시물 데이터 읽기
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        const posts = JSON.parse(data).posts;
        const post = posts.find(p => p.postId === postId);

        if (!post) {
            return res.status(404).json({ message: "해당 게시물이 존재하지 않습니다.", data: null });
        }

        // 댓글 데이터 읽기
        fs.readFile(commentsFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: "서버 오류", data: null });
            }

            const comments = JSON.parse(data).comments;

            // 해당 게시물에 해당하는 댓글 필터링
            const postComments = comments.filter(comment => comment.postId === postId);

            // 응답 객체 생성
            const response = {
                message: "게시글 상세조회 성공",
                data: {
                    ...post,
                    comments: postComments
                }
            };

            return res.status(200).json(response);
        });
    });
};