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

            // 댓글 데이터 파일 읽기
            fs.readFile(commentsFilePath, 'utf8', (err, commentData) => {
                if (err) {
                    console.error("댓글 데이터를 읽는 중 오류가 발생했습니다:", err);
                    return res.status(500).json({
                        message: "서버에 오류가 발생했습니다.",
                        data: null
                    });
                }

                let commentsData = JSON.parse(commentData); // 댓글 데이터 JSON 파싱
                const originalComments = commentsData.comments;

                // postId가 삭제할 게시물의 postId와 같은 댓글을 제외
                const updatedComments = originalComments.filter(comment => comment.postId !== postId);

                // comments.json 파일 업데이트
                fs.writeFile(commentsFilePath, JSON.stringify({ comments: updatedComments }, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error("댓글 데이터를 저장하는 중 오류가 발생했습니다:", err);
                        return res.status(500).json({
                            message: "서버에 오류가 발생했습니다.",
                            data: null
                        });
                    }

                    // 게시물과 댓글 삭제 성공 응답
                    return res.status(200).json({
                        message: "게시물 삭제 성공",
                        data: null
                    });
                });
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

        // 해당 게시물 정보 업데이트
        const post = postsData.posts[postIndex];
        if (newTitle) post.title = newTitle;
        if (newContent) post.content = newContent;
        if (editDate) post.date = editDate;

        if (imageUrl && post.imageUrl !== imageUrl) {
            const oldImagePath = path.join(__dirname, '../public', post.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            post.imageUrl = imageUrl;
        }

        // 수정된 게시물을 배열 맨 앞에 위치시키기 위해 배열에서 제거 후 추가
        postsData.posts.splice(postIndex, 1);  // 기존 위치에서 제거
        postsData.posts.unshift(post);         // 배열 맨 앞에 추가

        fs.writeFile(postsFilePath, JSON.stringify(postsData, null, 2), (err) => {
            if (err) {
                console.error("파일을 저장하는 중 오류가 발생했습니다:", err);
                return res.status(500).json({ message: "게시물 저장 중 오류 발생" });
            }
            res.status(200).json({ message: "게시물 수정 성공", data: post });
        });
    });
};

//게시물 등록
exports.addPost = (req, res) => {
    const { userId, title, content, date, imageUrl } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, userData) => {
        if (err) {
            console.error("유저 데이터를 읽는 중 오류가 발생했습니다:", err);
            return res.status(500).json({ message: "서버 오류", data: null });
        }

        let users = [];
        try {
            users = JSON.parse(userData);
        } catch (parseError) {
            console.error("유저 데이터 파싱 중 오류 발생:", parseError);
            return res.status(500).json({ message: "데이터 파싱 오류", data: null });
        }

        const author = users.find(user => user.userId === userId);
        if (!author) {
            return res.status(404).json({ message: "작성자 정보가 없습니다.", data: null });
        }

        // 게시물 파일 읽기
        fs.readFile(postsFilePath, 'utf8', (err, postData) => {
            if (err) {
                console.error("게시물 데이터를 읽는 중 오류가 발생했습니다:", err);
                return res.status(500).json({ message: "서버 오류", data: null });
            }

            // postsData 초기화
            let postsData = { posts: [] };
            try {
                postsData = JSON.parse(postData);
            } catch (parseError) {
                console.error("게시물 데이터 파싱 중 오류 발생:", parseError);
            }

            // 새 게시물 ID 생성
            const newPostId = postsData.posts.length > 0
                ? Math.max(...postsData.posts.map(post => post.postId)) + 1
                : 1;

            // 새로운 게시물 객체 생성
            const newPost = {
                postId: newPostId,
                title,
                content,
                likes: 0,
                views: 0,
                commentsCnt: 0,
                date,
                imageUrl : imageUrl,
                author: {
                    userId: author.userId,
                    nickname: author.nickname,
                    profileImg: author.profileImage
                }
            };

            // 새로운 게시물을 배열의 맨 앞에 추가
            postsData.posts.unshift(newPost);

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



