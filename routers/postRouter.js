import express from 'express';
import { getPostsList, 
        getPost, 
        deletePost, 
        editPost, 
        addPost } from '../controllers/postController.js';

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

export default router;
