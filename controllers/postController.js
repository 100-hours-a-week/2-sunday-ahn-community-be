const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

const postsFilePath = path.join(__dirname, '../config/posts.json'); // 게시물 데이터 파일 경로
const commentsFilePath = path.join(__dirname, '../config/comments.json'); // 게시물 데이터 파일 경로
const usersFilePath = path.join(__dirname, '../config/users.json'); // 게시물 데이터 파일 경로

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

// 게시물 상세 조회 함수
exports.getPost = (req, res) => {
    const postId = parseInt(req.params.postId); // URL에서 postId 추출

    // 게시물 데이터 읽기
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        let posts = JSON.parse(data).posts;
        const postIndex = posts.findIndex(p => p.postId === postId);

        if (postIndex === -1) {
            return res.status(404).json({ message: "해당 게시물이 존재하지 않습니다.", data: null });
        }

        // 해당 게시물의 views 증가
        posts[postIndex].views += 1;

        // 파일에 업데이트된 views 값 저장
        fs.writeFile(postsFilePath, JSON.stringify({ posts }, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: "서버 오류", data: null });
            }

            // 댓글 데이터 읽기
            fs.readFile(commentsFilePath, 'utf8', (err, commentData) => {
                if (err) {
                    return res.status(500).json({ message: "서버 오류", data: null });
                }

                const comments = JSON.parse(commentData).comments;

                // 해당 게시물에 해당하는 댓글 필터링
                const postComments = comments.filter(comment => comment.postId === postId);

                // commentsCnt를 댓글 수로 업데이트
                posts[postIndex].commentsCnt = postComments.length;

                // 응답 객체 생성
                const response = {
                    message: "게시글 상세조회 성공",
                    data: {
                        ...posts[postIndex],
                        comments: postComments
                    }
                };

                // 성공적으로 상세 조회 결과 전송
                return res.status(200).json(response);
            });
        });
    });
};


// 게시물 삭제
exports.deletePost = (req, res) => {
    const postId = parseInt(req.params.postId); // URL에서 postId를 가져옴

    // 게시물 데이터 파일 읽기
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일을 읽는 중 오류가 발생했습니다:", err);
            return res.status(500).json({
                message: "서버에 오류가 발생했습니다.",
                data: null
            });
        }

        const postsData = JSON.parse(data);  // 파일 내용 JSON 파싱
        const posts = postsData.posts;

        // 삭제할 게시물 찾기
        const postIndex = posts.findIndex(post => post.postId === postId);
        if (postIndex === -1) {
            return res.status(404).json({
                message: "해당 게시물이 존재하지 않습니다.",
                data: null
            });
        }

        // 게시물 제거
        posts.splice(postIndex, 1);

        // 수정된 게시물 데이터 다시 파일에 저장
        fs.writeFile(postsFilePath, JSON.stringify(postsData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error("파일을 저장하는 중 오류가 발생했습니다:", err);
                return res.status(500).json({
                    message: "서버에 오류가 발생했습니다.",
                    data: null
                });
            }

            return res.status(200).json({
                message: "게시물 삭제 성공",
                data: null
            });
        });
    });
};

// 게시물 수정
exports.editPost = (req, res) => {
    const postId = parseInt(req.params.postId);
    const { newTitle, newContent, editDate, imageUrl } = req.body;

    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("파일을 읽는 중 오류가 발생했습니다:", err);
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        const postsData = JSON.parse(data);
        const postIndex = postsData.posts.findIndex(post => post.postId === postId);
        if (postIndex === -1) {
            return res.status(404).json({ message: "해당 게시물이 존재하지 않습니다.", data: null });
        }

        const post = postsData.posts[postIndex];

        // 제목과 내용 업데이트
        if (newTitle) post.title = newTitle;
        if (newContent) post.content = newContent;
        if (editDate) post.date = editDate;

        // 이미지 업데이트: 새 이미지 URL이 있으면 기존 이미지 파일 삭제
        if (imageUrl && post.imageUrl !== imageUrl) {
            const oldImagePath = path.join(__dirname, '../public', post.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            post.imageUrl = imageUrl;
        }
        fs.writeFile(postsFilePath, JSON.stringify(postsData, null, 2), (err) => {
            if (err) {
                console.error("파일을 저장하는 중 오류가 발생했습니다:", err);
                return res.status(500).json({ message: "게시물 저장 중 오류 발생" });
            }
            res.status(200).json({ message: "게시물 수정 성공", data: post });
        });
    });
};
// 게시물 등록
exports.addPost = (req, res) => {
    const { userId, title, content, date, imageUrl } = req.body;

    // users.json 파일을 읽어 유저 정보 확인
    fs.readFile(usersFilePath, 'utf8', (err, userData) => {
        if (err) {
            console.error("유저 데이터를 읽는 중 오류가 발생했습니다:", err);
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        let users = [];
        try {
            const parsedData = JSON.parse(userData); // JSON 파싱
            console.log("파싱된 데이터:", parsedData); // 파싱된 데이터 확인
            users = parsedData;  // 전체 객체가 배열이 아니라면 .users 로 접근하지 않음
        } catch (parseError) {
            console.error("유저 데이터 파싱 중 오류 발생:", parseError);
            return res.status(500).json({ message: "데이터 파싱 오류", data: null });
        }

        // 파싱 후 users가 undefined인지 확인
        if (!users || users.length === 0) {
            console.error("users 배열이 비어 있거나 정의되지 않았습니다.");
            return res.status(404).json({ message: "사용자 데이터가 없습니다.", data: null });
        }

        // 유저 정보 찾기
        const author = users.find(user => user.userId === userId);
        if (!author) {
            return res.status(404).json({ message: "작성자 정보가 없습니다.", data: null });
        }

        // 게시물 데이터 구성
        const newPost = {
            title,
            content,
            likes: 0,
            views: 0,
            commentsCnt: 0,
            date,
            imageUrl,
            author: {
                userId: author.userId,
                nickname: author.nickname,
                profileImg: author.profileImage // profileImage 필드를 수정
            }
        };

        // posts.json 파일에 게시물 추가
        const postsFilePath = path.join(__dirname, '../config/posts.json');
        fs.readFile(postsFilePath, 'utf8', (err, postData) => {
            if (err) {
                console.error("게시물 데이터를 읽는 중 오류가 발생했습니다:", err);
                return res.status(500).json({ message: "서버 오류", data: null });
            }

            let postsData = { posts: [] };
            try {
                postsData = JSON.parse(postData);
            } catch (parseError) {
                console.error("게시물 데이터 파싱 중 오류 발생:", parseError);
            }

            // 기존 게시물 중 가장 큰 postId 찾기
            const maxPostId = postsData.posts.length > 0
                ? Math.max(...postsData.posts.map(post => post.postId))
                : 0; // 게시물이 없으면 0으로 설정

            // 새로운 postId는 기존 최대 postId + 1
            newPost.postId = maxPostId + 1;

            postsData.posts.push(newPost);

            // 수정된 데이터를 파일에 저장
            fs.writeFile(postsFilePath, JSON.stringify(postsData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error("게시물 데이터를 저장하는 중 오류가 발생했습니다:", err);
                    return res.status(500).json({ message: "서버 오류", data: null });
                }

                return res.status(200).json({ message: "게시물 작성 성공", data: newPost });
            });
        });
    });
};

