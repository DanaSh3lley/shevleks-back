const express = require('express');

const router = express.Router();
const {
  addToCart,
  viewCart,
  updateCartItem,
  checkout,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/', viewCart);
router.post('/checkout', checkout);
router.post('/:productId', addToCart);
router.patch('/:productId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeCartItem);

module.exports = router;
