const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', () => {
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const { createServer } = require('http');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true,
});

const port = process.env.PORT || 3000;
const server = createServer(app);

server.listen(port, () => {});

process.on('unhandledRejection', () => {
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {});
});
