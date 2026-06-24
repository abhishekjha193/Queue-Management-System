const Patient = require("../models/Patient");
const Clinic = require("../models/Clinic");
const QueueStats = require("../models/QueueStats");
const ApiResponse = require("../utils/apiResponse");
const { getIO } = require("../config/socket");
const logger = require("../utils/logger");

const getTodayDate = () => new Date().toISOString().split("T")[0];

const computeQueueData = async (clinicId) => {
  const today = getTodayDate();
  const clinic = await Clinic.findById(clinicId);
  const waitingPatients = await Patient.find({ clinic: clinicId, date: today, status: "waiting" }).sort({ priority: -1, tokenNumber: 1 });
  const serving = await Patient.findOne({ clinic: clinicId, date: today, status: "serving" });
  const completed = await Patient.countDocuments({ clinic: clinicId, date: today, status: "completed" });
  const skipped = await Patient.countDocuments({ clinic: clinicId, date: today, status: "skipped" });

  const stats = await QueueStats.findOne({ clinic: clinicId, date: today });
  const avgTime = stats?.avgActualConsultTime || clinic.avgConsultationTime;

  const waitingWithEta = waitingPatients.map((p, idx) => ({
    ...p.toObject(),
    position: idx + 1,
    estimatedWaitMinutes: (idx + (serving ? 1 : 0)) * avgTime,
  }));

  return { waiting: waitingWithEta, serving, completed, skipped, avgTime, clinicName: clinic.name, doctorName: clinic.doctorName, avgConsultationTime: clinic.avgConsultationTime };
};

const emitQueueUpdate = async (clinicId) => {
  const data = await computeQueueData(clinicId);
  const io = getIO();
  io.to(`clinic-${clinicId}`).emit("queue-update", data);
  return data;
};

const addPatient = async (req, res) => {
  const { name, phone, age, complaint, priority } = req.body;
  const clinicId = req.clinic._id;
  const clinic = await Clinic.findById(clinicId);
  const tokenNumber = clinic.getNextToken();
  await clinic.save();

  const today = getTodayDate();
  const patient = await Patient.create({ clinic: clinicId, name, phone, age, complaint, priority: priority || "normal", tokenNumber, date: today });

  await QueueStats.findOneAndUpdate({ clinic: clinicId, date: today }, { $inc: { totalPatients: 1 } }, { upsert: true, new: true });

  logger.info(`Patient added: ${name}, Token: ${tokenNumber}, Clinic: ${clinic.name}`);
  const queueData = await emitQueueUpdate(clinicId);
  ApiResponse.created(res, { patient, queue: queueData }, `Token #${tokenNumber} assigned to ${name}`);
};

const callNext = async (req, res) => {
  const clinicId = req.clinic._id;
  const today = getTodayDate();

  const currentServing = await Patient.findOne({ clinic: clinicId, date: today, status: "serving" });
  if (currentServing) {
    const serveStart = currentServing.serveStartedAt || currentServing.calledAt || new Date();
    const durationMinutes = Math.round((new Date() - serveStart) / 60000);
    currentServing.status = "completed";
    currentServing.completedAt = new Date();
    await currentServing.save();

    const stats = await QueueStats.findOneAndUpdate({ clinic: clinicId, date: today }, {}, { upsert: true, new: true });
    if (durationMinutes > 0 && durationMinutes < 120) {
      stats.updateAvgConsultTime(durationMinutes);
      await stats.save();
    }
  }

  const next = await Patient.findOne({ clinic: clinicId, date: today, status: "waiting" }).sort({ priority: -1, tokenNumber: 1 });

  if (!next) {
    const queueData = await emitQueueUpdate(clinicId);
    return ApiResponse.success(res, { queue: queueData, serving: null }, "Queue is empty - all patients served!");
  }

  next.status = "serving";
  next.calledAt = new Date();
  next.serveStartedAt = new Date();
  await next.save();

  logger.info(`Token #${next.tokenNumber} called: ${next.name}`);
  const queueData = await emitQueueUpdate(clinicId);
  ApiResponse.success(res, { serving: next, queue: queueData }, `Now calling Token #${next.tokenNumber} - ${next.name}`);
};

const skipPatient = async (req, res) => {
  const { patientId } = req.params;
  const clinicId = req.clinic._id;
  const today = getTodayDate();

  const patient = await Patient.findOne({ _id: patientId, clinic: clinicId });
  if (!patient) return ApiResponse.error(res, "Patient not found", 404);

  patient.status = "skipped";
  await patient.save();

  await QueueStats.findOneAndUpdate({ clinic: clinicId, date: today }, { $inc: { skippedCount: 1 } }, { upsert: true });

  logger.info(`Token #${patient.tokenNumber} skipped: ${patient.name}`);
  const queueData = await emitQueueUpdate(clinicId);
  ApiResponse.success(res, { patient, queue: queueData }, `Token #${patient.tokenNumber} skipped`);
};

const markNoShow = async (req, res) => {
  const { patientId } = req.params;
  const clinicId = req.clinic._id;
  const today = getTodayDate();

  const patient = await Patient.findOne({ _id: patientId, clinic: clinicId });
  if (!patient) return ApiResponse.error(res, "Patient not found", 404);

  const wasServing = patient.status === "serving";
  patient.status = "no-show";
  await patient.save();

  await QueueStats.findOneAndUpdate({ clinic: clinicId, date: today }, { $inc: { noShowCount: 1 } }, { upsert: true });

  if (wasServing) {
    const next = await Patient.findOne({ clinic: clinicId, date: today, status: "waiting" }).sort({ priority: -1, tokenNumber: 1 });
    if (next) {
      next.status = "serving";
      next.calledAt = new Date();
      next.serveStartedAt = new Date();
      await next.save();
    }
  }

  const queueData = await emitQueueUpdate(clinicId);
  ApiResponse.success(res, { patient, queue: queueData }, "Marked as no-show");
};

const getQueue = async (req, res) => {
  const clinicId = req.params.clinicId || req.clinic._id;
  const queueData = await computeQueueData(clinicId);
  ApiResponse.success(res, queueData, "Queue fetched");
};

const getPublicQueue = async (req, res) => {
  const { clinicId } = req.params;
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) return ApiResponse.error(res, "Clinic not found", 404);
  const queueData = await computeQueueData(clinicId);
  ApiResponse.success(res, queueData, "Queue data fetched");
};

const getTodayStats = async (req, res) => {
  const clinicId = req.clinic._id;
  const today = getTodayDate();
  const stats = await QueueStats.findOne({ clinic: clinicId, date: today });
  const queueData = await computeQueueData(clinicId);
  ApiResponse.success(res, { stats, queueData }, "Stats fetched");
};

const resetQueue = async (req, res) => {
  const clinicId = req.clinic._id;
  const today = getTodayDate();
  await Patient.updateMany({ clinic: clinicId, date: today, status: { $in: ["waiting", "serving"] } }, { status: "no-show" });
  logger.info(`Queue reset for clinic: ${req.clinic.name}`);
  const queueData = await emitQueueUpdate(clinicId);
  ApiResponse.success(res, { queue: queueData }, "Queue reset successfully");
};

const updateConsultTime = async (req, res) => {
  const { avgConsultationTime } = req.body;
  const clinic = await Clinic.findByIdAndUpdate(req.clinic._id, { avgConsultationTime }, { new: true });
  const queueData = await emitQueueUpdate(req.clinic._id);
  ApiResponse.success(res, { clinic, queue: queueData }, "Consultation time updated");
};

module.exports = { addPatient, callNext, skipPatient, markNoShow, getQueue, getPublicQueue, getTodayStats, resetQueue, updateConsultTime };
