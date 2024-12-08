const express = require("express");
const router = express.Router();

const {
  Signup,
  Signin,
  EditSchoolProfile,
  AddClass,
  ChangeClassNumber,
  AddClassSection,
  RenameClassSection,
  AddTeacherIntoSchool,
  RemoveTeacherFromSchool,
} = require("./school");
const {
  isSchoolExists,
  isClassExists,
  isTeacherExists,
} = require("../middleware");

// Routes
router.post("/signup", Signup); // School signup
router.get("/signin", Signin); // School signin

router.put(
  "/school_id/:school_id/editSchoolProfile",
  isSchoolExists,
  EditSchoolProfile
); // Edit school profile

router.post("/school_id/:school_id/addClass", isSchoolExists, AddClass); // Add a class
router.put(
  "/school_id/:school_id/class_id/:class_id/changeClassNumber",
  isSchoolExists,
  isClassExists,
  ChangeClassNumber
); // Change class number

// router.post("/:school_id/:class_id/deleteClass", isClassExists, DeleteClass);

router.post(
  "/school_id/:school_id/class_id/:class_id/addClassSection",
  isSchoolExists,
  isClassExists,
  AddClassSection
); // Add a class section

router.put(
  "/school_id/:school_id/class_id/:class_id/renameClassSection",
  isSchoolExists,
  isClassExists,
  RenameClassSection
); // Rename class section

// router.post("/:school_id/:class_id/deleteSection", isSchoolExists, isClassExists, DeleteSection);

router.post(
  "/school_id/:school_id/teacher_id/:teacher_id/addTeacherIntoSchool",
  isSchoolExists,
  isTeacherExists,
  AddTeacherIntoSchool
); // Add a teacher in school

router.delete(
  "/school_id/:school_id/teacher_id/:teacher_id/removeTeacherFromSchool",
  isSchoolExists,
  isTeacherExists,
  RemoveTeacherFromSchool
); // Remove a teacher from school

module.exports = router;
