const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ClinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Clinic name is required"], trim: true, maxlength: 100 },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    doctorName: { type: String, required: [true, "Doctor name is required"], trim: true },
    avgConsultationTime: { type: Number, default: 10, min: 1, max: 120 },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    currentTokenDate: { type: String, default: "" },
    tokenCounter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ClinicSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

ClinicSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

ClinicSchema.methods.getNextToken = function () {
  const today = new Date().toISOString().split("T")[0];
  if (this.currentTokenDate !== today) {
    this.tokenCounter = 0;
    this.currentTokenDate = today;
  }
  this.tokenCounter += 1;
  return this.tokenCounter;
};

module.exports = mongoose.model("Clinic", ClinicSchema);
