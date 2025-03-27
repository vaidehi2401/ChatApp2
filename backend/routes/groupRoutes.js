const express = require('express');
const authenticate = require('../middleware/auth')
const controller = require('../controllers/userController')
const messageController = require('../controllers/messageController')
const groupController = require('../controllers/groupController')
const router = express.Router();
router.post('/createGroup', authenticate, groupController.createGroup)
router.post('/joinGroup/:groupId', authenticate, groupController.joinGroup)
router.get('/userGroups', authenticate, groupController.getGroups)
router.get('/members/:groupId', authenticate, groupController.getMembers )
router.post('/make-admin', authenticate, groupController.makeAdmin )
router.post('/remove-user', authenticate, groupController.removeUser)
module.exports=router;