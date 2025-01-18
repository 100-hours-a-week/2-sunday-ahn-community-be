import express from 'express';
import {
    logout,
    withdrawUser,
    editProfileImage,
    editNickname,
    editPassword,
    deleteProfileImage
} from '../controllers/userController.js';

const router = express.Router();

router.post('/logout', logout);
router.delete('/withdraw/:userId', withdrawUser);
router.put('/profileImg/:userId', editProfileImage);
router.patch('/nickname/:userId', editNickname);
router.patch('/password/:userId', editPassword);

router.delete('/profileImage/:imageUrl', deleteProfileImage);

export default router;
