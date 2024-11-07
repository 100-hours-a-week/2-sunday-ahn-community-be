// routes/userRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/login', authController.loginCheck);
router.post('/regist', authController.regist);

module.exports = router;
