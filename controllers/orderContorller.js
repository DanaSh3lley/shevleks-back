const factory = require('./handlerFactory');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

exports.createOrder = factory.createOne(Order);
exports.getOrder = factory.getOne(Order);
exports.getAllOrders = factory.getAll(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

exports.getUserOrders = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const orders = await Order.find({ user: userId }).populate(
      'product.product'
    );
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};
