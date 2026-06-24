require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Queue Cure server running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`Client URL: ${process.env.CLIENT_URL}`);
  });
};

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();
