const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const orderRouter = require('./routes/orderRoutes');
const cartRouter = require('./routes/cartRoutes');
const favoritesRouter = require('./routes/favoritesRoutes');
const messageRouter = require('./routes/messageRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
path.join(__dirname, '../views');

app.use(cors());

app.options('*', cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ['price', 'favorites', 'cart', 'volume', 'name', 'messages'],
  })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/cart', cartRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/message', messageRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
