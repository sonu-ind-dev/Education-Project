const express = require("express");
const { Signup, Signin } = require("./teacher");

const router = express.Router();

router.post("/signup", Signup); // Teacher signup
router.get("/signin", Signin); // Teacher Signin

module.exports = router;
