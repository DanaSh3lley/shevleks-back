const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');
const { getMessages } = require('../controllers/messageController');

const router = express.Router();

router.use(authController.protect);

router.post('/', messageController.createMessage);

router.get('/', getMessages);

module.exports = router;
