const express = require("express");
const app = express();
const PORT = 5000;

// Import Routes
const parentRoutes = require("./API/Parent/parentRoutes.js");
const studentRoutes = require("./API/Student/studentRoutes.js");
const schoolRoutes = require("./API/School/schoolRoutes.js");
const teacherRoutes = require("./API/Teacher/teacherRoutes.js");

// Middleware to parse JSON
app.use(express.json());

// API Routes
app.use("/parent", parentRoutes);
app.use("/student", studentRoutes);
app.use("/school", schoolRoutes);
app.use("/teacher", teacherRoutes);

// Root Endpoint
app.get("/", async (req, res) => {
  res.send("Welcome!");
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
