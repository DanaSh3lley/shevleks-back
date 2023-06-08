const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const {
  addToFavorites,
  getUserFavorites,
  removeFromFavorites,
} = require('../controllers/favoritesController');

router.use(authController.protect);

router.post('/:productId', addToFavorites);
router.get('/', getUserFavorites);
router.delete('/:productId', removeFromFavorites);

module.exports = router;
