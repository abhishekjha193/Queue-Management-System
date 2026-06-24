const mongoose = require("mongoose");

const QueueStatsSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    date: { type: String, required: true },
    totalPatients: { type: Number, default: 0 },
    completedPatients: { type: Number, default: 0 },
    avgActualConsultTime: { type: Number, default: 0 },
    totalConsultTimes: { type: [Number], default: [] },
    peakHour: { type: Number },
    skippedCount: { type: Number, default: 0 },
    noShowCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

QueueStatsSchema.index({ clinic: 1, date: 1 }, { unique: true });

QueueStatsSchema.methods.updateAvgConsultTime = function (durationMinutes) {
  this.totalConsultTimes.push(durationMinutes);
  this.completedPatients += 1;
  const sum = this.totalConsultTimes.reduce((a, b) => a + b, 0);
  this.avgActualConsultTime = Math.round(sum / this.totalConsultTimes.length);
};

module.exports = mongoose.model("QueueStats", QueueStatsSchema);
