const express = require("express");
const {
  Signup,
  Signin,
  EditSchoolProfile,
  AddClass,
  AddSection,
} = require("./school");

const router = express.Router();

router.post("/signup", Signup);
router.get("/signin", Signin);
router.put("/editSchoolProfile/:school_id", EditSchoolProfile);

router.post("/:school_id/addClass", AddClass);
// router.post("/:school_id/deleteClass", DeleteClass);
router.post("/:school_id/:class_id/addSection", AddSection);
// router.post("/:school_id/:class_id/deleteSection", DeleteSection);

module.exports = router;
