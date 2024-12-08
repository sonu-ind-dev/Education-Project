const express = require("express");
const { Signup, Signin, EditTeacherProfile } = require("./teacher");
const { isTeacherExists } = require("../middleware");

const router = express.Router();

router.post("/signup", Signup); // Teacher signup
router.get("/signin", Signin); // Teacher Signin

router.put(
  "/teacher_id/:teacher_id/editTeacherProfile",
  isTeacherExists,
  EditTeacherProfile
); // Edit teacher profile

module.exports = router;
