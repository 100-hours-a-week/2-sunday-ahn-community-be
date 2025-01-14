import express from 'express';
import {
    login,
    regist,
    getUserInfo,
    emailCheck,
    nicknameCheck,
    generatePresignedUrl,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/regist', regist);
router.get('/userInfo', getUserInfo);
router.post('/email', emailCheck);
router.post('/nickname', nicknameCheck);
router.post('/uploadProfile', generatePresignedUrl);


export default router;
