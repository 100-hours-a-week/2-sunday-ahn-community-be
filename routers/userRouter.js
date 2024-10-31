// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/login', userController.loginCheck);
router.post('/regist', userController.regist);
router.post('/logout', userController.logout)

module.exports = router;
