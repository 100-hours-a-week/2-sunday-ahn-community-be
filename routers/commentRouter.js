import express from 'express';
import { editComment, 
        deleteComment, 
        addComment } from '../controllers/commentController';

const router = express.Router();

//댓글 수정
router.put('/:commentId', editComment);
//댓글 삭제
router.delete('/:commentId', deleteComment);
//댓글 등록
router.post('/', addComment);

export default router;
