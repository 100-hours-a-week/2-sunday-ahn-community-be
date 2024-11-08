// routes/userRoutes.js
const express = require('express');
const postController = require('../controllers/postController');
const router = express.Router();

//게시물 리스트 조회
router.get('/', postController.getPostsList);
router.get('/:postId', postController.getPost);

// router.post('/edit', postController.editInfo);

module.exports = router;