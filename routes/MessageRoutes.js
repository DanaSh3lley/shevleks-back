const express = require('express');
const messageController = require("../controllers/messageController");
const authController = require("../controllers/authController");
const {getUserMessages, getAdminMessages, getMessages} = require("../controllers/messageController");
const {restrictTo} = require("../controllers/authController");

const router = express.Router();
router.use(authController.protect);

// Route to send a message
router.post('/', messageController.createMessage);

router.get('/', getMessages);

// Admin Routes
// router.get('/admin', restrictTo('admin'), getAdminMessages);



module.exports = router;
