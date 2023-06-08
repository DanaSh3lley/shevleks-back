const Product = require("../models/productModel");

const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const APIFeatures = require("../utils/apiFeatures");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadProductImage = upload.single('image');

exports.resizeProductImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${req.file.filename}`);

    next();
});

exports.aliasTopProducts = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-rating,price';
    next();
};

exports.getCatalog = async (req, res, next) => {
    const products = await Product.find().populate('category');
    const volumes = [
        ...new Set(
            products
                .map((product) => {
                    return product.price.map((price) => price.volume);
                })
                .flat()
                .filter((el) => el)
        ),
    ];
    const categories = [
        ...new Set(
            products
                .map((product) => {
                    return product.category;
                }).filter(el => el)
        ),
    ];

    const maxPrice = Math.max(...products.map(el => el.price.map(el => el.value)).flat())
    const minPrice = Math.min(...products.map(el => el.price.map(el => el.value)).flat())
    console.log(maxPrice, minPrice)

    const countFeatures = new APIFeatures(Product.find(), req.query)
        .filterCategory()
        .filterVolume()
        .filterPrice()
        .filter('category', 'volume', 'price')
        .sort()
    const count = await countFeatures.query.countDocuments();

    const features = new APIFeatures(Product.find(), req.query)
        .filterCategory()
        .filterVolume()
        .filterPrice()
        .search()
        .filter('category', 'volume', 'price', 'search')
        .sort()
        .limitFields()
        .paginate();

    const doc = await features.query;
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc,
            total: count,
            categories,
            volumes,
            maxPrice,
            minPrice
        }
    });
}


exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product, {path: 'reviews'});
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
