const User = require("../models/userModel");
const addToFavorites = async (req, res, next) => {
    const {id: userId} = req.user;
    const {productId} = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Check if the product is already in favorites
        if (user.favorites.includes(productId)) {
            return res.status(400).json({message: 'Product already in favorites'});
        }

        user.favorites.push(productId);
        await user.save({validateBeforeSave:false});

        res.status(200).json({message: 'Product added to favorites'});
    } catch (error) {
        next(error);
    }
};

const removeFromFavorites = async (req, res, next) => {
    const {id: userId} = req.user;
    const {productId} = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Check if the product is in favorites
        if (!user.favorites.includes(productId)) {
            return res.status(400).json({message: 'Product not found in favorites'});
        }

        user.favorites.pull(productId);
        await user.save({validateBeforeSave:false});

        res.status(200).json({message: 'Product removed from favorites'});
    } catch (error) {
        next(error);
    }
};

const getUserFavorites = async (req, res, next) => {
    try {
        const {id: userId} = req.user;
        const user = await User.findById(userId).populate('favorites');
        res.status(200).json({favorites: user.favorites});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToFavorites, removeFromFavorites, getUserFavorites
}