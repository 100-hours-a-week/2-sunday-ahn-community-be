import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

// 댓글 추가
export const addComment = async (req, res) => {
    const { userId, postId, content } = req.body;

    try {
        const author = await User.getUserById(userId);
        if (!author) {
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다.', data: null });
        }

        const newCommentId = await Comment.createComment(
            userId,
            postId,
            content,
        );
        const newComment = await Comment.getCommentById(newCommentId); // DB에서 추가된 댓글 정보 가져오기

        // 댓글 수 증가
        const post = await Post.getPostById(postId);
        if (post) {
            await Post.updatePost(
                postId,
                post.user_id,
                post.title,
                post.content,
                post.likes,
                post.views,
                post.comments_cnt + 1,
                post.image_url,
            );
        }
        console.log('댓글 등록');
        res.status(200).json({
            message: '댓글 등록 성공',
            data: {
                commentId: newComment.comment_id,
                postId,
                content: newComment.content,
                date: newComment.date, // DB에서 자동 생성된 date 반환
                author: {
                    userId: author.user_id,
                    nickname: author.nickname,
                    profileImg: author.profile_image,
                },
            },
        });
    } catch (err) {
        console.error('댓글 등록 중 오류:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 댓글 목록 조회
export const getCommentsList = async (req, res) => {
    try {
        const comments = await Comment.getAllComments();

        // 작성자 정보를 포함한 댓글 데이터 포맷팅
        const formattedComments = comments.map(comment => ({
            commentId: comment.comment_id,
            postId: comment.post_id,
            content: comment.content,
            date: comment.date,
            author: {
                userId: comment.author_user_id,
                nickname: comment.author_nickname,
                profileImg: comment.author_profile_image,
            },
        }));
        console.log('댓글 목록 조회');
        res.status(200).json({
            message: '댓글 목록 조회 성공',
            data: formattedComments,
        });
    } catch (err) {
        console.error('댓글 목록 조회 실패:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 댓글 수정
export const editComment = async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;

    try {
        const comment = await Comment.getCommentById(commentId);
        if (!comment) {
            return res
                .status(404)
                .json({ message: '댓글을 찾을 수 없습니다.', data: null });
        }

        await Comment.updateComment(commentId, content);
        console.log('댓글 수정');
        res.status(200).json({
            message: '댓글 수정 성공',
            data: {
                commentId,
                content,
                date: comment.date, // 기존 댓글의 date 반환
            },
        });
    } catch (err) {
        console.error('댓글 수정 중 오류:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
    const commentId = parseInt(req.params.commentId);

    try {
        const comment = await Comment.getCommentById(commentId);
        if (!comment) {
            return res
                .status(404)
                .json({ message: '댓글을 찾을 수 없습니다.', data: null });
        }

        await Comment.deleteComment(commentId);

        // 댓글 수 감소
        const post = await Post.getPostById(comment.post_id);
        if (post) {
            await Post.updatePost(
                post.post_id,
                post.user_id,
                post.title,
                post.content,
                post.likes,
                post.views,
                post.comments_cnt - 1,
                post.image_url,
            );
        }
        console.log('댓글 삭제');
        res.status(200).json({
            message: '댓글 삭제 성공',
            data: null,
        });
    } catch (err) {
        console.error('댓글 삭제 중 오류:', err);
        res.status(500).json({ message: '서버 오류', data: null });
    }
};
