const express = require('express');
const paymentController = require("../models/paymentController");
const router = express.Router({ mergeParams: true });

router.post('/', paymentController.initiatePayment);

// Route for handling payment execution
router.get('/success', paymentController.executePayment);

// Route for handling canceled payment
router.get('/cancel', paymentController.cancelPayment);

module.exports = router;
