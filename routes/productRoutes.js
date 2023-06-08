const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(productController.getAllProducts);

router.route('/catalog').get(productController.getCatalog);

router.route('/:id').get(productController.getProduct);

router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .post(
    productController.uploadProductImage,
    productController.resizeProductImage,
    productController.createProduct
  );

router
  .route('/:id')
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
