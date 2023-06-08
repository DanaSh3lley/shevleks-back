const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require("../models/userModel");
const paypal = require("paypal-rest-sdk");
const Email = require("../utils/email");
const Order = require("../models/orderModel");

const addToCart = catchAsync(async (req, res, next) => {
    const {productId} = req.params;
    const {quantity, volume} = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const user = req.user;

    const cartItem = user.cart.find(
        (item) => item.product.toString() === productId && item.volume === volume
    );

    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        // Check if the product has the specified volume
        const productVolume = product.price.find((vol) => vol.volume === volume);
        if (!productVolume) {
            return res.status(400).json({
                success: false,
                message: 'Product volume not available',
            });
        }

        // If the cart item doesn't exist, create a new cart item
        user.cart.push({product: productId, quantity, volume});
    }

    await user.save({validateBeforeSave: false});

    res.status(200).json({
        status: 'success',
        message: 'Product added to cart successfully',
        data: {
            cart: user.cart,
        },
    });
});


const viewCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // Assuming you have middleware that extracts the user ID from the JWT token
        const user = await User.findById(userId).populate('cart.product');

        const totalPrice = user.cart.reduce((previousValue, currentValue) => {
            const price = currentValue.product.price.find(p => p.volume === currentValue.volume);
            return previousValue + price.value * currentValue.quantity;
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                cartItems: user.cart
            },
            totalPrice: totalPrice
        });
    } catch (error) {
        next(error);
    }
};


const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const {volume, quantity} = req.body;

        const user = await User.findById(userId).populate('cart.product');

        const cartItem = user.cart.find(
            (item) => item.product._id.toString() === productId && item.volume === volume
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart',
            });
        }

        const volumeIndex = cartItem.product.price.findIndex(
            (price) => price.volume === volume
        );

        if (volumeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Volume not found for the product',
            });
        }

        cartItem.quantity = quantity;

        if (quantity === 0) {
            // Remove the cart item if the quantity is set to 0
            user.cart = user.cart.filter(
                (item) => item.product._id.toString() !== productId
            );
        }

        await user.save({validateBeforeSave: false});

        res.status(200).json({
            success: true,
            data: {
                cartItems: user.cart,
            },
        });
    } catch (error) {
        next(error);
    }
};

const removeCartItem = async (req, res, next) => {
    const {id: userId} = req.user;
    const {productId} = req.params;
    const {volume} = req.body;

    try {
        const user = await User.findById(userId).populate('cart.product');

        const updatedCart = user.cart.filter(
            (item) => {
                if (item.product._id.toString() !== productId || item.volume !== volume)
                    return true
            }
        );

        user.cart = updatedCart;
        await user.save({validateBeforeSave: false});
        res.status(200).json({
            status: 'success',
            message: 'Cart item removed successfully',
            data: {
                cart: user.cart,
            },
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
};

paypal.configure({
    mode: 'sandbox',
    client_id: 'Ac6Fbx2DdJ88_GLWZLtIWYkIiWmpOPjew9oLUxDRYcd1QN6wFq67L9hWBFLjCRHsejkhImPyiApN11z5',
    client_secret: 'EEgwLhjbniDOmMAlHj44ujR_ntv-_LTb9gZwr5D24cwBH1N1QI-TCS06dXwfOwiHeJ-10z6aOpIe5Doz'
});

const calculateTotalAmount = (cart) => {
    let totalAmount = 0;

    for (const item of cart) {
        const volume = item.volume;
        const price = item.product.price.find((p) => p.volume === volume);
        totalAmount += price.value * item.quantity;
    }

    return totalAmount.toFixed(2);
};

const checkout = async (req, res, next) => {
    const {id: userId} = req.user;
    const {shippingAddress} = req.body

    try {
        const user = await User.findById(userId).populate('cart.product');
        const cart = user.cart;
        const totalAmount = calculateTotalAmount(cart);

        const createPaymentJson = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: 'http://localhost:3001/',
                cancel_url: 'http://localhost:3001/favorites',
            },
            transactions: [
                {
                    amount: {
                        total: totalAmount,
                        currency: 'USD',
                    },
                    description: 'Payment for your product or service',
                },
            ],
        };

        paypal.payment.create(createPaymentJson, async (error, payment) => {
            if (error) {
                console.error(error);
                return res.status(500).json({error: 'Failed to create PayPal payment.'});
            }

            if (payment && payment.state === 'created') {
                // user.cart = [];
                // await user.save({validateBeforeSave: false});

                const order = new Order({
                    user: userId,
                    product: cart.map((item) => {
                        return ({
                            product: item.product._id,
                            quantity: item.quantity,
                            volume: item.volume,
                        })
                    }),
                    shippingAddress,
                    totalPrice: totalAmount,
                    status: 'pending',
                });
                await order.save();
                // const email = new Email(user, 'http://your-website.com/order-confirmation');

                const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
                res.status(200).json({
                    status: 'success',
                    forwardLink:approvalUrl
                });
            } else {
                console.error(payment.details[0]);
                return res.status(400).json({error: 'Invalid request - see details'});
            }
        });
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    const {id: userId} = req.user;
    try {
        const user = await User.findById(userId);
        user.cart = [];
        await user.save({validateBeforeSave: false});

        res.status(200).json({
            status: 'success',
            message: 'Cart cleared successfully',
            data: {
                cart: user.cart,
            },
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addToCart,
    viewCart,
    updateCartItem,
    checkout,
    removeCartItem,
    clearCart
};
