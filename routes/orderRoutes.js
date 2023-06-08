const express = require('express');
const orderController = require('./../controllers/orderContorller');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);


router
    .route('/user')
    .get(orderController.getUserOrders)

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createOrder);


router
    .route('/:id')
    .get(orderController.getOrder)
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder);

module.exports = router;