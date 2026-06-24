const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { register, login, getMe, updateSettings } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Clinic name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("doctorName").trim().notEmpty().withMessage("Doctor name is required"),
  validate,
], register);

router.post("/login", [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
], login);

router.get("/me", protect, getMe);
router.put("/settings", protect, [
  body("avgConsultationTime").isInt({ min: 1, max: 120 }).withMessage("Consultation time must be between 1 and 120 minutes"),
  validate,
], updateSettings);

module.exports = router;
