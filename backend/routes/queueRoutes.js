const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { addPatient, callNext, skipPatient, markNoShow, getQueue, getPublicQueue, getTodayStats, resetQueue, updateConsultTime } = require("../controllers/queueController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/public/:clinicId", getPublicQueue);

router.use(protect);

router.get("/", getQueue);
router.get("/stats", getTodayStats);

router.post("/add-patient", [
  body("name").trim().notEmpty().withMessage("Patient name is required").isLength({ max: 100 }),
  body("phone").optional().trim(),
  body("age").optional().isInt({ min: 0, max: 150 }),
  body("priority").optional().isIn(["normal", "urgent", "elderly"]),
  validate,
], addPatient);

router.post("/call-next", callNext);
router.put("/update-consult-time", [
  body("avgConsultationTime").isInt({ min: 1, max: 120 }),
  validate,
], updateConsultTime);

router.patch("/skip/:patientId", [
  param("patientId").isMongoId().withMessage("Invalid patient ID"),
  validate,
], skipPatient);

router.patch("/no-show/:patientId", [
  param("patientId").isMongoId().withMessage("Invalid patient ID"),
  validate,
], markNoShow);

router.post("/reset", resetQueue);

module.exports = router;
