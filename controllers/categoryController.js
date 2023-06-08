const factory = require("./handlerFactory");
const Category = require("../models/categoryModel");
exports.createCategory = factory.createOne(Category);
exports.getCategory = factory.getOne(Category);
exports.getAllCategorys = factory.getAll(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
