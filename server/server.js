require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());//cors middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
