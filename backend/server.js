require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Init Middleware
const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/logs", require("./routes/logs"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
