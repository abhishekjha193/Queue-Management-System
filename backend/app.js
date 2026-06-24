const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const queueRoutes = require("./routes/queueRoutes");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests, please try again later" });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.use(limiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "OK", timestamp: new Date().toISOString(), service: "Queue Cure API" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/queue", queueRoutes);

app.use("*", (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

app.use(errorHandler);

module.exports = app;
