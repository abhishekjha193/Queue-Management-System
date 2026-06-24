const jwt = require("jsonwebtoken");
const Clinic = require("../models/Clinic");
const ApiResponse = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return ApiResponse.error(res, "Not authorized, no token", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.clinic = await Clinic.findById(decoded.id).select("-password");
  if (!req.clinic) return ApiResponse.error(res, "Clinic not found", 401);
  next();
};

module.exports = { protect };
