const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Product = require('./productModel');
const AppError = require('../utils/appError');

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      volume: {
        type: String,
        required: true,
      },
    },
  ],
  shippingAddress: {
    type: String,
    required: false,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'product',
    select: 'name',
  });
  next();
});

orderSchema.pre('save', async function (next) {
  try {
    let totalPrice = 0;

    for (const product of this.product) {
      const fetchedProduct = await Product.findById(product);

      if (!fetchedProduct) {
        return new AppError(`Product ${product.name} not found`);
      }

      const productPrice = fetchedProduct.price.find(
        (price) => price.volume === product.volume
      );

      if (!productPrice) {
        return new AppError('Price not found for the specified volume');
      }

      totalPrice += productPrice.value * product.quantity;
    }

    this.totalPrice = totalPrice;
    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
