import express from 'express';
import {
    getPostsList,
    getPost,
    deletePost,
    editPost,
    addPost,
    likePost,
    generatePostPresignedUrl,
    deletePostImage,
} from '../controllers/postController.js';

const router = express.Router();

// 게시물 리스트 조회
router.get('/', getPostsList);
// 게시물 상세 조회
router.get('/:postId', getPost);
// 게시물 삭제
router.delete('/:postId', deletePost);
// 게시물 수정
router.put('/:postId', editPost);
// 게시물 등록
router.post('/', addPost);
// 게시물 좋아요
router.get('/:postId/likes', likePost);
// 게시물 이미지 업로드
router.post('/uploadPostImage', generatePostPresignedUrl);
// 게시물 이미지 삭제
router.delete('/postImage/:imageUrl', deletePostImage);

export default router;


