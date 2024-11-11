const express = require('express');
const commentController = require('../controllers/commentController');
const router = express.Router();

//댓글 수정
router.put('/:commentId', commentController.editComment);
//댓글 삭제
router.delete('/:commentId', commentController.deleteComment);
//댓글 등록
router.post('/', commentController.addComment);


module.exports = router;