const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080; // Use port from environment variable or default to 8080

// Middleware
app.use(
  cors()
);
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// Start the server after connecting to the database
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process if server fails to start
  }
};

start();
