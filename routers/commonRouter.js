// routes/userRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/login', authController.login);
router.post('/regist', authController.regist);
router.get('/userInfo', authController.getUserInfo);
router.post('/email', authController.emailCheck);
router.post('/nickname', authController.nicknameCheck);

module.exports = router;
