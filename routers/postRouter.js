// routes/userRoutes.js
const express = require('express');
const postController = require('../controllers/postController');
const router = express.Router();

router.post('/edit', postController.editInfo);

module.exports = router;