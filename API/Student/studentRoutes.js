const express = require("express");
const router = express.Router();

const { Signup, Signin, EditStudentProfile } = require("./student");
const { isStudentExists } = require("../middleware");

// Routes
router.post("/signup", Signup); // Student signup
router.get("/signin", Signin); // Student signin

router.put(
  "/student_id/:student_id/editStudentProfile",
  isStudentExists,
  EditStudentProfile
); // Edit student profile

module.exports = router;
