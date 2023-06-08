const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const productSchema = new Schema(
  {
    name: {
      en: {
        type: String,
        required: [false, 'Please provide the English product name'],
      },
      uk: {
        type: String,
        required: [false, 'Please provide the Ukrainian product name'],
      },
    },
    description: {
      en: {
        type: String,
        required: [false, 'Please provide the English product description'],
      },
      uk: {
        type: String,
        required: [false, 'Please provide the Ukrainian product description'],
      },
    },
    usage: {
      en: {
        type: String,
        required: [false, 'Please provide the English product usage'],
      },
      uk: {
        type: String,
        required: [false, 'Please provide the Ukrainian product usage'],
      },
    },
    price: [
      {
        volume: {
          type: String,
          required: [false, 'Please provide the volume'],
        },
        value: {
          type: Number,
          required: [false, 'Please provide the price value'],
        },
      },
    ],
    image: {
      type: String,
      required: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    numReviews: {
      type: Number,
      required: false,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
