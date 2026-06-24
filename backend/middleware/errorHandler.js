const logger = require("../utils/logger");
const ApiResponse = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });

  if (err.name === "CastError") return ApiResponse.error(res, `Invalid ${err.path}: ${err.value}`, 400);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.error(res, `${field} already exists`, 400);
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.error(res, messages.join(", "), 400);
  }
  if (err.name === "JsonWebTokenError") return ApiResponse.error(res, "Invalid token", 401);
  if (err.name === "TokenExpiredError") return ApiResponse.error(res, "Token expired", 401);

  ApiResponse.error(res, err.message || "Server Error", err.statusCode || 500);
};

module.exports = errorHandler;
