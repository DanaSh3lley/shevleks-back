const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    en: {
      type: String,
      required: [false, 'Please provide the English category name'],
    },
    uk: {
      type: String,
      required: [false, 'Please provide the Ukrainian category name'],
    },
  },
  image: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
