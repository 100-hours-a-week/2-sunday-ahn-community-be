const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/logout', userController.logout);
router.delete('/withdraw/:userId', userController.withdrawUser);
router.put('/profileImg/:userId', userController.editProfileImage)
router.patch('/nickname/:userId', userController.editNickname);
router.patch('/password/:userId', userController.editPassword);

module.exports = router;
