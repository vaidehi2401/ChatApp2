const express = require('express');
const authenticate = require('../middleware/auth')
const upload = require('../middleware/multer'); // adjust path as needed
const controller = require('../controllers/userController')
const messageController = require('../controllers/messageController')

const router = express.Router();

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/message', authenticate , messageController.postMessage)
router.get('/messages/:lastId/:groupId', authenticate,  messageController.getMessages)
router.post('/upload', authenticate, upload.single('file'), messageController.uploadFiles);

module.exports=router;