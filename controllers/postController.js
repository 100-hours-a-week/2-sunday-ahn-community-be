import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

// 게시물 목록 조회
export const getPostsList = async (req, res) => {
    try {
        const posts = await Post.getAllPosts();

        const postList = posts.map(post => ({
            postId: post.post_id,
            title: post.title,
            content: post.content,
            likes: post.likes,
            views: post.views,
            commentsCnt: post.comments_cnt,
            date: post.date, // DB에서 자동 생성된 DATETIME 사용
            imageUrl: post.image_url,
            author: {
                userId: post.author_user_id,
                nickname: post.author_nickname,
                profileImg: post.author_profile_image,
            },
        }));
        console.log('게시물 목록 조회');
        res.status(200).json({
            message: '게시물 목록 조회 성공',
            data: postList,
        });
    } catch (err) {
        console.error('게시물 조회 실패:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 게시물 상세 조회
export const getPost = async (req, res) => {
    const postId = parseInt(req.params.postId);

    try {
        const post = await Post.getPostById(postId);
        if (!post) {
            return res
                .status(404)
                .json({ message: '게시물이 존재하지 않습니다.', data: null });
        }

        // 댓글 조회
        const comments = await Comment.getAllComments();

        const postComments = comments
            .filter(comment => comment.post_id === postId)
            .map(comment => ({
                commentId: comment.comment_id,
                content: comment.content,
                date: comment.date,
                author: {
                    userId: comment.author_user_id,
                    nickname: comment.author_nickname,
                    profileImg: comment.author_profile_image,
                },
            }));

        await Post.updatePost(
            postId,
            post.user_id,
            post.title,
            post.content,
            post.likes,
            post.views + 1,
            post.comments_cnt,
            post.image_url,
        );

        const postData = {
            postId: post.post_id,
            title: post.title,
            content: post.content,
            likes: post.likes,
            views: post.views + 1,
            commentsCnt: postComments.length,
            date: post.date,
            imageUrl: post.image_url,
            author: {
                userId: post.author_user_id,
                nickname: post.author_nickname,
                profileImg: post.author_profile_image,
            },
            comments: postComments,
        };
        console.log('게시물 상세 조회');
        res.status(200).json({
            message: '게시글 상세 조회 성공',
            data: postData,
        });
    } catch (err) {
        console.error('게시물 상세 조회 실패:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 게시물 추가
export const addPost = async (req, res) => {
    const { userId, title, content, imageUrl } = req.body;
    try {
        const author = await User.getUserById(userId);
        if (!author) {
            return res
                .status(404)
                .json({ message: '작성자 정보가 없습니다.', data: null });
        }

        const postId = await Post.createPost(
            userId,
            title,
            content,
            0,
            0,
            0,
            imageUrl,
        );

        const newPost = {
            postId,
            title,
            content,
            likes: 0,
            views: 0,
            commentsCnt: 0,
            date: new Date(), // 응답에 현재 시간 포함
            imageUrl,
            author: {
                userId: author.user_id,
                nickname: author.nickname,
                profileImage: author.profile_image,
            },
        };
        console.log('게시물 작성');
        res.status(200).json({
            message: '게시물 작성 성공',
            data: newPost,
        });
    } catch (err) {
        console.error('게시물 작성 중 오류 발생:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 게시물 수정
export const editPost = async (req, res) => {
    const postId = parseInt(req.params.postId);
    const { title, content, imageUrl } = req.body;

    try {
        const post = await Post.getPostById(postId);
        if (!post) {
            return res
                .status(404)
                .json({ message: '게시물이 존재하지 않습니다.', data: null });
        }

        await Post.updatePost(
            postId,
            post.user_id,
            title,
            content,
            post.likes,
            post.views,
            post.comments_cnt,
            imageUrl,
        );
        console.log('게시물 수정');
        res.status(200).json({
            message: '게시물 수정 성공',
            data: {
                postId,
                title,
                content,
                likes: post.likes,
                views: post.views,
                commentsCnt: post.commentsCnt,
                date: post.date, // 수정 후에도 기존의 date 반환
                imageUrl,
            },
        });
    } catch (err) {
        console.error('게시물 수정 중 오류 발생:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 게시물 삭제
export const deletePost = async (req, res) => {
    const postId = parseInt(req.params.postId);

    try {
        const post = await Post.getPostById(postId);
        if (!post) {
            return res
                .status(404)
                .json({ message: '게시물이 존재하지 않습니다.', data: null });
        }

        // 댓글 삭제
        const comments = await Comment.getAllComments();
        for (const comment of comments) {
            if (comment.post_id === postId) {
                await Comment.deleteComment(comment.comment_id);
            }
        }

        // 게시물 삭제
        await Post.deletePost(postId);
        console.log('게시물 삭제');
        res.status(200).json({
            message: '게시물 삭제 성공',
            data: null,
        });
    } catch (err) {
        console.error('게시물 삭제 중 오류 발생:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
    
};

// 게시물 좋아요 클릭
export const likePost = async (req, res) => {
    const postId = parseInt(req.params.postId);

    try {
        // 게시물 존재 여부 확인
        const post = await Post.getPostById(postId);
        if (!post) {
            return res
                .status(404)
                .json({ message: '게시물이 존재하지 않습니다.', data: null });
        }

        // 좋아요 수 증가
        const result = await Post.increaseLikes(postId);
        if (result === 0) {
            return res
                .status(500)
                .json({ message: '좋아요 증가 실패', data: null });
        }

        // 성공적으로 좋아요 수를 증가시킨 후 응답
        res.status(200).json({
            message: '좋아요 성공',
            data: null, // 추가 데이터가 필요 없으면 null
        });
    } catch (err) {
        console.error('좋아요 처리 중 오류 발생:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};