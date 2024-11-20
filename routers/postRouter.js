const express = require('express');
const postController = require('../controllers/postController');
const router = express.Router();

//게시물 리스트 조회
router.get('/', postController.getPostsList);
//게시물 상세 조회
router.get('/:postId', postController.getPost);
//게시물 삭제
router.delete('/:postId',postController.deletePost);
//게시물 수정
router.put('/:postId', postController.editPost);
//게시물 등록
router.post('/', postController.addPost);
module.exports = router;