import express from 'express';
import { login, 
        regist, 
        getUserInfo, 
        emailCheck, 
        nicknameCheck } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/regist', regist);
router.get('/userInfo', getUserInfo);
router.post('/email', emailCheck);
router.post('/nickname', nicknameCheck);

export default router;
