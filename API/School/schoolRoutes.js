const express = require("express");
const { Signup, Signin, EditSchoolProfile } = require("./school");

const router = express.Router();

router.post("/signup", Signup);
router.get("/signin", Signin);
router.put("/editSchoolProfile/:school_id", EditSchoolProfile);

module.exports = router;
