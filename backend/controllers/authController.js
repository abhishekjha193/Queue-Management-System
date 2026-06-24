const jwt = require("jsonwebtoken");
const Clinic = require("../models/Clinic");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const register = async (req, res) => {
  const { name, email, password, doctorName, address, phone, avgConsultationTime } = req.body;
  const clinic = await Clinic.create({ name, email, password, doctorName, address, phone, avgConsultationTime });
  const token = generateToken(clinic._id);
  logger.info(`New clinic registered: ${clinic.name}`);
  ApiResponse.created(res, { token, clinic: { id: clinic._id, name: clinic.name, email: clinic.email, doctorName: clinic.doctorName, avgConsultationTime: clinic.avgConsultationTime } }, "Clinic registered successfully");
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const clinic = await Clinic.findOne({ email }).select("+password");
  if (!clinic || !(await clinic.matchPassword(password))) {
    return ApiResponse.error(res, "Invalid email or password", 401);
  }
  const token = generateToken(clinic._id);
  logger.info(`Clinic logged in: ${clinic.name}`);
  ApiResponse.success(res, { token, clinic: { id: clinic._id, name: clinic.name, email: clinic.email, doctorName: clinic.doctorName, avgConsultationTime: clinic.avgConsultationTime } }, "Login successful");
};

const getMe = async (req, res) => {
  ApiResponse.success(res, { clinic: req.clinic }, "Profile fetched");
};

const updateSettings = async (req, res) => {
  const { avgConsultationTime, doctorName, address, phone } = req.body;
  const clinic = await Clinic.findByIdAndUpdate(
    req.clinic._id,
    { avgConsultationTime, doctorName, address, phone },
    { new: true, runValidators: true }
  );
  ApiResponse.success(res, { clinic }, "Settings updated");
};

module.exports = { register, login, getMe, updateSettings };
