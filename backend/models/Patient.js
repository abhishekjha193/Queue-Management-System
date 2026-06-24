const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    name: { type: String, required: [true, "Patient name is required"], trim: true, maxlength: 100 },
    phone: { type: String, trim: true, default: "" },
    age: { type: Number, min: 0, max: 150 },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "skipped", "no-show"],
      default: "waiting",
      index: true,
    },
    priority: { type: String, enum: ["normal", "urgent", "elderly"], default: "normal" },
    complaint: { type: String, trim: true, maxlength: 500, default: "" },
    calledAt: { type: Date },
    completedAt: { type: Date },
    serveStartedAt: { type: Date },
    date: { type: String, default: () => new Date().toISOString().split("T")[0], index: true },
    estimatedWaitMinutes: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PatientSchema.index({ clinic: 1, date: 1, status: 1 });
PatientSchema.index({ clinic: 1, tokenNumber: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Patient", PatientSchema);
